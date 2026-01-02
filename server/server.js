import { Server } from "socket.io";
// import https from 'https';
import express from "express";
import amqp from "amqplib";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import http from "http";

dotenv.config({ path: ".env" });
const app = express();
const sslKey = fs.readFileSync(path.join("./cert/key.pem"));
const sslCert = fs.readFileSync(path.join("./cert/cert.pem"));
const credentials = { key: sslKey, cert: sslCert };
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const EXCHANGE = "Direct_chat";
const TOPIC_EXCHANGE = "topic_chat";

const users = {};

// io.use((socket, next) => {
//   const token = socket.handshake.query.token;
//   try {
//     const user = jwt.verify(token, process.env.JWT_SECRET);
//     socket.user = user;
//     next();
//   } catch (err) {
//     next(new Error("Unauthorized"));
//   }
// });

async function one_to_one() {
  const conn = await amqp.connect("amqp://127.0.0.1:5672?heartbeat=60");
  conn.on("error", (err) => {
    console.error("RabbitMQ connection error", err);
  });
  conn.on("close", () => {
    console.warn("RabbitMQ connection closed. Reconnecting...");
    setTimeout(conn, 3000);
  });
  const channel = await conn.createChannel();
  await channel.assertExchange(EXCHANGE, "direct", { durable: true });
  await channel.assertExchange(TOPIC_EXCHANGE, "topic", { durable: true });
  io.on("connection", async (socket) => {
    const token = socket.handshake.query.token;
    const userId = socket.handshake.query.userId;

    console.log(`user joined ${userId}`);
    if (!token || !userId) {
      console.log("Missing token or userId");
      socket.disconnect();
      return;
    }

    users[userId] = socket.id;
    // socket[socket.id] = userId

    const userQueue = `queue_${userId}`;
    await channel.assertQueue(userQueue, { durable: true });
    await channel.bindQueue(userQueue, EXCHANGE, `user.${userId}`);
    console.log(`✅ Bound queue ${userQueue} to routing key user.${userId}`);

    channel.consume(
      userQueue,
      (msg) => {
        if (msg) {
          const data = JSON.parse(msg.content.toString());
          console.log(data);
          if (data.files) {
              socket.emit("recieved_files", data);
          } else {
              socket.emit("message", data);
          }
          if (data.from !== String(userId)) {
            if (data.files) {
              socket.emit("recieved_files", data);
            } else if (data.voice) {
              socket.emit("voiceMessage", data);
            } else {
              console.log("message", data);
              socket.emit("message", data);
            }
          }
          channel.ack(msg);
        }
      },
      { noAck: false }
    );
    socket.on("joined_room", async (roomId) => {
      console.log(`🔗 ${userId} joined room: ${roomId}`);
      socket.join(roomId);
      const groupQueue = `room_queue_${roomId}_${userId}`;
      await channel.assertQueue(groupQueue, { durable: true });
      await channel.bindQueue(groupQueue, TOPIC_EXCHANGE, `room.${roomId}`);
      console.log(`${userId},${groupQueue}`);
      channel.consume(
        groupQueue,
        (msg) => {
          if (msg) {
            const data = JSON.parse(msg.content.toString());
            if (data.from !== userId) {
              if (data.files) {
                socket.emit("recieved_files", data);
              } else if (data.voice) {
                socket.emit("groupVoice", data);
              } else if (data.message) {
                console.log("group", data);
                socket.emit("groupMessage", data);
              }
            }
            // socket.to(roomId).emit("groupMessage", data.message);
            channel.ack(msg);
          }
        },
        { noAck: false }
      );
    });

    socket.on(
      "sendMessage",
      async ({ userId, profilePicture, roomId, message }) => {
        let payload = {
          from: userId,
          profilePicture,
          roomId,
          message,
        };
        console.log(payload)
        if (roomId && roomId.includes("_")) {
          const recipientIds = roomId.split("_").filter((id) => id !== userId);
          for (const receiverId of recipientIds) {
            payload = {
              from: userId,
              roomId,
              receiverId,
              profilePicture,
              message,
            };
            channel.publish(
              EXCHANGE,
              `user.${receiverId}`,
              Buffer.from(JSON.stringify(payload))
              // { persistent: true }
            );
          }
        } else {
          channel.publish(
            TOPIC_EXCHANGE,
            `room.${roomId}`,
            Buffer.from(JSON.stringify(payload))
            // { persistent: true }
          );
        }
      }
    );

    socket.on("send_files", ({ userId, roomId, files }) => {
      let payload = {
        from: userId,
        files,
      };
      if (roomId && roomId.includes("_")) {
        const recipientIds = roomId.split("_").filter((id) => id !== userId);
        for (const receiverId of recipientIds) {
          payload = {
            from: userId,
            roomId,
            receiverId,
            // message
          };
          // console.log("reciever", receiverId)
          channel.publish(
            EXCHANGE,
            `user.${receiverId}`,
            Buffer.from(JSON.stringify(payload)),
            { persistent: true }
          );
        }
      } else {
        channel.publish(
          TOPIC_EXCHANGE,
          `room.${roomId}`,
          Buffer.from(JSON.stringify(payload)),
          { persistent: true }
        );
      }
    });

    socket.on("group-call", ({ to, offer, roomId }) => {
      const target = users[to];
      if (target && target !== socket.id) {
        io.to(target).emit("group-call-offer", {
          from: userId,
          offer,
          roomId,
        });
      }
    });
    socket.on("user-call", ({ to, offer, roomId }) => {
      const target = users[to];
      if (target && target !== socket.id) {
        io.to(target).emit("group-call-offer", {
          from: userId,
          offer,
          roomId,
        });
      }
    });
    socket.on("group-call-ask-answer", ({ to, answer }) => {
      console.log(answer);
      const target = users[to];
      console.log(
        `[WebRTC] Answer from ${userId} to ${to} -> socket: ${target}`
      );
      console.log(target, "targer");
      if (target) {
        io.to(target).emit("group-call-answer", { from: userId, answer });
      }
    });

    socket.on("user-answer", ({ to, answer }) => {
      const target = users[to];
      console.log(
        `[WebRTC] Answer from ${userId} to ${to} -> socket: ${target}`
      );
      console.log(target, "targer");
      if (target) {
        io.to(target).emit("user-answer", { from: userId, answer });
      }
    });
    socket.on("ice-candidate", ({ to, candidate, roomId }) => {
      const target = users[to];
      if (target) {
        console.log("target", userId, candidate);
        io.to(target).emit("ice-candidate", {
          from: userId,
          candidate,
          roomId,
        });
      }
      // to.map((el) => {
      // })
    });

    socket.on("end-call", ({ roomId }) => {
      socket.to(roomId).emit("call-ended");
    });

    socket.on("voiceMessage", ({ userId, profilePicture, roomId, voice }) => {
      let payload = {
        from: userId,
        profilePicture,
        roomId,
        voice,
      };
      console.log(voice);
      if (roomId && roomId.includes("_")) {
        const recipientIds = roomId.split("_").filter((id) => id !== userId);
        for (const receiverId of recipientIds) {
          payload = {
            from: userId,
            roomId,
            receiverId,
            profilePicture,
            voice,
          };
          channel.publish(
            EXCHANGE,
            `user.${receiverId}`,
            Buffer.from(JSON.stringify(payload))
            // { persistent: true }
          );
        }
      } else {
        channel.publish(
          TOPIC_EXCHANGE,
          `room.${roomId}`,
          Buffer.from(JSON.stringify(payload))
          // { persistent: true }
        );
      }
    });

    socket.on("disconnect", () => {
      delete users[userId];
      console.log(`❌ ${userId} disconnected`);
    });
  });
}

one_to_one();

export { io, server, app };

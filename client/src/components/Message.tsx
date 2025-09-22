import { useEffect, useState } from "react";
import { useSocket } from "@/context/Socket";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import type { url } from "../types/socket";
import dayjs from "dayjs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { IVoice } from "@/slices/roomSlice";
import FileViewer from "react-file-viewer";
import { toast } from "react-toastify";
import { Download, Eye, PlayCircle, X } from "lucide-react";
import { Button } from "./ui/button";

type messageProps = {
  message: string | null;
};

type ChatMessage = {
  text?: string;
  message?: string;
  files?: url[];
  type: "sent" | "recieved";
  createdAt: string;
  profilePicture?: {
    url: string;
    _id: string;
  };
  senderId?: {
    token: string;
  };
  voiceMessage?: IVoice;
};

const Message = ({ message }: messageProps) => {
  const socket = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { selectedRoom, userMessages, voice } = useSelector(
    (state: RootState) => state.rooms
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // const {files} = useSelector((state:RootState)=>state.)
  const { selectedUser } = useSelector((state: RootState) => state.users);
  const { user } = useSelector((state: RootState) => state.auth);
  const token = user?.token;
  const id = user?._id;
  const one_to_one_id = selectedUser
    ? [id, selectedUser?._id].sort().join("_")
    : null;
  // console.log("selectedRoom",selectedRoom);

  const formatTime = (createdAt: string) => {
    return dayjs(createdAt).format("h:mm A");
  };
  const { files } = useSelector((state: RootState) => state.message);
  useEffect(() => {
    if (selectedUser && !userMessages) {
      setMessages([]);
    } else if (selectedRoom && selectedRoom.messages) {
      const transformedMessages = selectedRoom.messages.map((msg: any) => {
        console.log("picture", msg.senderId.profilePicture);
        const isSender = msg?.senderId?.token === token;
        return {
          ...msg,
          type: isSender ? "sent" : "received",
          createdAt: msg.createdAt,
          profilePicture: isSender
            ? msg?.senderId?.profilePicture ?? null
            : msg?.recieverId?.profilePicture ?? null,
        };
      });

      setMessages(transformedMessages);
    }
  }, [selectedRoom, userMessages, selectedUser, token]);

  useEffect(() => {
    if (selectedUser && userMessages) {
      const transformedMessages = userMessages.messages?.map((msg: any) => {
        // const time = dayjs(msg.createdAt).format("h:mm A");
        const isSender = msg?.senderId?.token === token;

        return {
          ...msg,
          type: isSender ? "sent" : "received",
          createdAt: msg.createdAt,
          profilePicture: isSender
            ? msg?.senderId?.profilePicture ?? null
            : msg?.recieverId?.profilePicture ?? null,
        };
      });
      setMessages(transformedMessages ?? []);
    }
  }, [selectedUser, userMessages, token]);

  useEffect(() => {
    // console.log("message socket", socket);
    if (!socket) return;

    if ("Notification" in window) {
      Notification.requestPermission();
    }
    // const roomId = selectedRoom?._id ?? one_to_one_id;

    // Missed messages
    // const handleMissedMessages = (
    //   missed: { message?: string | null; files?: url[]; createdAt: Date }[]
    // ) => {
    //   console.log('missed',missed)
    //   missed.forEach((msg) => {
    //     if (msg.message) {
    //       // new Notification(msg.message);
    //     }

    //     setMessages((prev) => [
    //       ...prev,
    //       msg.files
    //         ? { files: msg.files, type: "recieved" }
    //         : { text: msg.message ?? "", type: "recieved" },
    //     ]);
    //   });
    // };

    // socket.on("missedMessages", handleMissedMessages);
    console.log("selectedRoom", selectedRoom);
    // Files
    socket.on("recieved_files", (data: any) => {
      console.log("files", data.files);
      const urls: url[] = data.files.map((file) => ({
        url: file.url,
        name: file.name,
        type: file.type,
      }));
      if (data && data.from !== user?._id) {
        // const createdAt = Date.now().toString();
        const createdAt = new Date().toISOString();

        setMessages((prev) => [
          ...prev,
          { files: urls, type: "recieved", createdAt: createdAt },
        ]);
      }
    });

    // Text message
    // console.log(roomId);
    // console.log("🔁 Rejoining room:", roomId);
    if (selectedRoom) {
      socket.emit("joined_room", selectedRoom?._id);
      console.log("socket", socket);
      socket.on("groupMessage", (incoming: any) => {
        console.log("📩 Incoming message:", incoming);
        if (incoming && incoming.from !== user?._id) {
          new Notification(incoming.message);
          const createdAt = new Date().toISOString();

          setMessages((prev) => [
            ...prev,
            {
              text: incoming.message,
              type: "recieved",
              createdAt: createdAt,
              profilePicture: incoming.profilePicture,
            },
          ]);
        }
      });
      socket.on("groupVoice", (incoming) => {
        if (incoming && incoming.from !== user?._id) {
          const createdAt = new Date().toISOString();

          setMessages((prev) => [
            ...prev,
            {
              voiceMessage: incoming.voice,
              type: "recieved",
              createdAt: createdAt,
              profilePicture: incoming.profilePicture,
            },
          ]);
        }
      });
    }

    console.log("hey");
    console.log("selectedUser", selectedUser);

    socket.on("message", (incoming: any) => {
      console.log("📩 Incoming message:", incoming);
      console.log(incoming);
      if (incoming && incoming.from !== user?._id) {
        new Notification(incoming.message);
        const createdAt = new Date().toISOString();

        setMessages((prev) => [
          ...prev,
          {
            text: incoming.message,
            type: "recieved",
            profilePicture: incoming.profilePicture,
            createdAt: createdAt,
          },
        ]);
      }
    });
    socket.on("voiceMessage", (incoming) => {
      if (incoming && incoming.from !== user?._id) {
        new Notification(incoming.message);
        const createdAt = new Date().toISOString();

        setMessages((prev) => [
          ...prev,
          {
            voiceMessage: incoming.voice,
            type: "recieved",
            profilePicture: incoming.profilePicture,
            createdAt: createdAt,
          },
        ]);
      }
    });

    socket.onAny((event, ...args) => {
      console.log("Any event:", event, args);
    });
    return () => {
      // socket.off("connect");
      socket.off("groupMessage");
      socket.off("message");
      socket.off("recieved_files");
      socket.off("missedMessages");
    };
  }, [socket, selectedRoom, user?._id, selectedUser, one_to_one_id]);

  useEffect(() => {
    const roomId = selectedRoom?._id ?? one_to_one_id;
    if (socket && message && message.length > 0 && roomId) {
      const createdAt = new Date().toISOString();

      const msgObj: ChatMessage = {
        text: message,
        type: "sent",
        createdAt: createdAt,
        profilePicture: user?.profilePicture,
      };
      socket.emit("sendMessage", {
        userId: user?._id,
        profilePicture: user?.profilePicture,
        roomId,
        message,
      });
      setMessages((prev) => [...prev, msgObj]);
    }
  }, [socket, message, user, one_to_one_id, selectedRoom?._id]);

  useEffect(() => {
    if (!voice || !socket) return;
    const createdAt = new Date().toISOString();
    const roomId = selectedRoom?._id ?? one_to_one_id;

    const msgObj: ChatMessage = {
      voiceMessage: voice,
      type: "sent",
      createdAt: createdAt,
      profilePicture: user?.profilePicture,
    };

    socket.emit("voiceMessage", {
      userId: user?._id,
      profilePicture: user?.profilePicture,
      roomId,
      voice,
    });
    setMessages((prev) => [...prev, msgObj]);
  }, [
    one_to_one_id,
    selectedRoom?._id,
    socket,
    user?._id,
    user?.profilePicture,
    voice,
  ]);

  useEffect(() => {
    if (!socket || !files) return;
    if (files) {
      const createdAt = new Date().toISOString();
      const urls: url[] = files.map((file) => ({
        url: file.url,
        name: file.filename,
        type: file.mimetype,
      }));
      socket.emit("send_files", {
        roomId: selectedRoom?._id,
        files: urls,
        userId: user?._id,
      });
      setMessages((prev) => [
        ...prev,
        { files: urls, type: "sent", createdAt: createdAt },
      ]);
    }
  }, [files, selectedRoom?._id, socket, user?._id]);

  // console.log("socket", socket);
  const getMessageDateLabel = (createdAt: string | Date): string => {
    const messageDate = dayjs(createdAt);
    const today = dayjs();

    if (messageDate.isSame(today, "day")) {
      return "Today";
    }

    if (messageDate.isSame(today.subtract(1, "day"), "day")) {
      return "Yesterday";
    }

    return messageDate.format("DD/MM/YYYY");
  };
  return (
    <>
      {messages &&
        messages.map((msg, ind) => {
          // console.log("voice",)
          const isSender =
            msg.type === "sent" || msg?.senderId?.token === token;
          const currentDateLabel = getMessageDateLabel(msg.createdAt);
          const previousMessage = messages[ind - 1];
          const previousDateLabel = previousMessage
            ? getMessageDateLabel(previousMessage.createdAt)
            : null;

          const showDateLabel = currentDateLabel !== previousDateLabel;
          // console.log("user", msg.profilePicture?.url);

          return (
            <div key={ind} className="flex flex-col">
              {(selectedRoom || selectedUser) && showDateLabel && (
                <div className="text-xs text-center text-gray-700 ">
                  {currentDateLabel}
                </div>
              )}
              <div
                className={`flex ${
                  isSender ? "self-end" : "self-start flex-row-reverse"
                } gap-2`}
              >
                <div className="flex flex-col max-w-xs">
                  {(msg.text || msg.message) && (
                    <p className="bg-blue-600 flex flex-col relative px-6 py-3 rounded-md text-sm text-white">
                      {msg.text || msg.message}
                      <span
                        className={`text-[7px] absolute ${
                          isSender ? "right-2" : "left-2"
                        } text-gray-300 bottom-0.5`}
                      >
                        {formatTime(msg.createdAt)}
                      </span>
                    </p>
                  )}
                  {msg.voiceMessage?.voice?.url && (
                    <audio controls src={msg.voiceMessage.voice.url}></audio>
                  )}

                  <div className="flex flex-col gap-5">
                    {msg.files?.map((fileUrl, i) => {
                      console.log(fileUrl, "file");
                      const fileType = fileUrl.mimetype
                        ? fileUrl.mimetype.split("/")[1]
                        : fileUrl.type.split("/")[1];
                      console.log(fileType);
                      return (
                        <Dialog
                          key={i}
                          open={selectedImage === fileUrl.url}
                          onOpenChange={(open) =>
                            setSelectedImage(open ? fileUrl.url : null)
                          }
                        >
                          <DialogTrigger asChild>
                            <div className="relative group cursor-pointer">
                              {fileType.startsWith("image/") ? (
                                <img
                                  src={fileUrl.url}
                                  alt="Preview"
                                  className="max-h-64 rounded-lg object-cover transition-transform duration-200 group-hover:scale-105"
                                />
                              ) : (
                                <div className="relative">
                                  <video className="max-h-64 rounded-lg">
                                    <source src={fileUrl.url} type={fileType} />
                                  </video>
                                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <PlayCircle className="h-12 w-12 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogTrigger>
                          <DialogContent className="w-auto max-w-none p-0 border-none overflow-hidden bg-transparent">
                            <div className="relative w-full h-full flex items-center justify-center bg-black/90">
                              {/* Close and Download buttons */}
                              <div className="absolute top-4 right-4 z-50 flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-white hover:bg-white/10"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const a = document.createElement("a");
                                    a.href = fileUrl.url;
                                    a.download = fileUrl.name || "download";
                                    a.click();
                                  }}
                                >
                                  <Download className="h-5 w-5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-white hover:bg-white/10"
                                  onClick={() => setSelectedImage(null)}
                                >
                                  <X className="h-5 w-5" />
                                </Button>
                              </div>

                              {/* File content - now with proper image/video handling */}
                              <div className="flex items-center justify-center p-4">
                                {fileType.startsWith("image/") ? (
                                  <img
                                    src={fileUrl.url}
                                    alt="Full Preview"
                                    className="max-h-[85vh] max-w-[90vw] object-contain"
                                    style={{
                                      width: "auto",
                                      height: "auto",
                                      maxWidth: "90vw",
                                      maxHeight: "85vh",
                                    }}
                                  />
                                ) : (
                                  <video
                                    controls
                                    className="max-h-[85vh] max-w-[90vw]"
                                    style={{
                                      width: "auto",
                                      height: "auto",
                                    }}
                                  >
                                    <source src={fileUrl.url} type={fileType} />
                                    Your browser does not support the video tag.
                                  </video>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      );
                    })}
                  </div>
                  {/* {
                    msg.voice?.map((voice)=>{
                    })
                  } */}
                </div>
                {/* {msg.profilePicture?.url && (
                  <Image url={msg.profilePicture?.url} />
                )} */}
              </div>
            </div>
          );
        })}
    </>
  );
};

export default Message;

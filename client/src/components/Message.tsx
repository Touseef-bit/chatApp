import { useEffect, useState } from "react";
import { useSocket } from "@/context/Socket";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import type { url } from "../types/socket";
import dayjs from "dayjs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { addMessage, getMessages, type IVoice } from "@/slices/roomSlice";
import { Download, Eye, PlayCircle, } from "lucide-react";
import { Button } from "./ui/button";
import FileIconComponent from "./FileIcon";

export type ChatMessage = {
  message?: string | null;
  files?: url[] | null;
  type: "sent" | "recieved";
  createdAt: string;
  profilePicture?: {
    url: string | null;
    _id: string | null;
  };
  senderId?: {
    token: string | null;
  };
  voiceMessage?: IVoice | null;
};

const Message = () => {
  const socket = useSocket();
  const { selectedRoom, voice } = useSelector(
    (state: RootState) => state.rooms
  );
  const Messages = useSelector(getMessages);
  const { selectedUser } = useSelector((state: RootState) => state.users);
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.message);
  const token = user?.token;
  const id = user?._id;
  const one_to_one_id = [id, selectedUser?._id].join("_")
  const dispatch = useDispatch();

  const formatTime = (createdAt: string) => {
    return dayjs(createdAt).format("h:mm A");
  };
  const { files } = useSelector((state: RootState) => state.message);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
    if (socket) {
      const handleAny = (event: string, ...args: any[]) => {
        console.log("📡 Socket Event:", event, args);
      };
      socket.onAny(handleAny);
      return () => {
        socket.offAny(handleAny);
      };
    }
  }, [socket]);

  // --- Room Management ---
  useEffect(() => {
    if (socket && selectedRoom) {
      console.log("🔗 Joining room:", selectedRoom._id);
      socket.emit("joined_room", selectedRoom._id);
    }
  }, [socket, selectedRoom?._id]);

  // --- Private Messaging (1-to-1) ---
  useEffect(() => {
    if (!socket) return;
    const handleMessage = (incoming: any) => {
      console.log("📩 Incoming 1-to-1 message:", incoming);
      if (incoming && incoming.from !== user?._id) {
        new Notification(incoming.message || "New Message");
        const createdAt = new Date().toISOString();
        dispatch(
          addMessage({
            message: incoming.message,
            type: "recieved",
            createdAt: createdAt,
            profilePicture: incoming.profilePicture,
          })
        );
      }
    };
    socket.on("message", handleMessage);
    return () => {
      socket.off("message", handleMessage);
    };
  }, [socket, user?._id, dispatch]);

  // --- Private Voice (1-to-1) ---
  useEffect(() => {
    if (!socket) return;
    const handleVoice = (incoming: any) => {
      console.log("📩 Incoming 1-to-1 voice:", incoming);
      if (incoming && incoming.from !== user?._id) {
        new Notification("New Voice Message");
        const createdAt = new Date().toISOString();
        dispatch(
          addMessage({
            message: incoming.voice,
            type: "recieved",
            createdAt: createdAt,
            profilePicture: incoming.profilePicture,
          })
        );
      }
    };
    socket.on("voiceMessage", handleVoice);
    return () => {
      socket.off("voiceMessage", handleVoice);
    };
  }, [socket, user?._id, dispatch]);

  // --- Group Messaging ---
  useEffect(() => {
    if (!socket || !selectedRoom) return;
    const handleGroupMessage = (incoming: any) => {
      console.log("📩 Incoming group message:", incoming);
      if (incoming && incoming.from !== user?._id) {
        new Notification(incoming.message || "New Room Message");
        const createdAt = new Date().toISOString();
        dispatch(
          addMessage({
            message: incoming.message,
            type: "recieved",
            createdAt: createdAt,
            profilePicture: incoming.profilePicture,
          })
        );
      }
    };
    socket.on("groupMessage", handleGroupMessage);
    return () => {
      socket.off("groupMessage", handleGroupMessage);
    };
  }, [socket, selectedRoom?._id, user?._id, dispatch]);

  // --- Group Voice ---
  useEffect(() => {
    if (!socket || !selectedRoom) return;
    const handleGroupVoice = (incoming: any) => {
      console.log("📩 Incoming group voice:", incoming);
      if (incoming && incoming.from !== user?._id) {
        const createdAt = new Date().toISOString();
        dispatch(
          addMessage({
            message: incoming.voice,
            type: "recieved",
            createdAt: createdAt,
            profilePicture: incoming.profilePicture,
          })
        );
      }
    };
    socket.on("groupVoice", handleGroupVoice);
    return () => {
      socket.off("groupVoice", handleGroupVoice);
    };
  }, [socket, selectedRoom?._id, user?._id, dispatch]);

  // --- File Reception (Common) ---
  useEffect(() => {
    if (!socket) return;
    const handleFiles = (data: any) => {
      console.log("📩 Incoming files:", data.files);
      const urls: url[] = data.files.map((file: any) => ({
        url: file.url,
        name: file.name,
        type: file.type,
      }));
      if (data && data.from !== user?._id) {
        const createdAt = new Date().toISOString();
        dispatch(
          addMessage({ files: urls, type: "recieved", createdAt: createdAt })
        );
      }
    };
    socket.on("recieved_files", handleFiles);
    return () => {
      socket.off("recieved_files", handleFiles);
    };
  }, [socket, user?._id, dispatch]);

  useEffect(() => {
    if (!voice || !socket) return;
    const createdAt = new Date().toISOString();
    const roomId = selectedRoom?._id ?? one_to_one_id;

    socket.emit("voiceMessage", {
      userId: user?._id,
      profilePicture: user?.profilePicture,
      roomId,
      voice,
    });
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
      const urls: url[] = files.map((file: any) => ({
        url: file.url,
        name: file.filename,
        type: file.mimetype,
      }));
      socket.emit("send_files", {
        roomId: selectedRoom?._id,
        files: urls,
        userId: user?._id,
      });
      dispatch(addMessage({ files: urls, type: "sent", createdAt: createdAt }));
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
      {Messages &&
        Messages.map((msg, ind) => {
          // console.log("voice",)
          // console.log("msg", msg);
          const isSender =
            msg.type === "sent" || msg?.senderId?.token === token;
          const currentDateLabel = getMessageDateLabel(msg.createdAt);
          const previousDateLabel =
            ind > 0 ? getMessageDateLabel(Messages[ind - 1].createdAt) : null;
          const showDateHeader = currentDateLabel !== previousDateLabel;

          return (
            <div key={ind} className="flex flex-col">
              {showDateHeader && (selectedRoom || selectedUser) && (
                <div className="flex justify-center my-4 sticky top-0 z-10 py-1">
                  <span className="text-[11px] bg-[#dcedf5] text-[#54656F] px-4 py-1 rounded-xl font-medium shadow-sm border border-white/20">
                    {currentDateLabel}
                  </span>
                </div>
              )}
              <div
                className={`flex ${isSender ? "self-end" : "self-start flex-row-reverse"
                  } gap - 2`}
              >
                <div className="flex flex-col max-w-xs">
                  {msg.message && typeof msg.message === "string" && (
                    <p className="bg-blue-600 flex flex-col relative px-6 py-3 rounded-md text-sm text-white">
                      {msg.message}
                      <span
                        className={`text - [7px] absolute ${isSender ? "right-2" : "left-2"
                          } text - gray - 300 bottom - 0.5`}
                      >
                        {formatTime(msg.createdAt)}
                      </span>
                    </p>
                  )}
                  {msg.voiceMessage?.voice?.url && (
                    <audio controls src={msg.voiceMessage.voice.url}></audio>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    {msg.files?.map((file, i) => {
                      const mimetype = file.mimetype || file.type || "application/octet-stream";
                      const isImage = mimetype.startsWith("image/");
                      const isVideo = mimetype.startsWith("video/");
                      const isMedia = isImage || isVideo;

                      return (
                        <div key={i} className="flex flex-col gap-1 max-w-[240px]">
                          {isMedia ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <div className="relative group cursor-pointer overflow-hidden rounded-lg border border-white/10 shadow-sm">
                                  {isImage ? (
                                    <img
                                      src={file.url}
                                      alt={file.name || "Image"}
                                      className="max-h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                  ) : (
                                    <div className="relative max-h-48 bg-black/20 flex items-center justify-center aspect-video">
                                      <video className="max-h-48 w-full object-cover">
                                        <source src={file.url} type={mimetype} />
                                      </video>
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                        <PlayCircle className="h-12 w-12 text-white/80" />
                                      </div>
                                    </div>
                                  )}
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="secondary"
                                      size="icon"
                                      className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white border-none"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const a = document.createElement("a");
                                        a.href = file.url;
                                        a.download = file.name || "download";
                                        a.click();
                                      }}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </DialogTrigger>
                              <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none flex items-center justify-center overflow-hidden">
                                <div className="relative w-full h-full flex items-center justify-center p-4">
                                  {isImage ? (
                                    <img
                                      src={file.url}
                                      alt="Full Preview"
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  ) : (
                                    <video controls autoPlay className="max-w-full max-h-full">
                                      <source src={file.url} type={mimetype} />
                                    </video>
                                  )}
                                  <div className="absolute top-4 right-14 z-50">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="cursor-pointer hover:bg-gray-300"
                                      onClick={() => {
                                        const a = document.createElement("a");
                                        a.href = file.url;
                                        a.download = file.name || "download";
                                        a.click();
                                      }}
                                    >
                                      <Download className="h-5 w-5" color="black" />
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-black/5 border border-white/10 hover:bg-black/10 transition-colors group">
                              <FileIconComponent mimetype={mimetype} className="h-10 w-10 shrink-0" />
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-xs font-medium truncate text-white" title={file.name}>
                                  {file.name || "File"}
                                </span>
                                <span className="text-[10px] text-gray-300 uppercase">
                                  {mimetype.split("/")[1] || "unknown"}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-white/70 hover:text-white"
                                onClick={() => {
                                  const a = document.createElement("a");
                                  a.href = file.url;
                                  a.download = file.name || "download";
                                  a.click();
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
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
      {loading && (
        <div className="flex flex-col self-end mb-4 mr-2">
          <div className="bg-blue-600/50 flex flex-col items-center gap-2 px-6 py-3 rounded-md animate-pulse">
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="text-[10px] text-white/80">Sending files...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default Message;

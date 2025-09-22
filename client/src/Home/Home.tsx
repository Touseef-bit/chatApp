import React, { useEffect, useState } from "react";
import SideBar from "@/components/SideBar";
// import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { IoIosSend } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import Message from "@/components/Message";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import SideRoom from "@/components/SideRoom";
import { sendMessage } from "@/slices/sendMessageSlice";
import { sendMessageinRoom } from "@/slices/roomSlice";
import type { AppDispatch } from "../store/store";
// import FileUpload from "@/components/fileUploader";
import { useRef } from "react";
import Image from "@/components/Image";
import FileUpload from "@/components/FileUploader";
import { IoIosCall } from "react-icons/io";
import { useWebRtc } from "@/context/WebRtc";
import {
  Dialog,
  // DialogClose,
  DialogContent,
  // DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import Calling from "@/components/Calling";
// import { useSocket } from "@/context/Socket";
import { Button } from "@/components/ui/button";
import VoiceUploader from "@/components/VoiceUploader";
import { CiVideoOn } from "react-icons/ci";
import { CameraModal } from "@/components/ImageUploader";

// import UploadProfile from "@/components/UploadProfile";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { getMedia, incomingCallRoomId, handleEndCall } = useWebRtc();
  const [open, setOpen] = useState(false);

  // const socket = useSocket();
  const [value, setvalue] = useState<string>("");
  const selectedUser = useSelector(
    (state: RootState) => state.users.selectedUser
  );
  // const { Room } = useSelector((state: RootState) => state.rooms);
  const [callStatus, setCallStatus] = useState("Calling...");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const selectedRoom = useSelector(
    (state: RootState) => state.rooms.selectedRoom
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [messages, setmessages] = useState<string>("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setvalue(e.target.value.toString());
  };
  // const { incomingCallRoomId } = useWebRtc();
  const sendMessagetoServer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedRoom) {
      dispatch(sendMessageinRoom(value));
    } else {
      dispatch(sendMessage(value));
    }
    setmessages(value);
    setvalue("");
    // setmessages("")
  };
  const url = selectedUser
    ? selectedUser.profilePicture?.url ?? null
    : selectedRoom?.profilePicture?.url ?? null;
  const token = user?.token;
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, selectedRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // const handleEndCall = () => {
  //   if (peer.current) {
  //     peer.current.getSenders().forEach((sender) => {
  //       if (sender.track) sender.track.stop();
  //     });
  //     peer.current.close();
  //     peer.current = null;
  //   }

  //   if (localVideoRef.current) localVideoRef.current.srcObject = null;
  //   if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  // };

  useEffect(() => {
    if (incomingCallRoomId === selectedRoom?._id) {
      setCallStatus("Calling...");
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        setCallStatus("Join");
      }, 30000);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [incomingCallRoomId, selectedRoom?._id]);

  return (
    <>
      <main className="w-screen h-screen border-2 flex gap-2">
        <SideBar />
        <section className="border-2 flex max-lg:mr-0 max-lg:my-0 max-lg:rounded-none flex-col justify-between px-4 py-4 w-1/2 grow-3 mr-4 my-4 bg-gray-100 rounded-2xl">
          {(selectedUser || selectedRoom) && (
            <main className="bg-blue-600 flex flex-col rounded-2xl">
              <div className="flex flex-col relative px-4 py-2">
                <div className="flex space-x-3  h-8">
                  {selectedUser ? (
                    <Image
                      url={
                        selectedUser.profilePicture
                          ? selectedUser.profilePicture.url
                          : null
                      }
                    />
                  ) : selectedRoom ? (
                    selectedRoom.members.length > 2 && (
                      <div className="flex items-center -space-x-2">
                        {selectedRoom.members.slice(0, 3).map((user, idx) => (
                          <div
                            key={user._id}
                            className={`w-8 h-8 border-white rounded-full overflow-hidden z-${
                              10 + idx
                            }`}
                          >
                            <Image url={user?.profilePicture?.url || null} />
                          </div>
                        ))}
                        {selectedRoom.members.length > 3 && (
                          <div className="w-8 h-8 bg-gray-300 text-xs flex items-center justify-center rounded-full  border-white">
                            +{selectedRoom.members.length - 3}
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="flex items-center -space-x-2">
                      <div
                        className={`w-8 h-8 border-white rounded-full overflow-hidden`}
                      >
                        {/* <Image
                          url={
                            typeof selectedRoom?.profilePicture === 'object'
    ? selectedRoom?.profilePicture?.url
    : selectedRoom?.profilePicture || null;
                          }
                        /> */}
                      </div>
                    </div>
                  )}
                  <h4 className="font-semibold text-white text-lg">
                    {selectedUser
                      ? selectedUser.username
                      : selectedRoom?.roomName}
                  </h4>
                </div>
                <div className="flex text-sm text-gray-300">
                  {selectedRoom && selectedRoom.members.length > 2
                    ? selectedRoom.members.slice(4).map((user) => {
                        console.log("users", user);
                        return <p key={user._id}>{user.username},</p>;
                      })
                    : null}
                </div>
                <Dialog
                  open={open}
                  onOpenChange={(isOpen) => {
                    setOpen(isOpen);
                    if (!isOpen) handleEndCall();
                  }}
                >
                  <DialogTrigger className="absolute top-1/2 right-5 -translate-y-1/2 cursor-pointer px-1 py-1 duration-150 rounded-full">
                    {incomingCallRoomId === selectedRoom?._id ? (
                      <Button
                        // onClick={() => handleJoin()}
                        variant={"outline"}
                        className="cursor-pointer"
                      >
                        {callStatus}
                      </Button>
                    ) : (
                      <div className="flex gap-5">
                        <IoIosCall
                          onClick={() => getMedia(false)}
                          className="text-white hover:bg-gray-600 p-1.5  rounded-full text-4xl"
                        />
                        <CiVideoOn
                          onClick={() => getMedia(true)}
                          className="text-white hover:bg-gray-600 p-1.5 rounded-full text-4xl"
                        />
                      </div>
                    )}
                  </DialogTrigger>
                  <DialogContent
                    // style={
                    //   fullScreen ? { transform: "none", top: 0, left: 0 } : {}
                    // }
                    className="flex flex-col justify-center  items-center"
                  >
                    <Calling />
                  </DialogContent>
                </Dialog>
              </div>
            </main>
          )}
          <div className="flex flex-col gap-3 overflow-y-auto px-2 py-2 my-3 grow">
            <Message message={messages} />
            <div ref={messagesEndRef} />
          </div>
          {(selectedRoom || selectedUser) && (
            <form
              onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
                sendMessagetoServer(e)
              }
              className="flex relative items-center gap-2"
            >
              <Input
                className="border-blue-600 bg-blue-100"
                placeholder="Message"
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange(e)
                }
              />
              <button type="submit">
                <IoIosSend className="px-1.5 py-1.5 cursor-pointer hover:bg-blue-700 rounded-2xl text-white w-8 h-8 bg-blue-600" />
              </button>
              <div className="absolute flex items-center gap-3 right-12">
                <FileUpload onClick={(e) => e.preventDefault()} />
                <VoiceUploader onClick={(e) => e.preventDefault()} />
                {/* <CameraModal /> */}
                <CameraModal/>
              </div>
            </form>
          )}
        </section>
        <SideRoom />
      </main>
    </>
  );
};

export default Home;

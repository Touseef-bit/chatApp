import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "./Image";
// import { IoIosCall } from "react-icons/io";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { useSocket } from "@/context/Socket";
import { useWebRtc } from "@/context/WebRtc";
import { DialogClose, DialogHeader } from "@/components/ui/dialog";
import { CiVideoOn, CiVideoOff } from "react-icons/ci";
import { CiMaximize2 } from "react-icons/ci";
import { CgMaximizeAlt } from "react-icons/cg";
import { IoIosCall } from "react-icons/io";
import ScreenSharing from "./ScreenSharing";

const Calling = () => {
  const { selectedRoom, selectedUser } = useSelector((state: RootState) => ({
    selectedRoom: state.rooms.selectedRoom,
    selectedUser: state.users.selectedUser,
  }));
  const [cameraOpen, setcameraOpen] = useState(false);
  const [fullScreen, setfullScreen] = useState(true);
  const url = selectedUser
    ? selectedUser.profilePicture?.url ?? null
    : selectedRoom?.profilePicture?.url ?? null;

  const socket = useSocket();

  const videoContainerRef = useRef<HTMLDivElement>(null);
  // const [isVideoCall, setisVideoCall] = useState<boolean | null>(false);
  // const remoteVideoRef = useRef<HTMLVideoElement>();
  // const [userId, setuserId] = useState<string>("");
  const {
    remoteStreams,
    localVideoRef,
    localStreamRef,
    addLocalTracksToPeer,
    createPeer,
    peersRef,
    pendingCandidates,
    // setRemoteStreams,
    handleEndCall,
    setIncomingCallRoomId,
  } = useWebRtc();

  const handleAnswer = useCallback(
    async ({
      from,
      answer,
    }: {
      from: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      const peer = peersRef.current[from];
      console.log("target", peer);
      if (!peer) return;
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
    },
    [peersRef]
  );

  const handleOffer = useCallback(
    async ({
      from,
      offer,
      roomId,
    }: {
      from: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      const peer = createPeer(from);
      // console.log("Received offer from:", from, "roomid", offer);
      await peer.setRemoteDescription(new RTCSessionDescription(offer));

      if (pendingCandidates.current[from]) {
        console.log(`Flushing buffered ICE candidates for ${from}`);
        for (const candidate of pendingCandidates.current[from]) {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        }
        delete pendingCandidates.current[from];
      }

      if (localStreamRef.current) {
        addLocalTracksToPeer(peer, localStreamRef.current);
      }

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket?.emit("group-call-ask-answer", { to: from, answer });
      socket?.emit("user-answer", { to: from, answer });
      setIncomingCallRoomId(roomId);
    },
    [addLocalTracksToPeer, createPeer, localStreamRef, pendingCandidates, setIncomingCallRoomId, socket]
  );
  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setcameraOpen((prev) => !prev);
    }
  };
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };
  useEffect(() => {
    if (!socket) return;
    socket.on("group-call-offer", handleOffer);
    console.log("video local", localStreamRef.current);

    // async ({ from, offer, roomId }) => {
    // setuserId(from);
    // // peer.current.ontrack = (event) => {
    // //   const [remoteStream] = event.streams;
    // //   if (remoteVideoRef.current) {
    // //     remoteVideoRef.current.srcObject = remoteStream;
    // //   }
    // // };
    // const peer = createPeer(from);
    // await peer.setRemoteDescription(new RTCSessionDescription(offer));

    // localStreamRef.current?.getTracks().forEach((track) => {
    //   peer.addTrack(track, localStreamRef.current!);
    // });

    // const answer = await peer.createAnswer();
    // await peer.setLocalDescription(answer);
    // console.log("answer", answer);
    // socket.emit("group-call-ask-answer", { to: from, answer });
    // // setIncomingCallRoomId(roomId);
    // // setPendingCall({ from, offer });
    // // peer.current.ontrack = (event) => {
    // //   const [remoteStream] = event.streams;
    // //   addRemoteStream(from, remoteStream);
    // // };

    socket.on("group-call-answer", handleAnswer);
    socket.on("user-answer", handleAnswer);
    // peer.current.ontrack = (event) => {
    //   const [remoteStream] = event.streams;
    //   const remoteUserId = from;
    //   addRemoteStream(remoteUserId, remoteStream);
    // };
    // peer.current.ontrack = (event) => {
    //   const [remoteStream] = event.streams;
    //   addRemoteStream(userId, remoteStream);
    // };

    return () => {
      socket.off("group-call-answer", handleAnswer);
      socket.off("group-call-offer", handleOffer);
      // socket.off("group-call-ask-answer");
    };
  }, [
    socket,
    createPeer,
    localStreamRef,
    handleOffer,
    handleAnswer,
    localVideoRef,
  ]);

  useEffect(() => {
    socket?.on("call-ended", handleEndCall);

    return () => {
      socket?.off("call-ended", handleEndCall);
    };
  }, [handleEndCall, socket]);
  return (
    <>
      <div
        ref={videoContainerRef}
        className="flex flex-col w-full h-full items-center justify-between py-10 gap-5"
      >
        <DialogHeader className="border-2">
          <Image url={null} />
          {/* <DialogDescription>Calling...</DialogDescription> */}
        </DialogHeader>
        {/* <div className="border-2 border-red-500 relative flex items-center justify-center"> */}
        {/* me */}
        {/* <video ref={remoteVideoRef} playsInline autoPlay /> */}
        <div className="flex align-center flex-wrap gap-3 py-1 relative justify-center border-2 child-div ">
          {/* <div className="border-blue-500 border-2 order-1 w-32 h-32">a</div  > */}
          <video
            className="order-1 w-32 h-32"
            style={{ transform: "scaleX(-1)" }}
            ref={localVideoRef}
            playsInline
            autoPlay
            muted
          />
          {/* <span className="absolute bottom-0 py-1 px-2">You</span> */}
          {/* other users */}
          {/* <div className="border-2 w-32 h-32">b</div>
        <div className="border-2 w-32 h-32">c</div>
        <div className="border-2 w-32 h-32">d</div>
        <div className="border-2 w-32 h-32">e</div>
        <div className="border-2 w-32 h-32">e</div>
        <div className="border-2 w-32 h-32">e</div>
        <div className="border-2 w-32 h-32">f</div> */}

          {remoteStreams.map(({ userId, stream }) => {
            console.log(stream, "video other");
            return (
              <video
                key={userId}
                autoPlay
                playsInline
                ref={(video) => {
                  if (video) video.srcObject = stream;
                }}
                className="w-32  h-32"
              />
            );
          })}
        </div>
        <div className="flex z-50 items-center gap-5">
          <div
            onClick={() => toggleFullscreen()}
            className="p-2 hover:bg-gray-300 rounded-full cursor-pointer"
          >
            {fullScreen ? (
              <CiMaximize2 className="text-2xl" color="blue" />
            ) : (
              <CgMaximizeAlt className="text-2xl" color="blue" />
            )}
          </div>
          <DialogClose
            onClick={() => handleEndCall()}
            className="px-1 py-1 bg-red-600 rounded-full cursor-pointer hover:bg-red-400"
          >
            <IoIosCall className="text-white text-4xl" />
          </DialogClose>
          <div
            onClick={() => toggleCamera()}
            className="hover:bg-gray-300  duration-150 cursor-pointer p-3 rounded-full "
          >
            {cameraOpen ? (
              <CiVideoOff size="25px" color="blue" />
            ) : (
              <CiVideoOn size="25px" color="blue" />
            )}
          </div>
          <div className="absolute top-5 left-5">
            <ScreenSharing isvideoCall={cameraOpen}/>
          </div>
        </div>
      </div>
    </>
  );
};

export default Calling;

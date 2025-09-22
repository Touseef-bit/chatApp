import type { RootState } from "@/store/store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSelector } from "react-redux";
import { useSocket } from "./Socket";

const WebRtc = createContext<null | any>(null);

export const WebRtcProvider = ({ children }: { children: ReactNode }) => {
  const { selectedRoom } = useSelector((state: RootState) => state.rooms);
  const { selectedUser } = useSelector((state: RootState) => state.users);
  const { user } = useSelector((state: RootState) => state.auth);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const [incomingCallRoomId, setIncomingCallRoomId] = useState<string | null>(
    null
  );
  const [pendingCall, setPendingCall] = useState<{
    from: string;
    offer: RTCSessionDescriptionInit;
  } | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<
    { userId: string; stream: MediaStream }[]
  >([]);
  const peersRef = useRef<{ [userId: string]: RTCPeerConnection }>({});
  const pendingCandidates = useRef<{ [userId: string]: RTCIceCandidateInit[] }>(
    {}
  );
  const socket = useSocket();
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [activeCalls, setActiveCalls] = useState<{
    [userId: string]: {
      peer: RTCPeerConnection;
      stream?: MediaStream;
    };
  }>({});
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "in-call">(
    "idle"
  );
  const addRemoteStream = (userId: string, stream: MediaStream) => {
    setRemoteStreams((prev) => {
      const exists = prev.find((s) => s.userId === userId);
      if (exists) return prev;
      return [...prev, { userId, stream }];
    });
  };
  const addLocalTracksToPeer = (
    peer: RTCPeerConnection,
    stream: MediaStream
  ) => {
    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });
  };

  const createPeer = useCallback(
    (targetUserId: string) => {
      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        // iceTransportPolicy: 'relay'
      });
      if (pendingCandidates.current[targetUserId]) {
        console.log(`[ICE] Applying buffered candidates for ${targetUserId}`);
        pendingCandidates.current[targetUserId].forEach(async (candidate) => {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        });
        delete pendingCandidates.current[targetUserId];
      }

      peersRef.current[targetUserId] = peer;

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("ice-candidate", {
            to: targetUserId,
            candidate: event.candidate,
            roomId: selectedRoom?._id,
          });
        }
      };

      peer.ontrack = (event) => {
        const [remoteStream] = event.streams;
        addRemoteStream(targetUserId, remoteStream);
      };

      peer.onnegotiationneeded = async () => {
        if (peer.signalingState !== "stable") return;

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        if (selectedRoom) {
          socket?.emit("group-call", {
            to: targetUserId,
            offer: offer,
            roomId: selectedRoom?._id,
          });
        } else if (selectedUser) {
          socket?.emit("user-call", {
            to: targetUserId,
            offer: offer,
            roomId: selectedUser?._id,
          });
        }
      };

      return peer;
    },
    [selectedRoom, selectedUser, socket]
  );
//   const createPeer = useCallback(
//   (targetUserId: string, isInitiator: boolean = false) => {
//     if (peersRef.current[targetUserId]) {
//       return peersRef.current[targetUserId];
//     }

//     const peer = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     peersRef.current[targetUserId] = peer;

//     peer.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket?.emit("ice-candidate", {
//           to: targetUserId,
//           candidate: event.candidate,
//           roomId: selectedRoom?._id,
//         });
//       }
//     };

//     peer.ontrack = (event) => {
//       const [remoteStream] = event.streams;
//       addRemoteStream(targetUserId, remoteStream);
//     };

//     if (isInitiator) {
//       peer.onnegotiationneeded = async () => {
//         try {
//           const offer = await peer.createOffer();
//           await peer.setLocalDescription(offer);
          
//           socket?.emit("call-offer", {
//             to: targetUserId,
//             offer: offer,
//             roomId: selectedRoom?._id,
//           });
//         } catch (err) {
//           console.error("Negotiation error:", err);
//         }
//       };
//     }

//     return peer;
//   },
//   [selectedRoom?._id, socket]
// );

  const getMedia = useCallback(
    async (isVideoCall: boolean) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      if (!isVideoCall) {
        stream.getVideoTracks().forEach((track) => {
          track.enabled = false;
        });
      }
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      if (selectedRoom?.members) {
        selectedRoom.members.forEach((member) => {
          if (member._id === user?._id) return;

          const peer = createPeer(member._id);
          const senderAlreadyExists = peer.getSenders().length > 0;

          if (!senderAlreadyExists) {
            stream.getTracks().forEach((track) => peer.addTrack(track, stream));
          }
        });
      } else if (selectedUser) {
        const peer = createPeer(selectedUser?._id);
        const senderAlreadyExists = peer.getSenders().length > 0;

        if (!senderAlreadyExists) {
          stream.getTracks().forEach((track) => peer.addTrack(track, stream));
        }
      }
    },
    [createPeer, selectedRoom?.members, selectedUser, user?._id]
  );

//   const getMedia = useCallback(
//   async (isVideoCall: boolean) => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//         video: isVideoCall,
//       });
//       localStreamRef.current = stream;

//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = stream;
//       }

//       let targetUserIds: string[] = [];
      
//       if (selectedRoom) {
//         targetUserIds = selectedRoom.members
//           .filter(member => member._id !== user?._id)
//           .map(member => member._id);
//       } else if (selectedUser) {
//         targetUserIds = [selectedUser._id];
//       }
//       targetUserIds.forEach(userId => {
//         const peer = createPeer(userId, true);
//         addLocalTracksToPeer(peer, stream);
//       });
      
//     } catch (err) {
//       console.error("Call setup failed:", err);
//     }
//   },
//   [createPeer, selectedRoom, selectedUser, user?._id]
// );
  const handleIceCandidate = useCallback(
    async ({
      from,
      candidate,
    }: {
      from: string;
      candidate: RTCIceCandidateInit;
      roomId: string;
    }) => {
      if (!peersRef.current[from] && !pendingCall?.from === from) {
        console.warn(`Rejected ICE candidate from unauthorized user: ${from}`);
        return;
      }

      const peer = peersRef.current[from] || createPeer(from);

      try {
        if (peer.remoteDescription) {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          if (!pendingCandidates.current[from]) {
            pendingCandidates.current[from] = [];
          }
          pendingCandidates.current[from].push(candidate);
        }
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    },
    [createPeer, pendingCall]
  );

  const screenShare = async (isVideoCall: boolean) => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    if (isVideoCall) {
      Object.values(peersRef.current).forEach((peer) => {
        screenStream.getTracks().forEach((track) => {
          peer.addTrack(track, screenStream);
        });
      });
    } else {
      Object.values(peersRef.current).forEach((peer) => {
        const sender = peer.getSenders().find((s) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(screenStream.getVideoTracks()[0]);
        } else {
          peer.addTrack(screenStream.getVideoTracks()[0], screenStream);
        }
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }
    }
  };

  useEffect(() => {
    if (!socket || !peersRef.current) return;

    socket.on("ice-candidate", handleIceCandidate);

    return () => {
      socket.off("ice-candidate");
    };
  }, [socket, user, handleIceCandidate]);

  const handleEndCall = useCallback(() => {
    Object.values(peersRef.current).forEach((peer) => {
      peer.close();
    });

    peersRef.current = {};

    if (selectedRoom?.members?.length == 2) {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    }

    setRemoteStreams([]);
    setIncomingCallRoomId(null);

    socket?.emit("end-call", { roomId: selectedRoom?._id });
  }, [
    localStreamRef,
    peersRef,
    selectedRoom?._id,
    selectedRoom?.members?.length,
    setIncomingCallRoomId,
    setRemoteStreams,
    socket,
  ]);

  return (
    <WebRtc.Provider
      value={{
        getMedia,
        incomingCallRoomId,
        setIncomingCallRoomId,
        localAudioRef,
        localVideoRef,
        pendingCall,
        setPendingCall,
        localStreamRef,
        createPeer,
        peersRef,
        remoteStreams,
        addLocalTracksToPeer,
        addRemoteStream,
        pendingCandidates,
        setRemoteStreams,
        handleEndCall,
        screenShare,
      }}
    >
      {children}
    </WebRtc.Provider>
  );
};

export const useWebRtc = () => {
  return useContext(WebRtc);
};

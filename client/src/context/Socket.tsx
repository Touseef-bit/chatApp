// SocketProvider.tsx
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../types/socket";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

type SocketContextType = Socket<
  ServerToClientEvents,
  ClientToServerEvents
> | null;

const SocketContext = createContext<SocketContextType>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [socket, setSocket] = useState<SocketContextType>(null);
  const socketRef = useRef<SocketContextType>(null);

  useEffect(() => {
  if (!user?.token || !user?._id) return;

  if (!socketRef.current) {
    const newSocket = io("https://192.168.0.117:3000", {
      query: {
        token: user.token,
        userId: user._id,
      },
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.warn("⚠️ Socket disconnected");
    });
  }

  // Cleanup only if user logs out
  return () => {
    if (!user?.token || !user?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        console.log("🔌 Socket disconnected on logout");
      }
    }
  };
}, [user?.token, user?._id]);


  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};

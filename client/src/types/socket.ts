import type { User } from "@/slices/userSlice";

export type url = {
  mimetype: string;
  type: string;
  url: string;
  name: string;
};

type data = {
  userId?: string;
  profilePicture?: {
    url: string,
    _id: string
  }
  user?: User;
  roomId?: string | null;
  message?: string | null;
  files?: url[];
  createdAt?: Date;
};

type missedMessages = data[];

export interface ServerToClientEvents {
  message: (message: string) => void;
  groupMessage: (message: string) => void;
  recieved_files: (files: url[]) => void;
  missedMessages: (data: missedMessages) => void;
}

export interface ClientToServerEvents {
  sendMessage: (data: data) => void;
  joined_room: (roomId: string) => void;
  send_files: (data: data) => void;
  getPrivateMessages: (data: string) => void;
}

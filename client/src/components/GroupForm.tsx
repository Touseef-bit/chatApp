import React, { useState } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { createRoom } from "@/slices/roomSlice";
import { toast } from "react-toastify";

const GroupForm = () => {
  const [roomName, setroomName] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const handlechange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setroomName(e.target.value);
  };
  const handleClick = () => {
    if (roomName) {
      dispatch(createRoom(roomName));
    } else {
      toast.error("Room name is required!");
    }
  };
  return (
    <>
      <DialogContent>
        <DialogHeader className="space-y-7">
          <DialogTitle>Name of your group</DialogTitle>
          <DialogDescription className="space-y-6">
            <Input
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handlechange(e)
              }
              placeholder="Name"
            />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            onClick={() => handleClick()}
            className="w-full px-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            Confirm
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </>
  );
};

export default GroupForm;

import React from "react";
import { Button } from "./ui/button";
import { LuScreenShare } from "react-icons/lu";
import { useWebRtc } from "@/context/WebRtc";

const ScreenSharing = ({isvideoCall}) => {
   const {screenShare} =  useWebRtc()
  return (
    <Button onClick={()=>screenShare(isvideoCall)} className="cursor-pointer">
      <LuScreenShare />
    </Button>
  );
};

export default ScreenSharing;

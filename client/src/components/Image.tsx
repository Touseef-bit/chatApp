import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Image: React.FC = () => {
  return (
    <>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </>
  );
};

export default Image;

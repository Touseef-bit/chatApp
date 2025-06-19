import React from "react";
import { Input } from "./ui/input";
import { Avatar } from "./ui/avatar";

const SideBar: React.FC = () => {
  return (
    <>
      <section className="flex px-3 py-4 gap-4 items-center flex-col w-1/3 my-4 bg-gray-100 mx-4 rounded-2xl">
        <Input className="border-blue-600" placeholder="Search Rooms..." />
        <main className="w-full hover:bg-gray-200 rounded-2xl px-3 cursor-pointer duration-200">
          <div className="space-x-4  py-1.5 flex w-full">
            <Avatar className="border-2 border-blue-600" />
            <div>
              <h4 className="text-sm font-semibold text-blue-600">Name</h4>
              <p className="text-[10px] text-gray-400"> Message</p>
            </div>
          </div>
        </main>
      </section>
    </>
  );
};

export default SideBar;

import React, { useState } from "react";
import { Input } from "./ui/input";
import Users from "@/features/Users";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDispatch, useSelector } from "react-redux";
import { searchUser } from "../slices/userSlice";
import SelectUsers from "@/features/SelectUsers";
import Image from "./Image";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import { logout } from "@/slices/authSlice";
import { Dialog, DialogContent } from "./ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import UploadProfileDialog from "./UploadProfile";
import type { RootState } from "@/store/store";

const SideBar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const { ProfilePic } = useSelector(
    (state: RootState) => state.auth
  );
  const deleteToken = () => {
    dispatch(logout());
    navigate("login");
  };

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <>
      <section
        className={`
          ${isOpen ? "translate-x-0" : "-translate-x-full "}
          fixed top-0 left-0 z-50 bg-gray-100 md:static md:translate-x-0 max-md:h-full md:bg-transparent
          transition-transform duration-300 max-lg:w-72 md:w-1/3
          flex px-3 py-4 gap-5 items-center flex-col my-4 mx-4 max-lg:my-0 max-lg:mx-0 max-lg:rounded-none rounded-2xl
        `}
      >
        <div className="w-full flex justify-end md:hidden">
          <FaArrowLeft
            className="w-5 h-5 text-blue-600 hover:text-blue-800 cursor-pointer"
            onClick={toggleSidebar}
          />
        </div>

        <div className="justify-between flex w-full gap-4">
          <div>
            <Dialog>
              <DialogTrigger className="cursor-pointer">
                <Image url={ProfilePic || null}/>
              </DialogTrigger>
              <DialogContent>
                <UploadProfileDialog />
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-row-reverse gap-4 max-lg:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="bg-blue-600 max-lg:text-sm max-lg:px-1 whitespace-nowrap rounded-lg px-2 py-1 text-white hover:bg-blue-700 cursor-pointer">
                Add group
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel className="space-y-5">
                  <Input
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      dispatch(searchUser(e.target.value));
                    }}
                    className="border-blue-600"
                    placeholder="Search"
                  />
                  <DropdownMenuSeparator />
                  <SelectUsers />
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={deleteToken}
              className="bg-blue-600 hover:bg-blue-700 max-lg:text-sm max cursor-pointer"
            >
              Logout
            </Button>
          </div>
        </div>
        <Users />
      </section>
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-2 z-50 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition md:hidden"
        >
          <FaArrowLeft className="rotate-180" />
        </button>
      )}
    </>
  );
};

export default SideBar;

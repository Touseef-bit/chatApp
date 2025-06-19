import React, { useEffect } from "react";
import SideBar from "@/components/SideBar";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { IoIosSend } from "react-icons/io";
import Image from "@/components/Image";
import { useNavigate } from "react-router-dom";
const Home: React.FC = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  useEffect(() => {
    if(!token){
      navigate('/login')
    }

  }, [token])
  
  return (
    <>
      <main className="w-1/2 flex gap-2 h-3/4">
        <SideBar />
        <section className="border-2 flex flex-col justify-between px-4 py-4 w-1/2 grow mr-4 my-4 bg-gray-100 rounded-2xl">
          <main className="bg-blue-600 rounded-2xl">
            <div className="flex items-center px-4 py-2 gap-7">
              <Avatar className="w-10 h-10" />
              <div>
                <h4 className="font-semibold text-white text-lg">Name</h4>
              </div>
            </div>
          </main>
          <main className="flex flex-col justify-end grow my-3 px-2 py-2">
            <div className="flex self-end gap-2 items-center">
              <p className="bg-blue-600  px-4 py-1 rounded-xl text-sm text-white">
                hello
              </p>
              <Image />
            </div>
            <div className="flex self-baseline gap-2 items-center">
              <p className="bg-blue-600 px-4 py-1 rounded-xl text-sm text-white">
                hello
              </p>
              <Image />
            </div>
          </main>
          <main className="flex items-center gap-2">
            <Input
              className="border-blue-600 bg-blue-100"
              placeholder="Message"
            />
            <IoIosSend className="px-1.5 py-1.5 cursor-pointer hover:bg-blue-700 rounded-2xl text-white w-8 h-8 bg-blue-600" />
          </main>
        </section>
      </main>
    </>
  );
};

export default Home;

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { fetchRoom, setSelectedRoom } from "@/slices/roomSlice";
import { FaArrowLeft } from "react-icons/fa6";
import Image from "./Image";
import { setSelectedUser } from "@/slices/userSlice";

const SideRoom = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { Room } = useSelector((state: RootState) => state.rooms);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const toggleRoom = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    dispatch(fetchRoom());
  }, [dispatch]);

  return (
    <>
      <section
        className={`
          flex Room grow-3 px-3 py-4 gap-5 items-center max-lg:my-0 max-md:h-full max-lg:mx-0 max-lg:rounded-none flex-col max-lg:w-92 w-1/3 my-4 bg-gray-100 mx-4 rounded-2xl

          fixed top-0 right-0 z-40 transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          md:static md:translate-x-0
        `}
      >
        <div className="w-full flex justify-end md:hidden">
          <FaArrowLeft
            onClick={toggleRoom}
            className="w-5 h-5 text-blue-600 cursor-pointer rotate-180"
          />
        </div>

        <h1 className="w-full pl-4 text-2xl text-blue-600">Messages</h1>
        <ul className="w-full py-2 px-4">
          {Room &&
            Room.map((el, ind) => {
              const otherMember = el.members.find(
                (member) => member._id !== user?._id
              );

              return (
                <li
                  key={ind}
                  className="flex gap-3  py-2 hover:bg-gray-200 rounded-2xl px-3 cursor-pointer duration-200 items-center"
                  onClick={() => {
                    dispatch(setSelectedRoom({ el, otherMember }));
                    dispatch(setSelectedUser(null));
                  }}
                >
                  {el.members.length == 2 && (
                    <Image
                      url={
                        otherMember?.profilePicture
                          ? otherMember.profilePicture.url
                          : null
                      }
                    />
                  )}
                  <h3>{el.roomName ?? otherMember?.username}</h3>
                </li>
              );
            })}
        </ul>
      </section>
      {!isOpen && (
        <div
          onClick={toggleRoom}
          className="fixed top-14 right-2 z-50 md:hidden"
        >
          <FaArrowLeft className="bg-blue-600 w-6 h-6 text-white px-1 rounded-full cursor-pointer" />
        </div>
      )}
    </>
  );
};

export default SideRoom;

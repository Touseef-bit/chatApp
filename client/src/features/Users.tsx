import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, setSelectedUser } from "../slices/userSlice";
import type { RootState, AppDispatch } from "../store/store";
import Image from "@/components/Image";
import { getMessages, setSelectedRoom } from "@/slices/roomSlice";

const Users = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users,loading } = useSelector((state: RootState) => state.users);
  // const { Room } = useSelector((state: RootState) => state.rooms);
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);
  // useEffect(() => {
  //   if(!user) return
  //   dispatch(fetchUsers(user?.token));
  // }, [dispatch]);

  if (loading) return <p>loading...</p>;
  // if (error) return <p>{error}</p>
  return (
    <>
      <ul className="flex w-full flex-col gap-2">
        {users &&
          users.map((el, ind) => {
            return (
              <li
                onClick={() => {
                  dispatch(setSelectedUser(el));
                  dispatch(getMessages())
                  dispatch(setSelectedRoom(null));
                }}
                className="flex gap-3 py-2 hover:bg-gray-200  rounded-2xl px-3 cursor-pointer duration-200 items-center"
                key={ind}
              >
                <Image url={el.profilePicture ? el.profilePicture.url : ""} />
                <h3>{el.username}</h3>
              </li>
            );
          })}
      </ul>
    </>
  );
};

export default Users;

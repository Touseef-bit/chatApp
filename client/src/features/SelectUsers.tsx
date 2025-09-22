import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, addUserToSelection } from "../slices/userSlice";
import type { RootState, AppDispatch } from "../store/store";
import Image from "@/components/Image";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import GroupForm from "@/components/GroupForm";

const SelectUsers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allUsers,loading, error, selectUsers, filterUser } = useSelector(
    (state: RootState) => state.users
  );
  const isSelected = (username: string) => {
    return selectUsers?.some(
      (u) => u._id === username || u.username === username
    );
  };
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) return <p>loading...</p>;
  if (error) return <p>{error}</p>;

  console.log("selectedUsers", selectUsers);

  return (
    <>
      <ul className="flex w-full flex-col gap-2">
        {filterUser ? (
          <li
            onClick={() => {}}
            className="flex gap-3 py-2 hover:bg-gray-200 rounded-2xl px-1 cursor-pointer duration-200 items-center"
          >
            <Input type="checkbox" className="w-3 h-3" />
            <Image />
            <h3>{filterUser.username}</h3>
          </li>
        ) : (
          allUsers?.map((el, ind) => {
            return (
              <li
                onClick={() => {}}
                className="flex gap-3 py-2 hover:bg-gray-200 rounded-2xl px-1 cursor-pointer duration-200 items-center"
                key={ind}
              >
                <Input
                  type="checkbox"
                  checked={isSelected(el.username)}
                  onChange={(e) =>
                    dispatch(
                      addUserToSelection({
                        user: el,
                        selected: e.target.checked,
                      })
                    )
                  }
                  className="w-3 h-3"
                />
                <Image />
                <h3>{el.username}</h3>
              </li>
            );
          })
        )}
        <Dialog>
          <DialogTrigger className="bg-blue-600 px-1 py-2 rounded-lg hover:bg-blue-700 text-white cursor-pointer">
            Next
          </DialogTrigger>
          <GroupForm />
        </Dialog>
      </ul>
    </>
  );
};

export default SelectUsers;

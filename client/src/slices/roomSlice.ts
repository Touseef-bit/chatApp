import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import { api } from "@/lib/api.instance";

// "url": {
//         "voice": {
//             "url": "https://res.cloudinary.com/dtuw7udqm/video/upload/v1752827055/chatApp/file-1752827055779.webm"
//         },
//         "_id": "687a04b147c36f271e8be409",
//         "createdAt": "2025-07-18T08:24:17.418Z",
//         "updatedAt": "2025-07-18T08:24:17.418Z",
//         "__v": 0
//     }

export type IVoice = {
  voice: {
    url: string;
  };
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type Room = {
  _id: string;
  roomName: string;
  members: {
    _id: string;
    username: string;
    profilePicture: {
      url: string;
      _id: string;
    };
  }[];
  profilePicture: {
    url: string;
    _id: string;
  };
  messages?: {
    message: string;
    senderId?: {
      token: string | null;
      username: string;
    };
    recieverId?: {
      username: string;
    };
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  }[];
  __v: number;
};
type UserState = {
  Room: Room[];
  userMessages: Room | null;
  selectedRoom: Room | null;
  loading: boolean;
  error: string;
  voice: IVoice | null;
};

const initialState: UserState = {
  Room: [],
  voice: null,
  userMessages: null,
  selectedRoom: null,
  loading: false,
  error: "",
};

// type createRoom = {
//   member: string[];
//   messages: string[] | null;
//   _id: string;
//   __v: number;
// };

// type data = createRoom

// const token = localStorage.getItem("token");
export const fetchRoom = createAsyncThunk<Room[], void, { state: RootState }>(
  "user/fetchRoom",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const token = state.auth.user?.token;

    const response = await api.get("/getRoom", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.rooms;
  }
);

export const getMessages = createAsyncThunk<Room, void, { state: RootState }>(
  "messages/getMessages",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const selectedUser = state.users.selectedUser;
    const token = state.auth.user?.token;
    const res = await api.get(`/getMessages/${selectedUser?._id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log(res.data.room)
    return res.data.room;
  }
);

export const sendMessageinRoom = createAsyncThunk<
  unknown,
  string,
  { state: RootState }
>("message/sendmessage", async (message, thunkAPI) => {
  const state = thunkAPI.getState();
  const selectedUser = state.users.selectedUser;
  const token = state?.auth?.user?.token;
  const selectedRoom = state.rooms.selectedRoom;
  // console.log(selectedRoom?._id);
  const res = await api.post(
    `/roommessage/${selectedRoom?._id}`,
    { message, receiverId: selectedUser?._id || null },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data.message;
});

export const createRoom = createAsyncThunk<Room, string, { state: RootState }>(
  "Room/createRoom",
  async (roomName, thunkAPI) => {
    const state = thunkAPI.getState();
    // const token = localStorage.getItem("token");
    const token = state?.auth?.user?.token;

    const selectUsers = state.users.selectUsers;
    const userIds = selectUsers?.map((el) => {
      return el._id;
    });

    const res = await api.post(
      "/createRoom",
      { roomName, userIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(res, "room creation reponse");

    return res.data.data;
  }
);

export const sendVoiceinRoom = createAsyncThunk<
  IVoice,
  FormData,
  { state: RootState }
>("message/sendmessage", async (fd, thunkAPI) => {
  const state = thunkAPI.getState();
  // const selectedUser = state.users.selectedUser;
  const token = state?.auth?.user?.token;
  const selectedRoom = state.rooms.selectedRoom;
  // console.log("form",FormData);
  const res = await api.post(`/roommessage/${selectedRoom?._id}`, fd, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(res.data)
  return res.data.voice;
});

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setSelectedRoom: (state, { payload }) => {
      if (!payload) {
        state.selectedRoom = null;
        return;
      }
      const { el, otherMember } = payload;
      state.selectedRoom = { ...el };

      if (state.selectedRoom) {
        if (!state.selectedRoom.roomName) {
          state.selectedRoom.roomName = el.roomName || otherMember?.username;
        }

        if (!state.selectedRoom.profilePicture) {
          state.selectedRoom.profilePicture =
            el.profilePicture || otherMember?.profilePicture;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchRoom.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchRoom.fulfilled, (state, action) => {
      state.loading = false;
      state.Room = action.payload;
    });
    builder.addCase(createRoom.fulfilled, (state, action) => {
      state.Room.push(action.payload);
    });
    builder.addCase(getMessages.fulfilled, (state, { payload }) => {
      state.userMessages = payload;
    });
    builder.addCase(sendVoiceinRoom.fulfilled, (state, { payload }) => {
      console.log(payload)
      state.voice = payload;
    });
  },
});

export const { setSelectedRoom } = roomSlice.actions;
export default roomSlice.reducer;

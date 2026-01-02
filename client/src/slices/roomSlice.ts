import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import { api } from "@/lib/api.instance";
import type { ChatMessage } from "@/components/Message";

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
    __v?: number;
  }[];
  friend?: {
    id: string;
    name: string;
    avatar: string;
  };
  __v: number;
};
type UserState = {
  Room: Room[];
  messages: Record<string, ChatMessage[]>;
  selectedRoom: Room;
  loading: boolean;
  error: string;
  voice: IVoice;
};

const initialState: UserState = {
  Room: [],
  messages: {},
  voice: {} as IVoice,
  selectedRoom: {} as Room,
  loading: false,
  error: "",
};

export const fetchRoom = createAsyncThunk<Room[], void, { state: RootState }>(
  "user/fetchRoom",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const token = state.auth.user?.token;

    const response = await api.get("/room", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.rooms;
  }
);

interface getRoomMessage {
  messages: ChatMessage[];
  roomId: string;
}

export const getRoomMessages = createAsyncThunk<
  getRoomMessage,
  void,
  { state: RootState }
>("messages/getMessages", async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  const selectedRoomId = state.rooms.selectedRoom._id;
  const token = state.auth.user?.token;
  const res = await api.get(`/room/${selectedRoomId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return { messages: res.data.data.messages, roomId: selectedRoomId };
});

export const sendMessageinRoom = createAsyncThunk<
  unknown,
  string,
  { state: RootState }
>("message/sendmessage", async (message, thunkAPI) => {
  const state = thunkAPI.getState();
  const selectedUser = state.users.selectedUser;
  const token = state?.auth?.user?.token;
  const selectedRoom = state.rooms.selectedRoom;
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
  const token = state?.auth?.user?.token;
  const selectedRoom = state.rooms.selectedRoom;
  const res = await api.post(`/roommessage/${selectedRoom?._id}`, fd, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.voice;
});

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    addMessage: (state, { payload }) => {
      const roomId = state.selectedRoom?._id;
      if (state.messages[roomId]) {
        state.messages[roomId].push(payload);
      } else {
        state.messages[roomId] = [payload];
      }
    },
    setMessages: (state, { payload }) => {
      state.messages = payload;
    },
    setSelectedRoom: (state, { payload }) => {
      if (!payload) return;
      const { el, otherMember } = payload;
      state.selectedRoom = { ...el };

      if (state.selectedRoom) {
        // Priority 1: User-defined Room Name (GroupName)
        if (el.roomName) {
          state.selectedRoom.roomName = el.roomName;
        }
        // Priority 2: Pre-resolved friend (backend handled 1-to-1)
        else if (state.selectedRoom.friend) {
          state.selectedRoom.roomName = state.selectedRoom.friend.name;
          state.selectedRoom.profilePicture = {
            url: state.selectedRoom.friend.avatar,
            _id: state.selectedRoom.friend.id
          };
        }
        // Priority 3: Fallback username
        else {
          if (!state.selectedRoom.roomName) {
            state.selectedRoom.roomName = otherMember?.username;
          }
          if (!state.selectedRoom.profilePicture) {
            state.selectedRoom.profilePicture =
              el.profilePicture || otherMember?.profilePicture;
          }
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
    builder.addCase(getRoomMessages.fulfilled, (state, { payload }) => {
      state.messages[payload.roomId] = payload.messages;
    });
    builder.addCase(sendVoiceinRoom.fulfilled, (state, { payload }) => {
      state.voice = payload;
    });
  },
});

export const getSelectedRoomId = (state: RootState) =>
  state.rooms.selectedRoom._id;

export const getMessages = (state: RootState) => {
  const roomId = state.rooms.selectedRoom._id
  return state.rooms.messages[roomId] || [];
}



export const { setSelectedRoom, addMessage } = roomSlice.actions;
export default roomSlice.reducer;

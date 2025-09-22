import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import { api } from "@/lib/api.instance";
// import type { Room } from "./roomSlice";

type files = {
  url: string;
  public_id: string;
  filename: string;
  mimetype: string;
};

type State = {
  files: files[] | null;
};

const initialState: State = {
  files: [],
};

export const sendMessage = createAsyncThunk<
  string,
  string,
  { state: RootState }
>("message/sendMessage", async (message, thunkAPI) => {
  const state = thunkAPI.getState();
  const selectedUser = state.users.selectedUser;
  const token = state?.auth?.user?.token;

  const response = await api.post(
    `/message/${selectedUser?._id}`,
    { message },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.message;
});



export const uploadFiles = createAsyncThunk<
  files[], // return type (you can replace `any` with a better type if known)
  FormData, // argument type (formData)
  { state: RootState } // thunkAPI config (to access state)
>("files/sendFiles", async (formData, thunkAPI) => {
  const state = thunkAPI.getState();
  const selectedRoom = state.rooms.selectedRoom;
  const token = state.auth.user?.token; // safely get token

  const res = await api.post(
    selectedRoom ? `/uploadFiles/${selectedRoom._id}` : "/uploadFiles",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data.files as files[];
});

export const sendVoice = createAsyncThunk<
  string,
  FormData,
  { state: RootState }
>("message/sendMessage", async (formData, thunkAPI) => {
  const state = thunkAPI.getState();
  const selectedUser = state.users.selectedUser;
  const token = state?.auth?.user?.token;

  const response = await api.post(
    `/message/${selectedUser?._id}`, formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.message;
});

const messageSlice = createSlice({
  name: "sendMessage",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(uploadFiles.fulfilled, (state, { payload }) => {
      state.files = payload;
    });
  },
});

export default messageSlice.reducer;

import { api } from "@/lib/api.instance";
import type { RootState } from "@/store/store";
import {
  createAsyncThunk,
  createSlice,
  // type PayloadAction,
} from "@reduxjs/toolkit";

type User = {
  _id: string;
  username: string;
  roles: string;
  token: string;
  profilePicture?: {
    url: string;
    _id: string;
  };
  createdAt: string;
  updatedAt: string;
};

type errorResponse = { message: string };

type response = {
  success: boolean;
  message: string;
  user: User;
};

type value = {
  username?: string | undefined;
  email: string | undefined;
  password: string | undefined;
};

type UserState = {
  user: User;
  profileLoading: boolean;
  ProfilePic: string | undefined;
  errmsg: string | null;
  loading: boolean;
};

const initialState: UserState = {
  user: {} as User,
  profileLoading: false,
  ProfilePic: undefined,
  errmsg: null,
  loading: false,
};
export const LoginUser = createAsyncThunk<
  response,
  value,
  { rejectValue: errorResponse }
>("users/login", async (value, thunkAPI) => {
  try {
    const res = await api.post("/login", value);
    return res.data;
  } catch (error: any) {
    if (error.response && error.response.data?.message) {
      return thunkAPI.rejectWithValue({ message: error.response.data.message });
    }
    return thunkAPI.rejectWithValue({
      message: "Login failed. Please try again.",
    });
  }
});
export const SignUpUser = createAsyncThunk<
  response,
  value,
  { rejectValue: errorResponse }
>("users/signup", async (value, thunkAPI) => {
  try {
    console.log(value)
    const res = await api.post("/signup", value);
    return res.data;
  } catch (error: any) {
    if (error.response && error.response.data?.message) {
      return thunkAPI.rejectWithValue({ message: error.response.data.message });
    }
    return thunkAPI.rejectWithValue({
      message: "Login failed. Please try again.",
    });
  }
});

export const uploadProfilePic = createAsyncThunk<
  string,
  FormData,
  { state: RootState }
>("upload/profile", async (formData, thunkAPI) => {
  const state = thunkAPI.getState();
  const { user } = state.auth;
  const token = user?.token;
  const res = await api.post("/uploadProfile", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.url;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = {} as User;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(LoginUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(LoginUser.fulfilled, (state, { payload }) => {
      state.user = payload.user;
      state.ProfilePic = payload.user.profilePicture?.url;
    });
    builder.addCase(LoginUser.rejected, (state, action) => {
      console.log(action.payload?.message);
      state.loading = false;
      if (action.payload) {
        state.errmsg = action.payload.message;
      } else {
        state.errmsg = action.error.message ?? "Unexpected error";
      }
    });
    builder.addCase(SignUpUser.fulfilled, (state, { payload }) => {
      state.user = payload.user;
    });
    builder.addCase(SignUpUser.rejected, (state, action) => {
      console.log(action.payload?.message);
      state.loading = false;
      if (action.payload) {
        state.errmsg = action.payload.message;
      } else {
        state.errmsg = action.error.message ?? "Unexpected error";
      }
    });
    builder.addCase(uploadProfilePic.pending, (state) => {
      state.profileLoading = true;
    });
    builder.addCase(uploadProfilePic.fulfilled, (state, { payload }) => {
      state.profileLoading = true;
      state.ProfilePic = payload;
    });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;

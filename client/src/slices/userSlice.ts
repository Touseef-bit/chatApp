import { api } from "@/lib/api.instance";
import type { RootState } from "@/store/store";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export type User = {
  username: string;
  _id: string;
  roles: string;
  profilePicture:{
    url:string,
    _id:string
  }
  createdAt: Date | null;
  updatedAt: Date | null;
};

type response = {
  success:boolean,
  users:User[],
  allUsers:User[]
}

type UserState = {
  users: User[];
  selectedUser: User | null;
  selectUsers: User[] | null;
  allUsers:User[] | null;
  filterUser: User | null;
  loading: boolean;
  error: string;
};

const initialState: UserState = {
  users: [],
  selectedUser: null,
  selectUsers: [],
  allUsers:null,
  loading: false,
  filterUser: null,
  error: "",
};

export const fetchUsers = createAsyncThunk<response, void, { state: RootState }>(
  "user/fetchUser",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const token = state?.auth?.user?.token;

    const response = await api.get("/getAllUser", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }
);



const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setSelectedUser: (state, { payload }) => {
      state.selectedUser = payload;
    },
    searchUser: (state, { payload }) => {
      const user =
        payload &&
        state.users.find((user) => user.username.includes(payload));
      state.filterUser = user || null;
    },
    addUserToSelection: (state, action) => {
      const { user, selected } = action.payload;

      if (selected) {
        if (state.selectUsers) {
          state.selectUsers.push(user);
        } else {
          state.selectUsers = [user];
        }
      } else {
        state.selectUsers = state.selectUsers
          ? state.selectUsers.filter((u) => u._id !== user._id)
          : null;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.users = action.payload.users;
      state.allUsers = action.payload.allUsers;
    });
    
  },
});
export const { setSelectedUser, searchUser, addUserToSelection } =
  userSlice.actions;
export default userSlice.reducer;

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "../slices/userSlice";
import roomReducer from "../slices/roomSlice";
import authReducer from "../slices/authSlice";
import messageReducer from "../slices/sendMessageSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";


const rootReducer = combineReducers({
  users: userReducer,
  rooms: roomReducer,
  auth: authReducer,
  message:messageReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],  
  blacklist: ["rooms", "users"],
};


const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

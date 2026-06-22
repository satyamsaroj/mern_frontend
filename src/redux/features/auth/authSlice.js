
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  token: localStorage.getItem("token") || null, // ← add token
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, ...user } = action.payload;
      state.userInfo = user;
      state.token = token;
      localStorage.setItem("userInfo", JSON.stringify(user));
      localStorage.setItem("token", token); // ← save token
    },
    logout: (state) => {
      state.userInfo = null;
      state.token = null;
      localStorage.clear();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
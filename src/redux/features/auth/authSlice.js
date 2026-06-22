// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   userInfo: localStorage.getItem("userInfo")
//     ? JSON.parse(localStorage.getItem("userInfo"))
//     : null,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setCredentials: (state, action) => {
//       state.userInfo = action.payload;
//       localStorage.setItem("userInfo", JSON.stringify(action.payload));
//       const expirationTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
//       localStorage.setItem("expirationTime", expirationTime);
//     },

//     logout: (state) => {
//       state.userInfo = null;
//       localStorage.clear();
//     },
//   },
// });

// export const { setCredentials, logout } = authSlice.actions;
// export default authSlice.reducer;
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
import { createSlice } from "@reduxjs/toolkit";

const initialState = { currentUser: null, loading: false, error: null };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => { state.loading = true; state.error = null; },
    signInSuccess: (state, action) => { state.loading = false; state.currentUser = action.payload; },
    signInFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    signOut: (state) => { state.currentUser = null; state.error = null; },
  },
});

export const { signInStart, signInSuccess, signInFailure, signOut } = userSlice.actions;
export default userSlice.reducer;

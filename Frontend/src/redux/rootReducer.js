import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice.js";
import { authApi } from "@/features/api/authApi.js";
import { userApi } from "@/features/api/userApi.js";
import { taskApi } from "@/features/api/taskApi.js";


const rootReducer = combineReducers({
    // API reducers
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [taskApi.reducerPath]: taskApi.reducer,

    // Regular Slice Reducer
    auth: authReducer,
});

export default rootReducer;
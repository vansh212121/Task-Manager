import { createApi } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";
import { userApi } from "./userApi";
import { baseQueryWithReauth } from "@/redux/baseQueryWithReauth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: new URLSearchParams({ username: credentials.email, password: credentials.password }),
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const { data: tokenData } = await queryFulfilled;

                    // 1️⃣ Immediately save tokens to Redux & localStorage
                    dispatch(
                        userLoggedIn({
                            user: null, // temporarily null, we’ll fill it next
                            access_token: tokenData.access_token,
                            refresh_token: tokenData.refresh_token,
                        })
                    );

                    // 2️⃣ Now fetch user profile using the stored accessToken
                    const userResponse = await dispatch(userApi.endpoints.getMe.initiate()).unwrap();

                    // 3️⃣ Update user in Redux
                    dispatch(
                        userLoggedIn({
                            user: userResponse,
                            access_token: tokenData.access_token,
                            refresh_token: tokenData.refresh_token,
                        })
                    );
                } catch (err) {
                    console.error("Login sequence failed:", err);
                    throw err;
                }
            },



        }),

        signup: builder.mutation({
            query: (userInfo) => ({
                url: "/auth/signup",
                method: "POST",
                body: userInfo,
            }),

            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    await queryFulfilled;
                    console.log("Signup successful. Logging in...");
                    dispatch(authApi.endpoints.login.initiate({ email: arg.email, password: arg.password }));
                } catch (err) {
                    console.error("Signup failed:", err);
                }
            }
        }),

        logout: builder.mutation({
            query: (body) => ({
                url: '/auth/logout',
                method: 'POST',
                body,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                } finally {
                    dispatch(userLoggedOut());
                    dispatch(userApi.util.resetApiState());
                }
            },
        }),


        refreshToken: builder.mutation({
            query: (refreshToken) => ({
                url: "/auth/refresh",
                method: "POST",
                body: { refresh_token: refreshToken },
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled;

                    // ✅ Immediately persist the rotated tokens
                    localStorage.setItem("accessToken", data.access_token);
                    localStorage.setItem("refreshToken", data.refresh_token);

                    // Then fetch user profile
                    const userResponse = await dispatch(
                        userApi.endpoints.getMe.initiate(data.access_token)
                    );

                    const credentials = {
                        user: userResponse.data,
                        access_token: data.access_token,
                        refresh_token: data.refresh_token,
                    };
                    dispatch(userLoggedIn(credentials));
                } catch (error) {
                    console.error("Token refresh failed:", error);
                    dispatch(userLoggedOut());
                }
            },
        }),

    }),
});

export const {
    useLoginMutation,
    useSignupMutation,
    useLogoutMutation,
    useRefreshTokenMutation,
} = authApi;
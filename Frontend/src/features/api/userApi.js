import { createApi } from "@reduxjs/toolkit/query/react";
import { userLoggedOut } from "../authSlice";
import { baseQueryWithReauth } from "@/redux/baseQueryWithReauth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const userApi = createApi({
    reducerPath: "userApi",
    tagTypes: ['User'],
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        // 1. GET CURRENT USER PROFILE
        getMe: builder.query({
            query: () => '/users/me',
            mehtod: "GET",
            providesTags: ['User'],
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error("GetMe Query Failed, logging out.", error);
                    dispatch(userLoggedOut());
                }
            }
        }),

        // 2. UPDATE PROFILE
        updateMyAccount: builder.mutation({
            query: (updateData) => ({
                url: '/users/me',
                method: "PATCH",
                body: updateData
            }),
            invalidatesTags: ['User']
        }),

        // 3. DELETE ACCOUINT
        deleteMyAccount: builder.mutation({
            query: () => ({
                url: '/users/me',
                method: "DELETE",
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    await queryFulfilled;
                    // Always log out on the client after a successful deactivation
                    dispatch(userLoggedOut());
                } catch (err) {
                    console.error("Deactivation failed on server, but forcing logout.", err);
                    dispatch(userLoggedOut());
                }
            }
        }),

        // 4. CHANGE PASSWORD
        changeMyPassword: builder.mutation({
            query: (passwordData) => ({
                url: '/users/change-password',
                method: "POST",
                body: passwordData
            }),

            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    await queryFulfilled;
                    // Always log out on the client after a successful deactivation
                    dispatch(userLoggedOut());
                } catch (err) {
                    console.error("Deactivation failed on server, but forcing logout.", err);
                    dispatch(userLoggedOut());
                }
            }
        }),
    }),
});

export const {
    useGetMeQuery,
    useUpdateMyAccountMutation,
    useDeleteMyAccountMutation,
    useChangeMyPasswordMutation,
} = userApi;
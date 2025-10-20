import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/redux/baseQueryWithReauth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const taskApi = createApi({
    reducerPath: "taskApi",
    tagTypes: ['Task'],
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        //1. Get task by ID
        getTaskById: builder.query({
            query: (taskId) => `/tasks/${taskId}`,
            providesTags: (result, error, taskId) => [{ type: 'Task', id: taskId }],
        }),

        // 2. Create a task
        createTask: builder.mutation({
            query: (taskData) => ({
                url: "/tasks",
                method: "POST",
                body: taskData
            }),
            invalidatesTags: [{ type: 'Task', id: 'LIST' }],
        }),

        // 3. Update a task
        updateTask: builder.mutation({
            query: ({ taskData, taskId }) => ({
                url: `/tasks/${taskId}`,
                method: "PATCH",
                body: taskData
            }),
            invalidatesTags: (result, error, { taskId }) => [
                { type: 'Task', id: taskId },
                { type: 'Task', id: 'LIST' },
            ],
        }),

        // 4. Delete a task
        deleteTask: builder.mutation({
            query: (taskId) => ({
                url: `/tasks/${taskId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, taskId) => [
                { type: 'Task', id: taskId },
                { type: 'Task', id: 'LIST' },
            ],
        }),

        // 5. GET ALL TASKS
        getMyTasks: builder.query({
            query: (params) => ({
                url: '/users/me/tasks',
                params: params
            }),
            providesTags: (result, error, arg) =>
                result
                    ? [
                        // Tag each item in the list
                        ...result.items.map(({ id }) => ({ type: 'Task', id: id })),
                        // Tag the list itself
                        { type: 'Task', id: 'LIST' },
                    ]
                    : [{ type: 'Task', id: 'LIST' }],
        })
    }),
});

export const {
    useGetTaskByIdQuery,
    useCreateTaskMutation,
    useUpdateTaskMutation,
    useDeleteTaskMutation,
    useGetMyTasksQuery,
} = taskApi;
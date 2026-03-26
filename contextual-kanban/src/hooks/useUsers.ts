import { User } from "@/types/kanban";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";

export function useUsers() {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("kanban_auth_token");

    const { data: currentUser = null, isLoading } = useQuery({
        queryKey: ["currentUser"],
        queryFn: async () => {
            if (!token) return null;
            try {
                return await usersApi.getMe();
            } catch (err) {
                // If token is invalid/expired, clear it
                localStorage.removeItem("kanban_auth_token");
                return null;
            }
        },
        enabled: !!token, // Only fetch if there's a token
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    const currentUserId = currentUser?.id || null;

    const logout = () => {
        localStorage.removeItem("kanban_auth_token");
        queryClient.setQueryData(["currentUser"], null);
        queryClient.clear(); // Clear all other queries (boards, orgs, etc)
    };

    const updateMutation = useMutation({
        mutationFn: async (updatedUser: User) => {
            // Note: In real app, we would PUT/PATCH to API
            // usersApi.updateUser(updatedUser)...
            return updatedUser;
        },
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(["currentUser"], updatedUser);
        }
    });

    const updateUser = updateMutation.mutate;

    // Keep backwards compatibility for components that might expect `users` array
    // Since we no longer have a global mock users array, we just return an empty array if requested,
    // or the current user as a single element array. Realistically, components should fetch users by ID from API.
    const users = currentUser ? [currentUser] : [];

    return {
        users, // Deprecated mock fallback
        currentUser,
        currentUserId,
        isLoading,
        logout,
        updateUser,
    };
}


import { User } from "@/types/kanban";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

    useEffect(() => {
        let isDark = false;

        if (currentUser) {
            const theme = currentUser.preferences.theme;
            isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
        } else {
            // Fallback for logged-out / unauthenticated users
            isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        }

        document.documentElement.classList.toggle("dark", isDark);
    }, [currentUser?.preferences?.theme]);

    const logout = () => {
        localStorage.removeItem("kanban_auth_token");
        queryClient.setQueryData(["currentUser"], null);
        queryClient.clear(); // Clear all other queries (boards, orgs, etc)
    };

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
    };
}


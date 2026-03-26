import axios from "axios";
import { User, BoardConfig, KanbanBoard, KanbanCard, Organization, BoardTemplate, FileAttachment } from "@/types/kanban";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Assuming token is stored in localStorage by `useUsers` when fully active
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("kanban_auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Ensure trailing slash for Django's APPEND_SLASH
    if (config.url && !config.url.endsWith("/") && !config.url.includes("?")) {
        config.url += "/";
    }
    return config;
});

// ==========================================
// Authentication
// ==========================================
export const authApi = {
    login: async (data: { email: string; password: string }): Promise<{ token: string; user: User }> => {
        // SimpleJWT returns { access, refresh } — normalize to { token, user }
        const tokenRes = await api.post<{ access: string; refresh?: string }>("/auth/login", data);
        const token = tokenRes.data.access;

        // Temporarily set the token so the lookup call is authenticated
        localStorage.setItem("kanban_auth_token", token);

        // Fetch the user profile using the email provided at login
        const user = await api.get<User>("/users/lookup", { params: { email: data.email } }).then(r => r.data);

        return { token, user };
    },
    signup: (data: any) => api.post<{ token: string; user: User }>("/auth/signup", data).then((res) => res.data),
};

// ==========================================
// Users
// ==========================================
export const usersApi = {
    getMe: () => api.get<User>("/users/me").then((res) => res.data),
    lookup: (email: string) => api.get<User>("/users/lookup", { params: { email } }).then((res) => res.data),
};

// ==========================================
// Organizations
// ==========================================
export const orgsApi = {
    getOrgs: () => api.get<Organization[]>("/organizations").then((res) => res.data),
    createOrg: (data: { name: string }) => api.post<Organization>("/organizations", data).then((res) => res.data),
    addMembers: (orgId: string, userIds: string[]) => api.post(`/organizations/${orgId}/members`, { userIds }).then((res) => res.data),
};

// ==========================================
// Boards
// ==========================================
export const boardsApi = {
    getBoards: () => api.get<KanbanBoard[]>("/boards").then((res) => res.data),
    createBoard: (config: BoardConfig, boardId?: string) => {
        const { columns, ...rest } = config;
        return api.post<KanbanBoard>("/boards", { ...rest, column_names: columns, id: boardId }).then((res) => res.data);
    },
    updateBoard: (id: string, boardObj: Partial<KanbanBoard>) => {
        const payload: Record<string, any> = {};
        if (boardObj.config) {
            // Flatten config back into the root for the backend DRF serializer
            const { name, fields, tags, focusColumns } = boardObj.config;
            if (name !== undefined) payload.name = name;
            if (fields !== undefined) payload.fields = fields;
            if (tags !== undefined) payload.tags = tags;
            if (focusColumns !== undefined) payload.focusColumns = focusColumns;
        }
        return api.put<KanbanBoard>(`/boards/${id}`, payload).then((res) => res.data);
    },
    deleteBoard: (id: string) => api.delete(`/boards/${id}`).then((res) => res.data),
    shareBoard: (id: string, payload: { userIds?: string[]; orgIds?: string[]; emails?: string[] }) =>
        api.post(`/boards/${id}/share`, payload).then((res) => res.data),
};

// ==========================================
// Cards
// ==========================================
export const cardsApi = {
    createCard: (boardId: string, columnId: string, card: any) =>
        api.post<KanbanCard>(`/boards/${boardId}/columns/${columnId}/cards`, card).then((res) => res.data),
    updateCard: (boardId: string, cardId: string, updates: Partial<KanbanCard>) =>
        api.put<KanbanCard>(`/boards/${boardId}/cards/${cardId}`, updates).then((res) => res.data),
    deleteCard: (boardId: string, cardId: string) => api.delete(`/boards/${boardId}/cards/${cardId}`).then((res) => res.data),
    uploadAttachment: (boardId: string, cardId: string, file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return api.post<FileAttachment>(`/boards/${boardId}/cards/${cardId}/attachments/`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }).then((res) => res.data);
    },
    deleteAttachment: (boardId: string, cardId: string, attachmentId: string) =>
        api.delete(`/boards/${boardId}/cards/${cardId}/attachments/${attachmentId}/`).then((res) => res.data),
};


// ==========================================
// Templates
// ==========================================
export const templatesApi = {
    getTemplates: () => api.get<BoardTemplate[]>("/templates").then((res) => res.data),
    createTemplate: (template: Omit<BoardTemplate, "id">) => api.post<BoardTemplate>("/templates", template).then((res) => res.data),
    deleteTemplate: (id: string) => api.delete(`/templates/${id}`).then((res) => res.data),
};

export default api;

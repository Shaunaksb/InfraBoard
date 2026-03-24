import { http, HttpResponse } from "msw";
import {
    mockUser,
    mockOrganization,
    mockBoard,
    mockCard,
    mockTemplate,
} from "../helpers";

const BASE_URL = "http://localhost:8000/api/v1";

export const handlers = [
    // ========== AUTH ==========
    http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
        const body = (await request.json()) as any;
        if (body.email === "john@example.com" && body.password === "password123") {
            // SimpleJWT returns { access, refresh }
            return HttpResponse.json({
                access: "mock_jwt_token_abc",
                refresh: "mock_refresh_token",
            });
        }
        return HttpResponse.json(
            { detail: "No active account found with the given credentials" },
            { status: 401 }
        );
    }),

    http.post(`${BASE_URL}/auth/signup`, async ({ request }) => {
        const body = (await request.json()) as any;
        if (body.email === "existing@example.com") {
            return HttpResponse.json(
                { email: ["A user with this email already exists."] },
                { status: 400 }
            );
        }
        return HttpResponse.json(
            {
                token: "mock_jwt_token_new",
                user: mockUser({
                    id: "usr_new12345",
                    name: body.name || "New User",
                    email: body.email,
                }),
            },
            { status: 201 }
        );
    }),

    // ========== USERS ==========
    http.get(`${BASE_URL}/users/lookup`, ({ request }) => {
        const url = new URL(request.url);
        const email = url.searchParams.get("email");
        if (email === "john@example.com") {
            return HttpResponse.json(mockUser());
        }
        return HttpResponse.json({ detail: "Not found." }, { status: 404 });
    }),

    // ========== ORGANIZATIONS ==========
    http.get(`${BASE_URL}/organizations`, () => {
        return HttpResponse.json([mockOrganization()]);
    }),

    http.post(`${BASE_URL}/organizations`, async ({ request }) => {
        const body = (await request.json()) as any;
        return HttpResponse.json(
            mockOrganization({
                id: "org_new12345",
                name: body.name,
            }),
            { status: 201 }
        );
    }),

    http.post(`${BASE_URL}/organizations/:orgId/members`, async ({ request, params }) => {
        const body = (await request.json()) as any;
        return HttpResponse.json(
            mockOrganization({
                id: params.orgId as string,
                memberIds: ["usr_abc12345", ...(body.userIds || [])],
            })
        );
    }),

    // ========== BOARDS ==========
    http.get(`${BASE_URL}/boards`, () => {
        return HttpResponse.json([mockBoard()]);
    }),

    http.get(`${BASE_URL}/boards/`, () => {
        return HttpResponse.json([mockBoard()]);
    }),

    http.post(`${BASE_URL}/boards`, async ({ request }) => {
        const body = (await request.json()) as any;
        return HttpResponse.json(
            mockBoard({ name: body.name }),
            { status: 201 }
        );
    }),

    http.post(`${BASE_URL}/boards/`, async ({ request }) => {
        const body = (await request.json()) as any;
        return HttpResponse.json(
            mockBoard({ name: body.name }),
            { status: 201 }
        );
    }),

    http.put(`${BASE_URL}/boards/:boardId`, async ({ request, params }) => {
        const body = (await request.json()) as any;
        return HttpResponse.json(
            mockBoard({ id: params.boardId as string, ...body })
        );
    }),

    http.delete(`${BASE_URL}/boards/:boardId`, () => {
        return new HttpResponse(null, { status: 204 });
    }),

    http.post(`${BASE_URL}/boards/:boardId/share`, async () => {
        return HttpResponse.json({ status: "shared successfully" });
    }),

    // ========== CARDS ==========
    http.post(
        `${BASE_URL}/boards/:boardId/columns/:columnId/cards`,
        async ({ request }) => {
            const body = (await request.json()) as any;
            return HttpResponse.json(
                mockCard({ title: body.title, fields: body.fields, tags: body.tags }),
                { status: 201 }
            );
        }
    ),

    http.put(
        `${BASE_URL}/boards/:boardId/cards/:cardId`,
        async ({ request, params }) => {
            const body = (await request.json()) as any;
            return HttpResponse.json(
                mockCard({ id: params.cardId as string, ...body })
            );
        }
    ),

    http.delete(`${BASE_URL}/boards/:boardId/cards/:cardId`, () => {
        return new HttpResponse(null, { status: 204 });
    }),

    // ========== TEMPLATES ==========
    http.get(`${BASE_URL}/templates`, () => {
        return HttpResponse.json([mockTemplate()]);
    }),

    http.get(`${BASE_URL}/templates/`, () => {
        return HttpResponse.json([mockTemplate()]);
    }),

    http.post(`${BASE_URL}/templates`, async ({ request }) => {
        const body = (await request.json()) as any;
        return HttpResponse.json(
            mockTemplate({
                id: "tpl_new12345",
                name: body.name,
                description: body.description,
                columns: body.columns,
            }),
            { status: 201 }
        );
    }),

    http.post(`${BASE_URL}/templates/`, async ({ request }) => {
        const body = (await request.json()) as any;
        return HttpResponse.json(
            mockTemplate({
                id: "tpl_new12345",
                name: body.name,
                description: body.description,
                columns: body.columns,
            }),
            { status: 201 }
        );
    }),

    http.delete(`${BASE_URL}/templates/:templateId`, () => {
        return new HttpResponse(null, { status: 204 });
    }),
];

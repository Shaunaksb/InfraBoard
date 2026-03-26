import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../test/mocks/server";
import {
    authApi,
    usersApi,
    orgsApi,
    boardsApi,
    cardsApi,
    templatesApi,
} from "./api";
import api from "./api";

// Reset auth token state between tests
beforeEach(() => {
    localStorage.clear();
});

afterEach(() => {
    localStorage.clear();
});

// ============================================================
// Authentication API
// ============================================================
describe("authApi", () => {
    describe("login", () => {
        it("should return token and user on valid credentials", async () => {
            const result = await authApi.login({
                email: "john@example.com",
                password: "password123",
            });

            expect(result).toHaveProperty("token", "mock_jwt_token_abc");
            expect(result).toHaveProperty("user");
            expect(result.user.id).toBe("usr_abc12345");
            expect(result.user.email).toBe("john@example.com");
            expect(result.user.name).toBe("John Doe");
        });

        it("should throw on invalid credentials", async () => {
            await expect(
                authApi.login({ email: "john@example.com", password: "wrong" })
            ).rejects.toThrow();
        });
    });

    describe("signup", () => {
        it("should return token and user on successful registration", async () => {
            const result = await authApi.signup({
                name: "Jane Doe",
                email: "jane@example.com",
                password: "password123",
            });

            expect(result).toHaveProperty("token", "mock_jwt_token_new");
            expect(result).toHaveProperty("user");
            expect(result.user.email).toBe("jane@example.com");
        });

        it("should throw when email already exists", async () => {
            await expect(
                authApi.signup({
                    name: "Existing",
                    email: "existing@example.com",
                    password: "password123",
                })
            ).rejects.toThrow();
        });
    });
});

// ============================================================
// Users API
// ============================================================
describe("usersApi", () => {
    describe("lookup", () => {
        it("should return user data for existing email", async () => {
            const user = await usersApi.lookup("john@example.com");

            expect(user.id).toBe("usr_abc12345");
            expect(user.email).toBe("john@example.com");
            expect(user.name).toBe("John Doe");
        });

        it("should throw 404 for non-existing email", async () => {
            await expect(
                usersApi.lookup("nonexistent@example.com")
            ).rejects.toThrow();
        });

        it("should throw 404 for empty email", async () => {
            await expect(usersApi.lookup("")).rejects.toThrow();
        });
    });
});

// ============================================================
// Organizations API
// ============================================================
describe("orgsApi", () => {
    describe("getOrgs", () => {
        it("should return array of organizations", async () => {
            const orgs = await orgsApi.getOrgs();

            expect(Array.isArray(orgs)).toBe(true);
            expect(orgs.length).toBeGreaterThan(0);
            expect(orgs[0]).toHaveProperty("id");
            expect(orgs[0]).toHaveProperty("name");
            expect(orgs[0]).toHaveProperty("ownerId");
            expect(orgs[0]).toHaveProperty("memberIds");
        });
    });

    describe("createOrg", () => {
        it("should create organization with given name", async () => {
            const org = await orgsApi.createOrg({ name: "Marketing Team" });

            expect(org.name).toBe("Marketing Team");
            expect(org).toHaveProperty("id");
            expect(org).toHaveProperty("ownerId");
            expect(org).toHaveProperty("memberIds");
        });
    });

    describe("addMembers", () => {
        it("should add user IDs to organization members", async () => {
            const result = await orgsApi.addMembers("org_abc12345", ["usr_new99999"]);

            expect(result).toHaveProperty("memberIds");
            expect(result.memberIds).toContain("usr_new99999");
        });
    });
});

// ============================================================
// Boards API
// ============================================================
describe("boardsApi", () => {
    describe("getBoards", () => {
        it("should return array of boards with nested columns", async () => {
            const boards = await boardsApi.getBoards();

            expect(Array.isArray(boards)).toBe(true);
            expect(boards.length).toBeGreaterThan(0);

            const board = boards[0];
            expect(board).toHaveProperty("id");
            expect(board).toHaveProperty("name");
            expect(board).toHaveProperty("columns");
            expect(Array.isArray(board.columns)).toBe(true);
        });
    });

    describe("createBoard", () => {
        it("should create a board with the provided config", async () => {
            const config = {
                name: "Sprint Board",
                columns: ["To Do", "In Progress", "Done"],
                fields: [],
                tags: [],
            };

            const board = await boardsApi.createBoard(config);

            expect(board).toHaveProperty("id");
            expect(board.name).toBe("Sprint Board");
        });
    });

    describe("updateBoard", () => {
        it("should update board properties", async () => {
            const updated = await boardsApi.updateBoard("brd_abc12345", {
                config: {
                    name: "Updated Board",
                    columns: [],
                    fields: [],
                    tags: [],
                },
            } as any);

            expect(updated).toHaveProperty("id", "brd_abc12345");
        });
    });

    describe("deleteBoard", () => {
        it("should delete a board successfully", async () => {
            // axios returns empty data for 204 — we just verify it doesn't throw
            await expect(
                boardsApi.deleteBoard("brd_abc12345")
            ).resolves.not.toThrow();
        });
    });

    describe("shareBoard", () => {
        it("should share board with user IDs", async () => {
            const result = await boardsApi.shareBoard("brd_abc12345", {
                userIds: ["usr_new99999"],
            });

            expect(result).toHaveProperty("status", "shared successfully");
        });

        it("should share board with org IDs", async () => {
            const result = await boardsApi.shareBoard("brd_abc12345", {
                orgIds: ["org_abc12345"],
            });

            expect(result).toHaveProperty("status", "shared successfully");
        });

        it("should share board with emails", async () => {
            const result = await boardsApi.shareBoard("brd_abc12345", {
                emails: ["new_employee@example.com"],
            });

            expect(result).toHaveProperty("status", "shared successfully");
        });

        it("should share board with mixed identifiers", async () => {
            const result = await boardsApi.shareBoard("brd_abc12345", {
                userIds: ["usr_new99999"],
                orgIds: ["org_abc12345"],
                emails: ["invited@example.com"],
            });

            expect(result).toHaveProperty("status", "shared successfully");
        });
    });
});

// ============================================================
// Cards API
// ============================================================
describe("cardsApi", () => {
    describe("createCard", () => {
        it("should create a card in the specified column", async () => {
            const card = await cardsApi.createCard("brd_abc12345", "col_abc12345", {
                title: "Fix login bug",
                fields: { priority: "High" },
                tags: ["tag_123"],
            });

            expect(card).toHaveProperty("id");
            expect(card.title).toBe("Fix login bug");
            expect(card.fields).toEqual({ priority: "High" });
            expect(card.tags).toContain("tag_123");
        });
    });

    describe("updateCard", () => {
        it("should update a card's properties", async () => {
            const updated = await cardsApi.updateCard(
                "brd_abc12345",
                "crd_abc12345",
                {
                    title: "Fix login bug (confirmed)",
                } as any
            );

            expect(updated).toHaveProperty("id", "crd_abc12345");
            expect(updated.title).toBe("Fix login bug (confirmed)");
        });
    });

    describe("deleteCard", () => {
        it("should delete a card successfully", async () => {
            await expect(
                cardsApi.deleteCard("brd_abc12345", "crd_abc12345")
            ).resolves.not.toThrow();
        });
    });
});

// ============================================================
// Templates API
// ============================================================
describe("templatesApi", () => {
    describe("getTemplates", () => {
        it("should return array of templates", async () => {
            const templates = await templatesApi.getTemplates();

            expect(Array.isArray(templates)).toBe(true);
            expect(templates.length).toBeGreaterThan(0);

            const tpl = templates[0];
            expect(tpl).toHaveProperty("id");
            expect(tpl).toHaveProperty("name");
            expect(tpl).toHaveProperty("columns");
            expect(tpl).toHaveProperty("fields");
            expect(tpl).toHaveProperty("tags");
        });
    });

    describe("createTemplate", () => {
        it("should create a template with provided data", async () => {
            const template = await templatesApi.createTemplate({
                name: "Custom Workflow",
                description: "My custom workflow",
                icon: "Workflow",
                columns: ["Ideas", "Execution", "Launch"],
                fields: [],
                tags: [],
            });

            expect(template).toHaveProperty("id");
            expect(template.name).toBe("Custom Workflow");
            expect(template.columns).toEqual(["Ideas", "Execution", "Launch"]);
        });
    });

    describe("deleteTemplate", () => {
        it("should delete a template successfully", async () => {
            await expect(
                templatesApi.deleteTemplate("tpl_abc12345")
            ).resolves.not.toThrow();
        });
    });
});

// ============================================================
// Axios Interceptor — Bearer Token
// ============================================================
describe("Axios interceptor", () => {
    it("should attach Authorization header when token exists", async () => {
        localStorage.setItem("kanban_auth_token", "my_secret_token");

        // We use a custom handler to inspect the request headers
        let capturedAuthHeader: string | null = null;
        server.use(
            http.get("http://localhost:8000/api/v1/boards", ({ request }) => {
                capturedAuthHeader = request.headers.get("Authorization");
                return HttpResponse.json([]);
            })
        );

        await boardsApi.getBoards();

        expect(capturedAuthHeader).toBe("Bearer my_secret_token");
    });

    it("should NOT attach Authorization header when no token", async () => {
        localStorage.removeItem("kanban_auth_token");

        let capturedAuthHeader: string | null = null;
        server.use(
            http.get("http://localhost:8000/api/v1/boards", ({ request }) => {
                capturedAuthHeader = request.headers.get("Authorization");
                return HttpResponse.json([]);
            })
        );

        await boardsApi.getBoards();

        expect(capturedAuthHeader).toBeNull();
    });
});

// ============================================================
// Error handling — Network errors
// ============================================================
describe("Network error handling", () => {
    it("should throw when the server is unreachable", async () => {
        server.use(
            http.get("http://localhost:8000/api/v1/boards", () => {
                return HttpResponse.error();
            })
        );

        await expect(boardsApi.getBoards()).rejects.toThrow();
    });

    it("should throw on server 500 errors", async () => {
        server.use(
            http.get("http://localhost:8000/api/v1/boards", () => {
                return HttpResponse.json(
                    { detail: "Internal server error" },
                    { status: 500 }
                );
            })
        );

        await expect(boardsApi.getBoards()).rejects.toThrow();
    });
});

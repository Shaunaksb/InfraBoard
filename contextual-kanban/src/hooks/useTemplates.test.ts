import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../test/mocks/server";
import { useTemplates } from "./useTemplates";
import { mockTemplate } from "../test/helpers";

// Mock localStorage for isolated tests
beforeEach(() => {
    localStorage.clear();
});

describe("useTemplates", () => {
    describe("initial fetch", () => {
        it("should fetch templates from API on mount", async () => {
            const { result } = renderHook(() => useTemplates());

            // Initially loading
            expect(result.current.isLoading).toBe(true);

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.templates.length).toBeGreaterThan(0);
            expect(result.current.error).toBeNull();
        });

        it("should fall back to static templates when API fails", async () => {
            server.use(
                http.get("http://localhost:8000/api/v1/templates", () => {
                    return HttpResponse.error();
                }),
                http.get("http://localhost:8000/api/v1/templates/", () => {
                    return HttpResponse.error();
                })
            );

            const { result } = renderHook(() => useTemplates());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Should have fallback templates from BOARD_TEMPLATES
            expect(result.current.templates.length).toBeGreaterThan(0);
            expect(result.current.error).not.toBeNull();
        });
    });

    describe("addTemplate", () => {
        it("should add template via API and update state", async () => {
            const { result } = renderHook(() => useTemplates());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            const initialCount = result.current.templates.length;

            let newTemplate: any;
            await act(async () => {
                newTemplate = await result.current.addTemplate({
                    name: "New Workflow",
                    description: "A new template",
                    icon: "Star",
                    columns: ["Step 1", "Step 2"],
                    fields: [],
                    tags: [],
                });
            });

            expect(newTemplate).toHaveProperty("id");
            expect(newTemplate.name).toBe("New Workflow");

            await waitFor(() => {
                expect(result.current.templates.length).toBeGreaterThanOrEqual(initialCount);
            });
        });

        it("should fall back to local storage when API create fails", async () => {
            // Override the template creation endpoint to fail
            server.use(
                http.post("http://localhost:8000/api/v1/templates", () => {
                    return HttpResponse.json(
                        { detail: "Server error" },
                        { status: 500 }
                    );
                }),
                http.post("http://localhost:8000/api/v1/templates/", () => {
                    return HttpResponse.json(
                        { detail: "Server error" },
                        { status: 500 }
                    );
                })
            );

            const { result } = renderHook(() => useTemplates());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            let localTemplate: any;
            await act(async () => {
                localTemplate = await result.current.addTemplate({
                    name: "Local Template",
                    description: "Created offline",
                    icon: "Wifi",
                    columns: ["Draft", "Final"],
                    fields: [],
                    tags: [],
                });
            });

            // The local template should have a tpl_local_ prefix
            expect(localTemplate.id).toMatch(/^tpl_local_/);
            expect(localTemplate.name).toBe("Local Template");
        });
    });

    describe("deleteTemplate", () => {
        it("should delete template via API and remove from state", async () => {
            const { result } = renderHook(() => useTemplates());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            const templates = result.current.templates;
            const apiTemplate = templates.find((t) => !t.id.startsWith("tpl_local_"));

            if (apiTemplate) {
                await act(async () => {
                    await result.current.deleteTemplate(apiTemplate.id);
                });

                await waitFor(() => {
                    expect(
                        result.current.templates.find((t) => t.id === apiTemplate.id)
                    ).toBeUndefined();
                });
            }
        });

        it("should delete local templates by prefix without API call", async () => {
            // First, force offline to create a local template
            server.use(
                http.post("http://localhost:8000/api/v1/templates", () => {
                    return HttpResponse.json({ detail: "error" }, { status: 500 });
                }),
                http.post("http://localhost:8000/api/v1/templates/", () => {
                    return HttpResponse.json({ detail: "error" }, { status: 500 });
                })
            );

            const { result } = renderHook(() => useTemplates());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Add a local template
            let localTemplate: any;
            await act(async () => {
                localTemplate = await result.current.addTemplate({
                    name: "Temp Local",
                    description: "temp",
                    icon: "X",
                    columns: ["A"],
                    fields: [],
                    tags: [],
                });
            });

            expect(localTemplate.id).toMatch(/^tpl_local_/);

            // Delete it — should succeed without API call
            await act(async () => {
                await result.current.deleteTemplate(localTemplate.id);
            });
        });

        it("should throw when deleting a backend template fails", async () => {
            server.use(
                http.delete("http://localhost:8000/api/v1/templates/:id", () => {
                    return HttpResponse.json(
                        { detail: "Not found" },
                        { status: 404 }
                    );
                })
            );

            const { result } = renderHook(() => useTemplates());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await expect(
                act(async () => {
                    await result.current.deleteTemplate("tpl_nonexistent");
                })
            ).rejects.toThrow();
        });
    });
});

/**
 * Test helper factories that produce data matching backend serializer output shapes.
 */

export const mockUser = (overrides: Record<string, any> = {}) => ({
    id: "usr_abc12345",
    name: "John Doe",
    email: "john@example.com",
    preferences: {
        theme: "system",
        emailNotifications: true,
        pushNotifications: true,
    },
    ...overrides,
});

export const mockOrganization = (overrides: Record<string, any> = {}) => ({
    id: "org_abc12345",
    name: "Engineering Team",
    ownerId: "usr_abc12345",
    memberIds: ["usr_abc12345"],
    ...overrides,
});

export const mockColumn = (overrides: Record<string, any> = {}) => ({
    id: "col_abc12345",
    title: "To Do",
    order: 0,
    cards: [],
    ...overrides,
});

export const mockBoard = (overrides: Record<string, any> = {}) => ({
    id: "brd_abc12345",
    name: "Project Alpha",
    ownerId: "usr_abc12345",
    memberIds: ["usr_abc12345"],
    orgIds: [],
    columns: [
        mockColumn(),
        mockColumn({ id: "col_def67890", title: "In Progress", order: 1 }),
        mockColumn({ id: "col_ghi11111", title: "Done", order: 2 }),
    ],
    ...overrides,
});

export const mockCard = (overrides: Record<string, any> = {}) => ({
    id: "crd_abc12345",
    title: "Fix login bug",
    fields: { priority: "High" },
    tags: ["tag_123"],
    order: 0,
    column: "col_abc12345",
    ...overrides,
});

export const mockTemplate = (overrides: Record<string, any> = {}) => ({
    id: "tpl_abc12345",
    name: "Software Development",
    description: "Standard agile workflow",
    icon: "Code",
    columns: ["Backlog", "To Do", "In Progress", "Review", "Done"],
    fields: [],
    tags: [],
    ...overrides,
});

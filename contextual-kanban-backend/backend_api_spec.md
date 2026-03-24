# Contextual Kanban: REST API Specification

This document maps the precise HTTP request methodologies and data structures standardizing communication between the React Frontend (Axios) and the backend server. 

## Base Configuration
- **Base URL**: `http://localhost:3000/api/v1`
- **Authentication**: Include HTTP Header `Authorization: Bearer <jwt_token>`

---

## Authentication Pipelines

### `POST /auth/login`
Authenticates user, resolving session token and profile data.
**Request:**
```json
{ "email": "user@example.com", "password": "password123" }
```
**Response (200 OK):**
```json
{
  "token": "jwt_token_here",
  "user": { "id": "usr_123", "name": "John Doe", "email": "user@example.com", "preferences": {} }
}
```

### `POST /auth/signup`
Registers a new account.
**Request:**
```json
{ "name": "Jane", "email": "jane@example.com", "password": "password123" }
```
**Response (201 Created):** Same shape as Login.

---

## Users

### `GET /users/lookup`
Retrieves public-facing identifier for an existing user via their email address recursively. This is heavily utilized when resolving unknown members during Board Sharing algorithms.
**Query Parameters:** `?email=jane@example.com`

**Response (200 OK):**
```json
{ "id": "usr_789", "name": "Jane Doe", "email": "jane@example.com" }
```
*(Returns `404 Not Found` if the email address corresponds to no existing active account).*

---

## Organizations

### `GET /organizations`
Fetch all organizations the active user owns or belongs to.
**Response (200 OK):**
```json
[
  { "id": "org_123", "name": "Engineering Team", "ownerId": "usr_123", "memberIds": ["usr_123", "usr_456"] }
]
```

### `POST /organizations`
**Request:** `{ "name": "Marketing Team" }`

### `POST /organizations/:id/members`
Bind existing User IDs to the Organization.
**Request:** `{ "userIds": ["usr_789"] }`

---

## Boards & Sharing 

### `GET /boards`
Fetches all boards accessible by the executing user globally.

### `POST /boards`
Creates a new board using the structural [BoardConfig](file:///e:/Shaunak/ECode/FC/Project/New%20folder%20%282%29/contextual-kanban/src/types/kanban.ts#50-60) object definition.

### `PUT /boards/:id`
Updates settings, columns, or properties on the Board.

### `DELETE /boards/:id`
Permanently destroys the specified board and cascadingly destroys all inner kanban cards.

### `POST /boards/:id/share`
Shares the board with users or organizations. Includes dynamic email-parsing pipelines to gracefully handle unauthenticated invitations.

**Request:**
```json
{
  "userIds": ["usr_456"],
  "orgIds": ["org_123"],
  "emails": ["new_employee@example.com"]
}
```
**Architecture Detail:** If an email is provided in the `emails` array and the user does **not** have an account, the backend creates a Pending Invitation record and securely dispatch an email containing a sign-up link equipped with a referral code (e.g. `https://kanban.com/signup?boardId=brd_123`). If they already have an account, the backend resolves their ID silently.

---

## Cards

### `POST /boards/:boardId/columns/:columnId/cards`
Appends a Kanban card directly to a specified column within a Board.
**Request:**
```json
{ "title": "Fix login bug", "fields": { "priority": "High" }, "tags": ["tag_123"] }
```

### `PUT /boards/:boardId/cards/:cardId`
Updates properties (shifting columns laterally, altering descriptions).

### `DELETE /boards/:boardId/cards/:cardId`
Obliterates card.

---

## Templates

### `GET /templates`
Fetches all templates actively seeded by the system or instantiated by the current authenticated user.
**Response:**
```json
[
  {
    "id": "tpl_123",
    "name": "Software Development",
    "description": "Standard agile workflow",
    "icon": "Code",
    "columns": ["Backlog", "To Do", "In Progress", "Review", "Done"],
    "fields": [],
    "tags": []
  }
]
```

### `POST /templates`
Converts active board schema layouts into a globally accessible template.
**Request:**
```json
{
  "name": "My Custom Workflow",
  "description": "Customized for my team",
  "columns": ["Ideas", "Execution", "Launch"],
  "fields": [],
  "tags": []
}
```

### `DELETE /templates/:id`
Eradicate user-created templates.

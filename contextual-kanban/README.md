# Contextual Kanban

A full-stack, customizable Kanban board application built with React, Vite, and Django REST Framework.

## Features

- **Custom Kanban Boards**: Create boards with unique columns and workflows.
- **Dynamic Cards**: Add, edit, and organize cards within columns.
- **Template System**: Pre-defined configurations for different project types.
- **Dark Mode**: Built-in, persistent dark theme support.
- **Organization Management**: Collaborate with other users via shared organizations.

## Tech Stack

**Frontend:**
- Vite
- React (TypeScript)
- Tailwind CSS
- shadcn-ui (Radix UI)
- React Router DOM
- TanStack Query (React Query)
- Axios

**Backend:**
- Django
- Django REST Framework (DRF)
- PostgreSQL
- SimpleJWT for Authentication

## Setup Instructions

### Frontend
```sh
cd contextual-kanban
npm install
npm run dev
```

### Backend
Make sure you have Python and PostgreSQL installed.
```sh
cd contextual-kanban-backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

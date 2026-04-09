# 🛡️ InfraBoard

[![InfraBoard Logo](infraboard.png)](./infraboard.png)

**InfraBoard** (formerly Contextual Kanban) is a high-performance, infrastructure-optimized Kanban management system. Designed for engineering teams who need a seamless bridge between task management and infrastructure deployment workflows.

---

## 🚀 Key Features

- **Dynamic Kanban Boards**: Advanced drag-and-drop functionality with customizable columns and cards.
- **Organization Centric**: Manage multiple organizations, teams, and projects from a single interface.
- **Infrastructure Templates**: Pre-configured templates for common architecture patterns (Terraform, GitHub Actions).
- **Contextual Awareness**: Attach infrastructure metadata directly to Kanban cards.
- **JWT Authentication**: Secure user sessions with token-based authentication and role-based access control.
- **Responsive UI**: A premium, dark-mode optimized interface built with Shadcn UI and Tailwind CSS.
- **Real-time Updates**: Integrated with a robust Django backend for instant data persistence.

---

## 🏗️ Architecture

The project is organized as a monorepo consisting of a separate frontend and backend:

- **/contextual-kanban**: A modern React SPA powered by Vite.
- **/contextual-kanban-backend**: A scalable REST API built with Django and PostgreSQL.

---

## 💻 Tech Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Navigation**: [React Router 6](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Framework**: [Django 5](https://www.djangoproject.com/)
- **API**: [Django REST Framework](https://www.django-rest-framework.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Auth**: [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- **Task Processing Engine**: Custom signals and service layers for infrastructure automation.

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18+ 
- **Python**: v3.10+
- **PostgreSQL**: Local instance running
- **Package Manager**: npm or bun for frontend; pip or uv for backend

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd contextual-kanban-backend
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Configure environment variables in `.env`:
   ```env
   SECRET_KEY=your_secret_key
   DEBUG=True
   DB_NAME=devopskanban
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   ```
4. Run migrations and start the server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd contextual-kanban
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the application at `http://localhost:5173`.

---

## ⚙️ Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_NAME` | PostgreSQL Database Name | `devopskanban` |
| `SECRET_KEY` | Django Secret Key | - |
| `DEBUG` | Enable Debug Mode | `True` |

---

## 📄 License

This project is licensed under the GNU GPL 3.0 License - see the LICENSE file for details.

---

*Developed by InfraBoard Team. Empowering Infrastructure Management.*

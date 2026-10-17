# Daymark Task Manager

A task manager with a React/Vite frontend and an Express/MongoDB backend. Users register and sign in with a password-protected account, then manage their own private task list.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- A MongoDB Atlas connection URI (or another MongoDB connection URI)

## Configuration

The backend reads its configuration from `backend/.env`. Keep the existing local file and values; do not commit it.

Required settings:

```dotenv
PORT=5000
MONGO_URI=<your MongoDB connection URI>
JWT_SECRET=<a long, random signing secret>
JWT_EXPIRES_IN=1d
```

`CLIENT_URL` is optional and defaults to `http://localhost:5173`. The frontend API base URL defaults to `http://localhost:5000/api`; set `VITE_API_URL` in the frontend environment only if the API uses a different address.

## Install

From the `task_manager` directory:

```bash
cd backend
npm install
cd ../frontend
npm install
```

The backend dependencies include bcryptjs, jsonwebtoken, Express, and Mongoose. The frontend uses React, React Router, Axios, and Vite.

## Run locally

Open two terminals from the `task_manager` directory.

Terminal 1 — API:

```bash
cd backend
npm run dev
```

Terminal 2 — web app:

```bash
cd frontend
npm run dev
```

Open the Vite URL printed in the frontend terminal (usually `http://localhost:5173`). The API health endpoint is `http://localhost:5000/`.

To create a production frontend bundle:

```bash
cd frontend
npm run build
```

## API

- `POST /api/auth/register` — create an account and return a JWT.
- `POST /api/auth/login` — verify credentials and return a JWT.
- `GET /api/tasks` — list the signed-in user's tasks.
- `POST /api/tasks` — create a task.
- `PATCH /api/tasks/:id` — update a task title, description, or completion status.
- `DELETE /api/tasks/:id` — delete a task.

Task endpoints require `Authorization: Bearer <token>`. Every task query is scoped to the authenticated user's ID.

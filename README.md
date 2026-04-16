# User Management System

Full-stack User Management System using Node.js (Express), MongoDB, and React.

## Features
- JWT authentication with email or username login
- Role-based access control for admin, manager, and user
- Paginated, searchable user management with status filters
- Audit fields for created and updated metadata
- Responsive React dashboard with protected routes

## Setup
1. Copy `.env.example` to `.env` and configure your environment variables (especially `MONGO_URI`).
2. Run `npm install` inside the `server/` directory to install dependencies.
3. Access the `server/` directory and run the initial seed script:
   ```bash
   node seed.js
   ```
4. Start the backend development server: `npm run dev`

## Client Setup
1. Run `npm install` inside the `client/` directory.
2. Start the frontend with `npm start` or `npm run dev`.
3. If you deploy the backend elsewhere, update `client/.env` with `VITE_API_URL`.

## Deployment Notes
- Backend: deploy the `server/` app with `PORT`, `MONGO_URI`, `JWT_SECRET`, and `JWT_EXPIRES_IN` configured.
- Frontend: deploy the `client/` app and point `VITE_API_URL` to the deployed backend base URL.
- Use the seeded admin account below to demonstrate the full RBAC flow in your demo video.

## Default Access
If you ran the seed script successfully, an initial System Admin is created:
- **Email:** `admin@system.com`
- **Username:** `admin`
- **Password:** `Admin@123`

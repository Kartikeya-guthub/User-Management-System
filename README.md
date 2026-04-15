# User Management System

Full-stack User Management System using Node.js (Express), MongoDB, and React.

## Setup
1. Copy `.env.example` to `.env` and configure your environment variables (especially `MONGO_URI`).
2. Run `npm install` inside the `server/` directory to install dependencies.
3. Access the `server/` directory and run the initial seed script:
   ```bash
   node seed.js
   ```
4. Start the backend development server: `npm run dev`

## Default Access
If you ran the seed script successfully, an initial System Admin is created:
- **Email:** `admin@system.com`
- **Password:** `Admin@123`

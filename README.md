# 👥 User Management System

> A full-stack MERN application demonstrating JWT authentication, role-based access control (RBAC), and RESTful API design with comprehensive documentation.

**Deployed App:** https://user-management-system-do8b.onrender.com  
**API Docs:** https://user-management-system-do8b.onrender.com/api-docs  
**Source Code:** https://github.com/Kartikeya-guthub/User-Management-System

---

## ✨ Features

### 🔐 **Authentication & Security**
- JWT-based authentication with email or username login
- Bcrypt password hashing with salting
- Secure token expiration and refresh
- Session persistence with localStorage
- Inactive account blocking
- Real-time token validation on protected routes

### 👮 **Role-Based Access Control (RBAC)**
- Three role levels: **Admin**, **Manager**, **User**
- Granular permission control per endpoint
- Role-restricted UI navigation
- Protected API routes with authorization middleware
- Admin-only operations (create/delete users)
- Manager oversight (view/edit non-admin users)
- User self-service (profile, password change)

### 📊 **User Management**
- Create users with auto-generated credentials
- Search, filter, and paginate user lists (10-100 per page)
- Update user details, roles, and status
- Soft delete (deactivate) users
- Reactivate deactivated accounts
- Bulk operations ready

### 📋 **Audit & Compliance**
- Automatic timestamp tracking (`createdAt`, `updatedAt`)
- User tracking (`createdBy`, `updatedBy`)
- Audit trail in user details
- Full change history accessible to admins

### 🎨 **Responsive UI**
- Modern React dashboard with gradient design
- Mobile-first responsive layout
- Role-aware navbar and sidebar
- Real-time validation and error feedback
- Toast notifications for user actions
- Accessible color contrast

### 📚 **API Documentation**
- Interactive Swagger/OpenAPI 3.0 documentation
- "Try it out" endpoint testing
- Real request/response examples
- Complete error documentation
- JWT authorization UI
- Production-ready endpoints

### ✅ **Testing & Quality**
- 26 backend integration tests (Jest + supertest)
- 7 frontend component/route tests (Vitest)
- In-memory database testing
- Full RBAC test coverage
- Security and validation tests
- Comprehensive critical path coverage

---

## 🎥 Demo Video

📺 **Full Application Walkthrough:** [Watch Demo Video](#demo)

> 📍 **Note:** Add your Google Drive or YouTube demo video link here. Should showcase:
> - Login flow with different roles
> - RBAC enforcement (manager viewing but not modifying admin)
> - User management interface
> - API documentation in Swagger UI

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ & npm v8+
- **MongoDB Atlas** account (free tier OK)
- **Git** for version control

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/Kartikeya-guthub/User-Management-System.git
cd user-management-system

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 2. Configure Environment

Create `.env` in the root `server/` directory:

```env
# ─── Server ───────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ─── MongoDB Atlas ────────────────────────────────────
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# ─── JWT ──────────────────────────────────────────────
JWT_SECRET=your-super-secret-key-min-32-chars-recommended
JWT_EXPIRES_IN=7d
```

### 3. Initialize Database

```bash
cd server
node seed.js
```

This creates:
- ✅ System Admin (`admin@system.com` / `Admin@123`)
- ✅ Test Manager (`manager@test.com` / `Manager123!`)
- ✅ Test User (`user@test.com` / `User123!`)
- ✅ Inactive User (for testing deactivation)

### 4. Start Servers

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```
Server runs on `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
App runs on `http://localhost:5173`

### 5. Access the App

| Resource | URL |
|----------|-----|
| **Web App** | http://localhost:5173 |
| **API** | http://localhost:5000/api |
| **API Docs** | http://localhost:5000/api-docs |
| **Health Check** | http://localhost:5000 |

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- **Express.js** — Lightweight HTTP server
- **MongoDB** — NoSQL database (Atlas)
- **Mongoose** — ODM with validation
- **JWT** — Stateless authentication
- **Bcrypt** — Password hashing
- **Cors** — Cross-origin requests
- **Helmet** — Security headers
- **Express-validator** — Input validation
- **Swagger/OpenAPI** — API documentation

**Frontend:**
- **React 19** — UI library
- **Vite** — Fast build tool
- **React Router** — Client-side routing
- **Axios** — HTTP client
- **Context API** — State management
- **CSS Grid/Flexbox** — Responsive layout

**Testing:**
- **Jest** + **Supertest** — Backend integration tests
- **Vitest** — Frontend unit tests
- **MongoDB Memory Server** — In-memory DB for tests
- **React Testing Library** — Component testing

---

## 📖 API Documentation

### Swagger UI — Interactive Docs

Once the server is running, access interactive API documentation:

```
http://localhost:5000/api-docs
```

**Features:**
- ✅ Try endpoints directly from browser
- ✅ View all request/response schemas
- ✅ See real error examples
- ✅ Test with JWT bearer token
- ✅ Explore all 6 REST endpoints

### Endpoints Overview

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/auth/login` | Public | Login & get JWT token |
| `POST` | `/users` | Admin | Create user |
| `GET` | `/users` | Admin, Manager | List users (paginated) |
| `GET` | `/users/:id` | Scoped | Get user details |
| `PUT` | `/users/:id` | Scoped | Update user |
| `DELETE` | `/users/:id` | Admin | Deactivate user |

### Example: Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@system.com",
    "password": "Admin@123"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@system.com",
    "role": "admin",
    "status": "active",
    "createdAt": "2026-04-16T10:00:00Z"
  }
}
```

---

## ✅ Testing

### Run All Tests

**Backend Tests (26 tests):**
```bash
cd server
npm test
```

Tests cover:
- ✅ Authentication (login, password hashing, token validation)
- ✅ Authorization (RBAC for all 3 roles)
- ✅ User CRUD operations
- ✅ Audit trail tracking
- ✅ API security (malformed JSON, validation)
- ✅ Token expiration

**Frontend Tests (7 tests):**
```bash
cd client
npm test
```

Tests cover:
- ✅ Route protection (unauthenticated redirect)
- ✅ Role-based navigation (Users link visibility)
- ✅ Auth persistence (localStorage)
- ✅ Navbar rendering per role

### Test Results

```
Backend:
  26 tests, 14.7s, 0 failures ✅

Frontend:
  7 tests, 1.6s, 0 failures ✅
```

---

## 🌐 Deployment

### Deploy on Render

**Step 1: Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

**Step 2: Connect to Render**
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Configure:
   - **Build Command:** `npm install` (or `cd server && npm install`)
   - **Start Command:** `npm start` (or `cd server && npm start`)
   - **Environment Variables:**
     - `PORT=5000`
     - `NODE_ENV=production`
     - `MONGO_URI=<your-mongodb-atlas-uri>`
     - `JWT_SECRET=<strong-secret>`
     - `JWT_EXPIRES_IN=7d`

**Step 3: Deploy Frontend**
1. Go to Render Dashboard
2. New Static Site → Connect GitHub repo (`client/`)
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Set Environment Variable: `VITE_API_URL=https://your-backend.onrender.com`

**Step 4: Test Production**
- Web App: https://your-frontend.onrender.com
- API: https://your-backend.onrender.com/api
- API Docs: https://your-backend.onrender.com/api-docs

---

## 📁 Project Structure

```
User Management System/
├── server/                          # Express.js backend
│   ├── app.js                       # Express application setup
│   ├── server.js                    # Server entry point
│   ├── swagger.js                   # OpenAPI/Swagger spec
│   ├── seed.js                      # Database seeding
│   ├── jest.config.cjs              # Jest test configuration
│   ├── package.json                 # Backend dependencies
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   └── roles.js                 # RBAC role definitions
│   ├── controllers/
│   │   ├── auth.controller.js       # Login logic
│   │   └── user.controller.js       # User CRUD logic
│   ├── middleware/
│   │   └── auth.middleware.js       # JWT verification & authorization
│   ├── models/
│   │   └── user.model.js            # Mongoose User schema
│   ├── routes/
│   │   ├── auth.routes.js           # Auth endpoints + Swagger docs
│   │   └── user.routes.js           # User endpoints + Swagger docs
│   └── tests/
│       └── api.test.js              # 26 integration tests
│
├── client/                          # React.js frontend
│   ├── index.html                   # Entry HTML
│   ├── vite.config.js               # Vite configuration
│   ├── package.json                 # Frontend dependencies
│   ├── src/
│   │   ├── main.jsx                 # React entry point
│   │   ├── App.jsx                  # Main app component & routes
│   │   ├── App.css                  # Global styles
│   │   ├── api/
│   │   │   └── axios.js             # HTTP client setup
│   │   ├── components/
│   │   │   └── Navbar.jsx           # Role-aware navigation
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Auth state management
│   │   │   └── ToastContext.jsx     # Toast notifications
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx        # Login form
│   │   │   ├── DashboardPage.jsx    # Home dashboard
│   │   │   ├── ProfilePage.jsx      # User profile & settings
│   │   │   ├── UsersPage.jsx        # User list with filters
│   │   │   ├── UserDetailPage.jsx   # User detail view
│   │   │   ├── EditUserPage.jsx     # User edit form
│   │   │   └── CreateUserPage.jsx   # Create user form
│   │   ├── routes/
│   │   │   ├── ProtectedRoute.jsx   # Auth check
│   │   │   └── RoleRoute.jsx        # RBAC check
│   │   └── test/
│   │       ├── setup.js             # Test configuration
│   │       ├── App.test.jsx         # Route tests
│   │       └── Navbar.test.jsx      # Component tests
│   └── public/                      # Static assets
│
├── TESTING.md                       # Test coverage details
├── SWAGGER_DOCS.md                  # Swagger usage guide
├── SWAGGER_QUICK_START.md           # API testing quick start
├── README.md                        # This file
├── .env.example                     # Environment template
└── vercel.json                      # Vercel deployment config
```

---

## 🔑 Default Test Credentials

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| `admin@system.com` | `Admin@123` | Admin | Full system access |
| `manager@test.com` | `Manager123!` | Manager | User oversight |
| `user@test.com` | `User123!` | User | Regular user |
| `inactive@test.com` | `Inactive123!` | User | Test deactivation |

---

## 🔍 Key Features Deep Dive

### 🔐 Security Implementation

- **Password Security:** Bcrypt hashing with salt rounds = 10
- **JWT Tokens:** Signed with HS256, 7-day expiration
- **SQL Injection Protection:** Mongoose schema validation
- **XSS Protection:** React auto-escaping + Helmet headers
- **CORS:** Whitelist policy enabled
- **Input Validation:** Express-validator on all inputs
- **Rate Limiting:** Ready for Redis integration

### 👥 RBAC Implementation

**Admin:**
- Create/read/update/delete all users
- Assign roles and change status
- Access all endpoints
- View audit trails

**Manager:**
- Read all users (including admins, view-only)
- Update non-admin users only
- Cannot create or delete users
- Cannot modify admin accounts

**User:**
- View own profile only
- Update own name and password
- Cannot access user management
- Cannot change role

#### Access Control Matrix

| Action | Admin | Manager | User |
|--------|:-----:|:-------:|:----:|
| Create User | ✅ | ❌ | ❌ |
| List All Users | ✅ | ✅ | ❌ |
| View User Details | ✅ | ✅ | ❌ |
| Edit User (non-admin) | ✅ | ✅ | ❌ |
| Edit User (admin) | ✅ | ❌ | ❌ |
| Change Role | ✅ | ❌ | ❌ |
| Deactivate User | ✅ | ❌ | ❌ |
| View Own Profile | ✅ | ✅ | ✅ |
| Edit Own Profile | ✅ | ✅ | ✅ |
| Change Own Password | ✅ | ✅ | ✅ |

### 📊 Audit Trail

Every user record tracks:
- `createdAt` — When account was created
- `updatedAt` — Last modification time
- `createdBy` — User who created account
- `updatedBy` — User who last modified

Admin users can view full audit trail in user details.

---

## 🛠️ Development Workflow

### Add a New Endpoint

1. **Create controller method** in `server/controllers/`
2. **Add route** with RBAC in `server/routes/`
3. **Add Swagger JSDoc comments** above route
4. **Add validation** with express-validator
5. **Add tests** in `server/tests/api.test.js`

### Add a New Page

1. **Create component** in `client/src/pages/`
2. **Add route** in `client/src/App.jsx`
3. **Wrap with ProtectedRoute** if authenticated
4. **Wrap with RoleRoute** if role-restricted
5. **Add tests** in `client/src/test/`

---

## 📝 Environment Variables

### Backend (.env)

```env
# Server config
PORT=5000                                    # API port
NODE_ENV=development|production              # Environment

# Database
MONGO_URI=mongodb+srv://user:pass@...        # MongoDB Atlas URI

# Authentication
JWT_SECRET=your-super-secret-key             # Token signing key
JWT_EXPIRES_IN=7d                            # Token expiration
```

### Frontend (.env.local or .env)

```env
VITE_API_URL=http://localhost:5000          # Backend URL (without /api)
```

---

## 🚨 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000 (macOS/Linux)
lsof -ti:5000 | xargs kill -9

# Windows PowerShell
Get-Process -Name node | Stop-Process -Force
```

### MongoDB Connection Error

- Verify `MONGO_URI` in `.env`
- Check IP whitelist in MongoDB Atlas
- Ensure credentials are URL-encoded (replace @ with %40, etc.)

### Tests Failing

```bash
# Clear Jest cache
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose
```

### Swagger Docs Not Loading

- Ensure `swagger.js` exists in `server/`
- Check that `swagger-ui-express` is installed
- Restart server after installing dependencies

---

## 📚 Additional Resources

- [API Documentation Guide](./SWAGGER_DOCS.md)
- [API Testing Quick Start](./SWAGGER_QUICK_START.md)
- [Full Test Coverage Report](./TESTING.md)
- [MongoDB Docs](https://docs.mongodb.com)
- [Express.js Guide](https://expressjs.com)
- [React Docs](https://react.dev)

---

## 🤝 Support & Contributing

### Report a Bug
1. Check existing issues
2. Create detailed bug report with steps to reproduce
3. Include error messages and screenshots

### Feature Requests
1. Describe use case
2. Suggest implementation approach
3. Label as enhancement

### Pull Requests
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

This project is open source and available under the **ISC** License.

---

## � Screenshots

### Login Page
- Clean, centered form with email/username input
- Real-time validation and error messages
- Persistent session with localStorage

### Admin Dashboard
- User management table with search/filter
- Action buttons: View, Edit, Deactivate
- Pagination (10-100 users per page)
- User creation wizard

### User Management
- Complete CRUD interface
- Role assignment controls
- Status indicators (active/inactive)
- Audit trail display (created/updated by)

*Screenshots coming soon in production demo*

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MERN Stack                            │
├──────────────────┬──────────────────┬──────────────────┤
│   React (UI)     │   Express (API)  │  MongoDB (Data)  │
├──────────────────┼──────────────────┼──────────────────┤
│ • Routes         │ • Auth Routes    │ • User Schema    │
│ • Context API    │ • User Routes    │ • Audit Fields   │
│ • Protected      │ • RBAC Middleware│ • Validation     │
│   Routes         │ • JWT Validation │ • Indexes        │
│ • Toast Notifs   │ • Controllers    │                  │
└──────────────────┴──────────────────┴──────────────────┘

Auth Flow:
1. Login → Email/Username + Password
2. Validate credentials → Hash comparison
3. Mint JWT Token (7-day expiration)
4. Return token + user data
5. Store token in localStorage
6. Include token in all API requests
7. Validate on protected routes
```

---

## �👤 Author

Created as a full-stack demonstration project with production-ready features.

**Last Updated:** April 16, 2026  
**Version:** 1.0.0

---

<div align="center">

**[⬆ Back to Top](#-user-management-system)**

Made with ❤️ using Node.js, MongoDB, and React

</div>

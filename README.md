# Blog MERN

A full-stack blog platform with role-based access control, post approval workflow, guest interactions, and a comprehensive admin panel. Built with the MERN stack (MongoDB, Express, React, Node.js).

![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-9-880000?logo=mongoose&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Upload-3448C5?logo=cloudinary&logoColor=white)

---

## Features

- **User Authentication** — Register and login with JWT-based sessions
- **Role-Based Access Control** — Three-tier role system: User → Author → Admin
- **Author Request System** — Users can apply to become authors with a motivation message; admin reviews and approves/rejects
- **Post Approval Workflow** — Authors submit posts (pending) → Admin reviews → Approve or reject with reason
- **Admin Panel** — Full dashboard with user management, author request review, post moderation, and comment management
- **Guest Likes** — Anyone can like posts without registration (fingerprint-based)
- **Registered Comments** — Comments require user authentication
- **User Profiles** — Comprehensive profiles with tabs (posts, liked posts, comments)
- **Privacy Controls** — Users choose what's visible on their public profile
- **Settings Page** — Appearance, privacy, notifications, and content preferences
- **Theme System** — Dark / Light / System theme with persistent user preferences
- **Pagination & Sorting** — Newest, popular, most commented; configurable posts per page
- **Image Upload** — Cloudinary-powered image uploads with file validation
- **Responsive Design** — Mobile-first layout across all pages including admin panel

---

## Screenshots

> _Screenshots will be added after deployment._

---

## Roles & Permissions

| Action                   | Guest | User | Author          | Admin            |
| ------------------------ | ----- | ---- | --------------- | ---------------- |
| Read published posts     | ✅     | ✅    | ✅               | ✅                |
| Like posts               | ✅     | ✅    | ✅               | ✅                |
| Comment on posts         | ❌     | ✅    | ✅               | ✅                |
| Request author access    | ❌     | ✅    | —               | —                |
| Create posts             | ❌     | ❌    | ✅ (pending)     | ✅ (auto-publish) |
| Edit own posts           | ❌     | ❌    | ✅ (draft/rejected) | ✅             |
| Delete own posts         | ❌     | ❌    | ✅               | ✅                |
| Profile with privacy     | ❌     | ✅    | ✅               | ✅                |
| Settings & preferences   | ❌     | ✅    | ✅               | ✅                |
| Access admin panel       | ❌     | ❌    | ❌               | ✅                |
| Manage users & roles     | ❌     | ❌    | ❌               | ✅                |
| Review author requests   | ❌     | ❌    | ❌               | ✅                |
| Approve/reject posts     | ❌     | ❌    | ❌               | ✅                |
| Delete any content       | ❌     | ❌    | ❌               | ✅                |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Cloudinary](https://cloudinary.com/) account (for image uploads)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/blog-mern.git
cd blog-mern

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Setup

**Backend** — create `server/.env` from the example:

```bash
cp server/.env.example server/.env
```

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/blog-mern
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongAdminPassword123!
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend** — create `client/.env` from the example:

```bash
cp client/.env.example client/.env
```

```env
VITE_API_URL=http://localhost:5000/api
```

### Seed Admin User

```bash
cd server
npm run seed:admin
```

This creates the initial admin account using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.

### Run Development Servers

```bash
# Terminal 1 — Backend (from server/)
cd server
npm run dev

# Terminal 2 — Frontend (from client/)
cd client
npm run dev
```

- Backend runs at `http://localhost:5000`
- Frontend runs at `http://localhost:5173`

---

## API Endpoints

### Health

| Method | Endpoint         | Description       | Auth |
| ------ | ---------------- | ----------------- | ---- |
| GET    | `/api/health`    | Health check      | —    |

### Auth

| Method | Endpoint                  | Description               | Auth     |
| ------ | ------------------------- | ------------------------- | -------- |
| POST   | `/api/auth/register`      | Register new user         | —        |
| POST   | `/api/auth/login`         | Login                     | —        |
| GET    | `/api/auth/me`            | Get current user          | Required |
| PUT    | `/api/auth/me`            | Update profile            | Required |
| PUT    | `/api/auth/me/password`   | Change password           | Required |
| DELETE | `/api/auth/me`            | Delete account            | Required |
| PUT    | `/api/auth/me/preferences`| Update preferences        | Required |

### Posts

| Method | Endpoint                  | Description               | Auth     |
| ------ | ------------------------- | ------------------------- | -------- |
| GET    | `/api/posts`              | List published posts      | —        |
| GET    | `/api/posts/mine`         | List own posts            | Author+  |
| GET    | `/api/posts/mine/:id`     | Get own post by ID        | Author+  |
| GET    | `/api/posts/:slug`        | Get post by slug          | —        |
| POST   | `/api/posts`              | Create post               | Author+  |
| PUT    | `/api/posts/:id`          | Update own post           | Author+  |
| PATCH  | `/api/posts/:id/submit`   | Submit post for review    | Author+  |
| DELETE | `/api/posts/:id`          | Delete own post           | Author+  |

### Likes

| Method | Endpoint                       | Description            | Auth |
| ------ | ------------------------------ | ---------------------- | ---- |
| POST   | `/api/posts/:id/like`          | Toggle like (user)     | Required |
| POST   | `/api/posts/:id/guest-like`    | Toggle like (guest)    | —    |
| GET    | `/api/posts/:id/guest-like`    | Check guest like status| —    |

### Comments

| Method | Endpoint                          | Description            | Auth     |
| ------ | --------------------------------- | ---------------------- | -------- |
| GET    | `/api/posts/:postId/comments`     | List post comments     | —        |
| POST   | `/api/posts/:postId/comments`     | Create comment         | Required |
| DELETE | `/api/comments/:commentId`        | Delete own comment     | Required |
| GET    | `/api/users/:userId/comments`     | List user comments     | —        |

### Author Requests

| Method | Endpoint                    | Description               | Auth     |
| ------ | --------------------------- | ------------------------- | -------- |
| POST   | `/api/author-requests`      | Submit author request     | Required |
| GET    | `/api/author-requests/mine` | Get own request status    | Required |
| DELETE | `/api/author-requests/mine` | Cancel own request        | Required |

### Upload

| Method | Endpoint        | Description       | Auth     |
| ------ | --------------- | ----------------- | -------- |
| POST   | `/api/upload`   | Upload image      | Required |

### Users (Public)

| Method | Endpoint                        | Description            | Auth |
| ------ | ------------------------------- | ---------------------- | ---- |
| GET    | `/api/users/:userId`            | Get user profile       | —    |
| GET    | `/api/users/:userId/liked-posts`| Get user's liked posts | —    |

### Admin

All admin endpoints require authentication with `admin` role.

| Method | Endpoint                                  | Description              |
| ------ | ----------------------------------------- | ------------------------ |
| GET    | `/api/admin/dashboard`                    | Dashboard statistics     |
| GET    | `/api/admin/users`                        | List all users           |
| GET    | `/api/admin/users/:id`                    | Get user details         |
| PATCH  | `/api/admin/users/:id/role`               | Change user role         |
| DELETE | `/api/admin/users/:id`                    | Delete user              |
| GET    | `/api/admin/author-requests`              | List author requests     |
| PATCH  | `/api/admin/author-requests/:id/approve`  | Approve author request   |
| PATCH  | `/api/admin/author-requests/:id/reject`   | Reject author request    |
| GET    | `/api/admin/posts`                        | List all posts           |
| GET    | `/api/admin/posts/pending`                | List pending posts       |
| PATCH  | `/api/admin/posts/:id/approve`            | Approve post             |
| PATCH  | `/api/admin/posts/:id/reject`             | Reject post              |
| DELETE | `/api/admin/posts/:id`                    | Delete any post          |
| GET    | `/api/admin/comments`                     | List all comments        |
| DELETE | `/api/admin/comments/:id`                 | Delete any comment       |

---

## Folder Structure

```
blog-mern/
├── server/                         # Backend (Express API)
│   ├── src/
│   │   ├── index.js                # Entry point, middleware setup
│   │   ├── validators.js           # Request validation schemas
│   │   ├── config/
│   │   │   ├── cloudinary.js       # Cloudinary configuration
│   │   │   ├── db.js               # MongoDB connection
│   │   │   └── env.js              # Environment variable validation
│   │   ├── controllers/            # Route handlers
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── authorRequestController.js
│   │   │   ├── commentController.js
│   │   │   ├── likeController.js
│   │   │   ├── postController.js
│   │   │   └── userController.js
│   │   ├── middlewares/
│   │   │   ├── auth.js             # JWT auth & role-based guards
│   │   │   ├── errorHandler.js     # Global error handler
│   │   │   ├── upload.js           # Multer file upload config
│   │   │   └── validate.js         # Validation middleware
│   │   ├── models/                 # Mongoose schemas
│   │   │   ├── AuthorRequest.js
│   │   │   ├── Comment.js
│   │   │   ├── GuestLike.js
│   │   │   ├── Post.js
│   │   │   └── User.js
│   │   ├── routes/                 # Express route definitions
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── authorRequestRoutes.js
│   │   │   ├── commentRoutes.js
│   │   │   ├── likeRoutes.js
│   │   │   ├── postRoutes.js
│   │   │   ├── uploadRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── scripts/
│   │   │   └── seedAdmin.js        # Admin seed script
│   │   └── utils/
│   │       ├── escapeRegex.js      # Regex escape utility
│   │       └── generateToken.js    # JWT token generator
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── client/                         # Frontend (React SPA)
│   ├── src/
│   │   ├── App.jsx                 # Root component with routing
│   │   ├── main.jsx                # Entry point
│   │   ├── index.css               # Global styles (Tailwind)
│   │   ├── api/
│   │   │   ├── axios.js            # Axios instance config
│   │   │   └── services/           # API service modules
│   │   │       ├── adminService.js
│   │   │       ├── authService.js
│   │   │       ├── authorRequestService.js
│   │   │       ├── commentService.js
│   │   │       ├── likeService.js
│   │   │       ├── postService.js
│   │   │       ├── uploadService.js
│   │   │       └── userService.js
│   │   ├── components/
│   │   │   ├── CommentSection.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── PostCard.jsx
│   │   │   ├── ScrollToTop.jsx
│   │   │   ├── routes/             # Route guards
│   │   │   │   ├── AdminRoute.jsx
│   │   │   │   ├── AuthorRoute.jsx
│   │   │   │   ├── GuestOnlyRoute.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   └── ui/                 # Reusable UI components
│   │   │       ├── CharacterCounter.jsx
│   │   │       ├── ConfirmModal.jsx
│   │   │       ├── EmptyState.jsx
│   │   │       ├── PostCardSkeleton.jsx
│   │   │       ├── RoleBadge.jsx
│   │   │       ├── SelectableCard.jsx
│   │   │       ├── Spinner.jsx
│   │   │       ├── StatusBadge.jsx
│   │   │       └── ToggleSwitch.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Auth state management
│   │   │   └── PreferencesContext.jsx # User preferences
│   │   ├── hooks/
│   │   │   ├── useGuestFingerprint.js
│   │   │   └── useLocalStorage.js
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── MainLayout.jsx
│   │   │   └── SettingsLayout.jsx
│   │   └── pages/
│   │       ├── BecomeAuthorPage.jsx
│   │       ├── CreatePostPage.jsx
│   │       ├── EditPostPage.jsx
│   │       ├── HomePage.jsx
│   │       ├── LoginPage.jsx
│   │       ├── MyPostsPage.jsx
│   │       ├── NotFoundPage.jsx
│   │       ├── PostDetailPage.jsx
│   │       ├── RegisterPage.jsx
│   │       ├── UserProfilePage.jsx
│   │       ├── admin/              # Admin panel pages
│   │       │   ├── AdminAuthorRequestsPage.jsx
│   │       │   ├── AdminCommentsPage.jsx
│   │       │   ├── AdminDashboardPage.jsx
│   │       │   ├── AdminPendingPostsPage.jsx
│   │       │   ├── AdminPostsPage.jsx
│   │       │   ├── AdminUserDetailPage.jsx
│   │       │   └── AdminUsersPage.jsx
│   │       └── settings/           # Settings pages
│   │           ├── SettingsAccountPage.jsx
│   │           ├── SettingsAppearancePage.jsx
│   │           ├── SettingsContentPage.jsx
│   │           ├── SettingsNotificationsPage.jsx
│   │           ├── SettingsPrivacyPage.jsx
│   │           └── SettingsProfilePage.jsx
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
├── STEPS.md
└── README.md
```

---

## Security

This application implements multiple layers of security:

| Layer | Implementation |
| ----- | -------------- |
| **HTTP Headers** | Helmet.js sets secure headers (CSP, HSTS, X-Frame-Options, etc.) |
| **Rate Limiting** | 4-tier rate limiting: global (100/15min), auth (20/15min), upload (10/15min), guest-like (30/15min) |
| **NoSQL Injection** | `express-mongo-sanitize` strips `$` and `.` from request body/params |
| **XSS Protection** | User input sanitized; no raw HTML rendering on frontend |
| **HPP** | `hpp` middleware prevents HTTP parameter pollution |
| **JWT Security** | Strong secret key, expiration, httpOnly considerations |
| **Body Size Limits** | Express body parser limits prevent payload attacks |
| **File Upload Validation** | File type whitelist, size limits, extension checking via Multer |
| **Mass Assignment Protection** | Only whitelisted fields accepted in update operations |
| **User Enumeration Prevention** | Login returns identical error messages for wrong email/password |
| **CORS** | Strict origin whitelist — only `CLIENT_URL` is allowed |
| **RBAC** | Middleware-enforced role checks on every protected route |
| **Post Status Isolation** | Unpublished posts never exposed through public API |
| **Guest Like Rate Limiting** | Fingerprint validation and per-fingerprint rate limits |
| **Privacy Enforcement** | Privacy preferences enforced server-side, not just UI-hidden |

---

## Deployment

### Backend → Render

1. Create a **Web Service** on [Render](https://render.com).
2. Connect the GitHub repository.
3. Set **Root Directory** to `server`, **Build Command** to `npm install`, **Start Command** to `npm start`.
4. Add environment variables (`NODE_ENV`, `MONGO_URI`, `JWT_SECRET`, etc.).
5. After first deploy, run `node src/scripts/seedAdmin.js` from the Render Shell tab.

> **Note:** Render's filesystem is ephemeral. For persistent image storage, use Cloudinary (already integrated).

### Frontend → Netlify

1. Create a new site on [Netlify](https://app.netlify.com).
2. Connect the GitHub repository.
3. Set **Base directory** to `client`, **Build command** to `npm run build`, **Publish directory** to `client/dist`.
4. Add environment variable: `VITE_API_URL` = your Render backend URL (e.g., `https://your-api.onrender.com/api`).
5. After deploy, update `CLIENT_URL` on Render to the Netlify URL for CORS.

---

## Tech Stack

| Layer      | Technology                                                    |
| ---------- | ------------------------------------------------------------- |
| Frontend   | React 19, React Router 7, Tailwind CSS 4, Vite 8, Axios      |
| Backend    | Node.js, Express 5, Mongoose 9, JWT, Multer, Cloudinary      |
| Database   | MongoDB                                                       |
| Auth       | JSON Web Tokens (bcryptjs for hashing)                        |
| Upload     | Cloudinary (via Multer + Cloudinary SDK)                      |
| Security   | Helmet, CORS, Rate Limiting, mongo-sanitize, HPP              |
| Dev Tools  | Nodemon, ESLint 9, Vite Dev Server                            |

---

## License

This project is licensed under the [MIT License](LICENSE).

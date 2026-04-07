# 📝 Blog MERN

A full-stack blog platform with role-based access control, post approval workflow, guest interactions, and a comprehensive admin panel. Built with the **MERN** stack (MongoDB, Express, React, Node.js). Features three-tier role system (User → Author → Admin), Cloudinary image uploads, dark/light theme, privacy controls, and a security-hardened backend.

[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)

---

## Features

- **User Authentication** — Secure register and login system with JWT-based token authentication
- **Role-Based Access Control** — Three-tier role system: User → Author → Admin with middleware-enforced permissions
- **Author Request System** — Users apply to become authors with a motivation message; admin reviews and approves or rejects
- **Post Approval Workflow** — Authors submit posts (pending) → Admin reviews → Approve or reject with reason
- **Admin Panel** — Full dashboard with user management, author request review, post moderation, and comment management
- **Guest Likes** — Anyone can like posts without registration using fingerprint-based identification
- **Registered Comments** — Authenticated users can comment on published posts with optimistic UI updates
- **User Profiles** — Comprehensive profiles with tabs for posts, liked posts, and comments
- **Privacy Controls** — Users choose what's visible on their public profile (liked posts, comments, email)
- **Settings Page** — Appearance, privacy, notifications, and content preferences with six dedicated sub-pages
- **Theme System** — Dark / Light / System theme with persistent user preferences and CSS variable architecture
- **Pagination & Sorting** — Newest, popular, most commented sorting with configurable posts per page
- **Image Upload** — Cloudinary-powered image uploads with file type validation and size limits
- **Responsive Design** — Mobile-first layout across all pages including admin panel with drawer navigation
- **Debounced Search** — Real-time post search with debounced input for optimal performance
- **Toast Notifications** — User-friendly feedback with react-hot-toast for all operations

---

## Live Demo

[🚀 View Live Demo](https://blog-mernn.netlify.app/)

---

## Screenshots

> _Screenshots will be added soon._

---

## Technologies

### Frontend

- **React 19**: Modern UI library with hooks, context API, and functional components
- **React Router 7**: Client-side routing with nested layouts, route guards, and protected routes
- **Vite 8**: Lightning-fast build tool and dev server with HMR
- **Tailwind CSS 4**: Utility-first CSS framework with custom theme via CSS variables
- **Axios 1.14**: Promise-based HTTP client with interceptors for JWT and error handling
- **React Hot Toast 2.6**: Lightweight toast notifications for user feedback
- **React Icons 5.6**: Popular icon library for consistent iconography
- **UUID 13**: Unique fingerprint generation for guest like tracking

### Backend

- **Node.js**: Server-side JavaScript runtime
- **Express 5**: Minimal and flexible web application framework
- **MongoDB (Mongoose 9)**: NoSQL database with elegant object modeling and schema validation
- **JWT (jsonwebtoken 9)**: Stateless authentication with token-based sessions
- **bcryptjs 3**: Secure password hashing with salt rounds
- **Cloudinary 2.9**: Cloud-based image management and delivery
- **Multer 2.1**: Middleware for handling multipart/form-data file uploads
- **Helmet 8**: Secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
- **express-rate-limit 8**: Multi-tier rate limiting for API protection
- **express-mongo-sanitize 2**: NoSQL injection prevention
- **HPP 0.2**: HTTP parameter pollution protection
- **Slugify 1.6**: URL-friendly slug generation for post URLs
- **Nodemon 3**: Development auto-restart on file changes

---

## Installation

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** — MongoDB Atlas (free tier) or local instance
- **Cloudinary** — Free account for image uploads ([cloudinary.com](https://cloudinary.com/))

### Local Development

**1. Clone the repository:**

```bash
git clone https://github.com/Serkanbyx/blog-mern.git
cd blog-mern
```

**2. Set up environment variables:**

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**server/.env**

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

| Variable | Description |
| -------- | ----------- |
| `NODE_ENV` | Application environment (`development` or `production`) |
| `PORT` | Port number for the Express server |
| `MONGO_URI` | MongoDB connection string (Atlas or local) |
| `JWT_SECRET` | Secret key for signing JWT tokens (min 32 chars recommended) |
| `JWT_EXPIRES_IN` | Token expiration duration (e.g., `7d`, `24h`) |
| `CLIENT_URL` | Frontend URL for CORS whitelist |
| `ADMIN_EMAIL` | Email for the seeded admin account |
| `ADMIN_PASSWORD` | Password for the seeded admin account |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name from dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

**client/.env**

```env
VITE_API_URL=http://localhost:5000/api
```

| Variable | Description |
| -------- | ----------- |
| `VITE_API_URL` | Backend API base URL |

**3. Install dependencies:**

```bash
cd server && npm install
cd ../client && npm install
```

**4. Seed admin user:**

```bash
cd server
npm run seed:admin
```

This creates the initial admin account using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.

**5. Run the application:**

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

- Backend runs at `http://localhost:5000`
- Frontend runs at `http://localhost:5173`

---

## Usage

1. **Visit the homepage** — Browse published blog posts, search, and sort by newest, popular, or most commented
2. **Register an account** — Create a new user account with name, email, and password
3. **Login** — Authenticate with your credentials to access protected features
4. **Like posts** — Like posts as a guest (fingerprint-based) or as an authenticated user
5. **Comment on posts** — Leave comments on published posts (requires authentication)
6. **Apply to become an author** — Submit an author request with a motivation message from the "Become Author" page
7. **Create posts** — Once approved as an author, create and submit blog posts for admin review
8. **Manage your posts** — View, edit, submit, or delete your posts from the "My Posts" page
9. **Customize settings** — Configure appearance (theme, font size, density), privacy, notifications, and content preferences
10. **Admin panel** — Admins can manage users, review author requests, moderate posts, and delete comments

---

## How It Works?

### Authentication Flow

The application uses JWT-based stateless authentication. When a user registers or logs in, the server generates a signed JWT token containing the user ID. The token is stored in `localStorage` on the client side and attached to every API request via an Axios interceptor. On the server, the `protect` middleware verifies the token and attaches the user object to `req.user`.

```javascript
// Axios interceptor attaches JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

On 401 responses, the interceptor automatically clears the token and redirects to the login page.

### Role-Based Access Control

Three roles exist with escalating permissions: **User** → **Author** → **Admin**. Middleware functions (`protect`, `authorOrAdmin`, `adminOnly`) enforce access at the route level. Authors can create posts that go through an approval workflow, while admins have full control over all content and users.

### Post Lifecycle

1. **Draft** — Author creates a post (saved as draft)
2. **Pending** — Author submits the post for review
3. **Published** — Admin approves the post (visible to everyone)
4. **Rejected** — Admin rejects with a reason (author can edit and resubmit)

Admin-created posts are automatically published without the approval step.

### Data Flow

The frontend uses React Context for global state (`AuthContext` for user/auth, `PreferencesContext` for theme/settings). API calls go through a centralized Axios instance with service modules for each resource. The backend follows MVC architecture with Express routes → controllers → Mongoose models.

---

## Roles & Permissions

| Action | Guest | User | Author | Admin |
| ------ | ----- | ---- | ------ | ----- |
| Read published posts | ✅ | ✅ | ✅ | ✅ |
| Like posts | ✅ | ✅ | ✅ | ✅ |
| Comment on posts | ❌ | ✅ | ✅ | ✅ |
| Request author access | ❌ | ✅ | — | — |
| Create posts | ❌ | ❌ | ✅ (pending) | ✅ (auto-publish) |
| Edit own posts | ❌ | ❌ | ✅ (draft/rejected) | ✅ |
| Delete own posts | ❌ | ❌ | ✅ | ✅ |
| Profile with privacy | ❌ | ✅ | ✅ | ✅ |
| Settings & preferences | ❌ | ✅ | ✅ | ✅ |
| Access admin panel | ❌ | ❌ | ❌ | ✅ |
| Manage users & roles | ❌ | ❌ | ❌ | ✅ |
| Review author requests | ❌ | ❌ | ❌ | ✅ |
| Approve/reject posts | ❌ | ❌ | ❌ | ✅ |
| Delete any content | ❌ | ❌ | ❌ | ✅ |

---

## API Endpoints

### Health

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| GET | `/api/health` | No | Health check |

### Auth

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/auth/me` | Yes | Get current user profile |
| PUT | `/api/auth/me` | Yes | Update profile (name, bio, avatar) |
| PUT | `/api/auth/me/password` | Yes | Change password |
| DELETE | `/api/auth/me` | Yes | Delete account |
| PUT | `/api/auth/me/preferences` | Yes | Update user preferences |

### Posts

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| GET | `/api/posts` | No | List published posts (paginated, searchable, sortable) |
| GET | `/api/posts/mine` | Author+ | List own posts by status |
| GET | `/api/posts/mine/:id` | Author+ | Get own post by ID |
| GET | `/api/posts/:slug` | No | Get published post by slug |
| POST | `/api/posts` | Author+ | Create new post |
| PUT | `/api/posts/:id` | Author+ | Update own post |
| PATCH | `/api/posts/:id/submit` | Author+ | Submit post for admin review |
| DELETE | `/api/posts/:id` | Author+ | Delete own post |

### Likes

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/api/posts/:id/like` | Yes | Toggle like (authenticated user) |
| POST | `/api/posts/:id/guest-like` | No | Toggle like (guest, fingerprint-based) |
| GET | `/api/posts/:id/guest-like` | No | Check guest like status |

### Comments

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| GET | `/api/posts/:postId/comments` | No | List post comments |
| POST | `/api/posts/:postId/comments` | Yes | Create comment |
| DELETE | `/api/comments/:commentId` | Yes | Delete own comment |
| GET | `/api/users/:userId/comments` | No | List user's comments |

### Author Requests

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/api/author-requests` | Yes | Submit author request |
| GET | `/api/author-requests/mine` | Yes | Get own request status |
| DELETE | `/api/author-requests/mine` | Yes | Cancel own request |

### Upload

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/api/upload` | Yes | Upload image to Cloudinary |

### Users (Public)

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| GET | `/api/users/:userId` | No | Get user public profile |
| GET | `/api/users/:userId/liked-posts` | No | Get user's liked posts |

### Admin

All admin endpoints require authentication with `admin` role.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/admin/dashboard` | Dashboard statistics |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/users/:id` | Get user details |
| PATCH | `/api/admin/users/:id/role` | Change user role |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/author-requests` | List author requests |
| PATCH | `/api/admin/author-requests/:id/approve` | Approve author request |
| PATCH | `/api/admin/author-requests/:id/reject` | Reject author request |
| GET | `/api/admin/posts` | List all posts |
| GET | `/api/admin/posts/pending` | List pending posts |
| PATCH | `/api/admin/posts/:id/approve` | Approve post |
| PATCH | `/api/admin/posts/:id/reject` | Reject post |
| DELETE | `/api/admin/posts/:id` | Delete any post |
| GET | `/api/admin/comments` | List all comments |
| DELETE | `/api/admin/comments/:id` | Delete any comment |

> Auth endpoints require `Authorization: Bearer <token>` header.

---

## Project Structure

```
blog-mern/
├── client/                              # React frontend (SPA)
│   ├── src/
│   │   ├── App.jsx                      # Root component with routing
│   │   ├── main.jsx                     # Entry point with providers
│   │   ├── index.css                    # Global styles, theme, Tailwind
│   │   ├── api/
│   │   │   ├── axios.js                 # Axios instance with interceptors
│   │   │   └── services/                # API service modules
│   │   │       ├── adminService.js      # Admin API calls
│   │   │       ├── authService.js       # Auth API calls
│   │   │       ├── authorRequestService.js
│   │   │       ├── commentService.js    # Comment API calls
│   │   │       ├── likeService.js       # Like API calls
│   │   │       ├── postService.js       # Post API calls
│   │   │       ├── uploadService.js     # Image upload API
│   │   │       └── userService.js       # User API calls
│   │   ├── components/
│   │   │   ├── CommentSection.jsx       # Post comment list and form
│   │   │   ├── Footer.jsx              # App footer
│   │   │   ├── Navbar.jsx              # Navigation with auth state
│   │   │   ├── Pagination.jsx          # Paginated navigation
│   │   │   ├── PostCard.jsx            # Blog post card with like
│   │   │   ├── ScrollToTop.jsx         # Scroll reset on navigation
│   │   │   ├── routes/                  # Route guard components
│   │   │   │   ├── AdminRoute.jsx       # Admin-only route guard
│   │   │   │   ├── AuthorRoute.jsx      # Author+ route guard
│   │   │   │   ├── GuestOnlyRoute.jsx   # Unauthenticated-only guard
│   │   │   │   └── ProtectedRoute.jsx   # Authenticated-only guard
│   │   │   └── ui/                      # Reusable UI components
│   │   │       ├── CharacterCounter.jsx # Input character counter
│   │   │       ├── ConfirmModal.jsx     # Confirmation dialog
│   │   │       ├── EmptyState.jsx       # Empty content placeholder
│   │   │       ├── PostCardSkeleton.jsx # Loading skeleton
│   │   │       ├── RoleBadge.jsx        # User role badge
│   │   │       ├── SelectableCard.jsx   # Selectable option card
│   │   │       ├── Spinner.jsx          # Loading spinner
│   │   │       ├── StatusBadge.jsx      # Post status badge
│   │   │       └── ToggleSwitch.jsx     # Toggle switch control
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # Auth state management
│   │   │   └── PreferencesContext.jsx   # User preferences state
│   │   ├── hooks/
│   │   │   ├── useAuth.js              # Auth context consumer
│   │   │   ├── useGuestFingerprint.js   # Guest UUID generator
│   │   │   ├── useLocalStorage.js       # localStorage sync hook
│   │   │   └── usePreferences.js        # Preferences context consumer
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx          # Admin panel layout + sidebar
│   │   │   ├── MainLayout.jsx           # Public layout (Navbar + Footer)
│   │   │   └── SettingsLayout.jsx       # Settings layout + side nav
│   │   ├── pages/
│   │   │   ├── BecomeAuthorPage.jsx     # Author request form
│   │   │   ├── CreatePostPage.jsx       # New post creation
│   │   │   ├── EditPostPage.jsx         # Post editing
│   │   │   ├── HomePage.jsx             # Post listing with search/sort
│   │   │   ├── LoginPage.jsx            # User login
│   │   │   ├── MyPostsPage.jsx          # Author's post management
│   │   │   ├── NotFoundPage.jsx         # 404 page
│   │   │   ├── PostDetailPage.jsx       # Single post view
│   │   │   ├── RegisterPage.jsx         # User registration
│   │   │   ├── UserProfilePage.jsx      # Public user profile
│   │   │   ├── admin/                   # Admin panel pages
│   │   │   │   ├── AdminAuthorRequestsPage.jsx
│   │   │   │   ├── AdminCommentsPage.jsx
│   │   │   │   ├── AdminDashboardPage.jsx
│   │   │   │   ├── AdminPendingPostsPage.jsx
│   │   │   │   ├── AdminPostsPage.jsx
│   │   │   │   ├── AdminUserDetailPage.jsx
│   │   │   │   └── AdminUsersPage.jsx
│   │   │   └── settings/               # Settings sub-pages
│   │   │       ├── SettingsAccountPage.jsx
│   │   │       ├── SettingsAppearancePage.jsx
│   │   │       ├── SettingsContentPage.jsx
│   │   │       ├── SettingsNotificationsPage.jsx
│   │   │       ├── SettingsPrivacyPage.jsx
│   │   │       └── SettingsProfilePage.jsx
│   │   └── utils/
│   │       ├── constants.js             # App-wide constants
│   │       ├── formatDate.js            # Date formatting utility
│   │       ├── guestLikes.js            # Guest like helpers
│   │       └── helpers.js               # General helper functions
│   ├── public/
│   │   └── favicon.svg
│   ├── .env.example
│   ├── eslint.config.js
│   ├── index.html
│   ├── netlify.toml
│   ├── vite.config.js
│   └── package.json
│
├── server/                              # Express backend (REST API)
│   ├── src/
│   │   ├── index.js                     # Entry point, middleware setup
│   │   ├── validators.js               # Request validation schemas
│   │   ├── config/
│   │   │   ├── cloudinary.js            # Cloudinary SDK configuration
│   │   │   ├── db.js                    # MongoDB connection
│   │   │   └── env.js                   # Environment variable validation
│   │   ├── controllers/                 # Route handlers (business logic)
│   │   │   ├── adminController.js       # Admin operations
│   │   │   ├── authController.js        # Auth operations
│   │   │   ├── authorRequestController.js
│   │   │   ├── commentController.js     # Comment CRUD
│   │   │   ├── likeController.js        # Like toggle logic
│   │   │   ├── postController.js        # Post CRUD
│   │   │   └── userController.js        # User profile & preferences
│   │   ├── middlewares/
│   │   │   ├── auth.js                  # JWT auth & role-based guards
│   │   │   ├── errorHandler.js          # Global error handler
│   │   │   ├── upload.js               # Multer file upload config
│   │   │   └── validate.js             # Validation result handler
│   │   ├── models/                      # Mongoose schemas
│   │   │   ├── AuthorRequest.js         # Author request schema
│   │   │   ├── Comment.js              # Comment schema
│   │   │   ├── GuestLike.js            # Guest like schema
│   │   │   ├── Post.js                 # Post schema with status
│   │   │   └── User.js                 # User schema with preferences
│   │   ├── routes/                      # Express route definitions
│   │   │   ├── adminRoutes.js           # /api/admin/*
│   │   │   ├── authRoutes.js            # /api/auth/*
│   │   │   ├── authorRequestRoutes.js   # /api/author-requests/*
│   │   │   ├── commentRoutes.js         # /api/posts/:postId/comments
│   │   │   ├── likeRoutes.js            # /api/posts/:id/like
│   │   │   ├── postRoutes.js            # /api/posts/*
│   │   │   ├── uploadRoutes.js          # /api/upload
│   │   │   └── userRoutes.js            # /api/users/*
│   │   ├── scripts/
│   │   │   └── seedAdmin.js             # Admin seed script
│   │   └── utils/
│   │       ├── escapeRegex.js           # Regex escape utility
│   │       └── generateToken.js         # JWT token generator
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── LICENSE
├── STEPS.md
└── README.md
```

---

## Security

- **HTTP Headers** — Helmet.js sets secure headers including CSP, HSTS, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy
- **Rate Limiting** — 4-tier rate limiting: global API (100/15min), auth (10/15min), admin (60/15min), guest-like (30/15min)
- **NoSQL Injection Prevention** — `express-mongo-sanitize` strips `$` and `.` operators from request body, params, and query strings
- **XSS Protection** — User input sanitized server-side; no raw HTML rendering on frontend
- **HTTP Parameter Pollution** — `hpp` middleware prevents duplicate parameter attacks
- **JWT Security** — Strong secret key requirement, configurable expiration, token validation on every protected request
- **Body Size Limits** — Express body parser limited to 10KB to prevent payload-based attacks
- **File Upload Validation** — File type whitelist, size limits, and extension checking via Multer middleware
- **Mass Assignment Protection** — Only whitelisted fields accepted in update operations to prevent data injection
- **User Enumeration Prevention** — Login returns identical error messages for wrong email and wrong password
- **CORS Whitelist** — Strict origin-based CORS; only the configured `CLIENT_URL` is allowed
- **Role-Based Access Control** — Middleware-enforced role checks (`protect`, `authorOrAdmin`, `adminOnly`) on every protected route
- **Post Status Isolation** — Unpublished, draft, and rejected posts are never exposed through public API endpoints
- **Guest Like Protection** — Fingerprint validation with per-fingerprint rate limits to prevent abuse
- **Privacy Enforcement** — User privacy preferences enforced server-side, not just hidden in the UI
- **x-powered-by Disabled** — Express fingerprint header removed to reduce attack surface

---

## Deployment

### Backend → Render

1. Create a **Web Service** on [Render](https://render.com)
2. Connect the GitHub repository
3. Set **Root Directory** to `server`, **Build Command** to `npm install`, **Start Command** to `npm start`
4. Add environment variables:

| Variable | Value |
| -------- | ----- |
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A strong random string (32+ chars) |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | Your Netlify URL (e.g., `https://blog-mernn.netlify.app`) |
| `ADMIN_EMAIL` | Admin email address |
| `ADMIN_PASSWORD` | Strong admin password |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

5. After first deploy, run `node src/scripts/seedAdmin.js` from the Render Shell tab

> **Note:** Render's filesystem is ephemeral. All image storage is handled through Cloudinary (already integrated).

### Frontend → Netlify

1. Create a new site on [Netlify](https://app.netlify.com)
2. Connect the GitHub repository
3. Set **Base directory** to `client`, **Build command** to `npm run build`, **Publish directory** to `client/dist`
4. Add environment variable:

| Variable | Value |
| -------- | ----- |
| `VITE_API_URL` | Your Render backend URL (e.g., `https://your-api.onrender.com/api`) |

5. After deploy, update `CLIENT_URL` on Render to the Netlify URL for CORS

> **Important:** The `netlify.toml` file handles SPA routing redirects automatically.

---

## Features in Detail

### Completed Features

✅ JWT authentication with register, login, and auto-refresh
✅ Three-tier role system (User, Author, Admin)
✅ Author request and approval workflow
✅ Post creation with draft, pending, published, rejected lifecycle
✅ Admin dashboard with statistics and quick actions
✅ Admin user management with role changes and deletion
✅ Admin post moderation with approve/reject workflow
✅ Admin comment management
✅ Guest likes with fingerprint-based tracking
✅ Authenticated comments with optimistic UI
✅ User profiles with tabs and privacy controls
✅ Six settings sub-pages (Profile, Account, Appearance, Privacy, Notifications, Content)
✅ Dark / Light / System theme support
✅ Font size, content density, and animation preferences
✅ Cloudinary image uploads for posts and avatars
✅ Debounced search and multi-sort post listing
✅ Pagination with configurable posts per page
✅ Responsive mobile-first design
✅ Comprehensive input validation (express-validator)
✅ Security hardening (Helmet, CORS, rate limiting, sanitization, HPP)

### Future Features

- [ ] 🔮 Rich text editor for post content
- [ ] 🔮 Post categories and tag-based filtering
- [ ] 🔮 Email notifications for post approval/rejection
- [ ] 🔮 Social media sharing buttons
- [ ] 🔮 Bookmark / save posts feature
- [ ] 🔮 User follow system
- [ ] 🔮 Post analytics and view counts
- [ ] 🔮 Multi-language support (i18n)

---

## Contributing

Contributions are welcome! Follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/amazing-feature`
3. **Commit** your changes: `git commit -m "feat: add amazing feature"`
4. **Push** to the branch: `git push origin feat/amazing-feature`
5. **Open** a Pull Request

### Commit Message Format

| Prefix | Description |
| ------ | ----------- |
| `feat:` | New feature |
| `fix:` | Bug fix |
| `refactor:` | Code refactoring |
| `docs:` | Documentation changes |
| `chore:` | Maintenance and dependency updates |

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Developer

**Serkan Bayraktar**

- 🌐 Website: [serkanbayraktar.com](https://serkanbayraktar.com/)
- 🐙 GitHub: [@Serkanbyx](https://github.com/Serkanbyx)
- 📧 Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)

---

## Acknowledgments

- [React](https://react.dev/) — UI library
- [Express](https://expressjs.com/) — Web framework
- [MongoDB](https://www.mongodb.com/) — Database
- [Tailwind CSS](https://tailwindcss.com/) — CSS framework
- [Vite](https://vite.dev/) — Build tool
- [Cloudinary](https://cloudinary.com/) — Image management
- [Render](https://render.com/) — Backend hosting
- [Netlify](https://www.netlify.com/) — Frontend hosting

---

## Contact

- 🐛 Issues: [GitHub Issues](https://github.com/Serkanbyx/blog-mern/issues)
- 📧 Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)
- 🌐 Website: [serkanbayraktar.com](https://serkanbayraktar.com/)

---

⭐ If you like this project, don't forget to give it a star!

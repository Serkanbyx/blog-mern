[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)

# BlogMERN API

Full-featured blog platform REST API built with **Express 5**, **MongoDB** and **JWT** authentication.

## Features

- **Authentication** — Register, login, JWT-based session, profile & password management
- **Role-based access** — `user` → `author` → `admin` with author request workflow
- **Post moderation** — Authors submit posts for admin approval before publishing
- **Comments** — Authenticated users can comment on published posts
- **Likes** — Registered user likes + anonymous guest likes via browser fingerprint
- **Image uploads** — Cloudinary integration with file validation (JPEG, PNG, WebP ≤ 5 MB)
- **Admin panel** — Dashboard stats, user/post/comment management, author request handling
- **Security** — Helmet, CORS, rate limiting, NoSQL injection prevention, HPP protection
- **API documentation** — Interactive Swagger / OpenAPI 3.0 docs at `/api-docs`
- **User preferences** — Theme, font size, content density, privacy & notification settings

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Uploads | Multer + Cloudinary |
| Validation | express-validator |
| Security | Helmet, CORS, express-rate-limit, express-mongo-sanitize, HPP |
| Docs | swagger-jsdoc + swagger-ui-express |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account

### Installation

```bash
git clone https://github.com/Serkanbyx/s4.7_Blog-Mern.git
cd s4.7_Blog-Mern/server
npm install
```

### Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/blogmern
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=securepassword
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Run

```bash
# Development (with hot reload)
npm run dev

# Production
npm start

# Seed admin user
npm run seed:admin
```

### API Documentation

Once the server is running, visit:

- **Welcome page:** [http://localhost:5000](http://localhost:5000)
- **Swagger docs:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Health check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Register |
| `POST` | `/api/auth/login` | — | Login |
| `GET` | `/api/auth/me` | JWT | Current user |
| `PUT` | `/api/auth/me` | JWT | Update profile |
| `PUT` | `/api/auth/me/password` | JWT | Change password |
| `DELETE` | `/api/auth/me` | JWT | Delete account |
| `PUT` | `/api/auth/me/preferences` | JWT | Update preferences |
| `GET` | `/api/posts` | — | Published posts |
| `GET` | `/api/posts/:slug` | — | Post by slug |
| `POST` | `/api/posts` | Author | Create post |
| `PUT` | `/api/posts/:id` | Author | Update post |
| `PATCH` | `/api/posts/:id/submit` | Author | Submit for review |
| `DELETE` | `/api/posts/:id` | Owner/Admin | Delete post |
| `GET` | `/api/posts/mine` | Author | Own posts |
| `POST` | `/api/posts/:id/like` | JWT | Toggle like |
| `POST` | `/api/posts/:id/guest-like` | — | Guest like |
| `GET` | `/api/posts/:postId/comments` | — | Post comments |
| `POST` | `/api/posts/:postId/comments` | JWT | Add comment |
| `DELETE` | `/api/comments/:commentId` | Owner/Admin | Delete comment |
| `GET` | `/api/users/:userId` | — | User profile |
| `POST` | `/api/author-requests` | JWT | Submit author request |
| `POST` | `/api/upload` | JWT | Upload image |
| `GET` | `/api/admin/dashboard` | Admin | Dashboard stats |

> Full interactive documentation available at `/api-docs`

## Project Structure

```
server/
├── src/
│   ├── config/          # DB, env, Cloudinary, Swagger config
│   ├── controllers/     # Route handlers
│   ├── docs/            # Swagger JSDoc annotations
│   ├── middlewares/      # Auth, validation, error handling, upload
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── scripts/         # Seed scripts
│   ├── utils/           # Helper functions
│   └── index.js         # App entry point
├── package.json
├── LICENSE
├── SECURITY.md
└── README.md
```

## Developer

**Serkanby**

- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)
- GitHub: [@Serkanbyx](https://github.com/Serkanbyx)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)

## Contact

- [Open an Issue](https://github.com/Serkanbyx/s4.7_Blog-Mern/issues)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)
- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)

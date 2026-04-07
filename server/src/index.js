const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { version } = require("../package.json");
const { PORT, CLIENT_URL } = require("./config/env");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const likeRoutes = require("./routes/likeRoutes");
const commentRoutes = require("./routes/commentRoutes");
const authorRequestRoutes = require("./routes/authorRequestRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

// --- Global middlewares (order matters) ---

// 1. Secure HTTP headers (allow inline styles for Swagger UI & welcome page)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https://validator.swagger.io"],
      },
    },
  })
);

// 2. CORS — strict origin, credentials enabled
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// 3. JSON body parser with size limit
app.use(express.json({ limit: "10kb" }));

// 4. URL-encoded parser with size limit
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// 5. Express 5 compatibility: req.query is read-only (getter), make it writable
// for middleware that needs to mutate it (mongoSanitize, hpp)
app.use((req, _res, next) => {
  Object.defineProperty(req, "query", {
    ...Object.getOwnPropertyDescriptor(req, "query"),
    value: req.query,
    writable: true,
  });
  next();
});

// 6. NoSQL injection prevention
app.use(mongoSanitize());

// 7. HTTP parameter pollution protection
app.use(hpp());

// --- Rate limiters ---

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const likeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/admin", adminLimiter);
app.use("/api/posts/:id/guest-like", likeLimiter);

// --- Root welcome page ---

app.get("/", (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BlogMERN API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      overflow: hidden;
      position: relative;
    }

    /* Floating ink blots / reading atmosphere */
    body::before,
    body::after {
      content: "";
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      opacity: 0.25;
      pointer-events: none;
    }
    body::before {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
      top: -120px;
      right: -100px;
    }
    body::after {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
      bottom: -80px;
      left: -80px;
    }

    /* Subtle grid pattern — notebook / editorial feel */
    body::selection { background: #3b82f6; color: #fff; }

    .container {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 3rem 2rem;
      max-width: 520px;
      width: 100%;
      background: rgba(30, 41, 59, 0.55);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(148, 163, 184, 0.12);
      border-radius: 20px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35);
    }

    /* Decorative quill / pen nib at top */
    .container::before {
      content: "";
      display: block;
      width: 48px;
      height: 48px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
    }

    h1 {
      font-size: 2.4rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    .version {
      display: inline-block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #94a3b8;
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.2);
      padding: 0.2rem 0.75rem;
      border-radius: 999px;
      margin-bottom: 2rem;
    }

    .links {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 2.5rem;
    }

    .links a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.8rem 1.5rem;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.25s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      color: #fff;
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.45);
    }

    .btn-secondary {
      background: rgba(148, 163, 184, 0.08);
      color: #cbd5e1;
      border: 1px solid rgba(148, 163, 184, 0.18);
    }
    .btn-secondary:hover {
      background: rgba(148, 163, 184, 0.15);
      color: #f1f5f9;
      transform: translateY(-2px);
    }

    .sign {
      font-size: 0.82rem;
      color: #64748b;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(148, 163, 184, 0.1);
    }
    .sign a {
      color: #60a5fa;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    .sign a:hover { color: #93c5fd; }

    @media (max-width: 480px) {
      .container { margin: 1rem; padding: 2rem 1.5rem; }
      h1 { font-size: 1.8rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>BlogMERN API</h1>
    <p class="version">v${version}</p>
    <div class="links">
      <a href="/api-docs" class="btn-primary">API Documentation</a>
      <a href="/api/health" class="btn-secondary">Health Check</a>
    </div>
    <footer class="sign">
      Created by
      <a href="https://serkanbayraktar.com/" target="_blank" rel="noopener noreferrer">Serkanby</a>
      |
      <a href="https://github.com/Serkanbyx" target="_blank" rel="noopener noreferrer">Github</a>
    </footer>
  </div>
</body>
</html>`);
});

// --- Swagger UI ---

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "BlogMERN API Docs",
}));

// --- Routes ---

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    version,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", likeRoutes);
app.use("/api", commentRoutes);
app.use("/api", authorRequestRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// --- Global error handler (must be last middleware) ---
app.use(errorHandler);

// --- Server start ---

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

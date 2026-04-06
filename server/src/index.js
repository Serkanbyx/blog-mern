const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const path = require("path");

const { PORT, CLIENT_URL } = require("./config/env");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();

app.disable("x-powered-by");

// --- Global middlewares (order matters) ---

// 1. Secure HTTP headers
app.use(helmet());

// 2. CORS — strict origin, credentials enabled
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// 3. JSON body parser with size limit
app.use(express.json({ limit: "10kb" }));

// 4. URL-encoded parser with size limit
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// 5. NoSQL injection prevention
app.use(mongoSanitize());

// 6. HTTP parameter pollution protection
app.use(hpp());

// 7. Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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

// --- Routes ---

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// TODO: More routes will be added in upcoming steps

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

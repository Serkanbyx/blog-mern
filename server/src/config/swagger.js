const swaggerJsdoc = require("swagger-jsdoc");
const { version } = require("../../package.json");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "BlogMERN API",
    version,
    description:
      "Full-featured blog platform API built with Express, MongoDB & JWT authentication. " +
      "Supports user registration, role-based access (user / author / admin), " +
      "post moderation, comments, likes (registered + guest), image uploads via Cloudinary, " +
      "and author request workflows.",
    contact: {
      name: "Serkanby",
      url: "https://serkanbayraktar.com/",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "/api",
      description: "API Base",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token (without 'Bearer ' prefix)",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
          name: { type: "string", example: "John Doe" },
          email: { type: "string", format: "email", example: "john@example.com" },
          avatar: { type: "string", example: "https://res.cloudinary.com/..." },
          bio: { type: "string", example: "Full-stack developer" },
          role: { type: "string", enum: ["user", "author", "admin"], example: "user" },
          preferences: { $ref: "#/components/schemas/Preferences" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Preferences: {
        type: "object",
        properties: {
          theme: { type: "string", enum: ["light", "dark", "system"], default: "system" },
          fontSize: { type: "string", enum: ["small", "medium", "large"], default: "medium" },
          contentDensity: { type: "string", enum: ["compact", "comfortable", "spacious"], default: "comfortable" },
          animationsEnabled: { type: "boolean", default: true },
          language: { type: "string", enum: ["en", "tr"], default: "en" },
          privacy: {
            type: "object",
            properties: {
              showLikedPosts: { type: "boolean", default: true },
              showComments: { type: "boolean", default: true },
              showEmail: { type: "boolean", default: false },
            },
          },
          notifications: {
            type: "object",
            properties: {
              postApproved: { type: "boolean", default: true },
              postRejected: { type: "boolean", default: true },
              newCommentOnPost: { type: "boolean", default: true },
            },
          },
          postsPerPage: { type: "integer", minimum: 5, maximum: 50, default: 10 },
          defaultSort: { type: "string", enum: ["newest", "popular", "mostCommented"], default: "newest" },
        },
      },
      Post: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string", example: "Getting Started with MERN Stack" },
          slug: { type: "string", example: "getting-started-with-mern-stack" },
          content: { type: "string", example: "In this tutorial we will..." },
          image: { type: "string", example: "https://res.cloudinary.com/..." },
          author: { $ref: "#/components/schemas/UserSummary" },
          status: { type: "string", enum: ["draft", "pending", "published", "rejected"] },
          rejectionReason: { type: "string" },
          likes: { type: "array", items: { type: "string" } },
          guestLikeCount: { type: "integer" },
          totalLikes: { type: "integer" },
          commentsCount: { type: "integer" },
          tags: { type: "array", items: { type: "string" }, example: ["react", "nodejs"] },
          isLiked: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Comment: {
        type: "object",
        properties: {
          _id: { type: "string" },
          postId: { type: "string" },
          user: { $ref: "#/components/schemas/UserSummary" },
          text: { type: "string", example: "Great article!" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AuthorRequest: {
        type: "object",
        properties: {
          _id: { type: "string" },
          user: { type: "string" },
          message: { type: "string", example: "I would like to contribute as an author..." },
          status: { type: "string", enum: ["pending", "approved", "rejected"] },
          rejectionReason: { type: "string" },
          reviewedBy: { type: "string" },
          reviewedAt: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      UserSummary: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          avatar: { type: "string" },
        },
      },
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error message" },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          totalPages: { type: "integer", example: 5 },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "Missing or invalid JWT token",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { success: false, message: "Not authorized, no token" },
          },
        },
      },
      Forbidden: {
        description: "Insufficient permissions",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { success: false, message: "Admin access required" },
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { success: false, message: "Resource not found" },
          },
        },
      },
    },
  },
  tags: [
    { name: "Auth", description: "Registration, login, profile & password management" },
    { name: "Posts", description: "CRUD operations for blog posts" },
    { name: "Comments", description: "Post comments" },
    { name: "Likes", description: "Like/unlike for registered users and guests" },
    { name: "Users", description: "Public user profiles" },
    { name: "Author Requests", description: "Author role application workflow" },
    { name: "Upload", description: "Image upload via Cloudinary" },
    { name: "Admin", description: "Admin-only management endpoints" },
    { name: "Health", description: "Server health check" },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/docs/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

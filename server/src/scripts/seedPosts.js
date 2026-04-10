const mongoose = require("mongoose");
const { MONGO_URI } = require("../config/env");
const User = require("../models/User");
const Post = require("../models/Post");

const posts = [
  {
    title: "Async/Await in JavaScript: Usage and Best Practices",
    content: `In modern JavaScript development, async/await is one of the most readable and powerful ways to manage asynchronous work. This syntax replaces callback hell and tangled Promise chains, making your code look synchronous while keeping all the benefits of asynchrony.

What Is Async/Await?

Introduced in ES2017, async/await is syntactic sugar that makes writing Promise-based asynchronous code easier. The "async" keyword marks a function as asynchronous, while "await" pauses until a Promise settles.

Error Handling

With async/await, errors are handled through try/catch blocks—the same pattern you already use in synchronous code. Always aim to produce clear, meaningful error messages in your catch blocks.

Parallel Work

Running independent asynchronous operations in parallel with Promise.all() can significantly improve performance. Instead of awaiting one after another, group independent work so total wait time approaches the duration of the slowest task.

Async/await has become essential in the JavaScript ecosystem. Used well, it greatly improves both readability and maintainability.`,
    tags: ["JavaScript", "Async", "Web Development"],
    status: "published",
  },
  {
    title: "Modern State Management with React Hooks",
    content: `Hooks, introduced in React 16.8, fundamentally changed how we build React apps by enabling state and lifecycle logic inside function components. We can now write powerful, reusable logic without class components.

useState and useEffect

useState is the simplest way to hold local state in a component. useEffect manages side effects—API calls, subscriptions, DOM updates. Together they cover most component needs.

Custom Hooks

Custom hooks let you extract and share logic across components. You can build hooks for forms, API calls, local storage, and more. This aligns with DRY, stays testable, and keeps your architecture modular.

Complex State with useReducer

When several state values depend on each other, useReducer often gives more predictable updates. You can mirror a Redux-like flow at component level and drive transitions from one place.

Hooks are the future of React. Embracing functional ideas makes it easier than ever to ship cleaner, more testable, easier-to-maintain applications.`,
    tags: ["React", "Hooks", "Frontend"],
    status: "published",
  },
  {
    title: "Designing RESTful APIs with Node.js",
    content: `A solid API sits at the heart of most successful web apps. By applying REST principles well, you can build APIs that scale, stay understandable, and are straightforward to maintain.

REST Principles

REST (Representational State Transfer) is an architectural style built on HTTP. It models resources with URLs and uses HTTP methods—GET, POST, PUT, DELETE—to express operations. Because it is stateless, each request stands on its own.

URL Design

Good URL design directly affects how intuitive your API feels. Prefer plural nouns (/users, /posts), avoid verbs in paths, and reflect hierarchy when it helps (/users/:id/posts).

Errors and Status Codes

Using HTTP status codes correctly signals professionalism. The 2xx range means success, 4xx client errors, 5xx server errors. Return a consistent error shape and helpful messages every time.

Security

Rate limiting, input validation, CORS configuration, and JWT-based authentication are core pieces of API security. Never put sensitive data in URL query strings, and validate all input on the server.

A well-designed API serves today’s needs and can adapt as requirements evolve.`,
    tags: ["Node.js", "API", "Backend"],
    status: "published",
  },
  {
    title: "Database Modeling Strategies with MongoDB",
    content: `MongoDB is among the most popular NoSQL databases. Its flexible schema and document model are a strong foundation for modern apps—but that flexibility still calls for deliberate modeling.

Embedding vs Referencing

Two main patterns exist: embed related data or store references. Prefer embedding when data is usually read and updated together; prefer referencing when documents have independent lifecycles.

Indexing

The right indexes can dramatically improve query performance. Index fields you filter or sort on often. Avoid redundant indexes—they slow down writes.

Aggregation Pipeline

MongoDB’s aggregation framework lets you transform and analyze data at the database layer. Stages like $match, $group, and $lookup enable powerful pipelines.

A successful MongoDB strategy accounts for read/write patterns, relationships, and how you plan to scale.`,
    tags: ["MongoDB", "Database", "NoSQL"],
    status: "published",
  },
  {
    title: "CSS Grid vs Flexbox: When to Use Which",
    content: `Grid and Flexbox revolutionized layout in CSS. Both are powerful, but they shine in different situations. Picking the right tool affects both your velocity and long-term maintainability.

Flexbox: One-Dimensional Layout

Flexbox is ideal for aligning items along a single axis—row or column. Navigation bars, rows of cards, form rows, and centering are where it excels. justify-content and align-items get you polished alignment quickly.

CSS Grid: Two-Dimensional Layout

Grid is built for layouts that need control across rows and columns—page shells, dashboards, galleries, asymmetric designs. grid-template-areas can describe structure visually.

Using Them Together

The strongest approach often combines both: Grid for the overall page skeleton, Flexbox for alignment inside components. That hybrid gives flexibility and control.

If your layout is essentially one-dimensional, reach for Flexbox; if it is two-dimensional, use Grid. Together they unlock the full power of modern CSS.`,
    tags: ["CSS", "Frontend", "Web Design"],
    status: "published",
  },
  {
    title: "Effective Version Control with Git and Branching Strategies",
    content: `Git is non-negotiable in software development. Using it well means more than memorizing commands—you need a branching strategy and workflow that fit your team.

Branch Strategies

Gitflow, GitHub Flow, and trunk-based development are common choices. Small teams often benefit from GitHub Flow’s simplicity; larger products may lean on Gitflow’s structure. The key is picking what matches your team.

Meaningful Commit Messages

Good commits make history readable. Conventional Commits (feat:, fix:, refactor:) improve consistency and enable automated changelogs. Each commit should represent one logical change.

Rebase vs Merge

Rebasing feature branches onto main yields a linear history; merge commits preserve branch topology. Agree on one style per team to reduce confusion.

Resolving Conflicts

Conflicts are inevitable. Pull from main regularly, keep commits small and focused, and communicate—those habits keep pain to a minimum.

Git is as much a discipline as a tool. Solid Git habits directly improve team throughput and code quality.`,
    tags: ["Git", "DevOps", "Version Control"],
    status: "published",
  },
  {
    title: "Security in Web Applications: OWASP Top 10",
    content: `Web security is every developer’s responsibility. The OWASP Top 10 ranks the most critical risks in web applications; you should know these threats and mitigate them deliberately.

Injection Attacks

SQL injection, NoSQL injection, and command injection happen when user input is concatenated into queries or commands. Parameterized queries, ORMs, and careful input handling greatly reduce this risk.

Cross-Site Scripting (XSS)

XSS lets attackers run scripts in a victim’s browser. Output encoding, Content Security Policy (CSP), and framework defaults (e.g. React’s escaping) form strong defenses.

Authentication and Sessions

Weak password rules, insecure session handling, and missing brute-force protection are common pitfalls. Hash passwords with bcrypt, manage JWTs carefully, add rate limiting, and consider multi-factor authentication.

CSRF and CORS

Cross-Site Request Forgery abuses a logged-in session to perform unauthorized actions. CSRF tokens, SameSite cookies, and correct CORS settings help close that gap.

Security is not a one-off feature—it is a process. Bake it into every stage of development.`,
    tags: ["Security", "OWASP", "Web Development"],
    status: "published",
  },
  {
    title: "Moving to TypeScript: Why and How",
    content: `TypeScript adds a static type system on top of JavaScript. On large projects it materially improves reliability and the developer experience. When does migrating make sense?

Benefits of TypeScript

Catch errors at compile time, get richer IDE support (completion, refactors), write self-documenting code, and keep large teams aligned. Many runtime issues surface during the build instead of in production.

Incremental Migration

The healthiest path is incremental. With allowJs: true in tsconfig.json you can mix JS and TS. Convert critical modules first, then expand.

Type Definitions

Interfaces, type aliases, generics, and utility types are the building blocks. Utilities like Partial, Pick, and Omit reshape types and cut duplication.

Common Pitfalls

Overusing "any" throws away TypeScript’s benefits. Enable strict mode, prefer "unknown" over "any" where you must loosen types, and do not give up type safety casually.

TypeScript asks for extra effort up front; over time it lowers defect rates, makes refactors safer, and boosts team productivity.`,
    tags: ["TypeScript", "JavaScript", "Programming"],
    status: "published",
  },
  {
    title: "Containerization with Docker: A Getting Started Guide",
    content: `Docker packages apps in containers and kills the “works on my machine” problem. From dev to prod it offers a consistent environment.

Containers vs Virtual Machines

Containers share the host kernel unlike full VMs. That makes them lighter, faster to start, and more resource-friendly. What might take minutes for a VM can start in seconds for a container.

Writing Dockerfiles

A solid Dockerfile uses multi-stage builds, excludes junk via .dockerignore, leverages layer caching, and favors small base images. Alpine-based images often shrink size a lot.

Docker Compose

For multi-container apps, Docker Compose is essential. Define database, backend, frontend, and more in one docker-compose.yml and bring the stack up with a single command.

Best Practices

Avoid running as root, pass secrets via environment variables, define health checks, and refresh images regularly. Fold security scanning into CI/CD.

Docker is now a standard part of modern development. The learning curve can feel steep at first, but consistency and efficiency repay the investment.`,
    tags: ["Docker", "DevOps", "Containerization"],
    status: "published",
  },
  {
    title: "Responsive Design: A Mobile-First Approach",
    content: `With most web traffic coming from phones, responsive design is mandatory—not optional. Mobile-first puts that reality at the center of how you design and build.

What Is Mobile-First?

You start from the smallest screen and scale up. That forces prioritization of content and naturally pushes you toward leaner, faster pages.

Media Query Strategy

min-width queries are the backbone of mobile-first. Base styles target mobile; then breakpoints like @media (min-width: 768px) add tablet and desktop rules.

Fluid Typography and Spacing

clamp() and viewport units let type and spacing scale smoothly with the viewport. That reduces reliance on fixed breakpoints and looks good across sizes.

Performance

Responsive images (srcset, picture), lazy loading, critical CSS, and conditional loading all help mobile performance. Mobile users often have slower links—speed matters.

Mobile-first is not only a technical choice; it is a user-centered design philosophy.`,
    tags: ["CSS", "Responsive", "UI/UX"],
    status: "published",
  },
  {
    title: "Clean Code: The Craft of Readable Software",
    content: `Writing code is writing text that others—and future you—must read. Clean code principles are the map to clarity, maintainability, and trust.

Meaningful Naming

Variables, functions, and classes should express intent. Prefer elapsedDays over d, fetchActiveUsers over getData. Good names reduce the need for comments.

Small Functions

Each function should do one thing and do it well. Functions past ~20 lines are often splittable. Small, focused units are easier to test and reuse.

DRY and KISS

Don't Repeat Yourself and Keep It Simple, Stupid anchor clean code. Abstract repetition, but resist needless complexity. Sometimes the simple fix beats the clever one.

A Culture of Code Review

Regular reviews are one of the best ways to raise quality. Constructive feedback, knowledge sharing, and shared standards lift the whole team.

Clean code is a habit. Aiming to write slightly better code every day compounds over time.`,
    tags: ["Clean Code", "Best Practices", "Programming"],
    status: "published",
  },
  {
    title: "CI/CD Pipelines: Automation with GitHub Actions",
    content: `CI/CD (Continuous Integration / Continuous Deployment) is the backbone of modern delivery. GitHub Actions gives you a capable automation platform for free—use it to tighten quality and speed up releases.

Continuous Integration

CI automatically tests and validates every change. Linting, unit tests, integration tests, and build checks are typical steps. Problems surface early before they get expensive.

How GitHub Actions Fits Together

Workflows live under .github/workflows/ as YAML. Triggers (push, pull_request), jobs, steps, and actions are the main pieces. Marketplace actions save implementation time.

Continuous Deployment

CD ships passing code to target environments automatically. Separate pipelines for staging and production support safer promotion flows.

Secrets and Environments

API keys, database URLs, and other secrets belong in GitHub Secrets. Use different secrets per environment for defense in depth.

CI/CD needs upfront setup, but over time it dramatically improves team throughput and software quality.`,
    tags: ["CI/CD", "GitHub Actions", "DevOps"],
    status: "published",
  },
  {
    title: "Artificial Intelligence and the Future of Software Development",
    content: `AI is reshaping how we build software. Assisted coding, generated tests, and smarter debugging multiply productivity. Where is this heading?

AI-Assisted Coding

Tools like GitHub Copilot and Cursor help with completion, refactors, and fixes. They automate repetitive work so developers can focus on harder problems.

Automated Test Generation

AI can analyze code, spot edge cases, and draft broader test suites—raising coverage while reducing manual test churn.

Review and Security

AI-powered reviewers can flag vulnerabilities, performance issues, and smells—catching issues humans might miss.

The Developer’s Role Is Changing

AI is not replacing developers; it is changing the job. As routine coding automates, skills like architecture, problem framing, and UX matter more.

Developers who learn to use AI well will thrive. Treat it as a partner, not a competitor.`,
    tags: ["AI", "Technology", "Future"],
    status: "published",
  },
  {
    title: "Web Performance: Optimizing Core Web Vitals",
    content: `Google’s Core Web Vitals define measurable standards for user experience. Improving LCP, INP, and CLS helps both satisfaction and SEO.

Largest Contentful Paint (LCP)

LCP measures when the largest content element becomes visible. Aim under 2.5 seconds. Image optimization, CDNs, server-side rendering, and prioritizing critical resources all help.

Interaction to Next Paint (INP)

INP measures responsiveness to input. Target under 200 ms. Avoid blocking the main thread, break up long tasks, and consider Web Workers.

Cumulative Layout Shift (CLS)

CLS captures unexpected layout movement. Stay under 0.1. Reserve space for images and video, plan for dynamic content, and tune font loading.

Measurement and Monitoring

Lighthouse, PageSpeed Insights, and Chrome DevTools are core for lab metrics. Real User Monitoring (RUM) grounds decisions in production data.

Performance is ongoing work—not a one-time task. Measure often and keep improving the experience you deliver.`,
    tags: ["Performance", "SEO", "Web Development"],
    status: "published",
  },
];

const seedPosts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to database");

    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.error("Admin user not found. Run seedAdmin first.");
      await mongoose.disconnect();
      process.exit(1);
    }

    const existingCount = await Post.countDocuments({ author: admin._id });
    if (existingCount >= 14) {
      console.log(`Admin already has ${existingCount} posts. Skipping seed.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    let created = 0;
    for (const postData of posts) {
      const existing = await Post.findOne({ title: postData.title });
      if (existing) {
        console.log(`Skipping duplicate: "${postData.title}"`);
        continue;
      }

      await Post.create({ ...postData, author: admin._id });
      created++;
      console.log(`Created: "${postData.title}"`);
    }

    console.log(`\nSeed complete: ${created} posts created for ${admin.email}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed posts failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedPosts();

# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do NOT open a public issue.** Instead, contact us directly:

For security concerns, please contact: **serkanbyx1@gmail.com**

We will acknowledge your report within 48 hours and aim to release a fix within 7 days for critical vulnerabilities.

## Security Measures

This API implements the following security measures:

- **Helmet** — Secure HTTP response headers
- **CORS** — Strict origin policy
- **Rate Limiting** — Per-endpoint rate limits (auth, API, admin, likes)
- **NoSQL Injection Prevention** — express-mongo-sanitize
- **HTTP Parameter Pollution** — HPP protection
- **JWT Authentication** — Stateless token-based auth with configurable expiration
- **Password Hashing** — bcryptjs with 12 salt rounds
- **Input Validation** — express-validator on all user inputs
- **File Upload Validation** — Type, size, and format restrictions
- **Content Security Policy** — Configured via Helmet

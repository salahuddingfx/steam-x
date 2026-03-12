# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in Stream-X, **please do not open a public issue.**

Instead, send a responsible disclosure report via:

- **Email**: salahuddingfx@gmail.com
- **Subject**: `[SECURITY] Stream-X Vulnerability Report`

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact / severity
- Any suggested fix (optional)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Investigation**: Within 7 days
- **Fix / Patch**: Depends on severity — critical issues are patched within 14 days

## Security Best Practices in This Project

- All passwords are hashed with **bcryptjs** (salt rounds: 12)
- Authentication uses **JWT** with configurable expiry
- Input validation and sanitization on all API endpoints
- Environment variables are never committed (`.env` is in `.gitignore`)
- MongoDB queries use parameterized inputs to prevent injection
- Proxy route whitelist restricts streaming only to allowed hosts (archive.org)
- CORS is configured — only allowed origins can access the API

## Known Limitations

- This is a personal/educational project — not intended for production use at scale
- Third-party embeds (VidSrc) are outside our security scope

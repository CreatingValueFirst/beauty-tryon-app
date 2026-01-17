# Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

At Save My Time, we take security seriously. If you discover a security vulnerability in BeautyTryOn, please follow these steps:

### Responsible Disclosure

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report security issues via email to:
**security@savemytime.com**

### What to Include

When reporting a vulnerability, please include:

1. **Description** of the vulnerability
2. **Steps to reproduce** the issue
3. **Potential impact** of the vulnerability
4. **Suggested fix** (if you have one)
5. **Your contact information** for follow-up

### What to Expect

- **Acknowledgment**: We'll acknowledge receipt within 48 hours
- **Assessment**: We'll assess the vulnerability within 7 days
- **Updates**: We'll keep you informed of our progress
- **Resolution**: We aim to fix critical issues within 30 days
- **Credit**: With your permission, we'll credit you in the security advisory

### Security Best Practices

When using BeautyTryOn:

1. **Never share** your Supabase service role key
2. **Use environment variables** for all secrets
3. **Keep dependencies updated** regularly
4. **Enable Row Level Security** in Supabase
5. **Use HTTPS** in production
6. **Validate all user inputs** on the backend
7. **Implement rate limiting** for API endpoints

### Known Security Considerations

- Camera access requires user permission
- Image uploads are validated for size and type
- Row Level Security enforces data isolation
- Authentication tokens expire after 1 hour
- All API calls require authentication

## Security Features

BeautyTryOn implements several security features:

- ✅ Row Level Security (RLS) on all database tables
- ✅ Supabase Auth with JWT tokens
- ✅ HTTPS-only in production
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Rate limiting (configurable)
- ✅ Secure credential storage
- ✅ No client-side secrets

## Bug Bounty Program

We currently do not have a formal bug bounty program, but we greatly appreciate responsible security research. We may offer rewards on a case-by-case basis for significant vulnerabilities.

## Compliance

BeautyTryOn follows:

- OWASP Top 10 security practices
- GDPR data protection guidelines
- Industry-standard authentication protocols

## Security Updates

Security updates are released as soon as possible after a vulnerability is confirmed. We recommend:

- Watch this repository for updates
- Enable GitHub security advisories
- Subscribe to our security mailing list

## Contact

For security concerns:
- Email: security@savemytime.com
- PGP Key: [Available upon request]

For general inquiries:
- Email: support@savemytime.com
- Website: https://savemytime.com

---

**Thank you for helping keep BeautyTryOn and Save My Time users safe!** 🔒

Last updated: January 2026

# Security Policy

## Supported Versions

Currently, we maintain and provide security updates for the following versions of SmartTube AI:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Considerations

### API Keys and Credentials
- All API keys (OpenRouter, YouTube, Supabase) must be stored securely in environment variables
- Never commit API keys or sensitive credentials directly to the repository
- Use `.env` files locally and secure environment variables in production

### Data Protection
- User data and generated content are stored securely in Supabase
- All API communications are encrypted using HTTPS
- YouTube channel analysis data is processed securely and not stored permanently

## Reporting a Vulnerability

We take the security of SmartTube AI seriously. If you discover any security issues, please report them following these guidelines:

### How to Report
1. **Email**: Send details to [hello.smarttubeai@gmail.com]
2. **GitHub**: Submit a private security advisory through GitHub's Security tab
3. **Expected Response Time**: Within 48 hours

### What to Include
- Detailed description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fixes (if any)

### Process
1. **Initial Response**: Within 48 hours
2. **Assessment**: 3-5 business days
3. **Fix Implementation**: Timeline based on severity
   - Critical: 24-48 hours
   - High: 1 week
   - Medium: 2 weeks
   - Low: Next release cycle

### Disclosure Policy
- Please allow us time to address issues before public disclosure
- We will acknowledge your contribution once the fix is implemented
- Responsible disclosure will be credited in our security advisory

## Best Practices for Contributors

1. **Code Review**
   - All pull requests must pass security checks
   - No sensitive data in code or comments
   - Regular dependency updates and audits

2. **Dependencies**
   - Regular npm audit checks
   - Keep all dependencies updated
   - Use only trusted npm packages

3. **API Security**
   - Rate limiting implemented
   - Input validation on all endpoints
   - CORS policies properly configured

## Compliance

SmartTube AI adheres to:
- GDPR compliance for EU users
- CCPA compliance for California users
- Standard web security practices

## Contact

For security-related inquiries:
- Security Email: [hello.smarttubeai@gmail.com]
- Response Time: 24-48 hours
- Emergency Contact: [hello.smarttubeai@gmail.com]

## Updates

This security policy is regularly reviewed and updated. Last update: [Current Date]

---

Note: Replace placeholder email addresses and contact information with your actual contact details.

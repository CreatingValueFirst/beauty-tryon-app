# Contributing to BeautyTryOn

First off, thank you for considering contributing to BeautyTryOn! It's people like you that make BeautyTryOn such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Be respectful and inclusive
- Be collaborative
- Be professional
- Focus on what is best for the community

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Include your environment details** (OS, browser, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some examples of how it would be used**

### Pull Requests

- Fill in the required template
- Follow the TypeScript/JavaScript styleguide
- Include screenshots and animated GIFs in your pull request whenever possible
- End all files with a newline
- Avoid platform-dependent code

## Development Process

### Setup Development Environment

1. Fork the repo
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/beauty-tryon-app.git
   cd beauty-tryon-app
   ```

3. Install dependencies:
   ```bash
   npm install pnpm@8.15.1
   pnpm install
   ```

4. Create a branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```

### Development Workflow

1. Make your changes
2. Test your changes:
   ```bash
   pnpm test
   pnpm lint
   ```

3. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

4. Push to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```

5. Open a Pull Request

### Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add hair color picker component
fix: resolve MediaPipe initialization issue
docs: update installation instructions
```

## Styleguides

### TypeScript Styleguide

- Use TypeScript for all new code
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Prefer `const` over `let`
- Use async/await over promises when possible

### React/Next.js Styleguide

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Follow the project's folder structure
- Use shadcn/ui components when available

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

## Project Structure

```
beauty-tryon-app/
├── apps/
│   ├── web/          # Next.js web app
│   └── mobile/       # Flutter mobile app
├── packages/
│   └── shared/       # Shared types
├── supabase/         # Backend
└── n8n/              # Workflows
```

### Adding New Features

When adding a new feature:

1. **Plan**: Discuss the feature in an issue first
2. **Design**: Consider the UI/UX impact
3. **Implement**: Write clean, tested code
4. **Document**: Update relevant documentation
5. **Test**: Ensure all tests pass

### Working with AI/ML Components

When working with MediaPipe or AI features:

- Test on multiple devices
- Consider performance implications
- Document model requirements
- Add fallback behaviors

### Database Changes

For Supabase schema changes:

1. Create a new migration file in `supabase/migrations/`
2. Test the migration locally
3. Document the changes
4. Include rollback instructions

## Testing

```bash
# Run all tests
pnpm test

# Run specific test suite
pnpm test:unit
pnpm test:e2e

# Run with coverage
pnpm test:coverage
```

## Need Help?

- 📧 Email: support@savemytime.com
- 💬 Discord: [Join our community](#)
- 📖 Docs: [Documentation](./docs/)

## Recognition

Contributors who make significant contributions will be:

- Listed in our README
- Mentioned in release notes
- Invited to our contributors channel

Thank you for contributing to BeautyTryOn! 🎉

---

**Built with ❤️ by Save My Time**

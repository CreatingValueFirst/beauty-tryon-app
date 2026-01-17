# Changelog

All notable changes to BeautyTryOn will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-17

### 🎉 Initial Release

This is the first public release of BeautyTryOn by Save My Time!

### ✨ Features

#### Web Application
- **Real-time AR Try-On**
  - Hair color and style visualization using MediaPipe
  - Nail polish try-on with hand tracking
  - 60fps rendering performance
  - Luminance-preserving hair color algorithm

- **User Interface**
  - Modern landing page with gradient branding
  - Responsive dashboard with navigation
  - Authentication (login/signup) with Supabase
  - Profile management with subscription tiers
  - Gallery with grid/list views
  - Social sharing dialog (Twitter, Instagram, Pinterest, Facebook)

- **Style Library**
  - 10 hair styles (500+ coming soon)
  - 10 nail designs (300+ coming soon)
  - Color picker with HSL adjustments
  - Pattern selection (solid, french, glitter, ombré)

#### Mobile Application (Flutter)
- Project structure initialized
- Splash screen and onboarding flow
- Authentication screens
- Navigation framework
- Theme system matching web app

#### Backend & Services
- **Supabase Integration**
  - Complete database schema with Row Level Security
  - Authentication and authorization
  - File storage with CDN
  - Real-time subscriptions

- **Edge Functions** (3 serverless functions)
  - `analyze-face`: AI-powered style recommendations
  - `generate-hair-style`: Custom AI style generation (Premium)
  - `process-image`: Server-side image processing

- **n8n Automation** (4 production workflows)
  - Social media automation (multi-platform posting)
  - Analytics sync (PostHog integration, every 15 minutes)
  - Image processing pipeline (4 variants: HD, social, thumbnail, preview)
  - User onboarding (welcome → 2-day check → 7-day upgrade offer)

#### Developer Experience
- TypeScript throughout
- pnpm workspaces monorepo
- Shared types package
- Comprehensive documentation
- GitHub Actions CI/CD
- ESLint and Prettier configured

### 🎨 Design
- Brand colors: Purple (#8B5CF6) to Pink (#EC4899) gradient
- Inter font family
- shadcn/ui component library
- Mobile-responsive design

### 📦 Technical Stack
- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Mobile**: Flutter 3.0+, Dart
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI/ML**: MediaPipe Tasks Vision
- **Automation**: n8n workflows
- **Deployment**: Vercel (web), App Stores (mobile)

### 🔒 Security
- Row Level Security on all database tables
- Secure authentication with Supabase Auth
- Environment variable management
- Input validation and sanitization
- HTTPS-only in production

### 📚 Documentation
- Comprehensive README
- API documentation
- Component documentation
- Deployment guides
- Contributing guidelines

### 🙏 Credits
Built with ❤️ by **Save My Time**

Special thanks to:
- MediaPipe by Google
- Supabase team
- n8n community
- Open source contributors

---

## [Unreleased]

### Planned Features
- [ ] AI custom style generation (Stable Diffusion integration)
- [ ] Video recording of try-ons
- [ ] AR filters and effects
- [ ] Social features (follow users, like looks)
- [ ] Style marketplace
- [ ] Virtual makeup try-on
- [ ] Hair length adjustment
- [ ] 3D hair rendering
- [ ] Mobile app AR with ARCore/ARKit
- [ ] Offline mode for mobile
- [ ] Push notifications
- [ ] In-app purchases

### Known Issues
- Camera permission prompt may appear multiple times on first use
- MediaPipe models require ~5MB download on first load
- Some hair styles may not look realistic on certain hair types (working on improvements)

---

## Version History

### Version Numbering
- **Major.Minor.Patch** (e.g., 1.0.0)
- Major: Breaking changes
- Minor: New features, backwards compatible
- Patch: Bug fixes, minor improvements

### Release Schedule
- Major releases: Quarterly
- Minor releases: Monthly
- Patch releases: As needed

---

For more details, see the [full documentation](./README.md).

**Made with 💜 by Save My Time Team**

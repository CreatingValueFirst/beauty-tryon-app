# Beauty Try-On App

## What This Is

A comprehensive beauty virtual try-on platform enabling users to virtually try on makeup, hair colors/styles, nail polish, and clothing using AI-powered technology. Built with Next.js 14, Supabase, and various AI models (Replicate, MediaPipe, TensorFlow.js).

## Core Value

Users can see how beauty products and clothing look on them before purchasing, reducing returns and increasing confidence in purchasing decisions.

## Requirements

### Validated

- ✓ User authentication via Supabase Auth — existing
- ✓ AR camera component with webcam access — existing
- ✓ Hair color overlay using ML segmentation — existing (partial)
- ✓ Nail polish overlay using hand tracking — existing (partial)
- ✓ Virtual clothing try-on via Replicate API — existing (partial)
- ✓ AI nail design generation via FLUX models — existing (partial)
- ✓ Gallery page to view saved try-ons — existing (partial)
- ✓ User profile with statistics — existing

### Active

- [ ] **FIX-SAVE-01**: All try-on results actually save to user's gallery
- [ ] **FIX-CAMERA-01**: Camera/canvas connections work for photo capture
- [ ] **FIX-MAKEUP-01**: Makeup try-on camera integration works
- [ ] **FIX-FILTER-01**: Nail collection filtering actually filters
- [ ] **FIX-NOTIFY-01**: Users notified when async operations complete
- [ ] **FIX-SEC-01**: Webhook signature verification implemented
- [ ] **FIX-SEC-02**: All API endpoints properly authenticated
- [ ] **FIX-PERF-01**: Polling uses exponential backoff
- [ ] **FIX-PERF-02**: Gallery has pagination
- [ ] **FIX-AI-01**: fal.ai KOLORS model integration completed
- [ ] **FIX-AI-02**: Garment preprocessing implemented

### Out of Scope

- Mobile native app — web-first approach for now
- Real-time video chat — not core to try-on functionality
- E-commerce integration — focus on try-on, not purchasing
- Social features (following, commenting) — complexity vs value

## Context

### Current State Analysis

The app has a polished UI but many features are partially implemented or broken:

**Makeup Page:**
- Save function is a stub (shows toast, doesn't save)
- Camera integration shows "coming soon"
- API lacks authentication

**Hair Page:**
- Canvas ref not connected to ARCamera
- Photo capture always fails
- ML fallbacks fail silently

**Nails Page:**
- Collection filtering is stubbed
- Canvas ref broken (same as hair)
- No user feedback when hands not detected

**Virtual Clothing:**
- fal.ai integration throws error (not implemented)
- Garment preprocessing is stub
- Webhook has race condition (double update)
- No notifications when complete

**Gallery:**
- No pagination (slow with many items)
- Cross-origin download failures
- Dead mock data code

**AI Nail Generator:**
- Save shows toast but doesn't persist
- Polling interval memory leak potential

**Security Issues:**
- No webhook signature verification
- Makeup API unauthenticated
- Error messages expose internal URLs

### Technical Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API routes, Supabase (Auth, Database, Storage)
- **AI/ML:** Replicate API, TensorFlow.js BodyPix, MediaPipe
- **External:** Makeup API service (localhost:8000)

## Constraints

- **Tech Stack**: Must use existing Next.js + Supabase architecture
- **AI Models**: Replicate for virtual try-on, local ML for real-time effects
- **Performance**: Real-time AR must maintain 30fps on mobile devices
- **Security**: All user data must be protected, webhooks verified

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use BodyPix over MediaPipe for hair | Better hair segmentation accuracy | — Pending |
| Replicate for async, local ML for real-time | Balance quality vs latency | ✓ Good |
| Supabase for auth + storage | Integrated solution, good DX | ✓ Good |
| Polling over WebSockets for status | Simpler implementation | ⚠️ Revisit (add backoff) |

---
*Last updated: 2026-01-28 after deep analysis*

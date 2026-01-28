# Requirements: Beauty Try-On App Fix

**Defined:** 2026-01-28
**Core Value:** All try-on features work end-to-end with proper save, security, and user feedback

## v1 Requirements

### Gallery Save Integration

- [x] **SAVE-01**: Makeup try-on results save to user's gallery in Supabase ✓
- [x] **SAVE-02**: Hair try-on photo captures save to gallery ✓
- [x] **SAVE-03**: Nail try-on photo captures save to gallery ✓
- [x] **SAVE-04**: AI-generated nail designs save to gallery ✓
- [ ] **SAVE-05**: Virtual clothing try-on results appear in gallery

### Camera & Canvas Fixes

- [x] **CAM-01**: Hair page canvas ref connected to ARCamera for photo capture ✓
- [x] **CAM-02**: Nail page canvas ref connected to ARCamera for photo capture ✓
- [ ] **CAM-03**: Makeup page camera integration works with real-time overlay
- [x] **CAM-04**: Photo capture shows success feedback and preview ✓

### Feature Completion

- [x] **FEAT-01**: Nail collection filtering actually filters displayed colors ✓
- [ ] **FEAT-02**: fal.ai KOLORS virtual try-on model integrated
- [ ] **FEAT-03**: Garment image preprocessing (background removal) implemented
- [ ] **FEAT-04**: Garment category auto-detection implemented

### User Experience

- [ ] **UX-01**: Users notified when async try-on completes (Supabase Realtime)
- [x] **UX-02**: "No hands detected" feedback shown on nail page ✓
- [x] **UX-03**: "No face detected" feedback shown on hair/makeup pages ✓
- [ ] **UX-04**: Loading states shown during ML model initialization
- [ ] **UX-05**: Retry button when AI generation fails

### Security

- [x] **SEC-01**: Webhook signature verification for Replicate webhooks ✓
- [x] **SEC-02**: Makeup API endpoint requires authentication ✓
- [x] **SEC-03**: Error messages don't expose internal URLs/config ✓
- [ ] **SEC-04**: File upload validates actual content (magic numbers)

### Performance

- [x] **PERF-01**: Polling uses exponential backoff (2s -> 5s -> 10s -> 20s) ✓
- [x] **PERF-02**: Gallery implements cursor-based pagination ✓
- [ ] **PERF-03**: Cache uses SHA-256 instead of collision-prone hash
- [x] **PERF-04**: Polling intervals properly cleaned up on unmount ✓

### Bug Fixes

- [x] **BUG-01**: Virtual try-on webhook double-update race condition fixed ✓
- [x] **BUG-02**: Gallery download works for cross-origin images ✓
- [x] **BUG-03**: Dead mock data removed from gallery page ✓

## v2 Requirements

### Notifications

- **NOTF-01**: Push notifications when try-on completes
- **NOTF-02**: Email digest of generated looks
- **NOTF-03**: In-app notification center

### Analytics

- **ANAL-01**: Track feature usage (which try-on types used most)
- **ANAL-02**: Track conversion (try-on to save rate)
- **ANAL-03**: Track user engagement (session duration, return rate)

### Advanced Features

- **ADV-01**: Compare before/after side-by-side
- **ADV-02**: Share try-on results to social media
- **ADV-03**: AR try-on with multiple products at once

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile native app | Web-first, mobile web works well enough |
| Real-time video chat | Not core to try-on functionality |
| E-commerce checkout | Focus on try-on experience first |
| User-to-user social features | Adds complexity without clear value |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SAVE-01 | Phase 1 | ✓ Complete |
| SAVE-02 | Phase 1 | ✓ Complete |
| SAVE-03 | Phase 1 | ✓ Complete |
| SAVE-04 | Phase 1 | ✓ Complete |
| SAVE-05 | Phase 1 | Pending |
| CAM-01 | Phase 2 | ✓ Complete |
| CAM-02 | Phase 2 | ✓ Complete |
| CAM-03 | Phase 2 | Pending |
| CAM-04 | Phase 2 | ✓ Complete |
| SEC-01 | Phase 3 | ✓ Complete |
| SEC-02 | Phase 3 | ✓ Complete |
| SEC-03 | Phase 3 | ✓ Complete |
| SEC-04 | Phase 3 | Pending |
| FEAT-01 | Phase 4 | ✓ Complete |
| UX-01 | Phase 4 | Pending |
| UX-02 | Phase 4 | ✓ Complete |
| UX-03 | Phase 4 | ✓ Complete |
| PERF-01 | Phase 5 | ✓ Complete |
| PERF-02 | Phase 5 | ✓ Complete |
| PERF-03 | Phase 5 | Pending |
| PERF-04 | Phase 5 | ✓ Complete |
| BUG-01 | Phase 5 | ✓ Complete |
| BUG-02 | Phase 5 | ✓ Complete |
| BUG-03 | Phase 5 | ✓ Complete |
| FEAT-02 | Phase 6 | Pending |
| FEAT-03 | Phase 6 | Pending |
| FEAT-04 | Phase 6 | Pending |
| UX-04 | Phase 6 | Pending |
| UX-05 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 27 total
- Completed: 19 ✓
- Remaining: 8

---
*Requirements defined: 2026-01-28*
*Last updated: 2026-01-28 after implementing fixes*

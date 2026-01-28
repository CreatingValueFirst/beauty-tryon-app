# Codebase Concerns

**Analysis Date:** 2026-01-28

## Tech Debt

**Missing Push Notifications:**
- Issue: Virtual try-on completion webhook does not notify users of results
- Files: `apps/web/app/api/webhooks/virtual-tryon/route.ts` (line 71)
- Impact: Users don't get real-time feedback when their virtual try-ons complete, requiring manual page refresh to see results
- Fix approach: Implement push notification via Supabase Realtime or a dedicated notification service (Firebase Cloud Messaging, OneSignal)

**Unimplemented AI Features:**
- Issue: Three core AI features are stubbed out and not functional
  - `fal.ai` provider support for KOLORS virtual try-on model
  - Garment image preprocessing (background removal, enhancement)
  - Automatic garment category detection from images
- Files:
  - `apps/web/lib/ai/virtual-tryon-client.ts` (lines 81, 189, 203)
  - `apps/web/lib/ai/replicate-client.ts` (similar stubs likely present)
- Impact: Users cannot use fal.ai models; garment preprocessing must be done manually; category auto-detection requires manual input
- Fix approach: Implement fal.ai client integration; add image preprocessing service (RemoveBG API, ImageMagick); integrate category detection model (Vision API or CLIP)

**Missing Gallery Save Integration:**
- Issue: Generated nail designs are not saved to user's gallery despite UI indicating save capability
- Files: `apps/web/app/[locale]/dashboard/makeup/MakeupDashboard.tsx` (line 15)
- Impact: Users lose generated designs on page navigation; cannot build personal gallery of creations
- Fix approach: Implement database save logic in makeup dashboard component and webhook handler

**Incomplete User Statistics Tracking:**
- Issue: Share count is not tracked despite being displayed in profile
- Files: `apps/web/app/[locale]/dashboard/profile/page.tsx` (line 93)
- Impact: Share metrics are always zero; cannot analyze user engagement or content popularity
- Fix approach: Implement share event tracking in ShareDialog component and webhook logging

**Incomplete Nail Design Filtering:**
- Issue: Nail design collection filtering is stubbed but not implemented
- Files: `apps/web/app/[locale]/dashboard/nails/page.tsx` (line 265)
- Impact: Users cannot filter designs by collection, making large galleries difficult to navigate
- Fix approach: Add filter UI controls and database query parameters

**Unimplemented Booking Modal:**
- Issue: Store pages reference booking modals that are not implemented
- Files: `apps/web/app/[locale]/stores/[slug]/page.tsx` (lines 145, 203)
- Impact: Users cannot book services through the app; feature is half-implemented
- Fix approach: Implement booking modal component, calendar integration, and backend booking API

**Missing Makeup API Setup:**
- Issue: Makeup API is exposed via proxy but no auth check, and service availability is uncertain at startup
- Files: `apps/web/app/api/makeup/route.ts` (entire file)
- Impact: Makeup endpoint is unauthenticated; service must be running locally or deployment fails silently
- Fix approach: Add authentication check, environment variable validation, and startup health check

## Known Bugs

**Webhook Double-Update Race Condition:**
- Symptoms: Virtual try-on result image may be updated twice with duplicate Realtime events
- Files: `apps/web/app/api/webhooks/virtual-tryon/route.ts` (lines 83-95)
- Trigger: Webhook fires before processing is fully complete, update occurs twice
- Workaround: Add idempotency key to webhook processing; check if already updated before sending second update

**Polling Interval Not Cleared on Component Unmount:**
- Symptoms: Multiple polling intervals may accumulate if user navigates away during generation
- Files: `apps/web/components/features/virtual-tryon/VirtualTryOnStudio.tsx` (line 151), `apps/web/components/features/ai-generation/NailsGenerator.tsx` (line 94)
- Trigger: Component unmounts before prediction completes, interval continues running in background
- Workaround: Current code has cleanup (line 177), but verify it fires on all unmount scenarios

**Numeric Hash Collision in Cache:**
- Symptoms: Different prompts with same hash will return wrong cached images
- Files: `apps/web/lib/ai/utils/cache.ts` (lines 28-35)
- Trigger: Simple numeric hash algorithm has low collision resistance for short prompts
- Workaround: Use crypto hash instead; current implementation may work for typical usage but is fragile

## Security Considerations

**Missing Webhook Signature Verification:**
- Risk: Malicious actors can send fake webhooks to update database with arbitrary data
- Files: `apps/web/app/api/webhooks/replicate/route.ts` (lines 27-31), `apps/web/app/api/webhooks/virtual-tryon/route.ts`
- Current mitigation: None (signature verification is commented out)
- Recommendations: Implement HMAC verification for Replicate webhooks; validate webhook source by IP whitelist or signed payload

**Unauthenticated Makeup API Endpoint:**
- Risk: Any user can call makeup processing endpoint without credentials; no rate limiting
- Files: `apps/web/app/api/makeup/route.ts` (lines 13, 78)
- Current mitigation: None visible
- Recommendations: Add `getUser()` authentication check; implement rate limiting per user; add request validation

**File Extension Trust Without Validation:**
- Risk: User can upload files with image extension but binary content (executable, script)
- Files: `apps/web/app/api/upload/image/route.ts` (line 57-58)
- Current mitigation: Only checks MIME type at upload time, not actual file content
- Recommendations: Add magic number validation; run malware scan on uploads; use dedicated image processing library that strips metadata

**Client-Side Image Data URI Upload:**
- Risk: Base64 encoded images in memory can cause DoS; no validation of actual dimensions
- Files: `apps/web/components/features/virtual-tryon/VirtualTryOnStudio.tsx` (line 233), `apps/web/components/features/ai-generation/NailsGenerator.tsx`
- Current mitigation: 10MB size limit but no dimension limit
- Recommendations: Validate image dimensions before upload; reject images > 4096x4096; limit simultaneous uploads

**Environment Variable Exposure:**
- Risk: Error responses expose internal service URLs and configurations
- Files: `apps/web/app/api/makeup/route.ts` (lines 50, 68)
- Current mitigation: None
- Recommendations: Log details server-side only; return generic error messages to client; use error tracking service for diagnostics

## Performance Bottlenecks

**Inefficient Cache Key Generation:**
- Problem: Numeric hash algorithm is slow and prone to collisions
- Files: `apps/web/lib/ai/utils/cache.ts` (lines 16-35)
- Cause: Manual character-by-character hashing instead of built-in crypto functions
- Improvement path: Replace with `crypto.subtle.digest('SHA-256', ...)` or `crypto.createHash()` for O(n) vs O(n²) performance

**Polling Every 3 Seconds Without Exponential Backoff:**
- Problem: High request rate to status endpoint even when job is still running
- Files: `apps/web/components/features/virtual-tryon/VirtualTryOnStudio.tsx` (line 175), `apps/web/components/features/ai-generation/NailsGenerator.tsx` (line 129)
- Cause: Fixed 3-second interval regardless of remaining time
- Improvement path: Implement exponential backoff; start at 2s, increase to 5s, 10s, etc; or use Server-Sent Events instead of polling

**Gallery Page Uses Mock Data:**
- Problem: Gallery component uses static mock data instead of real database queries
- Files: `apps/web/app/[locale]/dashboard/gallery/page.tsx` (lines 16-113)
- Cause: Incomplete implementation
- Improvement path: Load real gallery items from database; implement pagination and filtering; add proper loading states

**Unoptimized Image Cache Queries:**
- Problem: `.getStats()` runs 2 separate queries when 1 aggregated query would suffice
- Files: `apps/web/lib/ai/utils/cache.ts` (lines 178-186)
- Cause: Over-reliance on individual database calls instead of view/aggregation
- Improvement path: Create database view for cache stats; use `count` on single query with metadata

**No Request Deduplication:**
- Problem: Multiple identical virtual try-on requests within milliseconds are not deduplicated
- Files: `apps/web/app/api/virtual-tryon/generate/route.ts`
- Cause: No request tracking or cache at endpoint level
- Improvement path: Implement request deduplication using prediction_id + user_id; track in-flight requests with timeout

## Fragile Areas

**Virtual Try-On Result Extraction:**
- Files: `apps/web/app/api/webhooks/replicate/route.ts` (line 70), `apps/web/app/api/webhooks/virtual-tryon/route.ts` (line 64)
- Why fragile: Code assumes `output` is always an array or string; no type validation before accessing `output[0]`
- Safe modification: Validate output type; add schema validation with zod or similar
- Test coverage: No unit tests for webhook handlers visible; missing edge case coverage for null/undefined/malformed output

**Camera Permission Handling:**
- Files: `apps/web/components/ar/ARCamera.tsx` (lines 160-175)
- Why fragile: Error messages hardcoded for specific DOMException types; browser implementations vary
- Safe modification: Use try-catch for each media device method; test on multiple browsers before deploying
- Test coverage: No visible tests for camera permission flows; e2e tests needed

**Database Connection in Webhooks:**
- Files: `apps/web/app/api/webhooks/replicate/route.ts` (line 14)
- Why fragile: Service role client created at module level; will fail if env vars missing at build time
- Safe modification: Move client creation into handler (already done in virtual-tryon webhook); validate env vars at startup
- Test coverage: No integration tests for webhook database writes

**Image Base64 to Blob Conversion:**
- Files: `apps/web/components/features/virtual-tryon/VirtualTryOnStudio.tsx` (line 233)
- Why fragile: Uses `fetch(dataUri)` which is non-standard and fails in some environments
- Safe modification: Use `fetch(dataUri).then(r => r.blob())` or direct `atob()` + `Uint8Array` conversion
- Test coverage: No visible tests for image upload pipeline

**Prediction Status Polling:**
- Files: `apps/web/components/features/virtual-tryon/VirtualTryOnStudio.tsx` (lines 148-178)
- Why fragile: Multiple states (generating, polling, completed) rely on exact order; race conditions if user clicks generate twice
- Safe modification: Use state machine library or explicit state enum; prevent double-click with disabled buttons
- Test coverage: No tests for rapid user interaction; timing-sensitive code paths untested

## Scaling Limits

**Cache TTL Hard-Coded to 7 Days:**
- Current capacity: Unlimited growth (no max size enforced)
- Limit: Cache table grows indefinitely without bounded cleanup
- Scaling path: Implement configurable TTL; add cache eviction policy (LRU); monitor table size and add alerts at 80% of quota

**No Connection Pooling Visible:**
- Current capacity: Each request may create new Supabase client
- Limit: Supabase connection limit will be exceeded under high concurrent load
- Scaling path: Use connection pooling via Supabase connection manager; implement request batching for bulk operations

**Single Replicate Model Used for All Try-Ons:**
- Current capacity: IDM_VTON model may have rate limits
- Limit: Unknown Replicate API rate limit (likely 10-50 requests/min for free tier)
- Scaling path: Implement request queuing; upgrade Replicate plan; load balance across multiple model versions

**No Rate Limiting Per User:**
- Current capacity: Users can spam generation requests until quota exhausted
- Limit: No per-minute rate limit (only per-day quota)
- Scaling path: Add rate limiter middleware (Redis-based); implement exponential backoff for user requests

**Gallery Pagination Not Implemented:**
- Current capacity: Cannot display more than ~20 gallery items without performance degradation
- Limit: Entire gallery loaded into memory on page load
- Scaling path: Implement pagination; use cursor-based pagination for better performance; add virtual scrolling for large lists

## Dependencies at Risk

**Replicate API Dependency:**
- Risk: Model URLs are hardcoded; if Replicate updates version hashes, generation breaks silently
- Impact: Virtual try-on feature completely unavailable until code updated
- Migration plan: Implement version management system; use model aliases instead of hashes; add fallback models; monitor Replicate API announcements

**Unimplemented fal.ai Integration:**
- Risk: KOLORS_VTON model cannot be used; marked as not yet implemented
- Impact: Users cannot access latest high-quality model; feature incomplete
- Migration plan: Complete fal.ai client implementation; add feature flag to toggle between Replicate and fal.ai

**Supabase RPC Functions:**
- Risk: Custom RPC functions like `check_and_increment_quota` and `increment_clothing_tryon_count` are not visible in codebase
- Impact: If RPC logic changes or function fails, entire quota system breaks
- Migration plan: Document all RPC functions; add tests for quota logic; consider moving to stored procedures with versioning

## Missing Critical Features

**Notification System:**
- Problem: No real-time notifications when generations complete
- Blocks: Users cannot get push notifications, in-app alerts, or email notifications
- Affects: User experience is degraded; users must manually refresh to see results

**User Notification Preferences:**
- Problem: Profile page loads notification settings but they're not used anywhere
- Blocks: Cannot control notification frequency, channels, or types
- Affects: Over-notification or under-notification depending on user preference

**Analytics and Telemetry:**
- Problem: No tracking of user actions, feature usage, or conversion metrics
- Blocks: Cannot measure feature adoption, identify bottlenecks, or make data-driven decisions
- Affects: Product decisions are made blind; cannot optimize onboarding or feature discovery

**Error Recovery and Retry Logic:**
- Problem: Failed generations show error but have no automatic retry or manual retry UI
- Blocks: Users must start generation from scratch if API error occurs
- Affects: Frustration with failed operations; lost user engagement

## Test Coverage Gaps

**Webhook Handlers Not Tested:**
- What's not tested: Replicate and virtual-tryon webhook processing; state transitions; error handling
- Files: `apps/web/app/api/webhooks/replicate/route.ts`, `apps/web/app/api/webhooks/virtual-tryon/route.ts`
- Risk: Bugs in webhook handlers go undetected until production failure; silent data corruption possible
- Priority: High - webhook handlers are critical path for async operations

**API Endpoint Authentication Not Tested:**
- What's not tested: Auth checks on protected endpoints; unauthorized request handling
- Files: `apps/web/app/api/virtual-tryon/generate/route.ts`, `apps/web/app/api/ai/generate-nails/route.ts`
- Risk: Auth bypass vulnerabilities may exist; attackers could impersonate users
- Priority: High - security-critical functionality

**User Permission and Quota System Not Tested:**
- What's not tested: Quota increment/decrement; rate limiting; permission checks
- Files: `apps/web/app/api/**/route.ts` (all endpoints using `check_and_increment_quota`)
- Risk: Quota system may be bypassable; users could exhaust system resources
- Priority: High - prevents abuse and ensures fair resource allocation

**Component State Management Not Tested:**
- What's not tested: Polling state machine in VirtualTryOnStudio, NailsGenerator; race conditions; memory leaks
- Files: `apps/web/components/features/virtual-tryon/VirtualTryOnStudio.tsx`, `apps/web/components/features/ai-generation/NailsGenerator.tsx`
- Risk: Undetected race conditions; polling intervals leak on unmount; duplicate state updates
- Priority: Medium - affects user experience and reliability

**Image Upload and Processing Not Tested:**
- What's not tested: File validation; MIME type spoofing; size limits; upload error handling
- Files: `apps/web/app/api/upload/image/route.ts`, `apps/web/components/features/virtual-tryon/VirtualTryOnStudio.tsx`
- Risk: Malicious uploads, DoS attacks, security bypass
- Priority: High - security and stability critical

**Cache Implementation Not Tested:**
- What's not tested: Cache key collisions; TTL expiration; concurrent access; stats accuracy
- Files: `apps/web/lib/ai/utils/cache.ts`
- Risk: Cache corruption causing wrong images served; memory leaks; poor hit rate decisions
- Priority: Medium - affects performance and correctness

---

*Concerns audit: 2026-01-28*

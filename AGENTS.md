# Project rules

- AI features run in backend functions under `supabase/functions/ai-*` using the shared helper in `supabase/functions/_shared/responses.ts` (Lovable AI Gateway, Responses API); keeps the key and prompts server-side.
- The concierge chat's booking tool inserts through the public (anon) client so the same row rules and unique-slot index protect chat and form bookings alike.
- Admin-only AI actions verify the caller's session and `has_role(admin)` inside the function, because functions run without automatic token checks.
- Concierge chat history is stored only in the visitor's browser (localStorage), one conversation per browser.
- `src/components/ai-elements/` holds installed AI Elements chat primitives; customize around them instead of rewriting.
- Public AI functions (`ai-chat`, `ai-style`) call `checkDemoQuota` in `_shared/responses.ts` before any model call; it uses the service-role-only `consume_ai_quota` RPC (hashed IP, atomic lock) because the backend has no built-in rate limiter.

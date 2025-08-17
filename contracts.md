# API Contracts for KOG Landing

Scope: Replace frontend mock content with backend-provided content and expose a simple admin update route. No external integrations. Uses existing Mongo via MONGO_URL. All routes prefixed with /api.

Base URL (frontend): process.env.REACT_APP_BACKEND_URL
All requests: `${REACT_APP_BACKEND_URL}/api/...`

1) GET /api/content
- Purpose: Serve all public landing content and config
- Response (200):
{
  "hero": { "title": string, "ticker": string, "subtitle": string,
    "ctas": { "dexUrl": string, "telegram": string, "twitter": string }
  },
  "tokenomics": [ { "label": string, "value": number, "note": string } ],
  "howToBuy": [ { "step": number, "title": string, "detail": string } ],
  "roadmap": [ { "title": string, "points": string[] } ],
  "faqs": [ { "q": string, "a": string } ],
  "config": { "contractAddress": string }
}
- Default seeding: If empty, backend seeds defaults matching initial mock.

2) PUT /api/content (admin use later)
- Purpose: Replace all content in one go (no auth yet)
- Body: Same shape as GET response
- Response (200): Same as body

3) Existing (demo) endpoints
- GET /api/ -> { message: "Hello World" }
- POST /api/status -> create status check (for health testing)
- GET /api/status -> list status checks

Frontend Integration
- Hook: src/hooks/useContent.js fetches GET /api/content
- Landing.jsx reads content, displays; CTAs:
  - If url startsWith("http"), open in new tab
  - Else show toast "coming soon"
- Copy Contract button copies config.contractAddress if present; else toast TBA

Data that was mocked earlier
- hero, tokenomics, howToBuy, roadmap, faqs (now served by backend)

Rollout Steps
1) Merge backend changes (hot reload). 2) Frontend fetches content. 3) Later, provide real DEX/social URLs and contract via PUT /api/content.
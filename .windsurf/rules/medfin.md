---
trigger: always_on
---

# MedFin AI — Windsurf Rules

## CRITICAL: Files You Must NEVER Modify

### backend/main.py
- DO NOT rewrite, simplify, or "clean up" this file. EVER.
- DO NOT remove any router imports or `include_router` calls.
- DO NOT remove middleware, logging, security headers, or lifespan management.
- The AI router MUST always be present:
  ```python
  from app.routers.ai import router as ai_router
  app.include_router(ai_router, prefix="/api/v1/ai")
  ```
- CORS middleware MUST be the LAST `add_middleware` call (outermost middleware).
- If your task doesn't explicitly involve main.py, don't touch it.

### backend/app/security.py
- `nh3.clean()` only accepts: `tags`, `attributes`, `url_schemes`, `clean_content_tags`, `link_rel`
- It does NOT accept: `strip`, `protocols`, `strip_comments` (those are bleach parameters)
- Do not revert to bleach. The project uses nh3.

## Backend Rules

### FastAPI / slowapi
- Every endpoint with `@limiter.limit(...)` MUST have `request: Request` as a parameter (from `starlette.requests.Request`).
- The `Request` parameter MUST be named exactly `request` — not `http_request`, not `req`.
- Pydantic body models in rate-limited endpoints MUST be named `body`, NOT `request`.
- Example:
  ```python
  @router.post("/ask-question")
  @limiter.limit("30/minute")
  async def ask_policy_question(request: Request, body: QuestionRequest):
  ```

### Router Prefixes
- Router files (`app/routers/*.py`) must NOT define a prefix in `APIRouter()`.
- Prefixes are set in `main.py` via `include_router(router, prefix="...")`.
- Having prefix in both places causes doubled routes like `/api/v1/ai/ai/upload-policy`.

### LLM Architecture
- **Primary LLM**: Groq (Llama 3.3 70B) — used for all text analysis, Q&A, appeal letters, bill validation analysis, pre-visit checklists, optimization.
- **Image OCR**: Google Gemini — used ONLY for extracting text from images (bills, denial letters). Do not use Gemini for text generation.
- **Web Search**: Tavily — used for real-time web-grounded answers when `_needs_web_search()` returns True.
- The old `google-generativeai` SDK does NOT support `tools="google_search"` or `tools="google_search_retrieval"`. Only `"code_execution"` works as a string tool in the old SDK.
- Do not attempt to add Google Search grounding with the old SDK. Use Tavily instead.

### JSON Parsing
- Groq (Llama) sometimes returns JSON with single quotes, trailing commas, or comments.
- Always use the `_parse_json_response()` helper method, never raw `json.loads()` on LLM output.
- The fallback chain is: `json.loads` → regex fixes → `ast.literal_eval` → quote replacement.

### Environment Variables (on Render)
- `GROQ_API_KEY` — Groq LLM
- `GOOGLE_API_KEY` or `GEMINI_API_KEY` — Gemini image OCR
- `TAVILY_API_KEY` — Tavily web search
- `ALLOWED_ORIGINS` is NOT set as an env var. Origins are defined in `app/core/config.py`.

## Frontend Rules

### Navigation Architecture
- **Desktop**: Sidebar (`Sidebar.tsx`) is the primary navigation. Always visible at `md` breakpoint and above.
- **Mobile**: Bottom nav (`BottomNav.tsx`) is the primary navigation. No hamburger menu, no sidebar overlay.
- The "More" button in bottom nav opens a bottom sheet with overflow items (Pre-Visit, Optimize, Settings, Account).
- Sidebar and BottomNav both call `onNavigate(itemId)` on the parent `page.tsx`.
- `page.tsx` passes `activeNav` to `AIWorkspace` as `activeSection`.

### Navigation IDs (must match everywhere)
- `'policy'` → Policy upload / dashboard
- `'ask-ai'` → EstimationTool (Q&A chat)
- `'bills'` → ValidationTool (bill upload)
- `'appeal'` → AppealTool (appeal letters)
- `'pre-visit'` → PreVisitTool (checklists)
- `'optimize'` → OptimizationTool (recommendations)
- `'family'` → FamilyDashboard

### Preview Mode
- Sidebar items are ALWAYS clickable, even without a policy uploaded.
- When `policyData` is null and user clicks a tool, show `ToolPreview` component (description + CTA to upload policy).
- When `policyData` exists, show the actual tool.
- `policyData` is typed as `PolicyData | null` — always use optional chaining (`policyData?.field`) or null guards.

### Appeal Letter
- The AI must NOT embed jargon tooltip spans in the letter text.
- The frontend `formatAppealLetter()` function handles paragraph splitting, bold rendering, and section detection.
- PDFs are generated client-side using `html2pdf.js` with dynamic import for Next.js SSR compatibility.
- Use inline `style` attributes (not Tailwind classes) on the letter container for PDF rendering.

### UI Design
- Superlist-inspired: clean, minimal, lots of whitespace.
- No emojis in the UI. Use Lucide icons only.
- No saturated gradient cards. No "dashboard" layouts with 4 equal stat cards.
- No duplicate navigation (sidebar + horizontal tabs showing the same items).
- Accent color: emerald/teal. Neutral palette otherwise.

## Deployment

### Frontend: Vercel
- Framework: Next.js 14, TypeScript, Tailwind CSS
- URL: medfin-phi.vercel.app

### Backend: Render
- Framework: FastAPI, Python 3.13
- URL: medfin.onrender.com
- Entry: `uvicorn app_entry:app --host 0.0.0.0 --port $PORT`
- `app_entry.py` imports from `main.py`: `from main import app`

## When In Doubt
- If a task says to modify one file, modify ONLY that file.
- If you're not sure whether to change `main.py`, the answer is don't.
- If a backend endpoint returns 500, check Render logs before changing code — it might be a rate limit, not a bug.
- If the browser shows a CORS error, check if the backend is actually crashing — CORS errors often mask 500s.
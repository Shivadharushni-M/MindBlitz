# MindBlitz- Smart Study Assistant

AI-powered study companion that transforms any topic into an interactive learning experience.

## Overview

Smart Study Assistant is a modern web application that helps students learn faster and retain better. Simply enter any topic, and within seconds, receive:
- **Concise summaries** breaking down complex concepts
- **Interactive quizzes** to test understanding
- **Math problems** with step-by-step solutions (in Math Mode)
- **Study tips** backed by learning science
- **Fun facts** to make learning engaging

Built with React, Express.js, and powered by Google's Gemini AI, the app combines Wikipedia's knowledge base with AI-generated content to create comprehensive study packs. Features include dark/light themes, streak tracking, confetti celebrations, and a beautiful glassmorphic UI with smooth animations.

### Features
- Clean React UI with TailwindCSS + Framer Motion animations
- Dark/light theme toggle (persisted)
- Topic history (localStorage)
- Streak tracker (tracks daily study sessions)
- Generates:
  - Normal mode: 3-bullet summary, 3 MCQ quiz, study tip
  - Math mode: summary, quiz, 1 logic/quant question with answer + explanation, study tip
- Extras: "Did you know?" fun facts from Wikipedia
- Confetti celebration on quiz completion
- Robust backend with modular services and graceful error handling
- Production-ready formatting, HTTP errors, and tests (Jest + supertest)

---

## Tech Stack
- Frontend: React (Vite) + TailwindCSS + Framer Motion + Axios
- Backend: Express.js + native fetch + Gemini API + Wikipedia REST API
- Deploy: Frontend (Vercel/Netlify), Backend (Render/Railway)

---

## Folder Structure
```
smart-study-assistant/
├─ backend/
│  ├─ env.example
│  ├─ package.json
│  ├─ jest.config.mjs
│  ├─ src/
│  │  ├─ server.js
│  │  ├─ app.js
│  │  ├─ routes/
│  │  │  └─ study.js
│  │  ├─ controllers/
│  │  │  └─ studyController.js
│  │  ├─ services/
│  │  │  ├─ wikiService.js
│  │  │  └─ aiService.js
│  │  ├─ middleware/
│  │  │  └─ errorHandler.js
│  │  └─ utils/
│  │     ├─ httpError.js
│  │     └─ validate.js
│  └─ tests/
│     └─ study.test.js
└─ frontend/
   ├─ package.json
   ├─ vite.config.js
   ├─ tailwind.config.js
   ├─ postcss.config.js
   ├─ index.html
   └─ src/
      ├─ main.jsx
      ├─ App.jsx
      ├─ index.css
      ├─ lib/
      │  ├─ api.js
      │  └─ storage.js
      └─ components/
         ├─ Confetti.jsx
         ├─ EnhancedSpinner.jsx
         ├─ ErrorBoundary.jsx
         ├─ History.jsx
         ├─ Quiz.jsx
         ├─ StreakTracker.jsx
         ├─ ThemeToggle.jsx
         ├─ Toggle.jsx
         └─ ui/
            ├─ Badge.jsx
            ├─ GlassCard.jsx
            └─ PremiumButton.jsx
```

---

## Backend Setup
1) Install
```bash
cd backend
npm install
```

2) Environment
Copy `env.example` to `.env` and fill values:
```
PORT=8080
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
ORIGIN=*  # or your frontend URL, e.g. https://your-frontend.vercel.app
```

3) Run
```bash
npm run dev     # local
# or
npm start       # production
```

Health check:
- GET `/api/health` → `{ ok: true, service: 'smart-study-assistant', time: '...' }`

### API: POST /api/study
Body:
```json
{
  "topic": "Photosynthesis",
  "mode": "math" // optional: "math" or "normal"
}
```

Response (normal mode):
```json
{
  "topic": "Photosynthesis",
  "summary": ["...", "...", "..."],
  "quiz": [
    { "q": "...", "options": ["A","B","C","D"], "answer": "B" }
  ],
  "math": null,
  "studyTip": "...",
  "funFact": "Did you know?...",
  "mode": "normal",
  "timestamp": "2025-11-12T...",
  "source": { "wikipedia": "https://en.wikipedia.org/wiki/..." }
}
```

Response (math mode):
```json
{
  "topic": "Algebra",
  "summary": ["...", "...", "..."],
  "quiz": [
    { "q": "...", "options": ["A","B","C","D"], "answer": "B" }
  ],
  "math": { "question": "2+2=?", "answer": "4", "explanation": "Basic addition" },
  "studyTip": "...",
  "funFact": "Did you know?...",
  "mode": "math",
  "timestamp": "2025-11-12T...",
  "source": { "wikipedia": "https://en.wikipedia.org/wiki/..." }
}
```

Errors:
```json
{ "error": { "message": "Invalid or missing \"topic\"", "status": 400 }, "timestamp": "..." }
```

### Prompt Examples (Backend → Gemini AI)

The backend sends carefully crafted prompts to Gemini to generate high-quality educational content:

**Normal Mode Prompt Structure:**
```
Topic: Photosynthesis
Context: [Wikipedia extract - first 1200 chars]
Task: Create a comprehensive study pack.
Requirements:
- Summary: EXACTLY 3 DETAILED explanatory bullets (not basic definitions, explain HOW/WHY things work)
- Quiz: Generate EXACTLY 3 competitive questions DIRECTLY ABOUT Photosynthesis using the context provided
  * Make them RELATABLE and SPECIFIC to Photosynthesis - use real-world examples and applications
  * Q1 (Medium): Test a core concept or process specific to Photosynthesis
  * Q2 (Hard): Test application of Photosynthesis in a real-world scenario
  * Q3 (Very Hard): Test edge cases, advanced concepts, or implications of Photosynthesis
  * Use actual facts, terminology, and details FROM Photosynthesis
  * Options must be specific to Photosynthesis - not generic or vague
  * "answer" must match one option exactly
- StudyTip: ONE specific, actionable technique for learning Photosynthesis
- FunFact: ONE genuinely surprising or counterintuitive fact about Photosynthesis
Return JSON exactly in this shape:
{ "summary": [...], "quiz": [...], "studyTip":"...", "funFact":"..." }
- No markdown or code fences.
```

**Math Mode Prompt Structure:**
```
Topic: Pythagorean Theorem
Context: [Wikipedia extract]
Task: Create a comprehensive study pack with quiz AND math problem.
Requirements:
- Summary: 3 DETAILED bullets explaining key concepts
- Quiz: EXACTLY 3 competitive questions DIRECTLY ABOUT Pythagorean Theorem
- Math: ONE pure mathematical problem using formulas/equations from this topic
  * MUST use DIFFERENT random numbers each time
  * Use actual formulas/theorems (e.g., "Find c if a=7, b=24")
  * Show complete step-by-step solution
- StudyTip: Specific technique for mastering Pythagorean Theorem
- FunFact: ONE surprising, interesting fact
Return JSON: { "summary": [...], "quiz": [...], "math": {...}, "studyTip":"...", "funFact":"..." }
```

The AI responds with structured JSON containing all educational content, which the backend validates and returns to the frontend.

---

## Frontend Setup
1) Install
```bash
cd frontend
npm install
```

2) Env
Create `.env` (or `.env.local`) with:
```
VITE_API_URL=http://localhost:8080/api
```

3) Run
```bash
npm run dev
```

### UI
- Input topic, toggle "Math Mode", click "Generate"
- Sections animate in: Summary, Quiz, Math Question (in math mode), Study Tip, Fun Fact
- History chips to quickly re-select topics
- Streak tracker shows daily study sessions and total packs generated
- Dark mode toggle at top-right
- Confetti celebration when passing quiz

---

## Testing (Backend)
```bash
cd backend
npm test
```
Included tests (Jest + supertest):
- 400 when missing topic
- 200 with expected structure (normal)
- 200 with expected structure (math)

Note: Tests mock the AI response but use real Wikipedia.

---

## Deployment
### Backend (Render/Railway)
- Build command: `npm install`
- Start command: `npm start`
- Env vars: `GEMINI_API_KEY`, `GEMINI_MODEL`, `ORIGIN`, `PORT`

### Frontend (Vercel/Netlify)
- Build command: `npm run build`
- Publish directory: `dist`
- Env var: `VITE_API_URL` → your backend URL (`https://your-backend.onrender.com/api`)

### Live Deployment URLs

**🌐 Frontend (Render):**
- Production: https://mindblitz.onrender.com
- Access the full interactive study assistant

**⚙️ Backend API (Render):**
- API Base: https://mindblitz-backend.onrender.com/api
- Health Check: https://mindblitz-backend.onrender.com/api/health
- Study Pack Endpoint: `POST https://mindblitz-backend.onrender.com/api/study`

**✅ Status:** Both deployments are live and operational!

---

## Production Notes
- Node >= 18 (uses native fetch)
- CORS is configurable via `ORIGIN`
- Centralized error handling and structured error responses
- Small, focused modules to avoid duplication
- Minimal dependencies, async/await, and ES modules throughout

---

## AI Tools & Development Disclosure

### Content Generation (Runtime)
This application uses **Google Gemini AI API** to generate educational content (summaries, quizzes, math problems, study tips) based on Wikipedia articles. Always verify important facts against original sources.

### Development Assistance (Build Time)
Parts of this codebase were developed with assistance from **Claude AI (Anthropic)**:
- Frontend components and React structure
- CSS styling (glassmorphic design, animations, responsive layouts)
- Backend AI integration (Gemini API, prompt engineering, error handling)

The application concept, features, and architecture were human-directed with AI as a development tool.

---

## License & Credits

- Wikipedia content via [Wikimedia REST API](https://en.wikipedia.org/api/rest_v1/)
- AI generation powered by [Google Gemini API](https://ai.google.dev/)
- UI animations with [Framer Motion](https://www.framer.com/motion/)
- Developed with assistance from Claude AI

---



---

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

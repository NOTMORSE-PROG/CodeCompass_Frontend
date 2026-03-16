# CodeCompass — Frontend

React + Vite frontend for CodeCompass, an AI-driven career guide and personalized learning roadmap platform for CCS students in the Philippines.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 6 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| State | Zustand 5 |
| HTTP client | Axios (JWT interceptor + auto-refresh) |
| Real-time | Native WebSocket (streaming AI chat) |
| UI icons | Heroicons v2 |
| Markdown | react-markdown + react-syntax-highlighter |
| Charts | Recharts |
| Flow diagrams | @xyflow/react |
| Forms | React Hook Form + Zod |
| PDF export | react-to-print |
| Auth | @react-oauth/google |
| Toasts | react-hot-toast |

---

## Project Structure

```
src/
  api/            — Axios API clients, one file per domain
    client.js     — Axios instance, JWT interceptor, 401 auto-refresh
    auth.js       — register, login, logout, me, googleAuth, connectGoogle
    chat.js       — chat sessions CRUD, WebSocket factory
    roadmaps.js   — list, generate, node status, node editor, fix-structure
    resumes.js    — CRUD + AI: bullets, summary, job parse, ATS score
    onboarding.js — status, completeFromChat
    gamification.js
    profile.js
    certifications.js
    universities.js
    jobs.js

  stores/         — Zustand stores
    authStore.js      — user, tokens, login/logout/register/Google auth
    chatStore.js      — sessions, WebSocket, streaming messages, rename
    roadmapStore.js   — roadmaps, node actions, structure fix
    resumeStore.js    — resumes, AI suggestions, ATS results
    gamificationStore.js

  components/
    layout/
      AppLayout.jsx     — sidebar + topbar shell for authenticated pages
      Sidebar.jsx       — mobile drawer + desktop static nav
      TopBar.jsx        — XP indicator, streak, hamburger
      ProtectedRoute.jsx

    resume/             — resume editor sub-components

  pages/
    LandingPage.jsx
    auth/
      LoginPage.jsx
      RegisterPage.jsx
    onboarding/
      OnboardingPage.jsx    — chat-based AI onboarding (WebSocket)
    app/
      DashboardPage.jsx
      RoadmapPage.jsx       — roadmap view + in-app node editor
      AIChatPage.jsx        — ChatGPT-style interface, streaming
      ResumePage.jsx        — editor, 3 templates, live preview, PDF export
      JobsPage.jsx
      CertificationsPage.jsx
      UniversitiesPage.jsx
      AchievementsPage.jsx
      ProfilePage.jsx
```

---

## Pages

| Route | Page | Status |
|---|---|---|
| `/` | Landing | Complete |
| `/login` | Login | Complete |
| `/register` | Register | Complete |
| `/onboarding` | AI onboarding chat | Complete |
| `/app/dashboard` | Dashboard | Connected |
| `/app/roadmap` | Roadmap + node editor | Connected |
| `/app/chat` | AI Chat | Connected |
| `/app/resume` | Resume builder | Complete |
| `/app/jobs` | Job listings | Connected |
| `/app/certifications` | Cert tracker | Connected |
| `/app/universities` | University explorer | Connected |
| `/app/achievements` | XP / badges / leaderboard | Connected |
| `/app/profile` | Student profile | Connected |

---

## Auth Flow

1. Register or Google OAuth → `undergraduate` role assigned automatically
2. Redirect to `/onboarding` — WebSocket AI chat collects student profile
3. On completion → `/app/dashboard`

No role selection step. Google OAuth users skip `GoogleSetupPage` entirely.

Protected routes check: authenticated + (optionally) `isOnboarded`.

JWT tokens are stored in `localStorage`. The Axios client automatically attaches the access token to every request and silently refreshes it on 401 using the refresh token.

---

## Local Setup

### Prerequisites

- Node.js 18+
- The backend API running locally (see backend README)

### Steps

```bash
git clone https://github.com/NOTMORSE-PROG/CodeCompass_Frontend.git
cd CodeCompass_Frontend

npm install
```

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (HMR) |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | ESLint — zero warnings policy (`--max-warnings 0`) |
| `npm run preview` | Preview production build locally |

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (no trailing slash) |
| `VITE_WS_URL` | WebSocket base URL (`ws://` or `wss://`) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID |

---

## Key Design Decisions

**WebSocket chat** — The AI chat and onboarding use native WebSockets with a JWT query param (`?token=<access_token>`). The backend validates the JWT signature before the handshake and rejects unauthenticated connections after `accept()`.

**State management** — Zustand stores are plain modules. `authStore` imports `chatStore` and `roadmapStore` statically (not dynamically) so Vite can bundle them in the same chunk and avoid circular-import warnings.

**Resume storage** — Resume content is stored as a JSON blob (`Resume.content`) on the backend. The frontend manages sections (personal info, experience, education, skills, projects, certifications) as a structured object with UUID-keyed items.

**PDF export** — Uses `react-to-print` which triggers the browser's native print dialog. Users choose "Save as PDF" from there — no server-side rendering required.

**Code splitting** — Vite splits vendor bundles manually (`vendor-react`, `vendor-markdown`, `vendor-data`, `vendor-ui`, `vendor-charts`, `vendor-flow`) so the main app chunk stays small and the heavy markdown/chart libraries are only loaded when needed.

---

## Deployment

The frontend is deployed on **Vercel**. Set the three environment variables in the Vercel project settings. The build command is `npm run build` and the output directory is `dist`.

`VITE_API_URL` must point to the Render backend URL (e.g. `https://your-app.onrender.com`).
`VITE_WS_URL` must use `wss://` in production.

# CodeCompass — Frontend

React + Vite frontend for CodeCompass, an AI-driven career guide and personalized learning roadmap platform built for CCS students in the Philippines.

---

## Features

**AI Career Chat**
- Real-time streaming conversation with a personalized AI mentor powered by Groq
- Multiple chat modes: general career advice, roadmap coaching, job search, resume help, interview prep
- ChatGPT-style sidebar with session history grouped by date (Today, Yesterday, Previous 7 Days, etc.)
- Inline session rename, delete, and a new chat button
- Session titles auto-generated from the first message, updated live via WebSocket event

**AI Onboarding**
- Conversational onboarding flow where the AI collects the student's year level, program, career goals, and interests
- Streams responses in real time so it feels like a natural dialogue, not a form

**Personalized Roadmaps**
- AI generates a full learning roadmap tailored to the student's goal and profile
- Nodes display type (skill, project, assessment, certification), difficulty, estimated hours, and linked YouTube resources
- Students mark nodes in progress and completed — progress bar updates automatically
- In-app node editor: add, rename, or remove nodes without regenerating the roadmap
- "Next Up" banner highlights the next available node after completing one

**Resume Builder**
- Multi-section resume editor: personal info, work experience, education, skills, projects, certifications
- Three templates: Modern (two-column), Classic (serif), Minimal (clean single-column)
- Live preview updates as you type
- AI tools: generate bullet points from a job title, write a professional summary, parse a job description, score ATS compatibility with suggestions
- PDF export via browser print dialog

**Jobs**
- Live job listings from Careerjet and JSearch
- Save and unsave listings
- Recommended jobs based on career goal

**Certifications**
- Browse a catalog of industry certifications (TESDA, Google, AWS, and others)
- Track certifications with status (in progress, completed) and completion date

**Universities**
- Explore Philippine universities and their CCS programs

**Achievements**
- XP points, level, and badge collection
- XP history timeline
- Leaderboard ranked by total XP

**Profile**
- Edit bio, skills, social links, year level, program, and career goal
- Link or unlink a Google account
- Change password

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 6 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| State | Zustand 5 |
| HTTP client | Axios |
| Real-time | Native WebSocket |
| Forms | React Hook Form + Zod |
| Markdown | react-markdown + react-syntax-highlighter |
| Charts | Recharts |
| Flow diagrams | @xyflow/react |
| PDF export | react-to-print |
| Toasts | react-hot-toast |

---

## Local Setup

### Prerequisites

- Node.js 18+
- The backend running locally

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
| `npm run dev` | Start development server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | ESLint with zero-warnings policy |
| `npm run preview` | Preview the production build locally |

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (no trailing slash) |
| `VITE_WS_URL` | WebSocket base URL (`ws://` or `wss://`) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID |

---

## Deployment

Deployed on **Vercel**. Set the three environment variables in the Vercel project settings. Use `wss://` for `VITE_WS_URL` in production.

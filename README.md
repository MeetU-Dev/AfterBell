# AfterBell — Life Skills Platform

A gamified full-stack web application where teens discover, complete, and master real-world life skills through interactive lessons, AI-powered tutoring, and progress tracking. Built with a parent dashboard for supervision and an admin panel for content management.

---

## Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 with TypeScript |
| **Build Tool** | Vite 7 |
| **Routing** | React Router v6 |
| **Animation** | Framer Motion 11 |
| **Styling** | Tailwind CSS 3 |
| **Icons** | React Icons (Feather Icons) |
| **Markdown** | react-markdown + remark-gfm |
| **HTTP Client** | Axios |
| **Testing** | Vitest + Testing Library + happy-dom |

### Backend
| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js (v18+) |
| **Framework** | Express 5 |
| **Language** | JavaScript |
| **Authentication** | JWT + bcryptjs |
| **Database** | MongoDB + Mongoose 8 |
| **Email** | Nodemailer (SMTP) |
| **SMS** | Twilio |
| **Rate Limiting** | express-rate-limit |
| **Validation** | Server-side (manual) |
| **Testing** | Jest + Supertest |

### AI / ML
| Service | Usage |
|---------|-------|
| **OpenRouter API** | AI Study Buddy chat (streaming), quiz generation, lesson summarization |
| **Google Generative AI** | Fallback AI provider |
| **OpenAI SDK** | Additional AI capabilities |

### DevOps & Tooling
| Tool | Usage |
|------|-------|
| **Nodemon** | Dev server auto-reload |
| **ESLint** | Frontend linting |
| **Rollup Visualizer** | Bundle analysis |
| **Git** | Version control |

---

## Features

### 🧑‍🎓 Teen Experience
- **Skill Catalog** — Browse life skills by category (practical, social, digital, financial, health, emotional)
- **Interactive Lessons** — Step-by-step lessons with markdown content per skill
- **Progress Tracking** — Mark steps complete, track overall skill mastery
- **Gamification** — Earn XP, level up, unlock achievement badges
- **Equippable Badges** — Show off your best badge next to your name across the app
- **AI Study Buddy** — Chat with an AI tutor for explanations, examples, and quizzes via streaming SSE
- **Mini-Games** — Fun interactive games tied to skill content
- **Breathing Exercises** — Guided mindfulness exercises with animated visuals
- **Real-Life Stories** — Read real-world application stories for each skill
- **Notes** — Personal note-taking per skill
- **Notifications** — Real-time in-app notifications
- **User Profile** — Avatar, stats, unlocked badges, progress overview

### 👨‍👩‍👧 Parent Dashboard
- View linked teens and their progress
- Detailed per-teen skill breakdown, XP, streaks, badges, and equipped badge display
- Verify teen accounts via email link
- See total teens, overall and average progress metrics

### 🛠️ Admin Panel (7 tabs)
| Tab | Capabilities |
|-----|-------------|
| **Overview** | Platform-wide stats: total users, teens, parents, active users, completions, new signups |
| **Content Health** | Duplicate video detector (groups skills by YouTube ID), embed health checker (pings YouTube oEmbed) |
| **Skills** | Full CRUD: create, edit, delete skills with multi-step management (title, description, videoUrl, tags, step reordering) |
| **Categories** | CRUD for skill domains (name, icon, gradient, color, display order) |
| **Partners** | CRUD for partner organizations (name, website, logo, type, active status) |
| **Users** | Paginated, searchable, filterable user table with detail drilldown (badges, streak, completion count) |
| **Ops** | Reseed database button + paginated admin audit log |

### 🔐 Authentication & Roles
- **Teen** — Default role on signup, requires optional parent verification
- **Parent** — Can link to teens, view progress, verify accounts
- **Admin** — Full access to all management features
- JWT-based sessions stored in localStorage
- Rate-limited auth endpoints

---

## Architecture

```
AfterBell/
├── client/                          # React SPA (Vite)
│   ├── src/
│   │   ├── api/                     # API client, base URL config
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Header.tsx           # Nav bar + equipped badge
│   │   │   ├── AIChatBot.tsx        # AI Study Buddy chat widget
│   │   │   ├── EquippedBadge.tsx    # Badge display component
│   │   │   ├── SkillCard.tsx        # Skill catalog cards
│   │   │   └── MiniGames.tsx        # Interactive mini-games
│   │   ├── context/                 # React contexts
│   │   │   ├── AuthContext.tsx      # Auth state + login/logout
│   │   │   ├── GamificationContext.tsx  # XP, levels, badges
│   │   │   ├── AIChatContext.tsx    # Chat state + streaming
│   │   │   └── UserDataContext.tsx  # Global user data
│   │   ├── pages/                   # Route pages
│   │   └── styles/                  # Global styles
│   └── dist/                        # Production build output
│
└── server/                          # Express REST API
    ├── config/                      # DB connection, env config
    ├── controllers/                 # Route handlers
    │   ├── auth.js                  # Register, login, profile
    │   ├── skills.js                # Skills CRUD + video check
    │   ├── lessons.js               # Lesson step management
    │   ├── progress.js              # User progress tracking
    │   ├── gamification.js          # XP, levels, badges, equip
    │   ├── parent.js                # Parent dashboard endpoints
    │   ├── analytics.js             # Admin stats
    │   ├── ai.js                    # Chat (streaming), quiz, summarize
    │   ├── partners.js              # Partner CRUD
    │   ├── skillDomains.js          # Category CRUD
    │   └── notifications.js        # Notification system
    ├── models/                      # Mongoose schemas
    │   ├── User.js                  # Users + equippedBadgeId
    │   ├── Skill.js                 # Skills with lastVideoCheck
    │   ├── SkillDomain.js           # Categories
    │   ├── Lesson.js                # Lesson steps
    │   ├── Progress.js              # User progress
    │   ├── ChatMessage.js           # AI chat history
    │   ├── Gamification.js          # XP/badge records
    │   ├── Partner.js               # Partner organizations
    │   ├── Notification.js          # Notifications
    │   └── AdminAuditLog.js         # Admin action audit trail
    ├── routes/                      # Express route definitions
    ├── middleware/                   # Auth, admin, error handling
    ├── utils/                       # AI helpers, audit logging
    ├── scripts/                     # Seed scripts
    │   ├── seedAll.js               # Full DB seed
    │   ├── seedAdmin.js             # Admin account
    │   ├── seedDemoTeen.js          # Demo teen account
    │   ├── seedContent.js           # Skills, lessons, domains
    │   └── seedPartners.js          # Partner data
    └── server.js                    # App entry point
```

---

## Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **MongoDB** v4.4 or higher (local or Atlas)
- **npm**

### 1. Clone & Install
```bash
git clone https://github.com/MeetU-Dev/AfterBell.git
cd AfterBell

# Frontend
cd client && npm install

# Backend
cd ../server && npm install
```

### 2. Configure Environment
```bash
cp server/config/config.env.example server/config/config.env
```
Edit `config.env` — at minimum set `MONGO_URI`, `JWT_SECRET`, and `PORT=5001`.  
Optional: `OPENROUTER_API_KEY` for AI chat.

### 3. Start MongoDB
```bash
# macOS
brew services start mongodb/brew/mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 4. Run
```bash
# Terminal 1 — Backend (port 5001)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```
Open **http://localhost:5173**

---

## Test Accounts

| Role | Email | Password | How to Create |
|------|-------|----------|---------------|
| **Admin** | `admin@afterbell.com` | `Admin@123` | `cd server && npm run seed:admin` |
| **Demo Teen** | `teenadmin@afterbell.com` | `TeenAdmin@123` | `cd server && npm run seed:demo-teen` |

---

## Scripts

### Frontend (`cd client`)
| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run Vitest tests |
| `npm run test:watch` | Tests in watch mode |
| `npm run lint` | ESLint check |
| `npm run analyze` | Bundle size analysis |

### Backend (`cd server`)
| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Dev server with nodemon |
| `npm run seed:all` | Seed full database |
| `npm run seed:admin` | Create admin account |
| `npm run seed:demo-teen` | Create demo teen account |
| `npm run seed:content` | Seed skills, lessons, domains |
| `npm run seed:partners` | Seed partner data |
| `npm test` | Run Jest tests |

---

## API Overview

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/v1/auth/register` | POST | Public | Register teen account |
| `/api/v1/auth/login` | POST | Public | Login (all roles) |
| `/api/v1/auth/profile` | GET | Auth | Get user profile + equipped badge |
| `/api/v1/auth/users` | GET | Admin | Paginated user list (search, filter) |
| `/api/v1/skills` | GET | Auth | List all skills |
| `/api/v1/skills/:id` | GET | Auth | Skill detail + lesson steps |
| `/api/v1/skills/:id` | POST/PUT/DELETE | Admin | CRUD |
| `/api/v1/skills/check-videos` | POST | Admin | YouTube embed health check |
| `/api/v1/progress` | GET/POST | Auth | User progress tracking |
| `/api/v1/gamification/profile` | GET | Auth | XP, level, badges, equipped badge |
| `/api/v1/gamification/equip-badge` | PUT | Auth | Equip/unequip badge |
| `/api/v1/parent/teens` | GET | Parent | Linked teens with progress |
| `/api/v1/parent/teens/:id` | GET | Parent | Teen detail |
| `/api/v1/analytics/admin` | GET | Admin | Platform-wide statistics |
| `/api/v1/skilldomains` | GET | Auth | List categories |
| `/api/v1/skilldomains/:id` | POST/PUT/DELETE | Admin | CRUD |
| `/api/v1/partners/all` | GET | Auth | List partners |
| `/api/v1/partners/:id` | POST/PUT/DELETE | Admin | CRUD |
| `/api/v1/ai/chat/stream` | POST | Auth | Streaming AI chat (SSE) |
| `/api/v1/ai/quiz` | POST | Auth | Generate quiz questions |
| `/api/v1/ai/summarize` | POST | Auth | Summarize lesson |
| `/api/v1/ai/history` | GET/DELETE | Auth | Chat history |
| `/api/v1/admin/reseed` | POST | Admin | Reseed database |
| `/api/v1/admin/audit-log` | GET | Admin | Admin action audit trail |

---

## Key Design Decisions

- **SSE streaming for AI chat** — Server-sent events pipe OpenRouter tokens to the client in real-time; the backend writes each chunk immediately via `res.write` rather than buffering the full response.
- **Gamification via context** — XP, levels, and badges are managed through a React context so all components (header, profile, parent dashboard) reflect the latest state without prop drilling.
- **Equipped badge system** — A single `equippedBadgeId` field on the User model; the backend resolves it into a full badge object on profile fetches; the frontend renders it as a tiny rarity-colored icon next to the user's name.
- **Admin audit logging** — Every destructive action (reseed, content changes) is logged with admin identity, action type, and details for accountability.
- **Content health monitoring** — Admins can detect duplicate YouTube videos across skills and verify embed validity via the oEmbed API.
- **Role-based authorization** — Middleware enforces `protect` (authenticated) and `authorize('admin')` gates on all sensitive routes.

---

## Troubleshooting

- **MongoDB Connection Error** — Ensure MongoDB is running (`mongod` or Atlas URI in config)
- **Port Conflict** — Change `PORT` in `config.env` or kill the existing process
- **Module Not Found** — Run `npm install` in the affected directory
- **Build Errors** — `rm -rf node_modules && npm install`
- **AI Chat Not Working** — Set `OPENROUTER_API_KEY` in `config.env`; without it, the chat falls back to a non-streaming mock response

# CLAUDE.md - Rideway Project Guide

> **IMPORTANT**: ყოველი ახალი სესიის დასაწყისში აუცილებლად შეასრულე Quick Start!

---

## Quick Start (ახალი სესიისთვის)

### 1. პირველ რიგში წაიკითხე პროგრესი:
```bash
cat PROGRESS.md
```
ნახე: Current Task, Completed Tasks, Next Tasks

### 2. საჭიროებისამებრ წაიკითხე დეტალური დოკუმენტაცია:

| დოკუმენტი | როდის წაიკითხო |
|-----------|----------------|
| `docs/FRONTEND_PLAN.md` | **Frontend-ზე მუშაობისას** (pages, components, phases) |
| `docs/DESIGN_SYSTEM.md` | UI კომპონენტებზე მუშაობისას (colors, spacing) |
| `docs/API.md` | API integration-ისას (request/response ფორმატები) |
| `docs/DATABASE.md` | DB-ზე მუშაობისას (ცხრილები, relations) |
| `MVP_PLAN.md` | Backend გეგმის დეტალები |

### 3. გააგრძელე იქიდან სადაც გაჩერდა

---

## Project Documentation Map

```
rideway/
├── CLAUDE.md              # 📖 ეს ფაილი - მთავარი გაიდი
├── PROGRESS.md            # 📊 პროგრესის ტრეკინგი (ყოველ სესიაზე!)
├── MVP_PLAN.md            # 📋 Backend MVP გეგმა
│
├── docs/
│   ├── FRONTEND_PLAN.md   # 🖥️ Frontend გეგმა (pages, components, phases)
│   ├── API.md             # 🔌 API დოკუმენტაცია (ყველა endpoint)
│   ├── DATABASE.md        # 🗄️ DB სქემა + ERD დიაგრამა
│   └── DESIGN_SYSTEM.md   # 🎨 UI/UX გაიდი
│
├── rideway-api/           # ⚙️ Backend (Express.js) - ✅ COMPLETE
└── plan-frontend/         # 🖥️ Frontend (Next.js) - 🔨 IN PROGRESS
```

---

## Project Overview

**Rideway** - მოტოციკლეტის კომუნიტის პლატფორმა საქართველოსთვის

### პლატფორმები:
| კომპონენტი | ტექნოლოგია | სტატუსი |
|------------|------------|---------|
| `rideway-api/` | Express.js + TypeScript | ✅ Complete |
| `plan-frontend/` | Next.js 14 | 🔨 Building |
| `plan-mobile/` | React Native | ⏳ Planned |

### მიზანი:
- სოციალური ქსელი მოტოენთუზიასტებისთვის
- მარკეტპლეისი (მოტო, ნაწილები, ეკიპირება)
- სერვისების კატალოგი
- ფორუმი

---

## Tech Stack

### Backend (rideway-api)
```
Framework:     Express.js + TypeScript
Database:      PostgreSQL + Prisma ORM
Cache:         Redis (ioredis)
Auth:          JWT + Passport.js
Storage:       Cloudflare R2
Push:          Firebase Cloud Messaging
Real-time:     Socket.io
Queue:         BullMQ
Validation:    Zod
Email:         Resend
```

### Frontend (plan-frontend)
```
Framework:     Next.js 14 (App Router)
Auth:          NextAuth.js
State:         Zustand + React Query
UI:            Tailwind CSS + shadcn/ui + Radix UI
Forms:         React Hook Form + Zod
```

### Mobile (plan-mobile)
```
Framework:     React Native
Navigation:    React Navigation
State:         Zustand + React Query
```

---

## Project Structure

```
rideway/
├── CLAUDE.md              # ეს ფაილი - გაიდი Claude-სთვის
├── PROGRESS.md            # პროგრესის ტრეკინგი (ყოველ სესიაზე განახლდება!)
├── MVP_PLAN.md            # დეტალური MVP გეგმა
│
├── rideway-api/           # Backend (Express.js) - NEW
│   ├── src/
│   │   ├── config/        # კონფიგურაციები
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── validators/    # Zod schemas
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Helpers
│   │   ├── socket/        # Socket.io
│   │   └── jobs/          # Background jobs
│   └── prisma/
│       └── schema.prisma  # Database schema
│
├── plan-frontend/         # Frontend (Next.js)
│   └── src/
│       ├── app/           # Pages (App Router)
│       ├── components/    # React components
│       │   └── ui/        # shadcn/ui (Design System)
│       ├── lib/           # Utilities
│       ├── hooks/         # Custom hooks
│       ├── stores/        # Zustand stores
│       └── types/         # TypeScript types
│
└── plan-mobile/           # Mobile (React Native) - PLANNED
```

---

## Commands

### Backend (rideway-api)
```bash
cd rideway-api
npm run dev              # Development (port 8000)
npm run build            # Build
npm run start            # Production
npx prisma migrate dev   # Run migrations
npx prisma generate      # Generate client
npx prisma studio        # DB GUI
```

### Frontend (plan-frontend)
```bash
cd plan-frontend
npm run dev              # Development (port 3000)
npm run build            # Build
npm run lint:fix         # Lint fix
```

---

## API Design

### Base URL
- Development: `http://localhost:8000/api/v1`
- Production: TBD

### Response Format
```typescript
// Success
{
  success: true,
  data: { ... },
  meta?: { page, limit, total, totalPages }
}

// Error
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human readable message",
    details?: { ... }
  }
}
```

### Authentication
- Access Token: JWT (15 min expiry)
- Refresh Token: JWT (7 days expiry)
- Header: `Authorization: Bearer <token>`

---

## MVP Features (Priority Order)

> **გეგმა: ჯერ საიტი სრულად, შემდეგ აპლიკაცია**

### Phase 1: Backend Foundation
- [x] Project setup & cleanup
- [ ] Express.js + TypeScript setup
- [ ] Prisma + PostgreSQL schema
- [ ] Auth (register, login, OTP, JWT)
- [ ] Users (profile, follow, block)
- [ ] Media upload (R2)

### Phase 2: Backend - Social
- [ ] Posts (CRUD, likes, comments)
- [ ] Stories (24h ephemeral)
- [ ] Feed (personalized)
- [ ] Hashtags + trending

### Phase 3: Backend - Communication
- [ ] Chat (1-to-1 messaging)
- [ ] Notifications (in-app + push)
- [ ] Real-time (Socket.io)

### Phase 4: Backend - Marketplace & Community
- [ ] Listings (bikes, parts, gear)
- [ ] Forum (threads, replies)
- [ ] Services (mechanics, shops)
- [ ] Reviews
- [ ] Admin panel API

### Phase 5: Frontend Integration
- [ ] API client setup
- [ ] Auth pages (login, register, verify)
- [ ] Profile pages
- [ ] Feed page
- [ ] Marketplace pages
- [ ] Forum pages
- [ ] Chat pages
- [ ] Settings pages
- [ ] Admin panel

### Phase 6: Mobile App (შემდეგ)
- [ ] React Native setup
- [ ] All screens (იგივე დიზაინი)

---

## Database Models (Prisma)

### Core Models:
```
User, Follow, Block
Post, PostImage, PostLike, Comment, CommentLike
Story, StoryView
Hashtag, PostHashtag
Conversation, Message
ForumCategory, ForumThread, ThreadReply
ListingCategory, Listing, ListingImage, ListingFavorite
ServiceCategory, Service, ServiceImage, ServiceReview
Notification, DeviceToken
RefreshToken, OtpCode
```

---

## Frontend Design System

### შენახული კომპონენტები:
- `components/ui/` - shadcn/ui (27+ კომპონენტი)
- `components/layout/` - Header, Sidebar, Footer
- `components/shared/` - Loading, Skeletons, Empty states
- `globals.css` - Tailwind theme (colors, fonts)

### Theme Colors:
```css
--primary: 45 100% 51%      /* Yellow/Gold */
--background: 0 0% 100%     /* White */
--foreground: 0 0% 3.9%     /* Near black */
--muted: 0 0% 96.1%         /* Light gray */
--accent: 0 0% 96.1%        /* Light gray */
```

---

## Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# JWT
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudflare R2
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_ENDPOINT=...
R2_PUBLIC_URL=...

# Firebase
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# Email
RESEND_API_KEY=...

# App
PORT=8000
NODE_ENV=development
```

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
API_URL=http://localhost:8000/api/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
```

---

## Coding Conventions

### Backend:
- Use TypeScript strict mode
- Controllers handle HTTP, Services handle business logic
- All routes must have validation middleware
- Use Zod for request validation
- Error handling via centralized error middleware
- Use async/await, avoid callbacks

### Frontend:
- Use App Router (not Pages)
- Server Components by default
- Client Components only when needed ('use client')
- Use shadcn/ui components from `components/ui/`
- Forms with React Hook Form + Zod
- API calls via React Query

### Naming:
- Files: kebab-case (`user-service.ts`)
- Classes/Types: PascalCase (`UserService`)
- Functions/Variables: camelCase (`getUserById`)
- Constants: UPPER_SNAKE_CASE (`MAX_UPLOAD_SIZE`)
- Database columns: snake_case (`created_at`)

---

## Workflow Between Sessions

### სესიის დაწყებისას:

```
┌─────────────────────────────────────────────────────────┐
│  1. წაიკითხე PROGRESS.md                                │
│     → Current Task (რას ვაკეთებთ)                       │
│     → Next Tasks (რა არის შემდეგი)                      │
│     → Notes (მნიშვნელოვანი შენიშვნები)                  │
├─────────────────────────────────────────────────────────┤
│  2. Task-ის მიხედვით წაიკითხე შესაბამისი დოკუმენტი:     │
│                                                         │
│     Backend მუშაობა:                                    │
│       → docs/API.md (endpoints, formats)                │
│       → docs/DATABASE.md (tables, relations)            │
│       → MVP_PLAN.md (ფაზის დეტალები)                    │
│                                                         │
│     Frontend მუშაობა:                                   │
│       → docs/DESIGN_SYSTEM.md (colors, components)      │
│       → docs/API.md (API calls)                         │
│       → MVP_PLAN.md (ფაზის დეტალები)                    │
├─────────────────────────────────────────────────────────┤
│  3. გააგრძელე იქიდან სადაც გაჩერდა                      │
└─────────────────────────────────────────────────────────┘
```

### სესიის დასრულებისას:

```
┌─────────────────────────────────────────────────────────┐
│  1. განაახლე PROGRESS.md:                               │
│     → Completed Tasks-ში დაამატე გაკეთებული             │
│     → Current Task განაახლე                             │
│     → Next Tasks განაახლე                               │
│     → Notes-ში დაამატე მნიშვნელოვანი ინფორმაცია         │
│     → Session Log-ში დაამატე სესიის შეჯამება            │
├─────────────────────────────────────────────────────────┤
│  2. საჭიროების შემთხვევაში განაახლე:                    │
│     → MVP_PLAN.md (თუ გეგმა შეიცვალა)                   │
│     → docs/API.md (თუ ახალი endpoint დაემატა)           │
│     → docs/DATABASE.md (თუ სქემა შეიცვალა)              │
├─────────────────────────────────────────────────────────┤
│  3. კომიტი და Push:                                     │
│     → git add .                                         │
│     → git commit -m "short message in english"          │
│     → git push                                          │
│                                                         │
│     ⚠️  NO Co-Authored-By!                              │
│     ⚠️  კომიტი უნდა იყოს 1 ხაზიანი, მოკლე, ინგლისურად   │
└─────────────────────────────────────────────────────────┘
```

### Git Commit Rules:
```bash
# ✅ სწორი მაგალითები:
git commit -m "add auth module"
git commit -m "fix login validation"
git commit -m "setup express project structure"
git commit -m "add user profile endpoints"
git commit -m "cleanup frontend, keep design system"

# ❌ არასწორი:
git commit -m "Added authentication module with JWT support..."  # ძალიან გრძელი
git commit -m "დავამატე auth"  # ქართულად
git commit -m "..." --author="..."  # ხელმოწერით
```

### დოკუმენტების გამოყენების წესები:

| მუშაობის ტიპი | აუცილებელი დოკუმენტები |
|---------------|------------------------|
| **Auth მოდული** | API.md (auth endpoints), DATABASE.md (users, tokens) |
| **Posts მოდული** | API.md (posts endpoints), DATABASE.md (posts, likes, comments) |
| **Chat მოდული** | API.md (chat endpoints), DATABASE.md (conversations, messages) |
| **Marketplace** | API.md (listings endpoints), DATABASE.md (listings, categories) |
| **Frontend pages** | DESIGN_SYSTEM.md (components), API.md (API calls) |

### PROGRESS.md ფორმატი:
```markdown
## Current Task
რას ვაკეთებთ ახლა

## Completed Tasks
- [x] Task 1
- [x] Task 2

## Next Tasks
- [ ] Task 3
- [ ] Task 4

## Notes
მნიშვნელოვანი შენიშვნები

## Session Log
| Date | Session | Summary |
|------|---------|---------|
| 2026-01-08 | #1 | გეგმის შედგენა |
```

---

## Important Notes

### Frontend Cleanup:
`plan-frontend`-ში შენარჩუნებულია მხოლოდ:
- UI კომპონენტები (`components/ui/`)
- Layout კომპონენტები (visual part only)
- Styles და Tailwind config
- Public assets

წაშლილია:
- ძველი API integration
- ძველი auth logic
- ძველი pages business logic

### Backend:
`rideway-api` იწყება ნულიდან Express.js-ით.
არ გამოიყენო NestJS ან ძველი `bike-area-api`.

---

## Quick Reference

### API Endpoints (იხილე MVP_PLAN.md დეტალებისთვის):
- `/api/v1/auth/*` - Authentication
- `/api/v1/users/*` - User management
- `/api/v1/posts/*` - Social posts
- `/api/v1/stories/*` - Stories
- `/api/v1/chat/*` - Messaging
- `/api/v1/forum/*` - Forum
- `/api/v1/listings/*` - Marketplace
- `/api/v1/services/*` - Services
- `/api/v1/notifications/*` - Notifications
- `/api/v1/admin/*` - Admin panel

### File Upload Limits:
- Avatar: 5MB (jpeg, png, webp)
- Cover: 10MB (jpeg, png, webp)
- Post images: 10MB each, max 10 images
- Listing images: 10MB each, max 20 images

---

*Last updated: 2026-01-07*

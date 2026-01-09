# PROGRESS.md - Rideway Development Progress

> **ეს ფაილი განახლდება ყოველი სესიის ბოლოს!**
> Claude-მა უნდა წაიკითხოს ეს ფაილი ყოველი ახალი სესიის დასაწყისში.

## Quick Reference - დოკუმენტები

| Task Type | წაიკითხე |
|-----------|----------|
| Backend - Auth | `docs/API.md` → Auth section, `docs/DATABASE.md` → User tables |
| Backend - Posts | `docs/API.md` → Posts section, `docs/DATABASE.md` → Social domain |
| Backend - Chat | `docs/API.md` → Chat section, `docs/DATABASE.md` → Chat domain |
| Backend - Marketplace | `docs/API.md` → Listings section, `docs/DATABASE.md` → Marketplace domain |
| Frontend | `docs/DESIGN_SYSTEM.md`, `docs/API.md` |
| გეგმის დეტალები | `MVP_PLAN.md` |

## Git Commit Rule
```bash
# სესიის ბოლოს: მოკლე, 1 ხაზიანი, ინგლისურად, NO Co-Authored-By
git add . && git commit -m "short message" && git push
```

---

## Repositories & Infrastructure

| Component | GitHub Repo | Branch |
|-----------|-------------|--------|
| Backend | `git@github.com:BekaChkhiro/rideway-api.git` | master |
| Frontend | `git@github.com:BekaChkhiro/rideway-web.git` | - |

| Service | Platform | Status |
|---------|----------|--------|
| Database | Railway PostgreSQL | ✅ Ready |
| Backend | Railway | ⏳ After code |
| Frontend | Railway | ⏳ After code |

> **Note:** DATABASE_URL უკვე შენახულია `rideway-api/.env` ფაილში

---

## Current Status

| Component | Status | Progress |
|-----------|--------|----------|
| Backend (rideway-api) | ✅ ALL MODULES COMPLETE (Auth + Users + Media + Posts + Stories + Chat + Notifications + Listings + Forum + Services + Socket.io + Admin) | 100% |
| Frontend (rideway-web) | ✅ Setup Phase Complete | 30% |
| Mobile | ⏳ Planned | 0% |

---

## Current Task

**Phase 7: Frontend Integration - SETUP COMPLETE ✅**

დასრულდა:
1. [x] Frontend გეგმის შექმნა (`docs/FRONTEND_PLAN.md`) ✅
2. [x] CLAUDE.md განახლება Frontend სექციით ✅
3. [x] MVP_PLAN.md განახლება ✅
4. [x] **Frontend Setup Phase** ✅
   - [x] TypeScript types (`types/*.ts`)
   - [x] API client (`lib/api/client.ts`)
   - [x] NextAuth.js config (`lib/auth/config.ts`)
   - [x] Auth API functions (`lib/api/auth.ts`, `lib/api/users.ts`, `lib/api/media.ts`)
   - [x] Zustand stores (`stores/auth.store.ts`, `stores/ui.store.ts`)
   - [x] Providers updated with SessionProvider
   - [x] useAuth hook
   - [x] Build: ✅ წარმატებული

**შემდეგი: Auth Pages Implementation (Phase 1)**
- Login page + form
- Register page + form
- OTP verification page
- Forgot/reset password pages
- Protected route middleware

---

## Completed Tasks

### Session 1 (2026-01-07)
- [x] პროექტის ანალიზი
- [x] მომხმარებლის requirements-ის შეგროვება
- [x] MVP გეგმის შექმნა (`MVP_PLAN.md`)
- [x] CLAUDE.md განახლება
- [x] PROGRESS.md შექმნა
- [x] Workflow სისტემის დადგენა
- [x] **Frontend Cleanup:**
  - [x] წაშლილია: `lib/api/`, `lib/auth/`, `lib/validations/`
  - [x] წაშლილია: `stores/`, `hooks/`, `types/`
  - [x] წაშლილია: `components/profile/`, `search/`, `upload/`, `settings/`
  - [x] წაშლილია: `app/(auth)/`, `app/(main)/`, `app/api/`
  - [x] წაშლილია: `middleware.ts`, `__tests__/`
  - [x] გაასუფთავდა: `providers/`, `components/layout/`
  - [x] შეინარჩუნა: `components/ui/` (27 კომპონენტი)
  - [x] შეინარჩუნა: `components/shared/`, `globals.css`
  - [x] შეიქმნა: placeholder `page.tsx`
  - [x] Build: ✅ წარმატებული
- [x] **დამატებითი დოკუმენტაცია:**
  - [x] `docs/DESIGN_SYSTEM.md` - UI/UX გაიდი (colors, typography, spacing, components)
  - [x] `docs/API.md` - სრული API დოკუმენტაცია (ყველა endpoint)
  - [x] `docs/DATABASE.md` - DB სქემა + ERD დიაგრამა (Mermaid)

### Session 3 (2026-01-08)
- [x] **Backend Setup დასრულდა:**
  - [x] TypeScript + Express.js setup
  - [x] Prisma 7 + PostgreSQL adapter
  - [x] სრული database schema (30+ ცხრილი გადატანილია DB-ში)
  - [x] Project structure (`src/config/`, `middleware/`, `routes/`, `controllers/`, `services/`, `validators/`, `types/`, `utils/`)
  - [x] Base middleware (error handler, validation, async handler)
  - [x] Health check endpoint
  - [x] Database connection test ✅

### Session 4 (2026-01-08)
- [x] **Auth Module დასრულდა:**
  - [x] Auth validators (Zod schemas: register, login, verify-otp, refresh, forgot/reset password)
  - [x] Auth service (register, login, verify OTP, refresh token, logout, forgot/reset password)
  - [x] Auth controller
  - [x] Auth routes (`/api/v1/auth/*`)
  - [x] Auth middleware (JWT verification, role-based access)
  - [x] Utils: password hashing (bcryptjs), JWT generation/verification, OTP generation
  - [x] Build: ✅ წარმატებული
  - [x] Tested endpoints: register ✅, verify-otp ✅, login ✅

### Session 5 (2026-01-08)
- [x] **Users Module დასრულდა:**
  - [x] Users validators (profile update, search, pagination)
  - [x] Users service (profile CRUD, follow/unfollow, block/unblock)
  - [x] Users controller
  - [x] Users routes (`/api/v1/users/*`)
  - [x] Updated validate middleware (supports body, params, query)
  - [x] Fixed AppError import (centralized in error-handler.ts)
  - [x] Build: ✅ წარმატებული
  - [x] Tested endpoints: get profile ✅, update profile ✅, search ✅, follow ✅, unfollow ✅, block ✅, unblock ✅

### Session 6 (2026-01-08)
- [x] **Media Module დასრულდა:**
  - [x] Cloudflare R2 setup (credentials in .env)
  - [x] R2 client configuration (`src/config/r2.ts`)
  - [x] Multer middleware for file uploads (`src/middleware/upload.ts`)
  - [x] Media service (upload, delete files to R2) (`src/services/media.service.ts`)
  - [x] Media controller (`src/controllers/media.controller.ts`)
  - [x] Media routes (`/api/v1/media/*`)
  - [x] Build: ✅ წარმატებული
  - [x] Tested endpoints: upload avatar ✅, upload cover ✅, delete avatar ✅, delete cover ✅

### Session 7 (2026-01-09)
- [x] **Posts Module დასრულდა:**
  - [x] Posts validators (Zod schemas: create, update, pagination)
  - [x] Posts service (CRUD, feed, trending, hashtag search, like toggle)
  - [x] Posts controller
  - [x] Posts routes (`/api/v1/posts/*`)
  - [x] Hashtag extraction and management
  - [x] Build: ✅ წარმატებული
  - [x] Tested: create post ✅, get feed ✅, get trending ✅, get by hashtag ✅, toggle like ✅
- [x] **Comments Module დასრულდა:**
  - [x] Comments service (CRUD, replies, like toggle)
  - [x] Comments controller
  - [x] Comments routes (nested under posts)
  - [x] Build: ✅ წარმატებული
  - [x] Tested: add comment ✅, get comments ✅, toggle comment like ✅

### Session 8 (2026-01-09)
- [x] **Stories Module დასრულდა:**
  - [x] Stories validators (Zod schemas: create, storyId, userId params)
  - [x] Stories service (create, get feed, get by user, view, delete, cleanup)
  - [x] Stories controller
  - [x] Stories routes (`/api/v1/stories/*`)
  - [x] Story media upload (images + videos, 50MB limit)
  - [x] 24-hour expiry logic
  - [x] Feed stories grouped by user (unviewed first)
  - [x] Build: ✅ წარმატებული
  - [x] Tested: create story ✅, get feed ✅, get my stories ✅, view story ✅, get viewers ✅, delete ✅

### Session 9 (2026-01-09)
- [x] **Chat Module დასრულდა:**
  - [x] Chat validators (Zod schemas: createConversation, sendMessage, conversationId params)
  - [x] Chat service (getConversations, getOrCreateConversation, getMessages, sendMessage, markAsRead, getUnreadCount)
  - [x] Chat controller
  - [x] Chat routes (`/api/v1/chat/*`)
  - [x] Block checking in chat (can't message blocked users)
  - [x] Build: ✅ წარმატებული
  - [x] Tested: create conversation ✅, send message ✅, get conversations ✅, get messages ✅, mark as read ✅, unread count ✅

### Session 10 (2026-01-09)
- [x] **Notifications Module დასრულდა:**
  - [x] Notifications validators (Zod schemas: getNotifications, notificationId params)
  - [x] Notifications service (getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, createNotification)
  - [x] Notifications controller
  - [x] Notifications routes (`/api/v1/notifications/*`)
  - [x] Build: ✅ წარმატებული
  - [x] Tested: get notifications ✅, unread count ✅, mark as read ✅, mark all as read ✅, delete ✅

### Session 11 (2026-01-09)
- [x] **Listings Module დასრულდა:**
  - [x] Listings validators (Zod schemas: create, update, filters, search, pagination)
  - [x] Listings service (CRUD, search, filters, favorites, mark as sold)
  - [x] Listings controller
  - [x] Listings routes (`/api/v1/listings/*`)
  - [x] Categories support (hierarchical)
  - [x] Build: ✅ წარმატებული
  - [x] Tested: categories ✅, create listing ✅, get listings ✅, search ✅, popular ✅, favorites ✅, mark as sold ✅

### Session 12 (2026-01-09)
- [x] **Forum Module დასრულდა:**
  - [x] Forum validators (Zod schemas: createThread, updateThread, createReply, updateReply, pagination)
  - [x] Forum service (categories, threads CRUD, replies CRUD, likes for threads and replies)
  - [x] Forum controller
  - [x] Forum routes (`/api/v1/forum/*`)
  - [x] Thread/Reply likes with count tracking
  - [x] Notifications on thread replies
  - [x] Build: ✅ წარმატებული
- [x] **Services Module დასრულდა:**
  - [x] Services validators (Zod schemas: create, update, search, reviews)
  - [x] Services service (CRUD, search, reviews, rating calculation)
  - [x] Services controller
  - [x] Services routes (`/api/v1/services/*`)
  - [x] Review system with rating aggregation
  - [x] Notifications on service reviews
  - [x] Image upload support
  - [x] Build: ✅ წარმატებული

### Session 13 (2026-01-09)
- [x] **Socket.io Module დასრულდა:**
  - [x] Socket.io + Redis adapter setup
  - [x] JWT authentication middleware for sockets
  - [x] Chat handlers (join room, leave room, send message, typing indicators)
  - [x] Online status tracking (user:online, user:offline events)
  - [x] Real-time message delivery to conversation rooms
  - [x] Mark messages as read via socket
  - [x] Utility functions (emitToUser, emitToConversation, isUserOnline)
  - [x] Build: ✅ წარმატებული

### Session 14 (2026-01-09)
- [x] **Admin Module დასრულდა:**
  - [x] Admin validators (Zod schemas: getUsers, changeRole, ban/unban, content queries)
  - [x] Admin service (user management, content moderation, dashboard stats)
  - [x] Admin controller
  - [x] Admin routes (`/api/v1/admin/*`)
  - [x] Role-based access (ADMIN + MODERATOR)
  - [x] User management: list, get, change role, ban/unban, delete
  - [x] Content moderation: posts, comments, listings, forum threads
  - [x] Forum moderation: pin/unpin, lock/unlock threads
  - [x] Dashboard stats: users, content, activity metrics
  - [x] DB Schema updates: isBanned, bannedAt, bannedUntil, banReason, lastLoginAt (User); isDeleted (Comment)
  - [x] Build: ✅ წარმატებული
  - [x] Tested: dashboard ✅, users ✅, posts ✅, listings ✅

### Session 15 (2026-01-09)
- [x] **Frontend Planning დასრულდა:**
  - [x] `docs/FRONTEND_PLAN.md` შეიქმნა (სრული frontend გეგმა)
  - [x] Project structure (lib/, stores/, hooks/, types/, components/)
  - [x] API client architecture (React Query + Axios)
  - [x] State management (Zustand stores)
  - [x] 7 implementation phases (Auth → Profile → Feed → Chat → Marketplace → Forum → Admin)
  - [x] Component specifications (pages, forms, UI elements)
  - [x] Socket.io client integration plan
  - [x] CLAUDE.md განახლება (Quick Start, Documentation Map)
  - [x] MVP_PLAN.md განახლება (Phase 6 details)

### Session 16 (2026-01-09)
- [x] **Frontend Setup Phase დასრულდა:**
  - [x] TypeScript types (`types/api.ts`, `types/auth.ts`, `types/user.ts`, `types/post.ts`, `types/chat.ts`, `types/listing.ts`, `types/forum.ts`)
  - [x] API client with axios (`lib/api/client.ts`) - interceptors, token refresh
  - [x] NextAuth.js configuration (`lib/auth/config.ts`) - JWT strategy, credentials provider
  - [x] Auth API functions (`lib/api/auth.ts`) - register, verifyOtp, forgotPassword, resetPassword
  - [x] Users API functions (`lib/api/users.ts`) - profile, follow, block
  - [x] Media API functions (`lib/api/media.ts`) - avatar, cover upload
  - [x] Zustand stores (`stores/auth.store.ts`, `stores/ui.store.ts`)
  - [x] Auth provider (`providers/auth-provider.tsx`)
  - [x] useAuth hook (`hooks/use-auth.ts`)
  - [x] Providers განახლება SessionProvider + Toaster
  - [x] Settings pages გასუფთავდა (placeholders)
  - [x] Build: ✅ წარმატებული

---

## Next Tasks (Priority Order)

### Phase 6: Admin & Real-time ✅
- [x] Socket.io (real-time chat, typing, online status) ✅
- [x] Admin API ✅
- [x] Content moderation ✅

### Phase 2: Social ✅
- [x] Posts module (CRUD, likes, comments) ✅
- [x] Stories module ✅
- [x] Hashtags ✅

### Phase 3: Communication ✅
- [x] Chat module ✅
- [x] Notifications module ✅
- [x] Socket.io setup ✅

### Phase 4: Marketplace ✅
- [x] Listings module ✅
- [x] Categories ✅
- [x] Search + filters ✅
- [x] Favorites ✅

### Phase 5: Community ✅
- [x] Forum module ✅
- [x] Services module ✅
- [x] Reviews ✅

### Phase 6: Admin & Real-time ✅ (partial)
- [x] Socket.io (real-time chat, typing, online status) ✅
- [ ] Admin API
- [ ] Moderation

### Phase 7: Frontend Integration (საიტის დასრულება)

> **დეტალური გეგმა:** `docs/FRONTEND_PLAN.md`

**Setup Phase:**
- [ ] API client + React Query configuration
- [ ] NextAuth.js setup (JWT strategy)
- [ ] Zustand stores (auth, UI)
- [ ] Socket.io client integration

**Implementation Phases:**
- [ ] Phase 1: Auth (login, register, verify, password reset)
- [ ] Phase 2: Profile (view, edit, follow system)
- [ ] Phase 3: Feed (posts, stories, comments)
- [ ] Phase 4: Chat (conversations, real-time)
- [ ] Phase 5: Marketplace (listings, search, favorites)
- [ ] Phase 6: Forum (threads, replies)
- [ ] Phase 7: Admin panel (dashboard, moderation)

### Phase 8: Mobile App (საიტის შემდეგ)
- [ ] React Native setup
- [ ] All screens (იგივე დიზაინი რაც საიტზე)

---

## Backend Structure

```
rideway-api/
├── src/
│   ├── config/
│   │   ├── index.ts        # Environment config
│   │   ├── database.ts     # Prisma client
│   │   └── r2.ts           # Cloudflare R2 client ✅
│   ├── middleware/
│   │   ├── index.ts        # Exports
│   │   ├── error-handler.ts # AppError class + handler
│   │   ├── async-handler.ts
│   │   ├── validate.ts     # Zod validation (body/params/query)
│   │   ├── auth.ts         # JWT verification ✅
│   │   └── upload.ts       # Multer file upload ✅
│   ├── socket/
│   │   ├── index.ts        # Socket.io setup + auth ✅
│   │   └── handlers/
│   │       └── chat.handler.ts # Chat events ✅
│   ├── routes/
│   │   ├── auth.routes.ts  # Auth routes ✅
│   │   ├── users.routes.ts # Users routes ✅
│   │   ├── media.routes.ts # Media routes ✅
│   │   ├── posts.routes.ts # Posts + Comments routes ✅
│   │   ├── stories.routes.ts # Stories routes ✅
│   │   ├── chat.routes.ts  # Chat routes ✅
│   │   ├── notifications.routes.ts # Notifications routes ✅
│   │   ├── listings.routes.ts # Listings routes ✅
│   │   ├── forum.routes.ts # Forum routes ✅
│   │   ├── services.routes.ts # Services routes ✅
│   │   └── admin.routes.ts # Admin routes ✅
│   ├── controllers/
│   │   ├── auth.controller.ts ✅
│   │   ├── users.controller.ts ✅
│   │   ├── media.controller.ts ✅
│   │   ├── posts.controller.ts ✅
│   │   ├── comments.controller.ts ✅
│   │   ├── stories.controller.ts ✅
│   │   ├── chat.controller.ts ✅
│   │   ├── notifications.controller.ts ✅
│   │   ├── listings.controller.ts ✅
│   │   ├── forum.controller.ts ✅
│   │   ├── services.controller.ts ✅
│   │   └── admin.controller.ts ✅
│   ├── services/
│   │   ├── auth.service.ts ✅
│   │   ├── users.service.ts ✅
│   │   ├── media.service.ts ✅
│   │   ├── posts.service.ts ✅
│   │   ├── comments.service.ts ✅
│   │   ├── stories.service.ts ✅
│   │   ├── chat.service.ts ✅
│   │   ├── notifications.service.ts ✅
│   │   ├── listings.service.ts ✅
│   │   ├── forum.service.ts ✅
│   │   ├── services.service.ts ✅
│   │   └── admin.service.ts ✅
│   ├── validators/
│   │   ├── auth.ts         # Auth Zod schemas ✅
│   │   ├── users.ts        # Users Zod schemas ✅
│   │   ├── posts.ts        # Posts + Comments Zod schemas ✅
│   │   ├── stories.ts      # Stories Zod schemas ✅
│   │   ├── chat.ts         # Chat Zod schemas ✅
│   │   ├── notifications.ts # Notifications Zod schemas ✅
│   │   ├── listings.ts     # Listings Zod schemas ✅
│   │   ├── forum.ts        # Forum Zod schemas ✅
│   │   ├── services.ts     # Services Zod schemas ✅
│   │   └── admin.ts        # Admin Zod schemas ✅
│   ├── types/
│   │   ├── api.ts          # API response types
│   │   └── express.d.ts    # Express extensions
│   ├── utils/
│   │   ├── password.ts     # bcryptjs hashing ✅
│   │   ├── jwt.ts          # JWT utils ✅
│   │   └── otp.ts          # OTP generation ✅
│   ├── app.ts              # Express app
│   └── index.ts            # Entry point
├── prisma/
│   └── schema.prisma       # Full database schema
└── package.json
```

---

## Auth Module API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/auth/register` | POST | - | რეგისტრაცია |
| `/api/v1/auth/verify-otp` | POST | - | OTP დადასტურება |
| `/api/v1/auth/login` | POST | - | შესვლა |
| `/api/v1/auth/refresh` | POST | - | Token განახლება |
| `/api/v1/auth/logout` | POST | ✅ | გამოსვლა |
| `/api/v1/auth/forgot-password` | POST | - | პაროლის აღდგენა |
| `/api/v1/auth/reset-password` | POST | - | პაროლის შეცვლა |
| `/api/v1/auth/resend-otp` | POST | - | OTP ხელახლა გაგზავნა |
| `/api/v1/auth/me` | GET | ✅ | მიმდინარე მომხმარებელი |

---

## Users Module API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/users/search?q=` | GET | ✅ | მომხმარებლების ძებნა |
| `/api/v1/users/me` | PATCH | ✅ | პროფილის განახლება |
| `/api/v1/users/:username` | GET | opt | პროფილის ნახვა |
| `/api/v1/users/:id/followers` | GET | ✅ | მიმდევრების სია |
| `/api/v1/users/:id/following` | GET | ✅ | გამოწერილების სია |
| `/api/v1/users/:id/follow` | POST | ✅ | გამოწერა |
| `/api/v1/users/:id/follow` | DELETE | ✅ | გამოწერის გაუქმება |
| `/api/v1/users/:id/block` | POST | ✅ | დაბლოკვა |
| `/api/v1/users/:id/block` | DELETE | ✅ | ბლოკის მოხსნა |

---

## Media Module API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/media/avatar` | PATCH | ✅ | Avatar-ის ატვირთვა |
| `/api/v1/media/avatar` | DELETE | ✅ | Avatar-ის წაშლა |
| `/api/v1/media/cover` | PATCH | ✅ | Cover-ის ატვირთვა |
| `/api/v1/media/cover` | DELETE | ✅ | Cover-ის წაშლა |

**File Limits:**
- Avatar: 5MB (jpeg, png, webp)
- Cover: 10MB (jpeg, png, webp)
- Post images: 10MB each, max 10 images
- Listing images: 10MB each, max 20 images

---

## Posts Module API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/posts` | POST | ✅ | პოსტის შექმნა (+ images) |
| `/api/v1/posts/feed` | GET | ✅ | Feed (following + own) |
| `/api/v1/posts/trending` | GET | opt | Trending პოსტები |
| `/api/v1/posts/user/:userId` | GET | opt | მომხმარებლის პოსტები |
| `/api/v1/posts/hashtag/:tag` | GET | opt | პოსტები hashtag-ით |
| `/api/v1/posts/:id` | GET | opt | პოსტის ნახვა |
| `/api/v1/posts/:id` | PATCH | ✅ | პოსტის რედაქტირება |
| `/api/v1/posts/:id` | DELETE | ✅ | პოსტის წაშლა |
| `/api/v1/posts/:id/like` | POST | ✅ | ლაიქის toggle |
| `/api/v1/posts/:id/comments` | GET | opt | კომენტარები |
| `/api/v1/posts/:id/comments` | POST | ✅ | კომენტარის დამატება |
| `/api/v1/posts/comments/:commentId` | PATCH | ✅ | კომენტარის რედაქტირება |
| `/api/v1/posts/comments/:commentId` | DELETE | ✅ | კომენტარის წაშლა |
| `/api/v1/posts/comments/:commentId/like` | POST | ✅ | კომენტარის ლაიქი |
| `/api/v1/posts/comments/:commentId/replies` | GET | opt | პასუხები |

---

## Stories Module API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/stories` | POST | ✅ | Story-ის შექმნა (+ media) |
| `/api/v1/stories` | GET | ✅ | Feed stories (grouped by user) |
| `/api/v1/stories/me` | GET | ✅ | ჩემი აქტიური stories |
| `/api/v1/stories/user/:userId` | GET | opt | მომხმარებლის stories |
| `/api/v1/stories/:id` | GET | opt | ერთი story |
| `/api/v1/stories/:id/view` | POST | ✅ | Story-ის ნახვა (mark as viewed) |
| `/api/v1/stories/:id/viewers` | GET | ✅ | ვინ ნახა (owner only) |
| `/api/v1/stories/:id` | DELETE | ✅ | Story-ის წაშლა |

**Story Features:**
- 24-საათიანი ვადა (expiresAt)
- Image + Video support (50MB limit)
- Feed grouped by user, unviewed first
- Own stories first in feed

---

## Chat Module API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/chat/unread` | GET | ✅ | წაუკითხავი შეტყობინებების რაოდენობა |
| `/api/v1/chat/conversations` | GET | ✅ | საუბრების სია |
| `/api/v1/chat/conversations` | POST | ✅ | საუბრის შექმნა/მიღება |
| `/api/v1/chat/conversations/:id/messages` | GET | ✅ | შეტყობინებები |
| `/api/v1/chat/conversations/:id/messages` | POST | ✅ | შეტყობინების გაგზავნა |
| `/api/v1/chat/conversations/:id/read` | POST | ✅ | წაკითხულად მონიშვნა |

**Chat Features:**
- 1-to-1 messaging
- Unread count tracking
- Block checking (can't message blocked users)
- Last message preview in conversations list

---

## Notifications Module API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/notifications` | GET | ✅ | ნოტიფიკაციების სია (paginated) |
| `/api/v1/notifications/unread` | GET | ✅ | წაუკითხავების რაოდენობა |
| `/api/v1/notifications/:id/read` | POST | ✅ | ერთის წაკითხულად მონიშვნა |
| `/api/v1/notifications/read-all` | POST | ✅ | ყველას წაკითხულად მონიშვნა |
| `/api/v1/notifications/:id` | DELETE | ✅ | ნოტიფიკაციის წაშლა |

**Notification Types:**
- NEW_FOLLOWER
- POST_LIKE
- POST_COMMENT
- COMMENT_REPLY
- NEW_MESSAGE
- THREAD_REPLY
- LISTING_INQUIRY
- SERVICE_REVIEW
- STORY_VIEW

---

## Listings Module API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/listings/categories` | GET | - | კატეგორიების სია |
| `/api/v1/listings` | GET | opt | განცხადებების სია (filters) |
| `/api/v1/listings` | POST | ✅ | განცხადების შექმნა |
| `/api/v1/listings/search?q=` | GET | opt | ძებნა |
| `/api/v1/listings/popular` | GET | opt | პოპულარული |
| `/api/v1/listings/user/:userId` | GET | opt | მომხმარებლის განცხადებები |
| `/api/v1/listings/favorites` | GET | ✅ | ჩემი ფავორიტები |
| `/api/v1/listings/:id` | GET | opt | ერთი განცხადება |
| `/api/v1/listings/:id` | PATCH | ✅ | განცხადების რედაქტირება |
| `/api/v1/listings/:id` | DELETE | ✅ | განცხადების წაშლა |
| `/api/v1/listings/:id/sold` | POST | ✅ | გაყიდულად მონიშვნა |
| `/api/v1/listings/:id/favorite` | POST | ✅ | ფავორიტებში დამატება |
| `/api/v1/listings/:id/favorite` | DELETE | ✅ | ფავორიტებიდან წაშლა |

**Listing Features:**
- CRUD operations
- Hierarchical categories
- Search + filters (category, price range, condition, location, brand)
- Favorites (save/unsave)
- Mark as sold
- View count tracking
- Image upload (max 20 images, 10MB each)

---

## Forum Module API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/forum/categories` | GET | - | კატეგორიების სია |
| `/api/v1/forum/threads` | GET | opt | თემების სია (filters) |
| `/api/v1/forum/threads` | POST | ✅ | თემის შექმნა |
| `/api/v1/forum/threads/:id` | GET | opt | ერთი თემა |
| `/api/v1/forum/threads/:id` | PATCH | ✅ | თემის რედაქტირება |
| `/api/v1/forum/threads/:id` | DELETE | ✅ | თემის წაშლა |
| `/api/v1/forum/threads/:id/like` | POST | ✅ | თემის ლაიქი (toggle) |
| `/api/v1/forum/threads/:id/replies` | GET | opt | თემის პასუხები |
| `/api/v1/forum/threads/:id/replies` | POST | ✅ | პასუხის დამატება |
| `/api/v1/forum/replies/:replyId` | PATCH | ✅ | პასუხის რედაქტირება |
| `/api/v1/forum/replies/:replyId` | DELETE | ✅ | პასუხის წაშლა |
| `/api/v1/forum/replies/:replyId/like` | POST | ✅ | პასუხის ლაიქი (toggle) |

**Forum Features:**
- Categories with thread counts
- Threads CRUD with likes
- Replies CRUD with likes
- Pinned/locked threads support
- Notifications on replies
- Sort by: latest, oldest, popular, most_replies

---

## Services Module API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/services/categories` | GET | - | კატეგორიების სია |
| `/api/v1/services` | GET | - | სერვისების სია (filters) |
| `/api/v1/services` | POST | ✅ | სერვისის შექმნა |
| `/api/v1/services/search?q=` | GET | - | ძებნა |
| `/api/v1/services/user/:userId` | GET | - | მომხმარებლის სერვისები |
| `/api/v1/services/:id` | GET | - | ერთი სერვისი |
| `/api/v1/services/:id` | PATCH | ✅ | სერვისის რედაქტირება |
| `/api/v1/services/:id` | DELETE | ✅ | სერვისის წაშლა |
| `/api/v1/services/:id/reviews` | GET | - | სერვისის რევიუები |
| `/api/v1/services/:id/reviews` | POST | ✅ | რევიუს დამატება |
| `/api/v1/services/:id/reviews` | DELETE | ✅ | საკუთარი რევიუს წაშლა |

**Services Features:**
- CRUD operations
- Categories with service counts
- Search by name, description, location
- Reviews with 1-5 star rating
- Automatic rating calculation
- Notifications on reviews
- Image upload (max 10 images, 10MB each)
- Verified services support

---

## Socket.io Events

**Connection:** `ws://localhost:8000` (requires JWT in `auth.token`)

### Client → Server Events

| Event | Data | Description |
|-------|------|-------------|
| `chat:join` | `conversationId: string` | საუბარში შესვლა |
| `chat:leave` | `conversationId: string` | საუბრიდან გამოსვლა |
| `chat:sendMessage` | `{ conversationId, content }` | შეტყობინების გაგზავნა |
| `chat:typing` | `conversationId: string` | წერს... (typing indicator start) |
| `chat:stopTyping` | `conversationId: string` | აღარ წერს (typing indicator stop) |
| `chat:markRead` | `conversationId: string` | შეტყობინებების წაკითხულად მონიშვნა |
| `users:getOnline` | `userIds: string[]` | მომხმარებლების ონლაინ სტატუსი |

### Server → Client Events

| Event | Data | Description |
|-------|------|-------------|
| `chat:newMessage` | `{ conversationId, message }` | ახალი შეტყობინება |
| `chat:typingStart` | `{ conversationId, userId }` | მომხმარებელი წერს |
| `chat:typingStop` | `{ conversationId, userId }` | მომხმარებელმა შეწყვიტა წერა |
| `chat:messagesRead` | `{ conversationId, readBy }` | შეტყობინებები წაიკითხა |
| `user:online` | `{ userId }` | მომხმარებელი ონლაინ გახდა |
| `user:offline` | `{ userId }` | მომხმარებელი ოფლაინ გახდა |

### Connection Example (JavaScript)
```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:8000', {
  auth: { token: 'JWT_ACCESS_TOKEN' }
});

socket.on('connect', () => console.log('Connected'));
socket.on('user:online', ({ userId }) => console.log(`${userId} is online`));
socket.on('chat:newMessage', ({ conversationId, message }) => {
  console.log(`New message in ${conversationId}:`, message);
});

// Join conversation
socket.emit('chat:join', 'conversation-id', (response) => {
  console.log('Joined:', response.success);
});

// Send message
socket.emit('chat:sendMessage', {
  conversationId: 'conversation-id',
  content: 'Hello!'
}, (response) => {
  console.log('Sent:', response.success);
});
```

---

## Admin Module API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/admin/dashboard` | GET | ADMIN/MOD | Dashboard სტატისტიკა |
| `/api/v1/admin/users` | GET | ADMIN/MOD | მომხმარებლების სია (filters) |
| `/api/v1/admin/users/:id` | GET | ADMIN/MOD | მომხმარებლის დეტალები |
| `/api/v1/admin/users/:id/role` | PATCH | ADMIN | როლის შეცვლა |
| `/api/v1/admin/users/:id/ban` | POST | ADMIN/MOD | მომხმარებლის დაბლოკვა |
| `/api/v1/admin/users/:id/unban` | POST | ADMIN/MOD | ბლოკის მოხსნა |
| `/api/v1/admin/users/:id` | DELETE | ADMIN | მომხმარებლის წაშლა |
| `/api/v1/admin/posts` | GET | ADMIN/MOD | პოსტების სია |
| `/api/v1/admin/posts/:id` | DELETE | ADMIN/MOD | პოსტის წაშლა |
| `/api/v1/admin/comments` | GET | ADMIN/MOD | კომენტარების სია |
| `/api/v1/admin/comments/:id` | DELETE | ADMIN/MOD | კომენტარის წაშლა |
| `/api/v1/admin/listings` | GET | ADMIN/MOD | განცხადებების სია |
| `/api/v1/admin/listings/:id` | DELETE | ADMIN/MOD | განცხადების წაშლა |
| `/api/v1/admin/forum/threads` | GET | ADMIN/MOD | ფორუმის თემები |
| `/api/v1/admin/forum/threads/:id` | DELETE | ADMIN/MOD | თემის წაშლა |
| `/api/v1/admin/forum/threads/:id/pin` | POST | ADMIN/MOD | თემის pin/unpin |
| `/api/v1/admin/forum/threads/:id/lock` | POST | ADMIN/MOD | თემის lock/unlock |

**Dashboard Stats:**
- Users: total, newToday, newThisWeek, banned
- Content: posts, comments, listings, forumThreads, services
- Activity: postsToday, messagesToday, newListingsToday

---

## Notes

### Session 1 Notes:
- მომხმარებელი თვითონ მუშაობს პროექტზე (არ აქვს გუნდი)
- სწრაფი დასრულების ტემპი სურს
- საქართველოზეა ფოკუსი
- რეკლამებით მონეტიზაცია
- გადახდა პირადაპირ (myauto.ge-ის მსგავსად)
- **გეგმის ცვლილება:** ჯერ საიტი სრულად (Backend + Frontend), შემდეგ Mobile App

### Technical Decisions:
- Express.js > NestJS (მომხმარებლის არჩევანი)
- Prisma 7 > TypeORM (simpler, better DX)
- Zod > Joi (TypeScript-first)
- ქალაქის დონეზე ლოკაცია (არა GPS)

### Session 3 Notes:
- Prisma 7-ში შეიცვალა კონფიგურაცია - საჭიროა adapter
- დაყენებულია `@prisma/adapter-pg` PostgreSQL-ისთვის
- `npm run dev` - სერვერი port 8000-ზე

### Session 4 Notes:
- Zod 4-ში შეიცვლა API: `AnyZodObject` → `z.ZodSchema`, `errors` → `issues`
- bcryptjs გამოიყენება (არა bcrypt) - უკეთესი cross-platform support
- OTP ლოგში იბეჭდება development-ში: `[DEV] OTP for <userId>: <code>`

---

## Session Log

| Date | Session | Summary |
|------|---------|---------|
| 2026-01-07 | #1 | Planning, requirements, MVP გეგმა |
| 2026-01-08 | #2 | Workflow examples, GitHub/Railway setup, backend repo init |
| 2026-01-08 | #3 | Backend setup: Express.js, TypeScript, Prisma 7, DB schema |
| 2026-01-08 | #4 | Auth module: validators, service, controller, routes, middleware |
| 2026-01-08 | #5 | Users module: profile CRUD, follow/unfollow, block/unblock |
| 2026-01-08 | #6 | Media module: Cloudflare R2, avatar/cover upload/delete |
| 2026-01-09 | #7 | Posts + Comments module: CRUD, likes, hashtags, feed, trending |
| 2026-01-09 | #8 | Stories module: CRUD, 24h expiry, feed grouped by user, view tracking |
| 2026-01-09 | #9 | Chat module: conversations, messages, unread count, mark as read |
| 2026-01-09 | #10 | Notifications module: CRUD, unread count, mark as read |
| 2026-01-09 | #11 | Listings module: CRUD, categories, search, filters, favorites |
| 2026-01-09 | #12 | Forum + Services modules: threads, replies, reviews, ratings |
| 2026-01-09 | #13 | Socket.io: real-time chat, typing indicators, online status, Redis adapter |
| 2026-01-09 | #14 | Admin module: user management, content moderation, dashboard stats |
| 2026-01-09 | #15 | Frontend planning: FRONTEND_PLAN.md, CLAUDE.md, MVP_PLAN.md updates |
| 2026-01-09 | #16 | Frontend setup: types, API client, NextAuth, stores, providers |

---

*Last updated: 2026-01-09 - Session #16*

# Rideway MVP გეგმა

## 📋 პროექტის მიმოხილვა

**Rideway** - მოტოციკლეტის კომუნიტის ყოვლისმომცველი პლატფორმა საქართველოსთვის

### პლატფორმები:
- 🌐 **Web** - Next.js (არსებული plan-frontend-ის გაგრძელება)
- 📱 **Mobile** - React Native (iOS + Android)
- ⚙️ **Backend** - Node.js + Express.js (ნულიდან)

### მონეტიზაცია:
- რეკლამები (ბანერები, სპონსორირებული კონტენტი)

---

## 🏗 Backend არქიტექტურა (Express.js)

### ტექნოლოგიური სტეკი:

| კომპონენტი | ტექნოლოგია |
|------------|------------|
| Framework | Express.js |
| Language | TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis (ioredis) |
| Auth | JWT + Passport.js |
| File Storage | Cloudflare R2 |
| Push Notifications | Firebase Cloud Messaging |
| Real-time | Socket.io |
| Queue | BullMQ |
| Validation | Zod / Joi |
| Email | Resend |

### API სტრუქტურა:

```
rideway-api/
├── src/
│   ├── config/           # კონფიგურაციები
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── r2.ts
│   │   └── firebase.ts
│   │
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # JWT authentication
│   │   ├── validation.ts # Request validation
│   │   ├── rateLimit.ts  # Rate limiting
│   │   └── errorHandler.ts
│   │
│   ├── routes/           # API routes
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── posts.ts
│   │   ├── stories.ts
│   │   ├── chat.ts
│   │   ├── forum.ts
│   │   ├── listings.ts
│   │   ├── services.ts
│   │   ├── notifications.ts
│   │   └── admin.ts
│   │
│   ├── controllers/      # Route handlers
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── posts.controller.ts
│   │   └── ...
│   │
│   ├── services/         # Business logic
│   │   ├── auth.service.ts
│   │   ├── users.service.ts
│   │   ├── posts.service.ts
│   │   ├── media.service.ts
│   │   ├── notification.service.ts
│   │   └── ...
│   │
│   ├── validators/       # Request validation schemas
│   │   ├── auth.validator.ts
│   │   ├── users.validator.ts
│   │   └── ...
│   │
│   ├── types/            # TypeScript types
│   │   ├── auth.types.ts
│   │   ├── users.types.ts
│   │   └── ...
│   │
│   ├── utils/            # Helper functions
│   │   ├── jwt.ts
│   │   ├── otp.ts
│   │   ├── hash.ts
│   │   └── response.ts
│   │
│   ├── socket/           # Socket.io handlers
│   │   ├── index.ts
│   │   ├── chat.socket.ts
│   │   └── notification.socket.ts
│   │
│   ├── jobs/             # Background jobs
│   │   ├── notification.job.ts
│   │   └── cleanup.job.ts
│   │
│   └── app.ts            # Express app setup
│
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/
│
├── tests/
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 📊 Database Schema (Prisma)

### მთავარი მოდელები:

```prisma
// User & Auth
model User {
  id              String    @id @default(uuid())
  email           String?   @unique
  phone           String?   @unique
  passwordHash    String
  username        String    @unique
  fullName        String
  bio             String?
  avatarUrl       String?
  coverUrl        String?
  location        String?   // ქალაქი
  website         String?
  gender          Gender?
  dateOfBirth     DateTime?
  role            Role      @default(USER)
  isVerified      Boolean   @default(false)
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  posts           Post[]
  stories         Story[]
  comments        Comment[]
  likes           Like[]
  followers       Follow[]  @relation("followers")
  following       Follow[]  @relation("following")
  blocks          Block[]   @relation("blocker")
  blockedBy       Block[]   @relation("blocked")
  listings        Listing[]
  services        Service[]
  conversations   ConversationParticipant[]
  messages        Message[]
  notifications   Notification[]
  deviceTokens    DeviceToken[]
  refreshTokens   RefreshToken[]
}

enum Role {
  USER
  MODERATOR
  ADMIN
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

// Social
model Post {
  id          String    @id @default(uuid())
  content     String
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  images      PostImage[]
  likes       Like[]
  comments    Comment[]
  hashtags    PostHashtag[]
  viewCount   Int       @default(0)
  likeCount   Int       @default(0)
  commentCount Int      @default(0)
  shareCount  Int       @default(0)
  isDeleted   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Story {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  mediaUrl    String
  mediaType   MediaType @default(IMAGE)
  views       StoryView[]
  viewCount   Int       @default(0)
  expiresAt   DateTime  // 24 საათში
  createdAt   DateTime  @default(now())
}

enum MediaType {
  IMAGE
  VIDEO
}

// Forum
model ForumThread {
  id          String    @id @default(uuid())
  title       String
  content     String
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  categoryId  String
  category    ForumCategory @relation(fields: [categoryId], references: [id])
  replies     ThreadReply[]
  likes       ThreadLike[]
  viewCount   Int       @default(0)
  replyCount  Int       @default(0)
  isPinned    Boolean   @default(false)
  isLocked    Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Marketplace
model Listing {
  id          String    @id @default(uuid())
  title       String
  description String
  price       Decimal
  currency    String    @default("GEL")
  categoryId  String
  category    ListingCategory @relation(fields: [categoryId], references: [id])
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  images      ListingImage[]
  condition   Condition
  location    String    // ქალაქი
  status      ListingStatus @default(ACTIVE)
  viewCount   Int       @default(0)
  favorites   ListingFavorite[]

  // მოტოსთვის სპეციფიკური
  brand       String?
  model       String?
  year        Int?
  mileage     Int?
  engineSize  Int?      // cc

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum Condition {
  NEW
  LIKE_NEW
  GOOD
  FAIR
  PARTS
}

enum ListingStatus {
  ACTIVE
  SOLD
  RESERVED
  DELETED
}

// Services
model Service {
  id          String    @id @default(uuid())
  name        String
  description String
  categoryId  String
  category    ServiceCategory @relation(fields: [categoryId], references: [id])
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  images      ServiceImage[]
  location    String    // ქალაქი
  address     String?
  phone       String?
  isVerified  Boolean   @default(false)
  rating      Decimal   @default(0)
  reviewCount Int       @default(0)
  reviews     ServiceReview[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Chat
model Conversation {
  id           String    @id @default(uuid())
  participants ConversationParticipant[]
  messages     Message[]
  lastMessage  String?
  lastMessageAt DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Message {
  id             String    @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  senderId       String
  sender         User      @relation(fields: [senderId], references: [id])
  content        String
  isRead         Boolean   @default(false)
  createdAt      DateTime  @default(now())
}

// Notifications
model Notification {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  type      NotificationType
  title     String
  body      String
  data      Json?
  isRead    Boolean   @default(false)
  createdAt DateTime  @default(now())
}

enum NotificationType {
  NEW_FOLLOWER
  POST_LIKE
  POST_COMMENT
  COMMENT_REPLY
  NEW_MESSAGE
  THREAD_REPLY
  LISTING_INQUIRY
  SERVICE_REVIEW
  STORY_VIEW
}
```

---

## 🔌 API Endpoints

### Auth (`/api/v1/auth`)
| Method | Endpoint | აღწერა |
|--------|----------|--------|
| POST | `/register` | რეგისტრაცია |
| POST | `/login` | ლოგინი |
| POST | `/verify-otp` | OTP ვერიფიკაცია |
| POST | `/refresh` | Token განახლება |
| POST | `/logout` | გასვლა |
| POST | `/forgot-password` | პაროლის აღდგენა |
| POST | `/reset-password` | ახალი პაროლი |
| GET | `/me` | მიმდინარე მომხმარებელი |

### Users (`/api/v1/users`)
| Method | Endpoint | აღწერა |
|--------|----------|--------|
| GET | `/me` | ჩემი პროფილი |
| PATCH | `/me` | პროფილის რედაქტირება |
| POST | `/me/avatar` | ავატარის ატვირთვა |
| DELETE | `/me/avatar` | ავატარის წაშლა |
| POST | `/me/cover` | Cover-ის ატვირთვა |
| GET | `/search` | მომხმარებლების ძებნა |
| GET | `/:username` | პროფილის ნახვა |
| GET | `/:id/followers` | Followers სია |
| GET | `/:id/following` | Following სია |
| POST | `/:id/follow` | Follow |
| DELETE | `/:id/follow` | Unfollow |
| POST | `/:id/block` | Block |
| DELETE | `/:id/block` | Unblock |

### Posts (`/api/v1/posts`)
| Method | Endpoint | აღწერა |
|--------|----------|--------|
| POST | `/` | პოსტის შექმნა |
| GET | `/` | ყველა პოსტი |
| GET | `/feed` | პერსონალური Feed |
| GET | `/trending` | Trending პოსტები |
| GET | `/hashtag/:tag` | Hashtag-ით |
| GET | `/user/:userId` | მომხმარებლის პოსტები |
| GET | `/:id` | პოსტის ნახვა |
| PATCH | `/:id` | პოსტის რედაქტირება |
| DELETE | `/:id` | პოსტის წაშლა |
| POST | `/:id/like` | Like/Unlike |
| POST | `/:id/comments` | კომენტარის დამატება |
| GET | `/:id/comments` | კომენტარები |

### Stories (`/api/v1/stories`)
| Method | Endpoint | აღწერა |
|--------|----------|--------|
| POST | `/` | სტორის შექმნა |
| GET | `/` | აქტიური სტორიები |
| GET | `/user/:userId` | მომხმარებლის სტორიები |
| GET | `/:id` | სტორის ნახვა |
| DELETE | `/:id` | სტორის წაშლა |
| POST | `/:id/view` | ნახვის დაფიქსირება |

### Chat (`/api/v1/chat`)
| Method | Endpoint | აღწერა |
|--------|----------|--------|
| GET | `/conversations` | მიმოწერები |
| POST | `/conversations` | მიმოწერის შექმნა |
| GET | `/conversations/:id` | მიმოწერის დეტალები |
| GET | `/conversations/:id/messages` | შეტყობინებები |
| POST | `/conversations/:id/messages` | შეტყობინების გაგზავნა |
| POST | `/conversations/:id/read` | წაკითხულად მონიშვნა |
| DELETE | `/messages/:id` | შეტყობინების წაშლა |

### Forum (`/api/v1/forum`)
| Method | Endpoint | აღწერა |
|--------|----------|--------|
| GET | `/categories` | კატეგორიები |
| POST | `/threads` | თემის შექმნა |
| GET | `/threads` | თემების სია |
| GET | `/threads/:id` | თემის ნახვა |
| PATCH | `/threads/:id` | თემის რედაქტირება |
| DELETE | `/threads/:id` | თემის წაშლა |
| POST | `/threads/:id/like` | Like |
| POST | `/threads/:id/replies` | პასუხის დამატება |
| GET | `/threads/:id/replies` | პასუხები |

### Listings (`/api/v1/listings`)
| Method | Endpoint | აღწერა |
|--------|----------|--------|
| POST | `/` | განცხადების შექმნა |
| GET | `/` | განცხადებები (ფილტრებით) |
| GET | `/categories` | კატეგორიები |
| GET | `/search` | ძებნა |
| GET | `/popular` | პოპულარული |
| GET | `/user/:userId` | მომხმარებლის განცხადებები |
| GET | `/:id` | განცხადების ნახვა |
| PATCH | `/:id` | რედაქტირება |
| DELETE | `/:id` | წაშლა |
| POST | `/:id/sold` | გაყიდულად მონიშვნა |
| POST | `/:id/favorite` | Favorite-ში დამატება |
| DELETE | `/:id/favorite` | Favorite-დან წაშლა |

### Services (`/api/v1/services`)
| Method | Endpoint | აღწერა |
|--------|----------|--------|
| POST | `/` | სერვისის შექმნა |
| GET | `/` | სერვისები (ფილტრებით) |
| GET | `/categories` | კატეგორიები |
| GET | `/:id` | სერვისის ნახვა |
| PATCH | `/:id` | რედაქტირება |
| DELETE | `/:id` | წაშლა |
| POST | `/:id/reviews` | რევიუს დამატება |
| GET | `/:id/reviews` | რევიუები |

### Notifications (`/api/v1/notifications`)
| Method | Endpoint | აღწერა |
|--------|----------|--------|
| GET | `/` | ნოტიფიკაციები |
| POST | `/:id/read` | წაკითხულად მონიშვნა |
| POST | `/read-all` | ყველა წაკითხული |
| GET | `/unread-count` | წაუკითხავების რაოდენობა |
| DELETE | `/:id` | წაშლა |

### Admin (`/api/v1/admin`)
| Method | Endpoint | აღწერა |
|--------|----------|--------|
| GET | `/users` | მომხმარებლები |
| PATCH | `/users/:id` | მომხმარებლის რედაქტირება |
| POST | `/users/:id/ban` | ბანი |
| DELETE | `/users/:id/ban` | ბანის მოხსნა |
| GET | `/posts` | პოსტები |
| DELETE | `/posts/:id` | პოსტის წაშლა |
| GET | `/listings` | განცხადებები |
| DELETE | `/listings/:id` | განცხადების წაშლა |
| POST | `/services/:id/verify` | სერვისის ვერიფიკაცია |
| GET | `/reports` | რეპორტები |
| PATCH | `/reports/:id` | რეპორტის განხილვა |

---

## 🚀 MVP განვითარების ფაზები

> **გეგმა: ჯერ საიტი სრულად (Backend + Frontend), შემდეგ Mobile App**

### ფაზა 1: Backend Foundation
- [ ] Express.js პროექტის სტრუქტურა
- [ ] TypeScript კონფიგურაცია
- [ ] Prisma + PostgreSQL setup
- [ ] Redis setup
- [ ] Auth სისტემა (JWT, OTP)
- [ ] Error handling + validation
- [ ] Rate limiting

### ფაზა 2: Backend - Core Features
- [ ] Users module (პროფილები, follow, block)
- [ ] Media upload (R2)
- [ ] Posts module (CRUD, likes, comments)
- [ ] Stories module
- [ ] Chat module (real-time)

### ფაზა 3: Backend - Community Features
- [ ] Forum module
- [ ] Hashtags + trending
- [ ] Search functionality

### ფაზა 4: Backend - Marketplace & Services
- [ ] Listings module
- [ ] Categories management
- [ ] Services module
- [ ] Reviews system

### ფაზა 5: Backend - Engagement & Admin
- [ ] Notifications (in-app + push)
- [ ] Socket.io integration
- [ ] Admin panel API

### ფაზა 6: Frontend Integration (საიტის დასრულება)

> **დეტალური გეგმა:** იხილე `docs/FRONTEND_PLAN.md`

**Setup Phase:**
- [ ] API client + React Query configuration
- [ ] NextAuth.js setup (JWT strategy)
- [ ] Zustand stores (auth, UI)
- [ ] Socket.io client integration

**Implementation Phases (1-7):**
- [ ] Phase 1: Auth (login, register, verify OTP, password reset)
- [ ] Phase 2: Profile (view, edit, follow system)
- [ ] Phase 3: Feed (posts, stories, comments)
- [ ] Phase 4: Chat (conversations, real-time messaging)
- [ ] Phase 5: Marketplace (listings, search, favorites)
- [ ] Phase 6: Forum (threads, replies, categories)
- [ ] Phase 7: Admin panel (dashboard, moderation)

### ფაზა 7: Mobile App (საიტის შემდეგ)
- [ ] React Native project setup
- [ ] API integration
- [ ] All screens (იგივე დიზაინი რაც საიტზე)
- [ ] Push notifications
- [ ] App Store / Play Store submission

---

## 📂 Marketplace კატეგორიები

```
მარკეტპლეისი
├── 🏍 მოტოციკლები
│   ├── სპორტბაიკი
│   ├── ნეიკედი
│   ├── ტურისტული
│   ├── ჩოპერი/კრუიზერი
│   ├── ენდურო/მოტარდი
│   ├── სკუტერი
│   └── სხვა
│
├── 🔧 ნაწილები
│   ├── ძრავა და ტრანსმისია
│   ├── სამუხრუჭე სისტემა
│   ├── ელექტრონიკა
│   ├── კარკასი
│   ├── განათება
│   ├── გამონაბოლქვი
│   └── სხვა
│
├── 🦺 ეკიპირება
│   ├── ჩაფხუტები
│   ├── ხელთათმანები
│   ├── ბოთები
│   ├── ზურგის დაცვა
│   ├── მუხლის დაცვა
│   └── სხვა
│
└── 👕 ტანსაცმელი
    ├── ქურთუკები
    ├── შარვლები
    ├── სრული ტანსაცმელი
    └── სხვა
```

---

## 🔧 Services კატეგორიები

```
სერვისები
├── 🔧 სერვის-ცენტრები
├── 🎨 ტიუნინგი/კასტომიზაცია
├── 🖌 შეღებვა
├── 🛞 საბურავები
├── 📋 ტექ-დათვალიერება
├── 🚗 ტრანსპორტირება
├── 📸 ფოტო/ვიდეო
└── 📚 სასწავლო
```

---

## 🌍 ქალაქები (საქართველო)

```
- თბილისი
- ბათუმი
- ქუთაისი
- რუსთავი
- გორი
- ზუგდიდი
- ფოთი
- ხაშური
- სამტრედია
- სენაკი
- მარნეული
- თელავი
- ახალციხე
- ქობულეთი
- ოზურგეთი
- კასპი
- ჭიათურა
- წყალტუბო
- საგარეჯო
- გარდაბანი
- ბორჯომი
- ლანჩხუთი
- მცხეთა
- სხვა
```

---

## ✅ შემდეგი ნაბიჯები

1. **Express.js პროექტის ინიციალიზაცია**
   - TypeScript setup
   - Folder structure
   - Basic middleware

2. **Database setup**
   - Prisma schema
   - PostgreSQL connection
   - Initial migrations

3. **Auth module**
   - Registration
   - Login with JWT
   - OTP verification

4. **გაგრძელება მოდულებით...**

---

*გენერირებულია: 2026-01-07*

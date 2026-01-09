# Frontend Implementation Plan

> **გამოყენება:** Frontend-ზე მუშაობისას წაიკითხე ეს გეგმა.
> დამატებით: `DESIGN_SYSTEM.md` (UI), `API.md` (endpoints)

---

## Quick Reference

| რას აკეთებ | წაიკითხე |
|------------|----------|
| Auth pages | Phase 1, API.md → Auth |
| Profile pages | Phase 2, API.md → Users |
| Feed/Posts | Phase 3, API.md → Posts |
| Chat | Phase 4, API.md → Chat, Socket.io |
| Marketplace | Phase 5, API.md → Listings |
| Forum | Phase 6, API.md → Forum |
| Admin panel | Phase 7, API.md → Admin |
| UI კომპონენტები | DESIGN_SYSTEM.md |

---

## Tech Stack

```
Framework:      Next.js 14 (App Router)
State:          Zustand + React Query (TanStack Query)
Auth:           NextAuth.js v5
Forms:          React Hook Form + Zod
UI:             Tailwind CSS + shadcn/ui + Radix UI
Real-time:      Socket.io-client
HTTP:           Axios (with interceptors)
Icons:          Lucide React
```

---

## Project Structure

```
plan-frontend/src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (no layout)
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify/
│   │   └── forgot-password/
│   ├── (main)/                   # Main app (with sidebar)
│   │   ├── page.tsx              # Feed
│   │   ├── explore/
│   │   ├── [username]/           # Profile
│   │   ├── post/[id]/
│   │   ├── marketplace/
│   │   ├── forum/
│   │   ├── services/
│   │   ├── messages/
│   │   ├── notifications/
│   │   └── settings/
│   ├── (admin)/                  # Admin panel
│   │   └── admin/
│   ├── api/                      # API routes (NextAuth)
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                       # shadcn/ui (არსებული ✅)
│   ├── shared/                   # Shared components (ნაწილობრივ ✅)
│   ├── layout/                   # Layout components (ნაწილობრივ ✅)
│   ├── auth/                     # Auth-specific
│   ├── feed/                     # Feed/Posts
│   ├── profile/                  # Profile
│   ├── chat/                     # Chat/Messages
│   ├── marketplace/              # Listings
│   ├── forum/                    # Forum
│   └── admin/                    # Admin panel
│
├── lib/
│   ├── api/                      # API client
│   │   ├── client.ts             # Axios instance
│   │   ├── auth.ts               # Auth API
│   │   ├── users.ts              # Users API
│   │   ├── posts.ts              # Posts API
│   │   ├── chat.ts               # Chat API
│   │   ├── listings.ts           # Listings API
│   │   ├── forum.ts              # Forum API
│   │   └── admin.ts              # Admin API
│   ├── socket.ts                 # Socket.io client
│   ├── auth.ts                   # NextAuth config
│   ├── utils.ts                  # Utilities (არსებული ✅)
│   └── validations/              # Zod schemas
│
├── stores/                       # Zustand stores
│   ├── auth.store.ts
│   ├── user.store.ts
│   ├── chat.store.ts
│   └── notification.store.ts
│
├── hooks/                        # Custom hooks
│   ├── use-auth.ts
│   ├── use-socket.ts
│   ├── use-infinite-scroll.ts
│   └── use-media-upload.ts
│
├── types/                        # TypeScript types
│   ├── api.ts
│   ├── user.ts
│   ├── post.ts
│   ├── chat.ts
│   └── listing.ts
│
└── providers/                    # React providers (ნაწილობრივ ✅)
    ├── providers.tsx
    ├── auth-provider.tsx
    ├── query-provider.tsx
    └── socket-provider.tsx
```

---

## არსებული კომპონენტები

### UI Components (shadcn/ui) ✅
```
button, card, input, textarea, select, dialog, dropdown-menu,
tabs, avatar, badge, skeleton, alert-dialog, label, checkbox,
switch, separator, sheet, tooltip, popover, scroll-area, command,
form, sonner, progress, slider
```

### Shared Components ✅
```
empty-state, skeleton-card, skeleton-list, page-loading,
page-header, confirm-dialog, spinner, image-upload, theme-toggle,
loading, error-boundary, infinite-scroll, user-avatar, optimized-image
```

### Layout Components ✅
```
header, sidebar, footer, mobile-nav
```

---

## შესაქმნელი კომპონენტები

### Auth Components
| Component | Description |
|-----------|-------------|
| `LoginForm` | Email/password login |
| `RegisterForm` | Registration form |
| `OtpVerification` | OTP input component |
| `ForgotPasswordForm` | Password reset request |
| `ResetPasswordForm` | New password form |

### Feed Components
| Component | Description |
|-----------|-------------|
| `PostCard` | Single post display |
| `PostForm` | Create/edit post |
| `PostActions` | Like, comment, share buttons |
| `CommentList` | Comments with replies |
| `CommentForm` | Add comment |
| `StoryBar` | Horizontal stories carousel |
| `StoryViewer` | Full-screen story view |
| `HashtagBadge` | Clickable hashtag |

### Profile Components
| Component | Description |
|-----------|-------------|
| `ProfileHeader` | Avatar, cover, stats, actions |
| `ProfileTabs` | Posts, likes, media tabs |
| `FollowButton` | Follow/unfollow with state |
| `UserCard` | User list item (followers, search) |
| `EditProfileForm` | Profile edit modal |

### Chat Components
| Component | Description |
|-----------|-------------|
| `ConversationList` | Chat list sidebar |
| `ConversationItem` | Single chat preview |
| `ChatWindow` | Messages view |
| `MessageBubble` | Single message |
| `MessageInput` | Text input + send |
| `TypingIndicator` | "typing..." animation |
| `OnlineStatus` | Green dot indicator |

### Marketplace Components
| Component | Description |
|-----------|-------------|
| `ListingCard` | Listing preview card |
| `ListingGrid` | Grid/list toggle view |
| `ListingFilters` | Category, price, condition |
| `ListingForm` | Create/edit listing |
| `ListingGallery` | Image carousel |
| `PriceTag` | Formatted price display |
| `CategorySelector` | Hierarchical categories |

### Forum Components
| Component | Description |
|-----------|-------------|
| `ThreadCard` | Thread preview |
| `ThreadView` | Full thread with replies |
| `ThreadForm` | Create thread |
| `ReplyForm` | Reply to thread |
| `CategoryList` | Forum categories |

### Admin Components
| Component | Description |
|-----------|-------------|
| `AdminSidebar` | Admin navigation |
| `DashboardStats` | Stats cards |
| `UsersTable` | Users management table |
| `ContentTable` | Posts/comments table |
| `BanUserModal` | Ban user dialog |

---

## State Management

### Zustand Stores

#### `auth.store.ts`
```typescript
interface AuthStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}
```

#### `chat.store.ts`
```typescript
interface ChatStore {
  conversations: Conversation[];
  activeConversation: string | null;
  unreadCount: number;
  typingUsers: Record<string, string[]>;
  setActiveConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  markAsRead: (conversationId: string) => void;
}
```

#### `notification.store.ts`
```typescript
interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}
```

### React Query Keys
```typescript
const queryKeys = {
  // Auth
  me: ['auth', 'me'],

  // Users
  user: (username: string) => ['users', username],
  followers: (userId: string) => ['users', userId, 'followers'],
  following: (userId: string) => ['users', userId, 'following'],

  // Posts
  feed: ['posts', 'feed'],
  trending: ['posts', 'trending'],
  userPosts: (userId: string) => ['posts', 'user', userId],
  post: (id: string) => ['posts', id],
  comments: (postId: string) => ['posts', postId, 'comments'],

  // Stories
  stories: ['stories'],

  // Chat
  conversations: ['chat', 'conversations'],
  messages: (conversationId: string) => ['chat', conversationId, 'messages'],

  // Listings
  listings: (filters: object) => ['listings', filters],
  listing: (id: string) => ['listings', id],
  categories: ['listings', 'categories'],

  // Forum
  threads: (categoryId?: string) => ['forum', 'threads', categoryId],
  thread: (id: string) => ['forum', 'thread', id],

  // Notifications
  notifications: ['notifications'],
  unreadCount: ['notifications', 'unread'],

  // Admin
  adminUsers: (filters: object) => ['admin', 'users', filters],
  adminStats: ['admin', 'dashboard'],
};
```

---

## API Client Setup

### `lib/api/client.ts`
```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken(); // from cookie/storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401, refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh token
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return apiClient.request(error.config);
      }
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Socket.io Integration

### `lib/socket.ts`
```typescript
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(token: string) {
  socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
    auth: { token },
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
```

### `providers/socket-provider.tsx`
```typescript
// Provides socket context to app
// Connects on auth, disconnects on logout
// Handles reconnection
```

---

## Implementation Phases

### Phase 1: Foundation & Auth (სესია 1-2)
**Priority: Critical**

#### Tasks:
- [ ] API client setup (`lib/api/client.ts`)
- [ ] Type definitions (`types/*.ts`)
- [ ] NextAuth.js configuration
- [ ] Auth store (Zustand)
- [ ] Auth API functions
- [ ] Login page + form
- [ ] Register page + form
- [ ] OTP verification page
- [ ] Forgot/reset password pages
- [ ] Protected route middleware
- [ ] Auth provider

#### Pages:
```
/login
/register
/verify?userId=xxx
/forgot-password
/reset-password?userId=xxx&code=xxx
```

#### Components:
```
components/auth/
├── login-form.tsx
├── register-form.tsx
├── otp-form.tsx
├── forgot-password-form.tsx
└── reset-password-form.tsx
```

---

### Phase 2: Profile & Users (სესია 3-4)
**Priority: High**

#### Tasks:
- [ ] Users API functions
- [ ] Profile page layout
- [ ] Profile header component
- [ ] Follow/unfollow functionality
- [ ] Followers/following pages
- [ ] User search
- [ ] Edit profile modal
- [ ] Settings pages (profile, account, privacy, security)
- [ ] Block/unblock functionality

#### Pages:
```
/[username]
/[username]/followers
/[username]/following
/settings/profile
/settings/account
/settings/privacy
/settings/security
/settings/blocked
```

#### Components:
```
components/profile/
├── profile-header.tsx
├── profile-tabs.tsx
├── follow-button.tsx
├── user-card.tsx
├── user-list.tsx
├── edit-profile-modal.tsx
└── cover-upload.tsx
```

---

### Phase 3: Feed & Posts (სესია 5-6)
**Priority: High**

#### Tasks:
- [ ] Posts API functions
- [ ] Feed page with infinite scroll
- [ ] Post card component
- [ ] Create post form (with image upload)
- [ ] Post detail page
- [ ] Like/unlike functionality
- [ ] Comments system
- [ ] Hashtag pages
- [ ] Trending posts
- [ ] Stories (create, view, carousel)

#### Pages:
```
/ (feed)
/explore
/post/[id]
/hashtag/[tag]
```

#### Components:
```
components/feed/
├── post-card.tsx
├── post-form.tsx
├── post-actions.tsx
├── post-menu.tsx
├── comment-list.tsx
├── comment-form.tsx
├── comment-item.tsx
├── story-bar.tsx
├── story-item.tsx
├── story-viewer.tsx
└── hashtag-badge.tsx
```

---

### Phase 4: Chat & Real-time (სესია 7-8)
**Priority: High**

#### Tasks:
- [ ] Socket.io client setup
- [ ] Socket provider
- [ ] Chat store (Zustand)
- [ ] Chat API functions
- [ ] Conversations list
- [ ] Chat window
- [ ] Send/receive messages
- [ ] Typing indicators
- [ ] Online status
- [ ] Read receipts
- [ ] Notifications store
- [ ] Notification dropdown
- [ ] Push notification setup

#### Pages:
```
/messages
/messages/[conversationId]
/notifications
```

#### Components:
```
components/chat/
├── conversation-list.tsx
├── conversation-item.tsx
├── chat-window.tsx
├── message-list.tsx
├── message-bubble.tsx
├── message-input.tsx
├── typing-indicator.tsx
└── online-status.tsx

components/notifications/
├── notification-dropdown.tsx
├── notification-item.tsx
└── notification-list.tsx
```

---

### Phase 5: Marketplace (სესია 9-10)
**Priority: Medium**

#### Tasks:
- [ ] Listings API functions
- [ ] Listings page with filters
- [ ] Listing card component
- [ ] Listing detail page
- [ ] Create listing form (multi-image)
- [ ] Categories navigation
- [ ] Search functionality
- [ ] Favorites
- [ ] My listings page
- [ ] Mark as sold

#### Pages:
```
/marketplace
/marketplace/[id]
/marketplace/create
/marketplace/category/[slug]
/marketplace/favorites
/marketplace/my-listings
```

#### Components:
```
components/marketplace/
├── listing-card.tsx
├── listing-grid.tsx
├── listing-filters.tsx
├── listing-form.tsx
├── listing-gallery.tsx
├── category-nav.tsx
├── price-input.tsx
├── condition-select.tsx
└── favorite-button.tsx
```

---

### Phase 6: Forum & Services (სესია 11-12)
**Priority: Medium**

#### Tasks:
- [ ] Forum API functions
- [ ] Forum categories page
- [ ] Threads list
- [ ] Thread detail page
- [ ] Create thread form
- [ ] Reply system
- [ ] Thread likes
- [ ] Services API functions
- [ ] Services list page
- [ ] Service detail page
- [ ] Reviews system

#### Pages:
```
/forum
/forum/[categorySlug]
/forum/thread/[id]
/forum/create
/services
/services/[id]
/services/category/[slug]
```

#### Components:
```
components/forum/
├── category-card.tsx
├── thread-card.tsx
├── thread-view.tsx
├── thread-form.tsx
├── reply-list.tsx
├── reply-form.tsx
└── reply-item.tsx

components/services/
├── service-card.tsx
├── service-filters.tsx
├── review-list.tsx
├── review-form.tsx
└── rating-stars.tsx
```

---

### Phase 7: Admin Panel (სესია 13-14)
**Priority: Low**

#### Tasks:
- [ ] Admin API functions
- [ ] Admin layout
- [ ] Dashboard with stats
- [ ] Users management table
- [ ] Ban/unban users
- [ ] Change user roles
- [ ] Content moderation (posts, comments)
- [ ] Listings moderation
- [ ] Forum moderation (pin, lock, delete)

#### Pages:
```
/admin
/admin/users
/admin/posts
/admin/comments
/admin/listings
/admin/forum
```

#### Components:
```
components/admin/
├── admin-sidebar.tsx
├── dashboard-stats.tsx
├── users-table.tsx
├── content-table.tsx
├── ban-user-modal.tsx
├── role-select.tsx
└── moderation-actions.tsx
```

---

## Environment Variables

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Optional: Analytics, etc.
```

---

## Testing Checklist (Each Phase)

- [ ] All pages render without errors
- [ ] API calls work correctly
- [ ] Error states handled
- [ ] Loading states shown
- [ ] Mobile responsive
- [ ] Keyboard navigation
- [ ] Form validation
- [ ] Auth protection works

---

## Notes

### Session 1 დაწყებისას:
1. წაიკითხე ეს ფაილი სრულად
2. Phase 1 დაიწყე: API client + Auth
3. PROGRESS.md-ში მიუთითე: "Frontend Phase 1"

### კონვენციები:
- Server Components by default
- 'use client' მხოლოდ საჭიროებისამებრ
- React Query - server state
- Zustand - client state only
- Zod - ყველა ფორმის validation

---

*Last updated: 2026-01-09*

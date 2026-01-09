// API Response Types

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Query Keys
export const queryKeys = {
  // Auth
  me: ['auth', 'me'] as const,

  // Users
  user: (username: string) => ['users', username] as const,
  followers: (userId: string) => ['users', userId, 'followers'] as const,
  following: (userId: string) => ['users', userId, 'following'] as const,
  searchUsers: (query: string) => ['users', 'search', query] as const,

  // Posts
  feed: ['posts', 'feed'] as const,
  trending: ['posts', 'trending'] as const,
  userPosts: (userId: string) => ['posts', 'user', userId] as const,
  post: (id: string) => ['posts', id] as const,
  comments: (postId: string) => ['posts', postId, 'comments'] as const,
  hashtag: (tag: string) => ['posts', 'hashtag', tag] as const,

  // Stories
  stories: ['stories'] as const,
  myStories: ['stories', 'me'] as const,
  userStories: (userId: string) => ['stories', 'user', userId] as const,

  // Chat
  conversations: ['chat', 'conversations'] as const,
  messages: (conversationId: string) =>
    ['chat', conversationId, 'messages'] as const,
  unreadMessages: ['chat', 'unread'] as const,

  // Listings
  listings: (filters: Record<string, unknown>) => ['listings', filters] as const,
  listing: (id: string) => ['listings', id] as const,
  listingCategories: ['listings', 'categories'] as const,
  popularListings: ['listings', 'popular'] as const,
  favoriteListings: ['listings', 'favorites'] as const,
  userListings: (userId: string) => ['listings', 'user', userId] as const,

  // Forum
  forumCategories: ['forum', 'categories'] as const,
  threads: (categoryId?: string) => ['forum', 'threads', categoryId] as const,
  thread: (id: string) => ['forum', 'thread', id] as const,
  threadReplies: (threadId: string) =>
    ['forum', 'thread', threadId, 'replies'] as const,

  // Services
  serviceCategories: ['services', 'categories'] as const,
  services: (filters: Record<string, unknown>) => ['services', filters] as const,
  service: (id: string) => ['services', id] as const,
  serviceReviews: (serviceId: string) =>
    ['services', serviceId, 'reviews'] as const,

  // Notifications
  notifications: ['notifications'] as const,
  unreadCount: ['notifications', 'unread'] as const,

  // Admin
  adminStats: ['admin', 'dashboard'] as const,
  adminUsers: (filters: Record<string, unknown>) =>
    ['admin', 'users', filters] as const,
  adminUser: (userId: string) => ['admin', 'user', userId] as const,
  adminPosts: (filters: Record<string, unknown>) =>
    ['admin', 'posts', filters] as const,
  adminComments: (filters: Record<string, unknown>) =>
    ['admin', 'comments', filters] as const,
  adminListings: (filters: Record<string, unknown>) =>
    ['admin', 'listings', filters] as const,
  adminForumThreads: (filters: Record<string, unknown>) =>
    ['admin', 'forum', 'threads', filters] as const,
} as const;

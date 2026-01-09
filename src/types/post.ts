// Post Types

import type { UserCard } from './user';

export interface Post {
  id: string;
  content: string;
  images: PostImage[];
  author: UserCard;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  hashtags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PostImage {
  id: string;
  url: string;
  order: number;
}

export interface CreatePostData {
  content: string;
  images?: File[];
}

export interface UpdatePostData {
  content?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: UserCard;
  postId: string;
  parentId: string | null;
  likesCount: number;
  repliesCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentData {
  content: string;
  parentId?: string;
}

export interface Story {
  id: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  author: UserCard;
  viewsCount: number;
  isViewed?: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface StoryGroup {
  user: UserCard;
  stories: Story[];
  hasUnviewed: boolean;
}

export interface CreateStoryData {
  media: File;
}

export interface Hashtag {
  id: string;
  name: string;
  postsCount: number;
}

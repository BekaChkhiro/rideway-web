import { apiClient } from './client';
import type {
  ApiResponse,
  PaginationMeta,
  Post,
  Comment,
  CreatePostData,
  UpdatePostData,
  CreateCommentData,
  Hashtag,
} from '@/types';

// ==================== Feed ====================

// Get feed (posts from following + own posts)
export async function getFeed(
  page = 1,
  limit = 10
): Promise<{ posts: Post[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<Post[]> & { meta: PaginationMeta }
  >('/posts/feed', {
    params: { page, limit },
  });
  return { posts: response.data.data, meta: response.data.meta! };
}

// Get trending posts
export async function getTrendingPosts(
  page = 1,
  limit = 10
): Promise<{ posts: Post[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<Post[]> & { meta: PaginationMeta }
  >('/posts/trending', {
    params: { page, limit },
  });
  return { posts: response.data.data, meta: response.data.meta! };
}

// Get posts by hashtag
export async function getPostsByHashtag(
  tag: string,
  page = 1,
  limit = 10
): Promise<{ posts: Post[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<Post[]> & { meta: PaginationMeta }
  >(`/posts/hashtag/${encodeURIComponent(tag)}`, {
    params: { page, limit },
  });
  return { posts: response.data.data, meta: response.data.meta! };
}

// Get posts by user
export async function getPostsByUser(
  userId: string,
  page = 1,
  limit = 10
): Promise<{ posts: Post[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<Post[]> & { meta: PaginationMeta }
  >(`/posts/user/${userId}`, {
    params: { page, limit },
  });
  return { posts: response.data.data, meta: response.data.meta! };
}

// ==================== Post CRUD ====================

// Get single post
export async function getPost(postId: string): Promise<Post> {
  const response = await apiClient.get<ApiResponse<Post>>(`/posts/${postId}`);
  return response.data.data;
}

// Create post
export async function createPost(data: CreatePostData): Promise<Post> {
  const formData = new FormData();
  formData.append('content', data.content);

  if (data.images && data.images.length > 0) {
    data.images.forEach((image) => {
      formData.append('images', image);
    });
  }

  const response = await apiClient.post<ApiResponse<Post>>('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
}

// Update post
export async function updatePost(
  postId: string,
  data: UpdatePostData
): Promise<Post> {
  const response = await apiClient.patch<ApiResponse<Post>>(
    `/posts/${postId}`,
    data
  );
  return response.data.data;
}

// Delete post
export async function deletePost(postId: string): Promise<void> {
  await apiClient.delete(`/posts/${postId}`);
}

// Toggle like on post
export async function togglePostLike(
  postId: string
): Promise<{ isLiked: boolean; likesCount: number }> {
  const response = await apiClient.post<
    ApiResponse<{ isLiked: boolean; likesCount: number }>
  >(`/posts/${postId}/like`);
  return response.data.data;
}

// ==================== Comments ====================

// Get comments for post
export async function getComments(
  postId: string,
  page = 1,
  limit = 20
): Promise<{ comments: Comment[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<Comment[]> & { meta: PaginationMeta }
  >(`/posts/${postId}/comments`, {
    params: { page, limit },
  });
  return { comments: response.data.data, meta: response.data.meta! };
}

// Create comment
export async function createComment(
  postId: string,
  data: CreateCommentData
): Promise<Comment> {
  const response = await apiClient.post<ApiResponse<Comment>>(
    `/posts/${postId}/comments`,
    data
  );
  return response.data.data;
}

// Update comment
export async function updateComment(
  commentId: string,
  content: string
): Promise<Comment> {
  const response = await apiClient.patch<ApiResponse<Comment>>(
    `/posts/comments/${commentId}`,
    { content }
  );
  return response.data.data;
}

// Delete comment
export async function deleteComment(commentId: string): Promise<void> {
  await apiClient.delete(`/posts/comments/${commentId}`);
}

// Toggle like on comment
export async function toggleCommentLike(
  commentId: string
): Promise<{ isLiked: boolean; likesCount: number }> {
  const response = await apiClient.post<
    ApiResponse<{ isLiked: boolean; likesCount: number }>
  >(`/posts/comments/${commentId}/like`);
  return response.data.data;
}

// Get replies for comment
export async function getCommentReplies(
  commentId: string,
  page = 1,
  limit = 10
): Promise<{ replies: Comment[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<Comment[]> & { meta: PaginationMeta }
  >(`/posts/comments/${commentId}/replies`, {
    params: { page, limit },
  });
  return { replies: response.data.data, meta: response.data.meta! };
}

// ==================== Hashtags ====================

// Get trending hashtags
export async function getTrendingHashtags(limit = 10): Promise<Hashtag[]> {
  const response = await apiClient.get<ApiResponse<Hashtag[]>>(
    '/posts/hashtags/trending',
    {
      params: { limit },
    }
  );
  return response.data.data;
}

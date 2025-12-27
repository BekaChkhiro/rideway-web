import { toast as sonnerToast, type ExternalToast } from 'sonner';

type ToastOptions = ExternalToast;

// Toast helper functions with consistent styling

export const toast = {
  // Success toast
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      ...options,
    });
  },

  // Error toast
  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      duration: 5000,
      ...options,
    });
  },

  // Info toast
  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      ...options,
    });
  },

  // Warning toast
  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      duration: 5000,
      ...options,
    });
  },

  // Loading toast (returns dismiss function)
  loading: (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(message, {
      ...options,
    });
  },

  // Promise toast for async operations
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },

  // Custom toast (using message with custom content)
  custom: (message: string, options?: ToastOptions) => {
    return sonnerToast.message(message, options);
  },

  // Dismiss toast
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },

  // Message toast (default)
  message: (message: string, options?: ToastOptions) => {
    return sonnerToast.message(message, options);
  },
};

// Specific toast helpers for common actions

export const showSuccessToast = (message: string) => toast.success(message);
export const showErrorToast = (message: string) => toast.error(message);
export const showInfoToast = (message: string) => toast.info(message);
export const showWarningToast = (message: string) => toast.warning(message);

// Action-specific toasts
export const toastActions = {
  // Auth
  loginSuccess: () => toast.success('Welcome back!'),
  loginError: () => toast.error('Login failed. Please check your credentials.'),
  logoutSuccess: () => toast.success('Logged out successfully'),
  registerSuccess: () => toast.success('Account created successfully!'),
  passwordResetSent: () => toast.success('Password reset email sent!'),
  passwordChanged: () => toast.success('Password changed successfully!'),

  // Profile
  profileUpdated: () => toast.success('Profile updated successfully!'),
  avatarUpdated: () => toast.success('Avatar updated successfully!'),
  coverUpdated: () => toast.success('Cover photo updated successfully!'),

  // Posts
  postCreated: () => toast.success('Post published!'),
  postDeleted: () => toast.success('Post deleted'),
  postLiked: () => toast.success('Post liked'),
  postBookmarked: () => toast.success('Added to bookmarks'),
  postUnbookmarked: () => toast.success('Removed from bookmarks'),

  // Comments
  commentAdded: () => toast.success('Comment added'),
  commentDeleted: () => toast.success('Comment deleted'),

  // Social
  followed: (name: string) => toast.success(`Now following ${name}`),
  unfollowed: (name: string) => toast.success(`Unfollowed ${name}`),
  blocked: () => toast.success('User blocked'),
  unblocked: () => toast.success('User unblocked'),

  // Marketplace
  listingCreated: () => toast.success('Listing created!'),
  listingUpdated: () => toast.success('Listing updated'),
  listingDeleted: () => toast.success('Listing deleted'),
  addedToFavorites: () => toast.success('Added to favorites'),
  removedFromFavorites: () => toast.success('Removed from favorites'),

  // Forum
  threadCreated: () => toast.success('Thread created!'),
  replyAdded: () => toast.success('Reply posted'),

  // Messages
  messageSent: () => toast.success('Message sent'),
  conversationDeleted: () => toast.success('Conversation deleted'),

  // Settings
  settingsSaved: () => toast.success('Settings saved'),
  notificationsSaved: () => toast.success('Notification preferences saved'),

  // Reports
  reportSubmitted: () => toast.success('Report submitted. Thank you!'),

  // Generic
  copied: () => toast.success('Copied to clipboard'),
  saved: () => toast.success('Saved successfully'),
  deleted: () => toast.success('Deleted successfully'),
  uploaded: () => toast.success('Uploaded successfully'),

  // Errors
  genericError: () => toast.error('Something went wrong. Please try again.'),
  networkError: () => toast.error('Network error. Please check your connection.'),
  unauthorized: () => toast.error('Please sign in to continue.'),
  forbidden: () => toast.error('You don\'t have permission to do this.'),
  notFound: () => toast.error('The requested item was not found.'),
  validationError: (message: string) => toast.error(message),
  uploadError: () => toast.error('Upload failed. Please try again.'),
  fileTooLarge: (maxSize: number) => toast.error(`File too large. Max size: ${maxSize}MB`),
  invalidFileType: () => toast.error('Invalid file type'),
};

// Re-export sonner toast for direct usage if needed
export { sonnerToast };

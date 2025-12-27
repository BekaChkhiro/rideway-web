// API Hooks - Re-export all hooks for convenient imports

// Auth hooks
export {
  useLogin,
  useRegister,
  useVerifyOtp,
  useResendVerification,
  useForgotPassword,
  useResetPassword,
  useChangePassword,
  useLogout,
  useRefreshToken,
  useCheckEmail,
  useCheckUsername,
} from './use-auth-api';

// User hooks
export {
  useCurrentUser,
  useUser,
  useUserByUsername,
  useUpdateProfile,
  useUploadAvatar,
  useUploadCover,
  useSearchUsers,
  useUserSuggestions,
  useUserFollowers,
  useUserFollowing,
  useFollowUser,
  useUnfollowUser,
  useBlockUser,
  useUnblockUser,
  useBlockedUsers,
} from './use-user';

// Generic API hooks
export {
  createQueryHook,
  createMutationHook,
  createInfiniteQueryHook,
  useApiGet,
  useApiPost,
  useApiPatch,
  useApiDelete,
  useApiUpload,
  useOptimisticMutation,
} from './use-api';

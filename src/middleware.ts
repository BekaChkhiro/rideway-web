import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Routes that require authentication (exact match)
const protectedExactRoutes = ['/'];

// Routes that require authentication (prefix match)
const protectedPrefixRoutes = [
  '/profile',
  '/settings',
  '/messages',
  '/marketplace/create',
  '/forum/create',
];

// Routes that should redirect authenticated users
const authRoutes = ['/login', '/register', '/forgot-password', '/verify'];

// Admin routes - uncomment when admin functionality is implemented
// const adminRoutes = ['/admin'];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If user is authenticated and trying to access auth routes
    // Redirect them to home/feed
    if (token && authRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Check for admin routes
    // if (
    //   adminRoutes.some((route) => pathname.startsWith(route)) &&
    //   token?.role !== 'admin'
    // ) {
    //   return NextResponse.redirect(new URL('/', req.url));
    // }

    // Check for token expiration error
    if (token?.error === 'RefreshAccessTokenError') {
      // Clear the session and redirect to login
      const response = NextResponse.redirect(
        new URL('/login?error=SessionExpired', req.url)
      );
      return response;
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow auth routes without token
        if (authRoutes.some((route) => pathname.startsWith(route))) {
          return true;
        }

        // Allow public routes
        if (
          pathname.startsWith('/api/') ||
          pathname.startsWith('/_next/') ||
          pathname.startsWith('/static/') ||
          pathname.includes('.')
        ) {
          return true;
        }

        // Check if route requires authentication
        const requiresAuth =
          protectedExactRoutes.includes(pathname) ||
          protectedPrefixRoutes.some((route) => pathname.startsWith(route));

        if (requiresAuth) {
          return !!token;
        }

        // Default: allow access
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (except auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/(?!auth)).*)',
  ],
};

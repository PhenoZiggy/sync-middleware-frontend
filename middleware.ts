import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/signin', '/signup', '/reset-password', '/forgot-password'];

// Define auth routes (redirect to dashboard if already authenticated)
const authRoutes = ['/signin', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  const isAuthenticated = !!accessToken;

  // Debug logging (remove in production)
  console.log('Middleware:', {
    pathname,
    isAuthenticated,
    hasToken: !!accessToken,
    tokenLength: accessToken?.length || 0
  });

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Check if route is auth route (signin/signup)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Allow access to public routes without authentication
  if (isPublicRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (isAuthenticated && isAuthRoute) {
    console.log('Authenticated user on auth route, redirecting to /');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not authenticated and trying to access protected route
  if (!isAuthenticated && !isPublicRoute) {
    console.log('Unauthenticated user on protected route, redirecting to /signin');
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};
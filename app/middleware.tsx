import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard', '/admin', '/profile', '/settings'];
const adminRoutes = ['/admin'];
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.includes(pathname);
  
  // Get the access token from cookies
  const accessToken = request.cookies.get('access_token');
  
  // If trying to access protected route without token
  if (isProtectedRoute && !accessToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  // If authenticated user tries to access auth pages, redirect to dashboard
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // For admin routes, we'll need to validate the JWT payload
  // This is a basic check - you might want to validate the actual JWT
  if (isAdminRoute && accessToken) {
    try {
      // You might want to decode and verify the JWT here
      // For now, we'll assume the backend handles authorization
    } catch (error) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

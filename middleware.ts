import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ⚠️ AUTH COMPLETELY DISABLED FOR TESTING ⚠️
export async function middleware(req: NextRequest) {
  console.log('🔓 MIDDLEWARE: Auth check BYPASSED - allowing all routes');
  return NextResponse.next();
}

// ORIGINAL AUTH CODE (disabled):
// import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next();
//   const supabase = createMiddlewareClient({ req, res });
//   const { data: { session } } = await supabase.auth.getSession();
//   const protectedRoutes = ['/dashboard'];
//   const authRoutes = ['/auth/login', '/auth/signup'];
//   const isProtectedRoute = protectedRoutes.some(route => 
//     req.nextUrl.pathname.startsWith(route)
//   );
//   const isAuthRoute = authRoutes.some(route => 
//     req.nextUrl.pathname.startsWith(route)
//   );
//   if (isProtectedRoute && !session) {
//     const redirectUrl = req.nextUrl.clone();
//     redirectUrl.pathname = '/auth/login';
//     redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
//     return NextResponse.redirect(redirectUrl);
//   }
//   if (isAuthRoute && session) {
//     const redirectUrl = req.nextUrl.clone();
//     redirectUrl.pathname = '/dashboard';
//     return NextResponse.redirect(redirectUrl);
//   }
//   return res;
// }

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)',
  ],
};

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
         response.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value, ''...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const protectedRoutes = ['/global-chat', '/messages', '/news/create', '/profile', '/settings', '/admin'];
  const authRoutes = ['/login', '/register', '/forgot-password'];

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuth = authRoutes.some((route) => pathname.startsWith(route));

  // 1. Redirect unauthenticated users
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Enforce verified email state before full community access
  if (isProtected && user && !user.email_confirmed_at) {
    return NextResponse.redirect(new URL('/login?error=email_not_verified', request.url));
  }

  // 3. Redirect authenticated users away from login/register
  if (isAuth && user) {
    return NextResponse.redirect(new URL('/global-chat', request.url));
  }

  // 4. Server-side check for protected Admin Portal
  if (pathname.startsWith('/admin') && user) {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || (roleData.role !== 'admin' && roleData.role !== 'moderator')) {
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

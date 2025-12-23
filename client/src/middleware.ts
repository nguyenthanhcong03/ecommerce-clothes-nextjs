// import { jwtVerify } from 'jose';
// import { NextRequest, NextResponse } from 'next/server';

// type Role = 'ADMIN' | 'CUSTOMER';

// const PUBLIC_ROUTES = ['/login', '/register', '/news', '/shop', '/about', '/contact'];
// const ADMIN_ROUTES = ['/admin'];

// const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'ABCXYZ');

// function isPublicRoute(pathname: string) {
//   if (pathname === '/') return true;
//   return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
// }

// export async function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // Skip static
//   if (
//     pathname.startsWith('/_next') ||
//     pathname.startsWith('/favicon.ico') ||
//     pathname.startsWith('/images') ||
//     pathname.startsWith('/assets')
//   ) {
//     return NextResponse.next();
//   }

//   const accessToken = req.cookies.get('accessToken')?.value;
//   const refreshToken = req.cookies.get('refreshToken')?.value;

//   // Public routes
//   if (isPublicRoute(pathname)) {
//     if (pathname === '/login' && accessToken) {
//       return NextResponse.redirect(new URL('/', req.url));
//     }
//     return NextResponse.next();
//   }

//   // Protected routes
//   if (!accessToken) {
//     const loginUrl = new URL('/login', req.url);
//     loginUrl.searchParams.set('returnUrl', pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   // Decode / verify token
//   let payload: any;
//   try {
//     const decoded = await jwtVerify(accessToken, SECRET);
//     payload = decoded.payload;
//   } catch {
//     return NextResponse.redirect(new URL('/login', req.url));
//   }

//   const role = payload.role as Role;

//   // Admin routes
//   if (ADMIN_ROUTES.some((route) => pathname.startsWith(route)) && role !== 'ADMIN') {
//     return NextResponse.redirect(new URL('/403', req.url));
//   }

//   return NextResponse.next();
// }
import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { http } from './lib/http';

type Role = 'ADMIN' | 'CUSTOMER';

const PUBLIC_ROUTES = ['/login', '/register', '/news', '/shop', '/about', '/contact'];
const ADMIN_ROUTES = ['/admin'];

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

function isPublicRoute(pathname: string) {
  if (pathname === '/') return true;
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/assets')
  ) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  /* ================= PUBLIC ================= */
  if (isPublicRoute(pathname)) {
    if (pathname.startsWith('/login') && accessToken) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  /* ================= PROTECTED ================= */

  // ❗ Không có refresh token → login luôn
  if (!refreshToken && !pathname.startsWith('/login')) {
    console.log('pathname :>> ', pathname);
    const loginUrl = new URL('/login', req.url);
    // loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Có access token → verify
  if (accessToken) {
    try {
      const { payload } = await jwtVerify(accessToken, SECRET);

      // Check role admin
      if (ADMIN_ROUTES.some((route) => pathname.startsWith(route)) && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/403', req.url));
      }

      return NextResponse.next();
    } catch {
      // ❗ access token hết hạn → thử refresh
      // const refreshRes = await http.post(`api/auth/refresh-token`, null, {
      //   baseUrl: ''
      // });
      // if (!refreshRes) {
      //   return redirectToLogin(req, pathname);
      // }
    }
  }

  /* ================= REFRESH ================= */

  // const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
  //   method: 'POST',
  //   headers: {
  //     cookie: `refreshToken=${refreshToken}`
  //   }
  // });

  // if (!refreshRes.ok) {
  //   return redirectToLogin(req, pathname);
  // }

  // refresh OK → cho qua
  return NextResponse.next();
}

export const config = {
  matcher: ['/me', '/login', '/register', '/admin/:path*']
};

// // import { NextResponse } from 'next/server';
// // import type { NextRequest } from 'next/server';
// // import { jwtVerify } from 'jose';

// // // Các route không yêu cầu login
// // const PUBLIC_ROUTES = ['/', '/login', '/register', '/products', '/products/'];

// // // Các route chỉ admin được vào
// // const ADMIN_ROUTES = ['/admin'];

// // // Tạo SECRET cho jose (Edge bắt buộc)
// // const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// // export async function middleware(req: NextRequest) {
// //   const { pathname } = req.nextUrl;

// //   // 1️⃣ Bỏ qua các file tĩnh và next internal (bắt buộc)
// //   if (
// //     pathname.startsWith('/_next') ||
// //     pathname.startsWith('/favicon.ico') ||
// //     pathname.startsWith('/images') ||
// //     pathname.startsWith('/assets')
// //   ) {
// //     return NextResponse.next();
// //   }

// //   // 2️⃣ Check Public routes: không yêu cầu login
// //   const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
// //   if (isPublic) {
// //     return NextResponse.next();
// //   }

// //   // 3️⃣ Check token
// //   const accessToken = req.cookies.get('accessToken')?.value;

// //   if (!accessToken) {
// //     // Chưa login → redirect về login kèm returnUrl
// //     const loginUrl = new URL('/login', req.url);
// //     loginUrl.searchParams.set('returnUrl', pathname);
// //     return NextResponse.redirect(loginUrl);
// //   }

// //   // 4️⃣ Decode JWT (edge-safe)
// //   let payload: any;
// //   try {
// //     const decoded = await jwtVerify(accessToken, SECRET);
// //     payload = decoded.payload; // { id, role, email }
// //   } catch (e) {
// //     // Token invalid / expired
// //     return NextResponse.redirect(new URL('/login', req.url));
// //   }

// //   const role = payload.role;

// //   // 5️⃣ Check admin routes
// //   const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

// //   if (isAdminRoute && role !== 'admin') {
// //     return NextResponse.redirect(new URL('/403', req.url));
// //   }

// //   // 6️⃣ Hợp lệ → cho vào
// //   return NextResponse.next();
// // }

// // // Chỉ áp dụng cho những route cần thiết (tối ưu performance)
// // export const config = {
// //   matcher: '/:path*'
// // };

// // // export const config = {
// // //   matcher: [
// // //     '/login',
// // //     '/dashboard/:path*',
// // //     '/profile/:path*',
// // //     '/orders/:path*'
// // //   ]
// // // }
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

type Role = 'ADMIN' | 'CUSTOMER';

const PUBLIC_ROUTES = ['/login', '/register', '/news', '/shop', '/about', '/contact'];
const ADMIN_ROUTES = ['/admin'];

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'ABCXYZ');

function isPublicRoute(pathname: string) {
  if (pathname === '/') return true;
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/assets')
  ) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get('accessToken')?.value;

  // Public routes
  if (isPublicRoute(pathname)) {
    if (pathname === '/login' && accessToken) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!accessToken) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode / verify token
  let payload: any;
  try {
    const decoded = await jwtVerify(accessToken, SECRET);
    payload = decoded.payload;
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const role = payload.role as Role;

  // Admin routes
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route)) && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/403', req.url));
  }

  return NextResponse.next();
}

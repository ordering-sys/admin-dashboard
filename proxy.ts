import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { canAccess, homeForRole, isRole } from '@/lib/roles'

export default withAuth(
  function proxy(req) {
    const role = req.nextauth.token?.role
    const path = req.nextUrl.pathname
    if (!isRole(role)) return NextResponse.redirect(new URL('/auth/login', req.url))
    if (!canAccess(role, path)) {
      return NextResponse.redirect(new URL(homeForRole(role), req.url))
    }
    return NextResponse.next()
  },
  { callbacks: { authorized: ({ token }) => !!token }, pages: { signIn: '/auth/login' } }
)

export const config = { matcher: ['/dashboard/:path*', '/tables/:path*', '/menu/:path*', '/kds/:path*', '/users/:path*'] }

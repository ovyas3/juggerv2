import { NextResponse, type NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get('access_token')?.value
  const path = request.nextUrl.pathname
  const isPublicPath = path.startsWith('/signin') || path.startsWith('/signup') || path.startsWith('/public') || path.startsWith('/triptracker')
  if (isPublicPath) {
    return NextResponse.next()
  } else if (currentUser) {
    return NextResponse.next()
  } else {
    return NextResponse.redirect(new URL('/signin', request.nextUrl.origin));
  }
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
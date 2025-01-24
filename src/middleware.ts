import { NextResponse, type NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get('access_token')?.value
  if (currentUser) {
    return NextResponse.next()
  } else {
    return NextResponse.redirect(new URL('/', request.nextUrl.origin));
  }
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
import { NextResponse, type NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get('access_token')?.value
  const params = request.nextUrl.searchParams;
  const token = params.get('token');
  const redirect = params.get('redirect');
  const pathname = request.nextUrl.pathname;
  if (pathname == "/tracker") {
    return NextResponse.next()
  }
  if (!currentUser && token && redirect) {
    return NextResponse.next()
  } 
  else if (!currentUser && !token && pathname === '/') {
    return NextResponse.next()
  }
  else if (!currentUser && token) {
    return NextResponse.redirect(new URL('/?token=' + token + '&redirect=true', request.nextUrl.origin));
  }
  else {
    return NextResponse.next()
  }
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
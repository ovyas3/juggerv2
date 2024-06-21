import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname
  const currentUser = request.cookies.get('selected_shipper')?.value
  const token = request.nextUrl.searchParams.get('token');
  console.log(currentUser, token, pathName)
  if (!currentUser && pathName === '/') {
    return NextResponse.next();
  } else if (!currentUser && !token && pathName !== '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  } else if (currentUser && pathName === '/login') {
    return NextResponse.redirect(new URL('/orders', request.url))
  } else if (token && pathName === '/login') {
    return NextResponse.redirect(new URL('/?token=' + token, request.url))
  } else if (token && pathName === '/') {
    return NextResponse.redirect(new URL('/?token=' + token, request.url))
  }
  return NextResponse.next()
}
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|tracker|.*\\.png|.svg$).*)'],
}
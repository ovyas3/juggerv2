import { NextApiRequest } from 'next';

export default function authHeader(req: NextApiRequest) {
  const user = JSON.parse(req.headers.cookie?.split(';').find((c) => c.trim().startsWith('user='))?.split('=')[1] || '');

  if (user && user.accessToken) {
    return { 'x-auth-token': user.accessToken };
  } else {
    return {};
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { setCookie, parseCookies, destroyCookie } from 'nookies';

const API_URL = '/auth';

const login = async (email: string, password: string): Promise<any> => {
  const response = await fetch(API_URL + '/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (data.accessToken) {
    setCookie(null, 'user', JSON.stringify(data));
  }

  return data;
};

const logout = (): void => {
  destroyCookie(null, 'user');
};

const getCurrentUser = (req: NextApiRequest): any => {
  const cookies = parseCookies({ req });
  return JSON.parse(cookies.user || '{}');
};

const authService = {
  login,
  logout,
  getCurrentUser,
};

export default authService;
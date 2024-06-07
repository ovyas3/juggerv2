import { NextApiRequest, NextApiResponse } from 'next';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';

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
    setCookie('user', JSON.stringify(data));
  }

  return data;
};

const logout = (): void => {
  deleteCookie('user');
};

const getCurrentUser = (req: NextApiRequest): any => {
  const cookies:any = getCookie('user');
  return JSON.parse(cookies|| '{}').user;
};

const authService = {
  login,
  logout,
  getCurrentUser,
};

export default authService;
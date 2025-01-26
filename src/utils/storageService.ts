"use client";
interface CookieOptions {
  domain?: string;
  expires?: Date | string | number;
  secure?: boolean;
  httpOnly?: boolean;
  path?: string;
}

function setCookies(name: string, value: string, options: CookieOptions = {}) {
  let cookieString = `${name}=${value}`;
  if (options.domain) cookieString += `; domain=${options.domain}`;
  cookieString += `; path=${options.path || '/'}`;
  if (options.expires) {
    const expires = options.expires instanceof Date ? options.expires.toUTCString()
      : (typeof options.expires === 'number' ? new Date(Date.now() + options.expires * 24 * 60 * 60 * 1000).toUTCString()
        : options.expires);
    cookieString += `; expires=${expires}`;
  }
  if (options.secure) cookieString += '; secure';
  if (options.httpOnly) cookieString += '; httpOnly';
  document.cookie = cookieString;
}

function getCookie(name: string, path: string = '/') {
  if (typeof document === 'undefined') {
    return null;
  }
  const nameLenPlus = (name.length + 1);
  const cookieValue = document.cookie
    .split(';')
    .map(c => c.trim())
    .filter(cookie => {
      return cookie.substring(0, nameLenPlus) === `${name}=`;
    })
    .map(cookie => {
      return decodeURIComponent(cookie.substring(nameLenPlus));
    })[0] || null;
  if (!cookieValue) {
    const cookieValuePath = document.cookie
      .split(';')
      .map(c => c.trim())
      .filter(cookie => {
        return cookie.substring(0, nameLenPlus) === `${name}=` && cookie.includes(`path=${path}`);
      })
      .map(cookie => {
        return decodeURIComponent(cookie.substring(nameLenPlus));
      })[0]
    return cookieValuePath
  }
  return cookieValue;
}

function deleteCookie(name: string, options: CookieOptions = {}) {
  setCookies(name, '', { ...options, expires: new Date(0) });
}


function deleteAllCache(options: CookieOptions = {}) {
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    deleteCookie(name, options);
  }
}

function hasCookie(name: string, path: string = '/') {
  return !!getCookie(name, path);
}

export { setCookies, getCookie, hasCookie, deleteCookie, deleteAllCache };
'use client'
import { setCookie, getCookie, hasCookie, deleteCookie } from 'cookies-next';


const setCookies = (name: string, value: string) => {
    setCookie(name, value, {
        maxAge: 30 * 24 * 60 * 60,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    })
}

const deleteAllCache = () => {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookieName = cookies[i].split("=")[0].trim();
        if (cookieName) {
            deleteCookie(cookieName);
        }
    }

    localStorage.clear();
}

export { setCookies, getCookie, hasCookie, deleteCookie, deleteAllCache }
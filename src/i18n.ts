import {getRequestConfig} from 'next-intl/server';
import { getCookie, hasCookie, setCookie } from 'cookies-next';

export default getRequestConfig(async () => {
    'use client'
    let locale:any = 'en'
    if (hasCookie('locale')) {
        locale = getCookie('locale');
    } else {
        setCookie('locale', locale);
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
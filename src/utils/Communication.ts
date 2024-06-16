'use client'
import axios from 'axios';
import { environment } from '@/environments/env.api';

const prefix = [
  (process.env.NODE_ENV == 'production' ? environment.PROD_API_URL : environment.DEV_API_URL),
]

const httpsGet = async (path: string, type: number = 0) => {
  const url = prefix[type] + path;
  const response = await axios.get(url);
  return response.data;
}

const httpsPost = async (path: string, data: any, type = 0) => {
  const url = prefix[type] + path;
  const response = await axios.post(url, data);
  return response.data;
}

const apiCall = async (config: object) => await axios(config)

export { httpsGet,  httpsPost, apiCall };

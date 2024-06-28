'use client'
import axios from 'axios';
import { environment } from '@/environments/env.api';
import { getAuth } from '@/services/Authenticator/Auth';

const prefix = [
  environment.DEV_API_URL
]

const httpsGet = async (path: string, type: number = 0) => {
  const authorization = {
    Authorization: getAuth(),
  }
  const url = prefix[type] + path;
  const config = {
    method: 'GET',
    url,
    headers: authorization,
  }
  const response = await axios(config);
  return response.data;
}

const httpsPost = async (path: string, data: any, type = 0) => {
  const authorization = {
    Authorization: getAuth(),
  }
  const url = prefix[type] + path;
  const config = {
    method: 'POST',
    url,
    headers: authorization,
    data,
  }
  console.log(config);
  const response = await axios(config);
  return response.data;
}

const apiCall = async (config: any) => {
  const finalConf = {
    ...config,
  }
  if(finalConf.headers) {
    finalConf.headers = {
      ...finalConf.headers,
      Authorization: getAuth(),
    }
  } else  {
    finalConf.headers = {
      Autherization: getAuth(),
    }
  }
  await axios(finalConf)
}

export { httpsGet,  httpsPost, apiCall };

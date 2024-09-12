"use client";
import axios from "axios";
import { environment } from "@/environments/env.api";
import { getAuth } from "@/services/Authenticator/Auth";
import { deleteAllCache } from '@/utils/storageService';
import { redirect, useRouter } from "next/navigation";

const prefix = [
  environment.DEV_API_URL,
  environment.PROD_API_URL_MANHUNTER
]

const httpsGet = async (path: string, type: number = 0, router: any = null) => {
  const authorization = {
    Authorization: getAuth(),
  };
  const url = prefix[type] + path;
  const config = {
    method: "GET",
    url,
    headers: authorization,
  };
  const response = await axios(config)
    .then((res) => res)
    .catch((err) => {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        deleteAllCache();
        router.push('/');
      }
    });
    return response?.data;
};

const httpsPost = async (path: string, data: any, type = 0, isFile = false, router: any = null) => {
  const auth = getAuth();
  const authorization = {
    Authorization: auth,
  };
  const headers = {
    Authorization: auth,
    'Content-Type': 'multipart/form-data'
  };
  const url = prefix[type] + path;
  let config;
  if (isFile) {
    config = {
      method: "POST",
      url,
      headers: headers,
      data,
    };
  } else {
    config = {
      method: "POST",
      url,
      headers: authorization,
      data,
    };
  }
  // try {
    const response = await axios(config)
      .then((res) => res)
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          deleteAllCache();
          router.push('/');
        }
      });
    return response?.data || {};
  // } catch(err) {
  //   console.log(err, err.message, err.response);
  //   // if (axios.isAxiosError(err) && err.response?.status === 401) {
  //   //   deleteAllCache();
  //   //   router.push('/');
  //   // }
  // }
};

const apiCall = async (config: any) => {
  const finalConf = {
    ...config,
  };
  if (finalConf.headers) {
    finalConf.headers = {
      ...finalConf.headers,
      Authorization: getAuth(),
    };
  } else {
    finalConf.headers = {
      Authorization: getAuth(),
    };
  }
  await axios(finalConf);
};

export { httpsGet, httpsPost, apiCall };

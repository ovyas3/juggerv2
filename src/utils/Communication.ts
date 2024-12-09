"use client";
import axios from "axios";
import { environment } from "@/environments/env.api";
import { getAuth } from "@/services/Authenticator/Auth";
import { deleteAllCache } from '@/utils/storageService';

const prefix = [
  environment.PROD_API_URL,
  environment.PROD_API_URL_MANHUNTER
]

const parent = [
  environment.DEV_ETMS,
  environment.PROD_SMART
]

let redirectInProgress = false;

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
      if (axios.isAxiosError(err) && err.response?.status === 401 && !redirectInProgress) {
        redirectInProgress = true
        const fromRms = Boolean(localStorage.getItem('isRmsLogin'))
        if(fromRms) {
         router.push('/signin')
        } else {
          if(prefix[0].includes('dev')){
            router.push(`${parent[0]}/login`);
          }else{
            router.push(`${parent[1]}/login`);
          }
        }
        deleteAllCache()
      } else {
        redirectInProgress = false
      }
    });
    return response?.data;
};

const httpsPost = async (path: string, data: any, router: any = null, type = 0, isFile = false) => {
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
        if (axios.isAxiosError(err) && err.response?.status === 401 && !redirectInProgress) {
          redirectInProgress = true
          if(url.includes('shipper_user/signin')) {
            return err.response.data 
          }
          const fromRms = Boolean(localStorage.getItem('isRmsLogin'))
          if(fromRms) {
            router.push('/signin')
          } else {
            if(prefix[0].includes('dev')){
              router.push(`${parent[0]}/login`);
            }else{
              router.push(`${parent[1]}/login`);
            }
          }
          deleteAllCache();
        } else {
          redirectInProgress = false
        }
        return err.response.data 
      });
    return response?.data || response;
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

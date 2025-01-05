"use client";
import checkAuth from "@/services/Authenticator/Auth";
import { Box, CircularProgress } from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import "./Auth.css";
import Loader from "../Loading/WithBackDrop";
import { environment } from "@/environments/env.api";
import { httpsGet } from "@/utils/Communication";

const AuthController = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [checkCalled, setCheckCalled] = useState(false);


  // async function getPreferences() {
  //   const response = await httpsGet('/get_preferences', 0, router)
  //   if(response.statusCode === 200) {
  //     const preferences = response.data?.constant
  //     localStorage.setItem('preferences',JSON.stringify(preferences))
  //   } 
  // }

  const checkSum = async (rms_auth: string) => {
    const from = localStorage.getItem('isRmsLogin') === 'true' ? 'rms_login' : (rms_auth ? 'tms_rms' : '');
    const isAuth = await checkAuth(from,rms_auth);
    if (isAuth) {
      // getPreferences()
      router.push("/welcome");
    } else {
      const isDev = process.env.NODE_ENV === 'development';
      if(from === 'tms_rms') {
        router.push(isDev ? environment.DEV_ETMS : environment.PROD_SMART);
      } else {
       router.push("/signin");
      }
    }
  };
  useEffect(() => {
    const rms_auth = searchParams.get("token") as string;
    if (!checkCalled) {
      setCheckCalled(true);
      checkSum(rms_auth);
    }
  }, []);

  return (
    <Box sx={{ display: "flex" }} className="auth">
      <h1>Authenticating</h1>
      <CircularProgress className="progressBar" color="secondary" />
    </Box>
  );
};

const Auth = () => {
  return (
    <Suspense fallback={<Loader />}>
      <AuthController />
    </Suspense>
  );
};
export default Auth;

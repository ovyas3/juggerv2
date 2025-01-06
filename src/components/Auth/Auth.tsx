"use client";
import checkAuth from "@/services/Authenticator/Auth";
import { Box, CircularProgress } from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import "./Auth.css";
import Loader from "../Loading/WithBackDrop";
import { environment } from "@/environments/env.api";


const AuthController = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [checkCalled, setCheckCalled] = useState(false);


  const checkSum = async (auth: string) => {
    const from = localStorage.getItem('isSDLogin') === 'true' ? 'sd_login' : (auth ? 'tms_sd' : '');
    const isAuth = await checkAuth(from,auth);
    if (isAuth) {
      router.push("/externalParking");
    } else {
      const isDev = process.env.NODE_ENV === 'development';
      if(from === 'tms_sd') {
        router.push(isDev ? environment.DEV_ETMS : environment.PROD_SMART);
      } else {
       router.push("/signin");
      }
    }
  };
  useEffect(() => {
    const auth = searchParams.get("token") as string;
    if (!checkCalled) {
      setCheckCalled(true);
      checkSum(auth);
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

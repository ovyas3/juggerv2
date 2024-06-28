'use client'
import checkAuth from "@/services/Authenticator/Auth";
import { Box, CircularProgress } from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import './Auth.css'
import Loader from "../Loading/WithBackDrop";


const AuthController = () => {
    const searchParams = useSearchParams ();
    const router = useRouter();
    const [checkCalled, setCheckCalled] = useState(false);
    const checkSum = async (rms_auth: string) => {
        const isAuth = await checkAuth(rms_auth);
        if (isAuth) {
            router.push('/orders');
        } else {
            // redirect to etms.instavans.com/login
            router.push('https://etms.instavans.com/login');
        }
    }
    useEffect(() => {
        const rms_auth = searchParams.get('token') as string;
        console.log('top level', rms_auth)
        if (!checkCalled) {
            setCheckCalled(true);
            checkSum(rms_auth);
        }
    }, []);

    return (
        <Box sx={{ display: 'flex',}} className='auth'>
            <h1>Authenticating</h1>
            <CircularProgress className="progressBar" color="secondary"/>
        </Box>
    )
}

const Auth = () => {
    return (
        <Suspense fallback={<Loader />} >
            <AuthController />
        </Suspense>
    )
}
export default Auth;
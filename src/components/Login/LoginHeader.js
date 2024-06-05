'use client'

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './style/LoginHeader.css';
import LoginLogo from '../.././assets/logo.svg';
const Title = () => (
    <Link href="/">
            <Image className={styles.logo} alt="logo" src={LoginLogo} width={100} height={100} />
    </Link>
);

const LoginHeader = () => {
    const router = useRouter();

    return (
        <div className={styles.login}>
            <Title />
        </div>
    );
};

export default LoginHeader;
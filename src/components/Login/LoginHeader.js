'use client'

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './style/LoginHeader.css';

const Title = () => (
    <Link href="/">
        <a>
            <Image className={styles.logo} alt="logo" src="/assets/logo.svg" width={100} height={100} />
        </a>
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
import Image from "next/image";
import styles from "./page.module.css";
import LoginBody from "@/components/Login/LoginBody";


import { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: "RMS",
}

export default function Home() {
  return (
    <main className={styles.main}>
      <LoginBody />
    </main>
  );
}

import Image from "next/image";
import styles from "./page.module.css";
import LoginBody from "@/components/Login/LoginBody";

export default function Home() {
  return (
    <main className={styles.main}>
      <LoginBody />
    </main>
  );
}

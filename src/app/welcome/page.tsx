'use client'

import Welcome from "./Welcome";
import { useRouter } from 'next/navigation';

const WelcomePage = () => {
  const router = useRouter();

  const handleDashboardClick = () => {
    router.push('/dashboard?fromWelcome=true');
  };

  return <Welcome onDashboardClick={handleDashboardClick} />;
};

export default WelcomePage;
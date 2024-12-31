"use client";
import dynamic from 'next/dynamic'
import Loader from "@/components/Loading/WithBackDrop";

const SettingsDynamic = dynamic(() => import('../../components/Settings/page'), {
  loading: () => <Loader />,
  ssr: false
})

export default SettingsDynamic;

'use client'

import type { NextPage } from "next";
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from "react";
import { httpsGet } from "../../utils/Communication";
import dynamic from 'next/dynamic'

const TripTrackerDynamic = dynamic(() => import('../../components/MapView/TripTracker'), {
  loading: () => <p>Loading...</p>,
  ssr: false
})

const MapViewPageFunction: NextPage = () => {
    const [data, setData] = useState<any>({});
    const [dataFetched, setDataFetched] = useState(false);
    const searchParams = useSearchParams();
    const getData = async (code: string) => {
      const response = await httpsGet(
        `tracker?unique_code=${code}`
      ).then((res) => {
        setDataFetched(true);
        return res;
      })

      setData(response.data);
    }
    useEffect(() => {
      const unique_code = (searchParams.get('unique_code') as string);
      getData(unique_code);
    }, [searchParams]);
    if (dataFetched) {
      // @ts-ignore
      return <TripTrackerDynamic trip_tracker_data={data} />
    } else {
      return <div>Loading...</div>
    }
}

const MapViewPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MapViewPageFunction />
    </Suspense>
  )
}

export default MapViewPage;
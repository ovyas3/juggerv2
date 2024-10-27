
'use client'

import type { NextPage } from "next";
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from "react";
import { httpsGet } from "../../utils/Communication";
import dynamic from 'next/dynamic'
import Placeholder from "@/components/MapView/Skeleton/placeholder";
import Loader from "@/components/Loading/WithBackDrop";
import { useRouter } from "next/navigation";
import { ThreeCircles } from "react-loader-spinner";

const TripTrackerDynamic = dynamic(() => import('../../components/MapView/TripTracker'), {
  loading: () => <Placeholder />,
  ssr: false
})

const MapViewPageFunction: NextPage = () => {
    const router = useRouter();
    const [data, setData] = useState<any>({});
    const [dataFetched, setDataFetched] = useState(false);
    const [routeStation, setRouteStation] = useState<any>({})
    const searchParams = useSearchParams();
    const getData = async (code: string) => {
      const response = await httpsGet(
        `tracker?unique_code=${code}`, 0, router
      ).then((res) => {
        setDataFetched(true);
        return res;
      })

      setData(response.data);
    }

    const fetchRouteStations = async (code: string) => {
      const response = await httpsGet(
        `tracker/routeStations?unique_code=${code}`, 0, router
      )
      setRouteStation(response.data)
    }

    useEffect(() => {
      const unique_code = (searchParams.get('unique_code') as string);
      getData(unique_code);
      fetchRouteStations(unique_code)
    }, [searchParams]);
    if (dataFetched) {
      // @ts-ignore
      return <TripTrackerDynamic trip_tracker_data={data} routeStation={routeStation}/>
    } else {
      return <Loader />
    }
}

const MapViewPage = () => {
  return (
    <Suspense fallback={<Loader />}>
      <MapViewPageFunction />
    </Suspense>
  )
}

export default MapViewPage;
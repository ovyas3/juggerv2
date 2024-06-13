
 "use client"

import type { NextPage } from "next";
import { useSearchParams } from 'next/navigation'
import TripTracker from "../../components/MapView/TripTracker";
import React from "react";

const MapViewPage: NextPage = () => {

    const searchParams = useSearchParams();
    console.log(searchParams, "searchParams");
    
    return (
        <TripTracker uniqueCode={searchParams} />
    );
}

export default MapViewPage;
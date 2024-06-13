
 "use client"

import type { NextPage } from "next";
import { useSearchParams } from 'next/navigation'
import TripTracker from "../../components/MapView/TripTracker";
import React from "react";

const MapViewPage: NextPage = () => {

    const searchParams = useSearchParams();
    const unique_code =  searchParams.get('unique_code');
    
    return (
        <TripTracker uniqueCode={unique_code} />
    );
}

export default MapViewPage;
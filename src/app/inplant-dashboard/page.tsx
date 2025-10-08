'use client'

import React from "react";
import dynamicImport from 'next/dynamic';

export const dynamic = 'force-dynamic';

const InPlantDashboardContent = dynamicImport(
    () => import('./InPlantDashboardContent'),
    { ssr: false }
);

export default function InPlantDashboardPage() {
    return <InPlantDashboardContent />;
}
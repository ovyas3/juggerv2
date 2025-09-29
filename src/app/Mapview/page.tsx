// src/app/Mapview/page.tsx
import dynamic from "next/dynamic";
import Header from "@/components/Header/header";

const MapClient = dynamic(
  () => import("@/components/ShipmentsDashboard/Map/Mapview"),
  { ssr: false }
);

export default function Page() {
  return (

    <div className="max-w-5xl mx-auto p-6">
        <Header></Header>
        <div style={{ marginTop: '45px' }}>
      <MapClient />
      </div>
    </div>
  );
}

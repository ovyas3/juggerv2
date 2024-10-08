"use client";

import React, { useState, useEffect, use } from "react";
import Header from "@/components/Header/header";
import { useWindowSize as useWindowSize } from "@/utils/hooks";
import SideDrawer from "@/components/Drawer/Drawer";
import "./page.css";
import { useTranslations } from "next-intl";

import WagonTallySheet from "./wagonSheet";
import WagonAssignSheet from './wagonAssignSheet'

const Page = () => {
  const mobile = useWindowSize(500);
  const text = useTranslations("WAGONTALLYSHEET");
  const [showWagonSheet, setShowWagonSheet] = useState(true);
  const [showAssignWagon, setShowAssignWagon] = useState(false);
  const [shipmentForWagonSheet, setShipmentForWagonSheet] = useState({});
  return (
    <div className="wagon-tally-container">
      <Header title={text('in-plant-Dashboard')} isMapHelper={false} />
      <div id="pageInsideContent">
        {showWagonSheet && <WagonTallySheet setShowAssignWagon={setShowAssignWagon} setShowWagonSheet={setShowWagonSheet} setShipmentForWagonSheet={setShipmentForWagonSheet} />}
        {showAssignWagon && <WagonAssignSheet shipmentForWagonSheet={shipmentForWagonSheet} setShowWagonSheet={setShowWagonSheet} setShowAssignWagon={setShowAssignWagon} setShipmentForWagonSheet={setShipmentForWagonSheet}/>}
      </div>
      <SideDrawer />
    </div>
  );
};

export default Page;

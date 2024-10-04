"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header/header";
import { useWindowSize as useWindowSize } from "@/utils/hooks";
import SideDrawer from "@/components/Drawer/Drawer";
import "./page.css";

import WagonTallySheet from "./wagonSheet";
import WagonAssignSheet from './wagonAssignSheet'

const Page = () => {
  const mobile = useWindowSize(500);
  const [showWagonSheet, setShowWagonSheet] = useState(false);
  const [showAssignWagon, setShowAssignWagon] = useState(true);
  return (
    <div className="wagon-tally-container">
      <Header title={"Wagon Tally Sheet"} isMapHelper={false} />
      <div id="pageInsideContent">
        {showWagonSheet && <WagonTallySheet/>}
        {showAssignWagon && <WagonAssignSheet/>}
      </div>
      <SideDrawer />
    </div>
  );
};

export default Page;

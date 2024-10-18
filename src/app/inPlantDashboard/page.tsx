"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import Header from "@/components/Header/header";
import { useWindowSize as useWindowSize } from "@/utils/hooks";
import SideDrawer from "@/components/Drawer/Drawer";
import "./page.css";
import { useTranslations } from "next-intl";

import WagonTallySheet from "./wagonSheet";
import WagonAssignSheet from "./wagonAssignSheet";

const Page = () => {
  const mobile = useWindowSize(500);
  const text = useTranslations("WAGONTALLYSHEET");
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="wagon-tally-container">
        <Header title={text("in-plant-Dashboard")} isMapHelper={false} />
        <div id="pageInsideContent">
          <WagonTallySheet />
        </div>
        <SideDrawer />
      </div>
    </Suspense>
  );
};

export default Page;

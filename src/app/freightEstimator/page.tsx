"use client";
import SideDrawer from "@/components/Drawer/Drawer";
import FreightEstimator from "./components/freightEstimator";
import "./styles.css";
import Header from "@/components/Header/header";
import { useMediaQuery, useTheme } from "@mui/material";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import MobileHeader from "@/components/Header/mobileHeader";

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div>
      {isMobile ? <MobileHeader /> : <Header />}
      {isMobile ? <MobileDrawer /> : <SideDrawer />}
      <FreightEstimator />
    </div>
  );
}

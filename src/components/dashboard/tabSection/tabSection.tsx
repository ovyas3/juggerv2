"use client";

import React, { useState, useEffect } from "react";
import { httpsGet } from "@/utils/Communication";
import { Tab, Box } from "@mui/material";
import "./tabSection.css";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from 'next/dynamic';
import Placeholder from '@/components/MapView/Skeleton/placeholder';
import { useMediaQuery, useTheme } from '@mui/material';
import CaptiveRakeListView from "@/components/captiveRakeListView/captiveRakeListView";

const MapView = dynamic(
  () => import('../mapView/mapView'),
  { 
    loading: () => <Placeholder />,
    ssr: false 
  }
);

const CaptiveRakeMapView = dynamic(
  () => import('@/components/captiveRakeMapView/captiveRakeMapView'),
  { 
    loading: () => <Placeholder />,
    ssr: false 
  }
);

interface TabSectionProps {
  initialTab?: string;
}

const Tabsection: React.FC<TabSectionProps> = ({ initialTab }) => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialTab || "1");
  const t = useTranslations("DASHBOARD");

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setValue(tabFromUrl);
    } else if (initialTab) {
      setValue(initialTab);
    }
  }, [initialTab, searchParams]);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setValue(newValue);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', newValue);
    window.history.pushState({}, '', url);
  };

  return (
    <div className="wrapper">
      <div>
        <div>
          <Box sx={{ width: "100%", typography: "body1" }}>
            <TabContext value={value}>
              <Box sx={{ 
                borderBottom: 1, 
                borderColor: "divider",
                marginTop: !mobile ? '0px' : '48px'
              }}>
                <TabList onChange={handleChange}>
                  <Tab label={t("ListView")} value="1" />
                  <Tab label={t("MapView")} value="2" />
                </TabList>
              </Box>
              <TabPanel value="1" className="tabpanel-container">
                <CaptiveRakeListView />
              </TabPanel>
              <TabPanel value="2" className="tabpanel-container">
                <CaptiveRakeMapView />
              </TabPanel>
            </TabContext>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Tabsection;

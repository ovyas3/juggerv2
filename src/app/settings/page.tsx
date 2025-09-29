"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Tabs,
  Tab,
  Paper,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import InPlantDashboardTab from "@/components/settings/in-plant-dashboard-tab";
import TripClosureTab from "@/components/settings/trip-closure-tab";
import Header from "@/components/Header/header";
import SideDrawer from "@/components/Drawer/Drawer";
import { CustomDropdown } from "@/components/UI/CustomDropdown/CustomDropdown";

const theme = createTheme({
  palette: {
    primary: {
      main: "#20114d",
      light: "#4a3c7a",
      dark: "#150c35",
    },
    secondary: {
      main: "#f5f5f5",
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    text: {
      primary: "#2c2c2c",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h6: {
      fontWeight: 600,
      fontSize: "14px",
    },
    body1: {
      fontSize: "14px",
    },
    body2: {
      fontSize: "14px",
      color: "#666666",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 500,
          fontSize: "14px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "14px",
          minWidth: 160,
          padding: "12px 24px",
          margin: "0 4px",
          borderRadius: "8px",
          color: "#666666",
          backgroundColor: "transparent",
          transition: "all 0.2s ease-in-out",
          "&.Mui-selected": {
            backgroundColor: "#20114d !important",
            color: "#ffffff !important",
            fontWeight: 600,
          },
          "&:hover:not(.Mui-selected)": {
            backgroundColor: "rgba(32, 17, 77, 0.08)",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          "& .MuiTabs-indicator": {
            display: "none",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          minWidth: 200,
          height: "40px",
          fontSize: "14px",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: "14px",
          height: "40px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            height: "40px",
            fontSize: "14px",
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            height: "40px",
            fontSize: "14px",
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "14px",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "14px",
        },
      },
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ display: value === index ? "block" : "none" }}
      {...other}
    >
      {children}
    </div>
  );
}

export default function JPCSettingsPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <Header title={"Settings"} isMapHelper={false} />
      <SideDrawer />
      <Box
        sx={{
          minHeight: "90vh",
          bgcolor: "background.default",
          display: "flex",
          marginTop: "64px",
          marginLeft: "64px",
          flexDirection: "column",
        }}
      >
        {/* Sticky Header with Tabs */}
        <Paper
          elevation={1}
          sx={{
            position: "fixed",
            top: "56px",
            zIndex: 10,
            borderRadius: 0,
            width: "100vw",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Container style={{ maxWidth: "100vw" }} sx={{ px: 3, py: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="standard"
              sx={{
                "& .MuiTabs-flexContainer": {
                  gap: 1,
                  maxWidth: "100vw",
                },
                "& .MuiTabs-root": {
                  maxWidth: "100vw",
                },
                "& .MuiTab-root": {
                  maxWidth: "100vw",
                },
                "& .MuiTabs-indicator": {
                  maxWidth: "100vw",
                },
                maxWidth: "100vw",
              }}
            >
              <Tab
                label="Trip Closure"
                id="tab-0"
                aria-controls="tabpanel-0"
                style={{ maxWidth: "100vw" }}
              />
              <Tab
                label="In-Plant Metrics"
                id="tab-1"
                aria-controls="tabpanel-1"
                style={{ maxWidth: "100vw" }}
              />
            </Tabs>
          </Container>
        </Paper>

        {/* Scrollable Content */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            minWidth: "90vw",
            marginTop: "72px",
            paddingBottom: "64px",
            maxWidth: "auto",
          }}
        >
          <Container
            sx={{
              px: 3,
              py: 3,
              maxWidth: "auto",
              "&.MuiContainer-root": {
                maxWidth: "auto !important",
              },
            }}
            maxWidth={false}
          >
            <TabPanel value={tabValue} index={0}>
              <TripClosureTab CustomDropdown={CustomDropdown} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <InPlantDashboardTab />
            </TabPanel>
          </Container>
        </Box>
        
      </Box>
    </ThemeProvider>
  );
}

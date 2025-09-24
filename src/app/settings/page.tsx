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
import { ChevronDown } from "lucide-react";
import InPlantDashboardTab from "@/components/settings/in-plant-dashboard-tab";
import TripClosureTab from "@/components/settings/trip-closure-tab";
import Header from "@/components/Header/header";
import SideDrawer from "@/components/Drawer/Drawer";

// Custom Dropdown Component
interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  minWidth?: number;
}

const dropdownStyles: React.CSSProperties = {
  position: "relative",
  minWidth: 200,
  display: "inline-block",
};

const dropdownButtonStyles: React.CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0.5rem 0.75rem",
  textAlign: "left",
  background: "#fff",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  outline: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: 14,
  cursor: "pointer",
};

const dropdownButtonFocusStyles: React.CSSProperties = {
  boxShadow: "0 0 0 2px #20114d33",
  borderColor: "#20114d",
};

const dropdownListStyles: React.CSSProperties = {
  position: "absolute",
  zIndex: 20,
  width: "100%",
  marginTop: 4,
  background: "#fff",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  maxHeight: 240,
  overflow: "auto",
};

const dropdownOptionStyles: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  textAlign: "left",
  fontSize: 14,
  background: "none",
  border: "none",
  cursor: "pointer",
};

const dropdownOptionHoverStyles: React.CSSProperties = {
  background: "#f3f4f6",
};

const dropdownBackdropStyles: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 10,
};

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select option",
  className = "",
  minWidth = 200,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonFocused, setButtonFocused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={className} style={{ ...dropdownStyles, minWidth }}>
      <button
        type="button"
        style={{
          ...dropdownButtonStyles,
          ...(buttonFocused ? dropdownButtonFocusStyles : {}),
        }}
        onClick={() => setIsOpen(!isOpen)}
        onFocus={() => setButtonFocused(true)}
        onBlur={() => setButtonFocused(false)}
      >
        <span style={{ color: selectedOption ? "#111827" : "#6b7280" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          style={{
            height: 16,
            width: 16,
            color: "#9ca3af",
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "none",
          }}
        />
      </button>

      {isOpen && (
        <>
          <div
            style={dropdownBackdropStyles}
            onClick={() => setIsOpen(false)}
          />
          <div style={dropdownListStyles}>
            {options.map((option, idx) => (
              <button
                key={option.value}
                type="button"
                style={{
                  ...dropdownOptionStyles,
                  ...(hoveredIndex === idx ? dropdownOptionHoverStyles : {}),
                }}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

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

// Export the CustomDropdown for use in other components
export type { CustomDropdown };
export type { CustomDropdownProps };

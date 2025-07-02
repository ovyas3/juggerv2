'use client'

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation';
import { format } from "date-fns"
import { Calendar, Clock } from "lucide-react"
import { Spin } from 'antd';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table"
import { Card, CardContent } from "@/components/UI/card"
import { httpsGet, httpsPost } from "@/utils/Communication"
import { styled } from "@mui/material/styles";
import Dialog from '@mui/material/Dialog';
import CloseButtonIcon from "@/assets/close_icon.svg";
import Image from "next/image"
import { environment } from "@/environments/env.api";
import { Truck } from "lucide-react";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));


const themes = {
  navy: {
    name: 'Navy',
    primary: '#001529',
    secondary: '#003a75',
    text: '#e6f7ff',
    textSecondary: '#8bb4f7',
    accent: '#1890ff',
    background: 'linear-gradient(135deg, #001529 0%, #003a75 100%)',
    cardBg: '#007BFF',
    hover: 'rgba(255, 99, 71, 0.1)',
  },
  purple: {
    name: 'Purple',
    primary: '#17054B',
    secondary: '#4A1D96',
    text: '#EDE9FE',
    textSecondary: '#A78BFA',
    accent: '#7C3AED',
    background: 'linear-gradient(135deg, #17054B 0%, #4A1D96 100%)',
    cardBg: 'rgba(30, 12, 75, 0.8)',
    hover: 'rgba(255, 215, 0, 0.1)',
  },
  saffron: {
    name: 'Saffron',
    primary: '#8B2801',
    secondary: '#B33D00',
    text: '#FFF8F0',
    textSecondary: '#FFB067',
    accent: '#FF7A1F',
    background: 'linear-gradient(135deg, #8B2801 0%, #CC4400 100%)',
    cardBg: 'rgba(139, 40, 1, 0.85)',
    hover: 'rgba(0, 128, 128, 0.15)',
  },
  ocean: {
    name: 'Ocean',
    primary: '#0A4D68',
    secondary: '#088395',
    text: '#E6FFFD',
    textSecondary: '#89E7E3',
    accent: '#05BFDB',
    background: 'linear-gradient(135deg, #0A4D68 0%, #088395 100%)',
    cardBg: 'rgba(10, 77, 104, 0.85)',
    hover: 'rgba(255, 69, 0, 0.15)',
  },
  mint: {
    name: 'Mint',
    primary: '#CCFFCC',
    secondary: '#99FF99',
    text: '#006600',
    textSecondary: '#009900',
    accent: '#00CC00',
    background: 'linear-gradient(135deg, #CCFFCC 0%, #99FF99 100%)',
    cardBg: 'rgba(204, 255, 204, 0.85)',
    hover: 'rgba(128, 0, 128, 0.15)',
  },
  sky: {
    name: 'Sky',
    primary: '#CCFFFF',
    secondary: '#99FFFF',
    text: '#006666',
    textSecondary: '#009999',
    accent: '#00CCCC',
    background: 'linear-gradient(135deg, #CCFFFF 0%, #99FFFF 100%)',
    cardBg: 'rgba(204, 255, 255, 0.85)',
    hover: 'rgba(255, 0, 0, 0.15)',
  },
  light: {
    name: 'Light',
    primary: '#f0f2f5',
    secondary: '#e8e9ec',
    text: '#333333',
    textSecondary: '#777777',
    accent: '#1890ff',
    background: 'linear-gradient(135deg, #f0f2f5 0%, #e8e9ec 100%)',
    cardBg: 'rgba(255, 255, 255, 0.8)',
    hover: 'rgba(0, 128, 0, 0.15)',
  },
  white: {
    name: 'White',
    primary: '#ffffff',
    secondary: '#f0f0f0',
    text: '#262626',
    textSecondary: '#595959',
    accent: '#40a9ff',
    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    hover: 'rgba(64, 169, 255, 0.1)',
  },
  cream: {
    name: 'Cream',
    primary: '#FFFDD0',
    secondary: '#F5F5DC',
    text: '#4A4A4A',
    textSecondary: '#8A8A8A',
    accent: '#FFD700',
    background: 'linear-gradient(135deg, #FFFDD0 0%, #F5F5DC 100%)',
    cardBg: 'rgba(255, 253, 208, 0.85)',
    hover: 'rgba(255, 215, 0, 0.15)',
  },
  warmTerra: {
    name: 'Warm Terra',
    primary: '#FFF0E0',
    secondary: '#FFE5D0',
    text: '#5A4A4A',
    textSecondary: '#7A6A6A',
    accent: '#FF8C40',
    background: 'linear-gradient(135deg, #FFF0E0 0%, #FFE5D0 100%)',
    cardBg: 'rgba(255, 240, 224, 0.85)',
    hover: 'rgba(255, 140, 64, 0.15)',
  },
  paleBlue: {
    name: 'Pale Blue',
    primary: '#E6F7FF',
    secondary: '#B3E5FC',
    text: '#212121',
    textSecondary: '#616161',
    accent: '#1890FF',
    background: 'linear-gradient(135deg, #E6F7FF 0%, #B3E5FC 100%)',
    cardBg: 'rgba(230, 247, 255, 0.85)',
    hover: 'rgba(24, 144, 255, 0.15)',
  }
};

type ThemeKey = keyof typeof themes;

interface LocationData {
  totalWeight: number
  totalCount: number
  locationName: string
  reference: string
  shipmentIds?: string[] // To store shipment IDs from billing/dashboard
  // gi?: string[] // Assuming gi is replaced by shipmentIds for this dialog's purpose
}

interface BilledData {
  _id: string
  totalWeight: number
  totalCount: number
  material: string
  shipmentIds?: string[] // To store shipment IDs from billing/dashboard
}

interface DashboardData {
  underLoadingresult: LocationData[]
  underBillingresult: LocationData[]
  doIssuedresult: LocationData[]
  billedResult: BilledData[]
}

interface BillingStatusTableProps {
  currentTheme?: typeof themes[ThemeKey];
}

export function BillingStatusTable({ currentTheme = themes.navy }: BillingStatusTableProps) {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [openGateInfoDialog, setOpenGateInfoDialog] = useState(false)
  const [selectedGateInfoData, setSelectedGateInfoData] = useState<any>(null)
  const [shipmentDetails, setShipmentDetails] = useState<any[]>([]);
  const [loadingShipmentDetails, setLoadingShipmentDetails] = useState(false);

  interface ShipmentDetailItem {
    _id: string;
    driver?: { gate_entry_no?: string }; // Optional chaining for safety
    vehicle_no?: string;
    unique_code: string;
  }

  const getTrackerUrlPrefix = () => {
    return process.env.NODE_ENV === 'production'
      ? environment.TRACKER_URL
      : environment.TRACKER_URL_PREFIX;
  };
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await httpsGet("billing/dashboard", 1)
        if (response.statusCode === 200) {
          // Assuming response.data contains underLoadingresult, underBillingresult etc.
          // and each item in these arrays now includes a 'shipmentIds' field.
          setData(response.data);
          console.log("Dashboard data fetched:", response.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, []) // router dependency removed as fetchData doesn't directly use it. httpsGet handles router internally if needed.

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Combine all locations for unique shop names
  const allLocations = Array.from(
    new Set(
      [
        ...(data?.underLoadingresult || []),
        ...(data?.underBillingresult || []),
        ...(data?.doIssuedresult || []),
        ...(data?.billedResult || [])
      ].map((item: any) => item.locationName ? item.locationName : item.material)
    )
  )

  // Calculate totals
  const calculateTotalWeight = () => {
    const underLoadingTotal = data?.underLoadingresult.reduce(
      (sum, item) => sum + item.totalWeight,
      0
    ) || 0;
    const underBillingTotal = data?.underBillingresult.reduce(
      (sum, item) => sum + item.totalWeight,
      0
    ) || 0;
    const doIssuedTotal = data?.doIssuedresult.reduce(
      (sum, item) => sum + item.totalWeight,
      0
    ) || 0;
    const billedTotal = data?.billedResult.reduce(
      (sum, item) => sum + item.totalWeight,
      0
    ) || 0;

    return underLoadingTotal + underBillingTotal + doIssuedTotal + billedTotal;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  const renderMobileView = () => {
    return (
      <div className="mobile-container" style={{
        background: currentTheme.background,
        color: currentTheme.text
      }}>
        <div className="datetime-container" style={{
          background: currentTheme.primary,
          color: currentTheme.text
        }}>
          <div className="date-display">
            <Calendar className="datetime-icon" size={16} />
            <span>Date: {format(currentTime, "dd-MMM-yy")}</span>
          </div>
          <div className="time-display">
            <Clock className="datetime-icon" size={16} />
            <span>Time: {format(currentTime, "hh:mm a")}</span>
          </div>
        </div>
        {allLocations.map((locationName) => {
          const underLoading = data?.underLoadingresult.find(
            (item) => item.locationName === locationName
          )
          const underBilling = data?.underBillingresult.find(
            (item) => item.locationName === locationName
          )
          const doIssued = data?.doIssuedresult.find(
            (item) => item.locationName === locationName
          )
          const billed = data?.billedResult.find(
            (item) => item.material === locationName
          )

          const rowTotal =
            (underLoading?.totalWeight || 0) +
            (underBilling?.totalWeight || 0) +
            (doIssued?.totalWeight || 0) +
            (billed?.totalWeight || 0);

          return (
            <div key={locationName} className="mobile-card" style={{
              background: currentTheme.cardBg,
              color: currentTheme.textSecondary,
              border: `1px solid ${currentTheme.primary}`
            }}>
              <div className="card-header">
                <div className="shop-name">{locationName}</div>
                <div className="total-weight">{Math.round(rowTotal).toFixed(2)} MT</div>
              </div>
              <div className="card-sections">
                <div className="section">
                  <h4>Total Count</h4>
                  <div className="stats">{underLoading?.totalCount || 0}</div>
                </div>
                <div className="section">
                  <h4>Reference</h4>
                  <div className="stats">{underLoading?.reference || 'N/A'}</div>
                </div>
                <div className="section">
                  <h4>Under Loading</h4>
                  <div className="stats">
                    <div>Vehicles: {underLoading?.totalCount || 0}</div>
                    <div>Qty: {Math.round(underLoading?.totalWeight || 0)} MT</div>
                  </div>
                </div>
                <div className="section">
                  <h4>Under Invoicing</h4>
                  <div className="stats">
                    <div>Vehicles: {underBilling?.totalCount || 0}</div>
                    <div>Qty: {Math.round(underBilling?.totalWeight || 0)} MT</div>
                  </div>
                </div>
                <div className="section">
                  <h4>Billed</h4>
                  <div className="stats">
                    <div>Vehicles: {billed?.totalCount || 0}</div>
                    <div>Qty: {Math.round(billed?.totalWeight || 0)} MT</div>
                  </div>
                </div>
                <div className="section">
                  <h4>Vehicle at Extr. Parking</h4>
                  <div className="stats">
                    <div>Vehicles: {doIssued?.totalCount || 0}</div>
                    <div>Qty: {Math.round(doIssued?.totalWeight || 0)} MT</div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div className="total-card" style={{
          background: currentTheme.primary,
          color: currentTheme.text
        }}>
          <div className="card-header">
            <div className="shop-name">TOTAL</div>
            <div className="total-weight">{Math.round(calculateTotalWeight()).toFixed(2)} MT</div>
          </div>
        </div>
      </div>
    )
  }

  const handleCloseGateInfoDialog = () => {
    setOpenGateInfoDialog(false)
    setSelectedGateInfoData(null)
    setShipmentDetails([]); // Clear details when dialog closes
    setLoadingShipmentDetails(false);
  };

  const handleViewGateInfo = async (gateInfo: any) => {
    setSelectedGateInfoData(gateInfo);
    setOpenGateInfoDialog(true);
    setShipmentDetails([]); // Reset previous details

    // Check if shipmentIds are present in the gateInfo object
    if (!gateInfo || !gateInfo.shipmentIds || gateInfo.shipmentIds.length === 0) {
      console.log("No shipment IDs found for this entry:", gateInfo);
      // Optionally, you can display a message in the dialog if no IDs are found
      return;
    }

    setLoadingShipmentDetails(true);
    try {
      const payload = { shipmentIds: gateInfo.shipmentIds }; // API expects "shipment_ids"
      // Pass router to httpsPost as it's a required parameter in Communication.ts
      const response = await httpsPost("billing/shipments_details", payload, router, 1);

      if (response && response.data && response.statusCode === 200) {
        setShipmentDetails(response.data);
      } else {
        console.error("Failed to fetch shipment details:", response?.msg || "Unknown error");
        setShipmentDetails([]); // Clear or set error state
      }
    } catch (error) {
      console.error("Error calling billing/shipments_details:", error);
      setShipmentDetails([]); // Clear or set error state
    } finally {
      setLoadingShipmentDetails(false);
    }
  };


  return (
    <>
      <div className="billing-table-container">
        <div className="table-section">
          <Card className="table-card">
            <CardContent className="p-0 h-full flex flex-col">
              {!isMobile && (
                <div className="table-header">
                  <div className="datetime-container">
                    <div className="date-display" style={{ color: currentTheme.textSecondary }}>
                      <Calendar className="datetime-icon" size={16} />
                      <span>Date: {format(currentTime, "dd-MMM-yy")}</span>
                    </div>
                    <div className="time-display" style={{ color: currentTheme.textSecondary }}>
                      <Clock className="datetime-icon" size={16} />
                      <span>Time: {format(currentTime, "hh:mm a")}</span>
                    </div>
                  </div>
                </div>
              )}
              {isMobile ? (
                renderMobileView()
              ) : (
                <div className="table-wrapper">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead rowSpan={2} style={{
                          textAlign: "center",
                          minWidth: "140px", 
                          maxWidth: "200px"
                        }}>Shop</TableHead>
                        <TableHead colSpan={2}>Under Loading</TableHead>
                        <TableHead colSpan={2}>Under Invoicing</TableHead>
                        <TableHead colSpan={2}>Billed</TableHead>
                        <TableHead colSpan={2}>DO Issued</TableHead>
                        <TableHead rowSpan={2} style={{ textAlign: "center" }}>
                          Total 
                          <br />
                          Potential
                          <br />
                          (MT)
                        </TableHead>
                        <TableHead colSpan={2}>Mode</TableHead>
                        <TableHead rowSpan={2} style={{ textAlign: "center" }}>
                          G. Total
                          <br />
                          Qty
                          <br />
                          (MT)
                        </TableHead>
                      </TableRow>
                      <TableRow>
                        {/* Under Loading */}
                        <TableHead style={{ textAlign: "center", width: "50px", minWidth: "50px" }}><Truck size={16} color={currentTheme.text} /></TableHead>
                        <TableHead style={{ width: "80px", minWidth: "80px" }}>
                          Qty
                          <br />
                          (MT)
                        </TableHead>
                        {/* Under Invoicing */}
                        <TableHead style={{ textAlign: "center", width: "50px", minWidth: "50px" }}><Truck size={16} color={currentTheme.text} /></TableHead>
                        <TableHead style={{ width: "80px", minWidth: "80px" }}>
                          Qty
                          <br />
                          (MT)
                        </TableHead>
                        {/* Billed */}
                        <TableHead style={{ textAlign: "center", width: "50px", minWidth: "50px" }}><Truck size={16} color={currentTheme.text} /></TableHead>
                        <TableHead style={{ width: "80px", minWidth: "80px" }}>
                          Qty
                          <br />
                          (MT)
                        </TableHead>
                        {/* DO Issued */}
                        <TableHead style={{ textAlign: "center", width: "50px", minWidth: "50px" }}><Truck size={16} color={currentTheme.text} /></TableHead>
                        <TableHead style={{ width: "80px", minWidth: "80px" }}>
                          Qty
                          <br />
                          (MT)
                        </TableHead>
                        {/* Total Potential (MT) - This column is rowSpan=2, so no header here in second row */}
                        {/* Mode */}
                        <TableHead style={{ minWidth: "80px" }}>
                          By
                          <br />
                          Road
                          <br />
                          (MT)
                        </TableHead>
                        <TableHead style={{ minWidth: "80px" }}>
                          By
                          <br />
                          Rake
                          <br />
                          (MT)
                        </TableHead>
                        {/* G. Total Qty (MT) - This column is rowSpan=2, so no header here in second row */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allLocations.map((locationName) => {
                        const underLoading = data?.underLoadingresult.find(
                          (item) => item.locationName === locationName
                        )
                        const underBilling = data?.underBillingresult.find(
                          (item) => item.locationName === locationName
                        )
                        const doIssued = data?.doIssuedresult.find(
                          (item) => item.locationName === locationName
                        )
                        const billed = data?.billedResult.find(
                          (item) => item.material === locationName
                        )

                        const rowTotal =
                          (underLoading?.totalWeight || 0) +
                          (underBilling?.totalWeight || 0) +
                          (doIssued?.totalWeight || 0) +
                          (billed?.totalWeight || 0);

                        return (
                          <TableRow key={locationName}>
                            <TableCell style={{
                              textAlign: "center"
                            }}>{locationName}</TableCell>
                            <TableCell
                              onClick={() => {
                                handleViewGateInfo(underLoading);
                              }}
                              style={{ cursor: "pointer", width: "50px", minWidth: "50px" }}
                            >{underLoading?.totalCount || 0}
                            </TableCell>
                            <TableCell style={{ width: "80px", minWidth: "80px" }}>{Math.round(underLoading?.totalWeight || 0)}</TableCell>
                            <TableCell
                              onClick={() => {
                                handleViewGateInfo(underBilling);
                              }}
                              style={{ cursor: "pointer", width: "50px", minWidth: "50px" }}
                            >{underBilling?.totalCount || 0}</TableCell>
                            <TableCell style={{ width: "80px", minWidth: "80px" }}>{Math.round(underBilling?.totalWeight || 0)}</TableCell>
                            <TableCell onClick={() => {
                              handleViewGateInfo(billed);
                            }}
                              style={{ cursor: "pointer", width: "50px", minWidth: "50px" }}
                            >{billed?.totalCount || 0}</TableCell>
                            <TableCell style={{ width: "80px", minWidth: "80px" }}>{Math.round(billed?.totalWeight || 0)}</TableCell>
                            <TableCell
                              onClick={() => {
                                handleViewGateInfo(doIssued);
                              }}
                              style={{ cursor: "pointer", width: "50px", minWidth: "50px" }}
                            >{doIssued?.totalCount || 0}</TableCell>
                            <TableCell style={{ width: "80px", minWidth: "80px" }}>{Math.round(doIssued?.totalWeight || 0)}</TableCell>
                            <TableCell style={{ minWidth: "100px" }}>{Math.round(rowTotal)}</TableCell>
                            <TableCell style={{ minWidth: "80px" }}>{Math.round(billed?.totalWeight || 0)}</TableCell>
                            <TableCell style={{ minWidth: "80px" }}>0</TableCell>
                            <TableCell style={{ minWidth: "100px" }}>{Math.round((billed?.totalWeight || 0) + 0)}</TableCell>
                          </TableRow>
                        )
                      })}
                      <TableRow className="total-row">
                        <TableCell>TOTAL</TableCell>
                        <TableCell>
                          {data?.underLoadingresult.reduce((sum, item) => sum + item.totalCount, 0) || 0}
                        </TableCell>
                        <TableCell>
                          {Math.round(data?.underLoadingresult.reduce((sum, item) => sum + item.totalWeight, 0) || 0)}
                        </TableCell>
                        <TableCell>
                          {data?.underBillingresult.reduce((sum, item) => sum + item.totalCount, 0) || 0}
                        </TableCell>
                        <TableCell>
                          {Math.round(data?.underBillingresult.reduce((sum, item) => sum + item.totalWeight, 0) || 0)}
                        </TableCell>
                        <TableCell>
                          {data?.billedResult.reduce((sum, item) => sum + item.totalCount, 0) || 0}
                        </TableCell>
                        <TableCell>
                          {Math.round(data?.billedResult.reduce((sum, item) => sum + item.totalWeight, 0) || 0)}
                        </TableCell>
                        <TableCell>
                          {data?.doIssuedresult.reduce((sum, item) => sum + item.totalCount, 0) || 0}
                        </TableCell>
                        <TableCell>
                          {Math.round(data?.doIssuedresult.reduce((sum, item) => sum + item.totalWeight, 0) || 0)}
                        </TableCell>
                        <TableCell style={{ minWidth: "100px" }}>{Math.round(calculateTotalWeight())}</TableCell>
                        <TableCell style={{ minWidth: "80px" }}>
                          {Math.round(data?.billedResult.reduce((sum, item) => sum + item.totalWeight, 0) || 0)}
                        </TableCell>
                        <TableCell style={{ minWidth: "80px" }}>0</TableCell>
                        <TableCell style={{ minWidth: "100px" }}>
                          {Math.round((data?.billedResult.reduce((sum, item) => sum + item.totalWeight, 0) || 0) + 0)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <BootstrapDialog
        onClose={handleCloseGateInfoDialog}
        className="billing-status-gate-info-dialog-styles"
        aria-labelledby="customized-dialog-title"
        open={openGateInfoDialog}
      >
        <div className="billing-status-gate-info-dialog-container">
          <div
            aria-label="close"
            onClick={handleCloseGateInfoDialog}
            className="billing-status-gate-info-dialog-close-icon"
          >
            <Image src={CloseButtonIcon} alt="close" />
          </div>
          <div className="billing-status-gate-info-modal-details">
            <div className="billing-status-gate-info-detail-item">
              <span className="billing-status-gate-info-detail-label">Location Name:</span>
              <span className="billing-status-gate-info-detail-value">{selectedGateInfoData?.locationName || ''}</span>
            </div>
            <div className="billing-status-gate-info-detail-item">
              <span className="billing-status-gate-info-detail-label">Total Count:</span>
              <span className="billing-status-gate-info-detail-value">{selectedGateInfoData?.totalCount || 0}</span>
            </div>
            <div className="billing-status-gate-info-detail-item">
              <span className="billing-status-gate-info-detail-label">Total Weight:</span>
              <span className="billing-status-gate-info-detail-value">{selectedGateInfoData?.totalWeight || 0} MT</span>
            </div>
          </div>
          {loadingShipmentDetails ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size="large" />
              <p>Loading shipment details...</p>
            </div>
          ) : shipmentDetails && shipmentDetails.length > 0 ? (
            <>
              <div className="billing-status-gate-info-legend">
                <div className="legend-item">
                  <span className="legend-color-box gate-entry-legend-color"></span> Gate Entry Number
                </div>
                <div className="legend-item">
                  <span className="legend-color-box vehicle-number-legend-color"></span> Vehicle Number
                </div>
              </div>
              <div className="billing-status-gate-info-shipment-details-list"> {/* Changed class name for clarity */}
                <h3>Shipment Details</h3>
                <ul>
                  {shipmentDetails.map((shipment: ShipmentDetailItem, index: number) => (
                    <li key={shipment._id || index}> {/* Use a unique key */}
                      <a
                        href={`${getTrackerUrlPrefix()}${shipment.unique_code}`}
                        target="_blank" // Opens in a new tab
                        rel="noopener noreferrer" // Security best practice for target="_blank"
                        title={`View details for ${shipment.vehicle_no}`}
                      >
                        <span className="gate-entry-number-style">{shipment.driver?.gate_entry_no || 'N/A'}</span>

                        &nbsp;-&nbsp;

                        <span className="vehicle-number-style">{shipment.vehicle_no || 'N/A'}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (

            <div className="billing-status-gate-info-shipment-details-list">
              <h3>Shipment Details</h3>
              <p>{selectedGateInfoData?.shipmentIds && selectedGateInfoData.shipmentIds.length > 0 ? 'Could not load shipment details.' : 'No shipment IDs available for this entry.'}</p>
            </div>
          )}
        </div>
      </BootstrapDialog>


      <style jsx global>{`
        .billing-table-container {
          min-height: calc(100vh - 64px);
          background-color: ${currentTheme.cardBg}; /* Keep background color */
          background-image: ${currentTheme.background};
          color: ${currentTheme.text};
          margin-top: 64px;
          width: 100%;
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        table {
          width: 100%;
          height: 100%;
          border-collapse: collapse;
          table-layout: auto;
        }

        tbody {
          height: 100%;
        }

        tr {
          height: 3rem;
        }

        th,
        td {
          border: 1px solid ${currentTheme.accent};
          padding: 0.75rem 0.5rem;
          text-align: center;
          font-size: 0.875rem;
          white-space: nowrap;
          // min-width: 90px;
          background: ${currentTheme.cardBg};
          color: ${currentTheme.text};
        }

        th:first-child,
        td:first-child {
          min-width: 140px;
          max-width: 200px;
          position: sticky;
          // left: 1rem;
          z-index: 1;
        }

        th {
          background: ${currentTheme.primary};
          color: ${currentTheme.text};
          font-weight: 600;
          position: sticky;
          top: 0;
          z-index: 2;
        }

        th:first-child {
          z-index: 3;
        }

        td {
          vertical-align: middle;
        }

        tr:hover td {
          background: ${currentTheme.hover};
        }

        tr:hover td:first-child {
          background: ${currentTheme.hover};
        }

        .total-row {
          background: ${currentTheme.primary};
        }

        .total-row td {
          color: ${currentTheme.text};
          background: ${currentTheme.primary};
        }

        .total-row td:first-child {
          background: ${currentTheme.primary};
        }

        .datetime-container {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;
          color: ${currentTheme.textSecondary};
          font-weight: 500;
          justify-content: flex-end;
        }

        .date-display,
        .time-display {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .datetime-icon {
          color: ${currentTheme.textSecondary};
        }
      
               
        .billing-status-gate-info-dialog-styles {
            font-family: 'Inter', sans-serif;
        }

        .billing-status-gate-info-dialog-styles .billing-status-gate-info-dialog-container {
            position: relative;
            display: inline-block;
            border-radius: 12px !important;
            overflow-y: unset;
            width: 60vw !important;
            max-width: 60vw !important;
            background-color: white;
        }

        .billing-status-gate-info-dialog-styles .MuiDialog-container .MuiDialog-paper {
            position: relative;
            border-radius: 12px !important;
            max-height: 70%;
            overflow-y: unset;
            width: 60vw !important;
            max-width: 60vw !important;
        }

        .billing-status-gate-info-dialog-styles .billing-status-gate-info-dialog-close-icon {
            position: absolute;
            top: -40px;
            right: -2px;
            cursor: pointer;
            z-index: 1000;
        }

        .billing-status-gate-info-dialog-container{
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;
            width: 100%;
            height: 100%;
            padding: 16px;
        }

        .billing-status-gate-info-dialog-title {
            text-align: left;
            font-size: 20px;
            font-weight: 600;
            color: #000;
        }

        .billing-status-gate-info-modal-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .billing-status-gate-info-detail-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .billing-status-gate-info-detail-label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .billing-status-gate-info-detail-value {
          font-size: 1.2rem;
          font-weight: bold;
          color: #333;
        }

        .billing-status-gate-info-shipment-details-list { /* Updated class name */
          background-color: #f8f9fa;
          border-radius: 6px;
          padding: 1rem;
          width: 100%; /* Ensure it takes full width of its container */
          margin-top: 1rem; /* Add some space from the details above */
        }

        .billing-status-gate-info-shipment-details-list h3 {
          font-size: 1.1rem;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .billing-status-gate-info-shipment-details-list ul {
          list-style-type: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* Adjusted minmax for better readability */
          gap: 0.5rem;
        }

        .billing-status-gate-info-shipment-details-list li {
          background-color: #e9ecef;
          border-radius: 4px;
          padding: 0.5rem;
          font-size: 0.9rem;
          text-align: center;
        }

        .billing-status-gate-info-shipment-details-list li a {
          color: #007bff; /* Standard link color */
          text-decoration: none;
        }

        .billing-status-gate-info-shipment-details-list li a:hover {
          text-decoration: underline;
          color: #0056b3;
        }

        .billing-status-gate-info-shipment-details-list p {
          color: #495057;
        }

        .gate-entry-number-style {
          color: #20114d;
          // font-weight: bold;
        }

        .vehicle-number-style {
          color: #green;
          // font-weight: bold;
        }

        .billing-status-gate-info-legend {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem; /* Space before the list */
          padding-left: 1rem; /* Align with list padding */
        }

        .legend-item {
          display: flex;
          align-items: center;
          font-size: 0.8rem;
          color: #333;
        }

        .legend-color-box {
          width: 12px;
          height: 12px;
          margin-right: 0.3rem;
          border: 1px solid #ccc;
        }
        .gate-entry-legend-color {
          background-color: #20114d;
        }
        .vehicle-number-legend-color {
          background-color: #007BFF;
        }
        @media (max-width: 768px) {
          .billing-table-container {
            // padding: 0.5rem;
            margin-top: 0;
            min-height: 100vh;
            width: 100%;
          }

          .mobile-container {
            padding: 10px 16px 90px 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .mobile-card {
            background: ${currentTheme.cardBg};
            border: 1px solid ${currentTheme.accent};
            border-radius: 8px;
            padding: 12px;
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid ${currentTheme.accent};
          }

          .shop-name {
            font-size: 14px;
            font-weight: 600;
            color: ${currentTheme.text};
          }

          .total-weight {
            font-size: 14px;
            color: ${currentTheme.textSecondary};
          }

          .card-sections {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .section {
            padding: 8px;
            background: ${currentTheme.hover};
            border-radius: 6px;
          }

          .section h4 {
            font-size: 12px;
            font-weight: 600;
            color: ${currentTheme.text};
            margin-bottom: 4px;
          }

          .stats {
            font-size: 12px;
            color: ${currentTheme.textSecondary};
          }

          .total-card {
            background: ${currentTheme.cardBg};
            position: fixed;
            bottom: 52px;
            left: 0;
            right: 0;
            padding: 12px 16px;
            border-top: 1px solid ${currentTheme.accent};
            box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
            z-index: 10;
          }

          .total-card .card-header {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
          }

          .table-header {
            position: sticky;
            top: 0;
            background: ${currentTheme.cardBg};
            z-index: 40;
            padding: 0.75rem;
            margin: -0.5rem -0.5rem 0.5rem -0.5rem;
            border-bottom: 1px solid ${currentTheme.accent};
          }
        }
      `}</style>
    </>
  )
}

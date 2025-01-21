'use client'

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Calendar, Clock } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table"
import { Card, CardContent } from "@/components/UI/card"
import { httpsGet } from "@/utils/Communication"

const themes = {
  navy: {
    name: 'Navy',
    primary: '#001529',
    secondary: '#003a75',
    text: '#e6f7ff',
    textSecondary: '#8bb4f7',
    accent: '#1890ff',
    background: 'linear-gradient(135deg, #001529 0%, #003a75 100%)',
    cardBg: 'rgba(13, 25, 45, 0.8)',
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
}

interface BilledData {
  _id: string
  totalWeight: number
  totalCount: number
  material: string
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
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

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
          setData(response.data)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
      ].map((item) => item.locationName)
    )
  )

  // Calculate totals
  const calculateTotalWeight = () => {
    const underLoadingTotal = data?.underLoadingresult.reduce(
      (sum, item) => sum + item.totalWeight,
      0
    ) || 0
    const underBillingTotal = data?.underBillingresult.reduce(
      (sum, item) => sum + item.totalWeight,
      0
    ) || 0
    const doIssuedTotal = data?.doIssuedresult.reduce(
      (sum, item) => sum + item.totalWeight,
      0
    ) || 0
    const billedTotal = data?.billedResult.reduce(
      (sum, item) => sum + item.totalWeight,
      0
    ) || 0

    return underLoadingTotal + underBillingTotal + doIssuedTotal + billedTotal
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  const renderMobileView = () => {
    return (
      <div className="mobile-container"  style={{ 
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
            (billed?.totalWeight || 0)

          return (
            <div key={locationName} className="mobile-card" style={{ 
              background: currentTheme.cardBg, 
              color: currentTheme.textSecondary,
              border: `1px solid ${currentTheme.primary}`
            }}>
              <div className="card-header">
                <div className="shop-name">{locationName}</div>
                <div className="total-weight">{rowTotal.toFixed(2)} MT</div>
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
                    <div>Qty: {underLoading?.totalWeight.toFixed(2) || "0.00"} MT</div>
                  </div>
                </div>
                <div className="section">
                  <h4>Under Billing</h4>
                  <div className="stats">
                    <div>Vehicles: {underBilling?.totalCount || 0}</div>
                    <div>Qty: {underBilling?.totalWeight.toFixed(2) || "0.00"} MT</div>
                  </div>
                </div>
                <div className="section">
                  <h4>Billed</h4>
                  <div className="stats">
                    <div>Vehicles: {billed?.totalCount || 0}</div>
                    <div>Qty: {billed?.totalWeight.toFixed(2) || "0.00"} MT</div>
                  </div>
                </div>
                <div className="section">
                  <h4>Vehicle at Extr. Parking</h4>
                  <div className="stats">
                    <div>Vehicles: {doIssued?.totalCount || 0}</div>
                    <div>Qty: {doIssued?.totalWeight.toFixed(2) || "0.00"} MT</div>
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
            <div className="total-weight">{calculateTotalWeight().toFixed(2)} MT</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="billing-table-container">
      <div className="table-section">
        <Card className="table-card">
          <CardContent className="p-0 h-full flex flex-col">
            {!isMobile && (
              <div className="table-header">
                <div className="datetime-container">
                  <div className="date-display">
                    <Calendar className="datetime-icon" size={16} />
                    <span>Date: {format(currentTime, "dd-MMM-yy")}</span>
                  </div>
                  <div className="time-display">
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
                      <TableHead rowSpan={2}>Shop</TableHead>
                      <TableHead colSpan={2}>Under Loading</TableHead>
                      <TableHead colSpan={2}>Under Billing</TableHead>
                      <TableHead colSpan={2}>Billed</TableHead>
                      <TableHead colSpan={2}>Vehicle at Extr. Parking</TableHead>
                      <TableHead rowSpan={2}>Total Qty (MT)</TableHead>
                      <TableHead colSpan={2}>Mode</TableHead>
                      <TableHead rowSpan={2}>G. Total Qty (MT)</TableHead>
                    </TableRow>
                    <TableRow>
                      <TableHead>No. of Veh.</TableHead>
                      <TableHead>Qty (MT)</TableHead>
                      <TableHead>No. of Veh.</TableHead>
                      <TableHead>Qty (MT)</TableHead>
                      <TableHead>No. of Veh.</TableHead>
                      <TableHead>Qty (MT)</TableHead>
                      <TableHead>No. of Veh.</TableHead>
                      <TableHead>Qty (MT)</TableHead>
                      <TableHead>By Road</TableHead>
                      <TableHead>By Rake</TableHead>
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
                        (billed?.totalWeight || 0) +
                        (doIssued?.totalWeight || 0)

                      return (
                        <TableRow key={locationName}>
                          <TableCell>{locationName}</TableCell>
                          <TableCell>{underLoading?.totalCount || 0}</TableCell>
                          <TableCell>{underLoading?.totalWeight.toFixed(2) || "0.00"}</TableCell>
                          <TableCell>{underBilling?.totalCount || 0}</TableCell>
                          <TableCell>{underBilling?.totalWeight.toFixed(2) || "0.00"}</TableCell>
                          <TableCell>{billed?.totalCount || 0}</TableCell>
                          <TableCell>{billed?.totalWeight.toFixed(2) || "0.00"}</TableCell>
                          <TableCell>{doIssued?.totalCount || 0}</TableCell>
                          <TableCell>{doIssued?.totalWeight.toFixed(2) || "0.00"}</TableCell>
                          <TableCell>{rowTotal.toFixed(2)}</TableCell>
                          <TableCell>{rowTotal.toFixed(2)}</TableCell>
                          <TableCell>0.00</TableCell>
                          <TableCell>{rowTotal.toFixed(2)}</TableCell>
                        </TableRow>
                      )
                    })}
                    <TableRow className="total-row">
                      <TableCell>TOTAL</TableCell>
                      <TableCell>
                        {data?.underLoadingresult.reduce((sum, item) => sum + item.totalCount, 0) || 0}
                      </TableCell>
                      <TableCell>
                        {data?.underLoadingresult
                          .reduce((sum, item) => sum + item.totalWeight, 0)
                          .toFixed(2) || "0.00"}
                      </TableCell>
                      <TableCell>
                        {data?.underBillingresult.reduce((sum, item) => sum + item.totalCount, 0) || 0}
                      </TableCell>
                      <TableCell>
                        {data?.underBillingresult
                          .reduce((sum, item) => sum + item.totalWeight, 0)
                          .toFixed(2) || "0.00"}
                      </TableCell>
                      <TableCell>
                        {data?.billedResult.reduce((sum, item) => sum + item.totalCount, 0) || 0}
                      </TableCell>
                      <TableCell>
                        {data?.billedResult
                          .reduce((sum, item) => sum + item.totalWeight, 0)
                          .toFixed(2) || "0.00"}
                      </TableCell>
                      <TableCell>
                        {data?.doIssuedresult.reduce((sum, item) => sum + item.totalCount, 0) || 0}
                      </TableCell>
                      <TableCell>
                        {data?.doIssuedresult
                          .reduce((sum, item) => sum + item.totalWeight, 0)
                          .toFixed(2) || "0.00"}
                      </TableCell>
                      <TableCell>{calculateTotalWeight().toFixed(2)}</TableCell>
                      <TableCell>{calculateTotalWeight().toFixed(2)}</TableCell>
                      <TableCell>0.00</TableCell>
                      <TableCell>{calculateTotalWeight().toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        .billing-table-container {
          min-height: calc(100vh - 64px);
          background-color: ${currentTheme.cardBg};
          background-image: ${currentTheme.background};
          color: ${currentTheme.text};
          margin-top: 64px;
          width: 100%;
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        .table-wrapper {
          // height: calc(100% - 48px);
          // overflow: auto;
          // padding-left: 1rem;
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

        @media (max-width: 768px) {
          .billing-table-container {
            // padding: 0.5rem;
            margin-top: 0;
            min-height: 100vh;
            width: 100vw;
          }

          .mobile-container {
            padding: 10px 16px 50px 16px;
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
            bottom: 60px;
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
    </div>
  )
}

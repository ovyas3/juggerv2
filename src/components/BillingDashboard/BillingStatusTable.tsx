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

export function BillingStatusTable() {
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
      <div className="mobile-container">
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
            <div key={locationName} className="mobile-card">
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
        <div className="total-card">
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
          padding: 1rem;
          min-height: calc(100vh - 64px);
          background-color: #f8fafc;
          margin-top: 64px;
          width: 100%;
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        .table-section {
          height: 100%;
          width: 100%;
        }

        .table-card {
          height: 100%;
          width: 100%;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .table-header {
          display: flex;
          justify-content: flex-end;
          gap: 2rem;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          background: white;
          z-index: 10;
        }

        .table-wrapper {
          height: calc(100% - 48px);
          overflow: auto;
          padding-left: 1rem;
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
          border: 1px solid #e2e8f0;
          padding: 0.75rem 0.5rem;
          text-align: center;
          font-size: 0.875rem;
          white-space: nowrap;
          min-width: 90px;
          background: white;
        }

        th:first-child,
        td:first-child {
          min-width: 140px;
          max-width: 200px;
          position: sticky;
          left: 1rem;
          z-index: 1;
        }

        th {
          background: #f1f5f9;
          color: #334155;
          font-weight: 600;
          position: sticky;
          top: 0;
          z-index: 2;
        }

        th:first-child {
          z-index: 3;
        }

        td {
          color: #475569;
          vertical-align: middle;
        }

        tr:hover td {
          background: #f8fafc;
        }

        tr:hover td:first-child {
          background: #f8fafc;
        }

        .total-row {
          background: #f1f5f9;
          font-weight: 600;
        }

        .total-row td {
          color: #334155;
          background: #f1f5f9;
        }

        .total-row td:first-child {
          background: #f1f5f9;
        }

        .datetime-container {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .date-display,
        .time-display {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .datetime-icon {
          color: #64748b;
        }

        @media (max-width: 768px) {
          .billing-table-container {
            padding: 0.5rem;
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
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
          }

          .shop-name {
            font-size: 14px;
            font-weight: 600;
            color: #334155;
          }

          .total-weight {
            font-size: 14px;
            color: #64748b;
          }

          .card-sections {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .section {
            padding: 8px;
            background: #f8fafc;
            border-radius: 6px;
          }

          .section h4 {
            font-size: 12px;
            font-weight: 600;
            color: #334155;
            margin-bottom: 4px;
          }

          .stats {
            font-size: 12px;
            color: #475569;
          }

          .total-card {
            background: white;
            position: fixed;
            bottom: 60px;
            left: 0;
            right: 0;
            padding: 12px 16px;
            border-top: 1px solid #e2e8f0;
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
            background: white;
            z-index: 40;
            padding: 0.75rem;
            margin: -0.5rem -0.5rem 0.5rem -0.5rem;
            border-bottom: 1px solid #e2e8f0;
          }
        }
      `}</style>
    </div>
  )
}

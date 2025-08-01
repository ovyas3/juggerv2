"use client"

import { useState } from "react"
import { CalendarDays, TrendingUp, MapPin, DollarSign, Database, Download, Loader2 } from "lucide-react"
import styles from "./DataOverviewTab.module.css"
import { Tabs, TabsContent } from "@/components/UI/tabs"
import { httpsPost } from "@/utils/Communication"
import MetricCard from "../../UI/MetricCard"
import SummaryCardSkeleton from "../../UI/MetricCardSkeleton"
import { iconMap } from "../../UI/iconMap"

const DataOverviewTab = ({ tableData, isLoadingTable, filters, metricsData, isLoadingMetrics }: any) => {
  const [isDownloading, setIsDownloading] = useState(false)
  const [rowDownloading, setRowDownloading] = useState<string | null>(null)

  const handleExportData = async () => {
    setIsDownloading(true)
    try {
      const response = await httpsPost(
        "ptpk/download/table",
        {
          ...filters,
          report: true,
        },
        {},
        1,
      )
      if (response?.statusCode === 200 && response?.data?.link) {
        const link = document.createElement("a")
        link.href = response.data.link
        link.download = "PTPK_Full_Data.csv"
        link.target = "_blank"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error("CSV Download Error:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleRowDownload = async (row: any) => {
    setRowDownloading(row.month)
    try {
      const response = await httpsPost(
        "ptpk/download/row",
        {
          ...filters,
          month: row.month,
          report: true,
          year: row.year,
        },
        {},
        1,
      )
      if (response?.statusCode === 200 && response?.data?.link) {
        const link = document.createElement("a")
        link.href = response.data.link
        link.download = `PTPK_${row.month}_Data.csv`
        link.target = "_blank"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error("Row CSV Download Error:", error)
    } finally {
      setRowDownloading(null)
    }
  }

  const regions = ["North", "East", "West", "South", "Center"]

  const getZoneValue = (zones: Record<string, any>, region: string) => {
    // API zones keys are capitalized, so match accordingly
    return zones[region] !== undefined && zones[region] !== "N/A" ? zones[region] : "-"
  }

  const formatNumber = (val: any, decimals = 2) => {
    if (val === "N/A" || val === undefined || val === null || isNaN(val)) return "-"
    return Number(val).toLocaleString(undefined, { maximumFractionDigits: decimals })
  }

  return (
    <div className={styles.mainContent}>
      <div className={styles.metricsGrid}>
        {isLoadingMetrics ? (
          <SummaryCardSkeleton count={6} />
        ) : metricsData.length === 0 ? (
          <div className={styles.noDataAvailable}>No data available for the selected period.</div>
        ) : (
          metricsData.map((metric: any) => {
            const iconName = metric.icon || "default"
            const IconComponent = iconMap[iconName] || iconMap.default

            return (
              <MetricCard
                key={metric.id}
                title={metric.title}
                value={metric.value}
                icon={<IconComponent className="h-4 w-4" style={{ color: metric.iconColor }} />}
                bgColor={metric.bgColor}
                borderColor={metric.borderColor}
                iconColor={metric.iconColor}
              />
            )
          })
        )}
      </div>
      <Tabs defaultValue="data">
        <TabsContent value="data" className={styles.contentSpacing}>
          <div className={styles.tableCard} style={{ marginBottom: "2rem" }}>
            <div className={styles.tableHeader}>
              <div className={styles.tableHeaderDecorations}>
                <div className={styles.decoration1}></div>
                <div className={styles.decoration2}></div>
              </div>
              <div className={styles.tableHeaderContent}>
                <div className={styles.tableHeaderLeft}>
                  <div className={styles.tableTitle}>
                    <div className={styles.titleDecorativeBars}>
                      <div className={styles.bar1}></div>
                      <div className={styles.bar2}></div>
                      <div className={styles.bar3}></div>
                    </div>
                    <span className={styles.titleText}>Comprehensive Monthly Performance Data</span>
                  </div>
                  <div className={styles.tableDescription}>
                    Complete logistics data breakdown by mode, region, and time period with advanced analytics
                  </div>
                </div>
                <div className={styles.tableHeaderRight}>
                  <button className={styles.exportButton} onClick={handleExportData} disabled={isDownloading}>
                    <Download className="h-4 w-4" />
                    {isDownloading ? "Exporting..." : "Export Data"}
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.filterBar}>
              <div className={styles.filterContent}>
                {/* <div className={styles.filterLeft}>
                    <div className={styles.filterLabel}>
                      <Filter className="h-4 w-4" />
                      <span>Quick Filters:</span>
                    </div>
                    <div className={styles.filterButtons}>
                      {["All Modes", "Road Only", "Rail Only", "High Volume", "Cost Efficient"].map((filter) => (
                        <button
                        key={filter}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f8fafc";
                          e.currentTarget.style.borderColor = "#cbd5e1";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "white";
                          e.currentTarget.style.borderColor = "#d1d5db";
                          e.currentTarget.style.transform = "none";
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          backgroundColor: "white",
                          border: "1px solid #d1d5db",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                          padding: "8px 20px",
                          borderRadius: "9999px",
                          color: "#111827",
                        }}
                      >
                        {filter}
                      </button>
                    ))}
                  </div> */}
              </div>
              {/* Enhanced Table Footer with Analytics */}
              {/* <div className={styles.tableFooter}>
                  <div className={styles.footerContent}>
                    <div className={styles.footerIndicators}>
                      <div className={styles.footerIndicator}>
                        <div className={styles.indicatorDotRed}></div>
                        <span className={styles.indicatorText}>High Cost Alert</span>
                        <span className={styles.indicatorBadgeRed}>3 regions</span>
                      </div>
                      <div className={styles.footerIndicator}>
                        <div className={styles.indicatorDotGreen}></div>
                        <span className={styles.indicatorText}>Optimization Opportunity</span>
                        <span className={styles.indicatorBadgeGreen}>₹47Cr</span>
                      </div>
                      <div className={styles.footerIndicator}>
                        <div className={styles.indicatorDotBlue}></div>
                        <span className={styles.indicatorText}>Live Data</span>
                        <span className={styles.indicatorTime}>Last updated: 2 min ago</span>
                      </div>
                    </div>
                  </div>
                </div> */}
            </div>
            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <thead>
                  <tr className={styles.tableHeaderRow}>
                    <th className={`${styles.mainHeader} ${styles.stickyModeMainHeader}`}>
                      <div className={styles.headerContentFlex}>
                        <div
                          style={{
                            width: "0.5rem",
                            height: "0.5rem",
                            background: "#3b82f6",
                            borderRadius: "50%",
                          }}
                        ></div>
                        Mode
                      </div>
                    </th>
                    <th className={`${styles.mainHeader} ${styles.stickyMonthMainHeader}`}>
                      <div className={styles.headerContentFlex}>
                        <CalendarDays className="h-3 w-3" style={{ color: "#6366f1" }} />
                        Month
                      </div>
                    </th>
                    <th className={styles.mainHeaderPtpk} colSpan={6}>
                      <div className={styles.headerContentFlex}>
                        <TrendingUp className="h-4 w-4" style={{ color: "#dc2626" }} />
                        <span>Cost Per Ton Per KM (₹/MT/KM)</span>
                        {/* <div className={styles.liveIndicatorSmall}>
                            <div className={styles.liveDotSmall}></div>
                            <span className={styles.liveText}>Live</span>
                          </div> */}
                      </div>
                    </th>
                    <th className={styles.mainHeaderDistance} colSpan={6}>
                      <div className={styles.headerContentFlex}>
                        <MapPin className="h-4 w-4" style={{ color: "#2563eb" }} />
                        <span>Avg Lead Distance (KM)</span>
                      </div>
                    </th>
                    <th className={styles.mainHeaderCost} colSpan={6}>
                      <div className={styles.headerContentFlex}>
                        <DollarSign className="h-4 w-4" style={{ color: "#059669" }} />
                        <span>Cost Per Ton (₹/MT)</span>
                      </div>
                    </th>
                    <th className={styles.mainHeaderQuantity} colSpan={7}>
                      <div className={styles.headerContentFlex}>
                        <Database className="h-4 w-4" style={{ color: "#7c3aed" }} />
                        <span>Total Quantity Billed (MT)</span>
                      </div>
                    </th>
                  </tr>
                  <tr className={styles.tableSubheaderRow}>
                    <th className={`${styles.subHeader} ${styles.stickyMode}`}></th>
                    <th className={`${styles.subHeader} ${styles.stickyMonth}`}></th>
                    {["North", "East", "West", "South", "Center"].map((region) => (
                      <th key={region} className={styles.subHeader}>
                        <div className={styles.subHeaderContent}>
                          <div className={styles.regionBar}></div>
                          <span>{region}</span>
                          <div className={styles.hoverIcon}>
                            <TrendingUp className="h-3 w-3" style={{ color: "#ef4444" }} />
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className={styles.subHeaderWeightedAvg}>
                      <div className={styles.subHeaderContent}>
                        <div className={styles.regionBarBlue}></div>
                        <span>W.Avg</span>
                      </div>
                    </th>
                    {["North", "East", "West", "South", "Center"].map((region) => (
                      <th key={region} className={styles.subHeader}>
                        <div className={styles.subHeaderContent}>
                          <div className={styles.regionBarBlue}></div>
                          <span>{region}</span>
                          <div className={styles.hoverIcon}>
                            <MapPin className="h-3 w-3" style={{ color: "rgb(37, 99, 235)" }} />
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className={styles.subHeaderWeightedAvg}>
                      <div className={styles.subHeaderContent}>
                        <div className={styles.regionBarBlue}></div>
                        <span>W.Avg</span>
                      </div>
                    </th>
                    {["North", "East", "West", "South", "Center"].map((region) => (
                      <th key={region} className={styles.subHeader}>
                        <div className={styles.subHeaderContent}>
                          <div className={styles.regionBarGreen}></div>
                          <span>{region}</span>
                          <div className={styles.hoverIcon}>
                            <DollarSign className="h-3 w-3" style={{ color: "rgb(5, 150, 105)" }} />
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className={styles.subHeaderWeightedAvg}>
                      <div className={styles.subHeaderContent}>
                        <div className={styles.regionBarBlue}></div>
                        <span>W.Avg</span>
                      </div>
                    </th>
                    {["North", "East", "West", "South", "Center"].map((region) => (
                      <th key={region} className={styles.subHeader}>
                        <div className={styles.subHeaderContent}>
                          <div className={styles.regionBarPurple}></div>
                          <span>{region}</span>
                          <div className={styles.hoverIcon}>
                            <Database className="h-3 w-3" style={{ color: "rgb(124, 58, 237)" }} />
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className={styles.subHeaderWeightedAvg}>
                      <div className={styles.subHeaderContent}>
                        <div className={styles.regionBarBlue}></div>
                        <span>Total</span>
                      </div>
                    </th>
                    <th className={styles.subHeader}>
                      <div className={styles.subHeaderContent}>
                        <span>Actions</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingTable ? (
                    <tr>
                      <td colSpan={regions.length * 4 + 8} style={{ textAlign: "center", padding: "2rem" }}>
                        <Loader2
                          className={styles.spinner}
                          style={{ color: "#2563EB", fontSize: "2rem", width: "30px", height: "30px" }}
                        />
                      </td>
                    </tr>
                  ) : !tableData || tableData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={regions.length * 4 + 8}
                        style={{
                          textAlign: "center",
                          padding: "2rem",
                          color: "#6a6f78ff",
                          fontSize: "1rem",
                          fontWeight: "500",
                        }}
                      >
                        No data available for the selected period.
                      </td>
                    </tr>
                  ) : (
                    tableData.map((mode: any) =>
                      mode.data.map((row: any, idx: number) => (
                        <tr key={`${mode.id}-${row.month}-${idx}`} className={styles.tableRow}>
                          {idx === 0 && (
                            <td className={`${styles.stickyMode} ${styles.modeCell}`} rowSpan={mode.data.length}>
                              <div className={styles.modeContent}>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    padding: "12px",
                                    height: "100%",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      background: `${mode.color}20`,
                                      borderRadius: "50%",
                                      width: 40,
                                      height: 40,
                                      boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
                                    }}
                                  >
                                    {(() => {
                                      const Icon = iconMap[mode.icon] || iconMap.default
                                      return <Icon style={{ color: mode.color, width: 18, height: 18 }} />
                                    })()}
                                  </div>
                                  <span
                                    style={{
                                      fontWeight: 600,
                                      fontSize: 16,
                                      color: mode.color,
                                      textAlign: "center",
                                    }}
                                  >
                                    {mode.name}
                                  </span>
                                  <div
                                    style={{
                                      width: 60,
                                      height: 4,
                                      background: "#f0f0f0",
                                      borderRadius: 2,
                                      overflow: "hidden",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: "70%",
                                        height: "100%",
                                        background: mode.color,
                                        borderRadius: 2,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </td>
                          )}
                          <td className={`${styles.stickyMonth} ${styles.monthCell}`}>
                            <div className={styles.monthContent}>
                              <span className={styles.monthName}>
                                {row.month}
                                {row.year ? `- ${row.year}` : ""}
                              </span>
                            </div>
                          </td>
                          {regions.map((region) => (
                            <td key={`ptpk-${region}`} className={styles.tableCell}>
                              <div className={styles.cellContent}>{row.ptpk[region.toLowerCase()] ?? "-"}</div>
                            </td>
                          ))}
                          <td className={styles.weightedAvgCell}>
                            <div className={styles.cellContent}>{row.ptpk["W.avg"] ?? "-"}</div>
                          </td>
                          {regions.map((region) => (
                            <td key={`distance-${region}`} className={styles.tableCell}>
                              <div className={styles.cellContent}>{row.distance[region.toLowerCase()] ?? "-"}</div>
                            </td>
                          ))}
                          <td className={styles.weightedAvgCell}>
                            <div className={styles.cellContent}>{row.distance["W.avg"] ?? "-"}</div>
                          </td>
                          {regions.map((region) => (
                            <td key={`cost-${region}`} className={styles.tableCell}>
                              <div className={styles.cellContent}>{row.cost[region.toLowerCase()] ?? "-"}</div>
                            </td>
                          ))}
                          <td className={styles.weightedAvgCell}>
                            <div className={styles.cellContent}>{row.cost["W.avg"] ?? "-"}</div>
                          </td>
                          {regions.map((region) => (
                            <td key={`quantity-${region}`} className={styles.tableCell}>
                              <div className={styles.cellContent}>{row.quantity[region.toLowerCase()] ?? "-"}</div>
                            </td>
                          ))}
                          <td className={styles.weightedAvgCell}>
                            <div className={styles.cellContent}>{row.quantity["W.avg"] ?? "-"}</div>
                          </td>
                          <td className={styles.actionCell}>
                            <div className={styles.actionButtons}>
                              <button
                                className={styles.actionButtonDownload}
                                onClick={() => handleRowDownload(row)}
                                disabled={rowDownloading === row.month}
                                title="Download Raw Data"
                              >
                                <Download className="h-3 w-3" style={{ color: "#059669" }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )),
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      {/* <div className={styles.summaryGrid}>
        {summaryCardsData.map((card) => (
          <Card key={card.id} className={card.cardClass}>
            <CardHeader>
              <CardTitle className={card.titleClass}>
                {card.icon}
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {card.items.map((item, index) => (
                'isParagraph' in item || card.isParagraph ? (
                  <p 
                    key={index} 
                    className={styles.cardParagraph}
                    dangerouslySetInnerHTML={{ __html: item.value }}
                  />
                ) : (
                  <div key={index} className={styles.cardRow}>
                    <span className={styles.cardLabel}>{item.label}</span>
                    <span className={`${styles.cardValue} ${item.valueClass || ''}`}>
                      {item.value}
                    </span>
                  </div>
                )
              ))}
            </CardContent>
          </Card>
        ))}
      </div> */}
    </div>
  )
}

export default DataOverviewTab

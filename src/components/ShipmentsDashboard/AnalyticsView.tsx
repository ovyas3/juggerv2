import React, { useState } from "react";
import {
  Truck,
  IndianRupee,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  Package2,
  UserCheck,
  ClipboardCheck,
  RefreshCw,
  AlertTriangle,
  PieChart,
  X,
  Calendar,
  MapPin,
  User,
  FileText,
  Activity,
  ArrowRight,
} from "lucide-react";
import styles from "./AnalyticsView.module.css";
import TotalFreightModal from "./SpecialFeatures/TotalFreightModal";
import { MetricCard } from "../UI/MetricCard/MetricCard";
import { MetricCardSkeleton } from "../UI/MetricCard/MetricCardSkeleton";

interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

interface LifecycleStage {
  stage: string;
  subtitle: string;
  icon: string;
  total: number;
  slaHit: number;
  throughput: {
    onTime: number;
    delayed: number;
    waiting: number;
  };
  time: string;
}

interface SidebarData {
  stage: string;
  subtitle: string;
  icon: string;
  total: number;
  slaHit: number;
  throughput: {
    onTime: number;
    delayed: number;
    waiting: number;
  };
  time: string;
  details: {
    activeShipments: number;
    averageProcessingTime: string;
    lastUpdated: string;
    performance: {
      thisWeek: number;
      lastWeek: number;
      trend: "up" | "down" | "stable";
    };
    recentActivity: Array<{
      id: string;
      shipmentId: string;
      action: string;
      timestamp: string;
      status: "completed" | "pending" | "failed";
    }>;
    upcomingTasks: Array<{
      id: string;
      task: string;
      dueTime: string;
      priority: "high" | "medium" | "low";
    }>;
  };
}

const lucideIconMap = {
  inventory_2: Package2,
  assignment_ind: UserCheck,
  local_shipping: Truck,
  transfer_within_a_station: RefreshCw,
  task_alt: ClipboardCheck,
  check_circle: CheckCircle2,
};

const lucideInsightIcons = {
  check_circle: CheckCircle2,
  warning: AlertTriangle,
  trending_up: TrendingUp,
  people: Users,
};

interface AnalyticsData {
  totalShipments: number;
  totalFreightValue: number;
  averageFreight: number;
  activeCarriers: number;
  delayedShipments: number;
  highPriority: number;
}

interface Insight {
  text: string;
  icon: string;
  color: "green" | "orange" | "blue" | "default";
}

interface AnalyticsViewProps {
  analyticsData: AnalyticsData;
  analyticsLifeCycle: LifecycleStage[];
  analyticsInsights: Insight[];
  selectedAnalyticsRange: string;
  setSelectedAnalyticsRange: (range: string) => void;
  formatCurrency: (amount: number) => string;
  openActiveCarriersPopup: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analyticsData,
  analyticsLifeCycle,
  analyticsInsights,
  selectedAnalyticsRange,
  setSelectedAnalyticsRange,
  formatCurrency,
  openActiveCarriersPopup,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStageData, setSelectedStageData] =
    useState<SidebarData | null>(null);

  const [showAverageFreightModal, setShowAverageFreightModal] = useState(false);
  const [showTotalFreightModal, setShowTotalFreightModal] = useState(false);

  const averageFreightData = [
    {
      id: "SH001",
      division: "FLYJAC-MWH",
      carrier: "PATANJALI PARIVAHAN PVT LTD",
      amount: 12500,
      "%OfTotal": "10.62",
    },
    {
      id: "SH002",
      division: "P5-MWH",
      carrier: "Rajhans Parivahan pvt ltd",
      amount: 10000,
      "%OfTotal": "8.49",
    },
    {
      id: "SH003",
      division: "P5-MWH",
      carrier: "KIRAT LOGISTICS",
      amount: 8000,
      "%OfTotal": "6.79",
    },
    {
      id: "SH004",
      division: "FLYJAC-MWH",
      carrier: "V-Trans(India)Limited",
      amount: 15000,
      "%OfTotal": "12.74",
    },
    {
      id: "SH005",
      division: "P5-MWH",
      carrier: "EXPRESS LOGISTICS",
      amount: 22000,
      "%OfTotal": "18.68",
    },
    {
      id: "SH006",
      division: "FLYJAC-MWH",
      carrier: "Safe T-Trans",
      amount: 18250,
      "%OfTotal": "15.50",
    },
    {
      id: "SH007",
      division: "FLYJAC-MWH",
      carrier: "Speedy Freight",
      amount: 14000,
      "%OfTotal": "11.89%",
    },
    {
      id: "SH008",
      division: "P5-MWH",
      carrier: "Cargo Movers",
      amount: 18000,
      "%OfTotal": "15.29",
    },
  ];

  const totalFreightData = [
    {
      id: "SH009",
      division: "CORP-HQ",
      carrier: "Blue Dart",
      amount: 14500,
      "%OfTotal": "12.31",
    },
    {
      id: "SH010",
      division: "REG-NORTH",
      carrier: "Delhivery",
      amount: 15200,
      "%OfTotal": "12.91",
    },
    {
      id: "SH011",
      division: "CORP-HQ",
      carrier: "Gati",
      amount: 14800,
      "%OfTotal": "12.57",
    },
    {
      id: "SH012",
      division: "REG-SOUTH",
      carrier: "TCI Express",
      amount: 14100,
      "%OfTotal": "11.97",
    },
    {
      id: "SH013",
      division: "REG-WEST",
      carrier: "Safexpress",
      amount: 16000,
      "%OfTotal": "13.59",
    },
  ];

  const statusDistributionData: StatusDistribution[] = [
    { status: "Accepted", count: 4, percentage: 50, color: "green" },
    { status: "At Pickup", count: 1, percentage: 13, color: "blue" },
    { status: "In Transit", count: 2, percentage: 25, color: "amber" },
    { status: "Delivered", count: 1, percentage: 13, color: "grey" },
  ];

  const openAverageFreightPopup = async () => {
    try {
      // Fetch average freight data
      // const response = await yourApiCallForAverageFreightData();
      // setAverageFreightData(response.data);
      setShowAverageFreightModal(true);
    } catch (error) {
      console.error("Error fetching average freight data:", error);
    }
  };

  const closeAverageFreightModal = () => {
    setShowAverageFreightModal(false);
  };

  const openTotalFreightPopup = async () => {
    try {
      setShowTotalFreightModal(true);
    } catch (error) {
      console.error("Error fetching total freight data:", error);
    }
  };

  const closeTotalFreightModal = () => {
    setShowTotalFreightModal(false);
  };

  // Mock detailed data for sidebar - you can replace this with actual API calls
  const generateSidebarData = (stage: LifecycleStage): SidebarData => {
    return {
      ...stage,
      details: {
        activeShipments: Math.floor(Math.random() * 50) + 10,
        averageProcessingTime: `${Math.floor(Math.random() * 60) + 30} mins`,
        lastUpdated: new Date().toLocaleTimeString(),
        performance: {
          thisWeek: stage.slaHit,
          lastWeek: Math.floor(Math.random() * 20) + 80,
          trend: Math.random() > 0.5 ? "up" : "down",
        },
        recentActivity: [
          {
            id: "1",
            shipmentId: "SH-2025-001",
            action: `${stage.stage} completed`,
            timestamp: "2 mins ago",
            status: "completed",
          },
          {
            id: "2",
            shipmentId: "SH-2025-002",
            action: `${stage.stage} in progress`,
            timestamp: "5 mins ago",
            status: "pending",
          },
          {
            id: "3",
            shipmentId: "SH-2025-003",
            action: `${stage.stage} started`,
            timestamp: "8 mins ago",
            status: "completed",
          },
        ],
        upcomingTasks: [
          {
            id: "1",
            task: `Process pending ${stage.stage.toLowerCase()} requests`,
            dueTime: "30 mins",
            priority: "high",
          },
          {
            id: "2",
            task: `Review ${stage.stage.toLowerCase()} performance metrics`,
            dueTime: "2 hours",
            priority: "medium",
          },
          {
            id: "3",
            task: `Update ${stage.stage.toLowerCase()} workflow`,
            dueTime: "1 day",
            priority: "low",
          },
        ],
      },
    };
  };

  const handleLifecycleCardClick = (stage: LifecycleStage) => {
    const sidebarData = generateSidebarData(stage);
    setSelectedStageData(sidebarData);
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedStageData(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "failed":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.analyticsHeader}>
        <h2>Shipment Analytics</h2>
        <div className={styles.headerControls}>
          <select
            value={selectedAnalyticsRange}
            onChange={(e) => setSelectedAnalyticsRange(e.target.value)}
            className={styles.analyticsDropdown}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <button className={styles.exportButton}>Export</button>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.statsGrid}>
          {Array(6)
            .fill(null)
            .map((_, index) => (
              <MetricCardSkeleton key={index} />
            ))}
        </div>
      ) : (
        <div className={styles.statsGrid}>
          <MetricCard
            title="Total Shipments"
            value={analyticsData.totalShipments}
            icon={<Truck />}
            iconColor="#4f46e5"
            bgColor="#e4e2f8"
            borderColor="#544ecc"
          />
          <MetricCard
            title="Average Freight"
            value={formatCurrency(analyticsData.averageFreight)}
            icon={<TrendingUp />}
            iconColor="#3b82f6"
            bgColor="#fcf1dd"
            borderColor="orange"
            onClick={openAverageFreightPopup}
          />

          <MetricCard
            title="Total Freight Value"
            value={formatCurrency(analyticsData.totalFreightValue)}
            icon={<IndianRupee />}
            iconColor="#10b981"
            bgColor="#e2f6e2"
            borderColor="green"
            onClick={openTotalFreightPopup}
          />
          <MetricCard
            title="Active Carriers"
            value={analyticsData.activeCarriers}
            icon={<Users />}
            iconColor="#8b5cf6"
            bgColor="#d9e8f8"
            borderColor="#2a86d8"
            onClick={openActiveCarriersPopup}
          />
          <MetricCard
            title="Delayed Shipments"
            value={analyticsData.delayedShipments}
            icon={<Clock />}
            bgColor="#fcf1dd"
            borderColor="orange"
          />
          <MetricCard
            title="High Priority"
            value={analyticsData.highPriority}
            icon={<AlertTriangle />}
            iconColor="#8b5cf6"
            bgColor="#fbe2e2"
            borderColor="#ff2c2c"
          />
        </div>
      )}

      <div className={styles.chartGrid}>
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Status Distribution</h3>
            <PieChart className={styles.matIcon} />
          </div>
          <div className={styles.listContainer}>
            {statusDistributionData.map((item, index) => (
              <div key={index} className={styles.statusItem}>
                <div className={styles.statusLabel}>
                  <div className={`${styles.dot} ${styles[item.color]}`}></div>
                  {item.status}
                </div>
                <div className={styles.statusCount}>{item.count}</div>
                <div className={styles.statusPercent}>{item.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shipment Life Cycle */}
      <div className={styles.lifecycleSection}>
        <h3>Shipment Life Cycle</h3>
        <p>Track shipments through each stage of the process</p>
        <div className={styles.lifecycleGrid}>
          {analyticsLifeCycle.map((stage, index) => {
            const IconComp =
              lucideIconMap[stage.icon as keyof typeof lucideIconMap] ||
              CheckCircle2;
            return (
              <div
                key={index}
                className={styles.lifecycleCard}
                onClick={() => handleLifecycleCardClick(stage)}
              >
                <div className={styles.cardContent}>
                  <div className={styles.lifecycleHeader}>
                    <div className={styles.headerLeft}>
                      <div
                        className={`${styles.iconContainer} ${styles.brown}`}
                      >
                        <IconComp className={styles.matIcon} />
                      </div>
                      <div className={styles.titleContainer}>
                        <h4 className={styles.cardTitle}>{stage.stage}</h4>
                        <p className={styles.cardSubtitle}>{stage.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.lifecycleBody}>
                    <div className={styles.headerRight}>
                      <div className={styles.metricGroup}>
                        <div className={styles.metricLabel}>TOTAL</div>
                        <div className={styles.metricValue}>{stage.total}</div>
                      </div>
                      <div className={styles.slaGroup}>
                        <div className={styles.slaLabel}>SLA HIT</div>
                        <div className={styles.slaValue}>{stage.slaHit}%</div>
                      </div>
                    </div>
                    <div className={styles.lifecycleBody}>
                      <div className={styles.throughputDotsWrapper}>
                        <div className={styles.throughputDots}>
                          <div className={styles.dotItem}>
                            <button className={`${styles.dot} ${styles.green}`}>
                              <CheckCircle2 size={16} />
                              <span style={{ color: "#16a34a" }}>
                                {stage.throughput.onTime}
                              </span>
                            </button>
                          </div>
                          <div className={styles.dotItem}>
                            <button className={`${styles.dot} ${styles.amber}`}>
                              <Clock size={16} />
                              <span style={{ color: "#f59e0b" }}>
                                {stage.throughput.delayed}
                              </span>
                            </button>
                          </div>
                          <div className={styles.dotItem}>
                            <button className={`${styles.dot} ${styles.red}`}>
                              <AlertTriangle size={16} />
                              <span style={{ color: "#ef4444" }}>
                                {stage.throughput.waiting}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.lifecycleFooter}>
                    <div className={styles.footerLeft}>
                      <div className={styles.throughputLabel}>
                        LAST 24H THROUGHPUT
                      </div>
                      <div className={styles.chartContainer}>
                        <div className={styles.chartLine}></div>
                      </div>
                    </div>
                    <div className={`${styles.timeMetric} ${styles.up}`}>
                      <TrendingUp size={16} />
                      {stage.time}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Insights */}
      <div className={styles.insightsSection}>
        <h3>Key Insights</h3>
        <div className={styles.insightsGrid}>
          {analyticsInsights.map((insight, index) => {
            const IconComp =
              lucideInsightIcons[
                insight.icon as keyof typeof lucideInsightIcons
              ] || CheckCircle2;
            return (
              <div key={index} className={styles.insightCard}>
                <IconComp
                  className={`${styles.insightIcon} ${styles[insight.color]}`}
                />
                <p>{insight.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      <TotalFreightModal
        show={showAverageFreightModal}
        onClose={closeAverageFreightModal}
        totalFreightData={averageFreightData}
        title="Average Freight Breakdown"
      />

      <TotalFreightModal
        show={showTotalFreightModal}
        onClose={closeTotalFreightModal}
        totalFreightData={totalFreightData}
        title="Total Freight Breakdown"
      />

      {/* Sidebar */}
      {sidebarOpen && selectedStageData && (
        <>
          <div className={styles.sidebarOverlay} onClick={closeSidebar}></div>
          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <div className={styles.sidebarTitle}>
                <div className={`${styles.iconContainer} ${styles.brown}`}>
                  {React.createElement(
                    lucideIconMap[
                      selectedStageData.icon as keyof typeof lucideIconMap
                    ] || CheckCircle2,
                    { className: styles.matIcon }
                  )}
                </div>
                <div>
                  <h3>{selectedStageData.stage}</h3>
                  <p>{selectedStageData.subtitle}</p>
                </div>
              </div>
              <button className={styles.sidebarCloseBtn} onClick={closeSidebar}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.sidebarContent}>
              {/* Overview Stats */}
              <div className={styles.sidebarSection}>
                <h4>Overview</h4>
                <div className={styles.sidebarStats}>
                  <div className={styles.sidebarStat}>
                    <div className={styles.sidebarStatValue}>
                      {selectedStageData.total}
                    </div>
                    <div className={styles.sidebarStatLabel}>
                      Total Shipments
                    </div>
                  </div>
                  <div className={styles.sidebarStat}>
                    <div className={styles.sidebarStatValue}>
                      {selectedStageData.details.activeShipments}
                    </div>
                    <div className={styles.sidebarStatLabel}>Active Now</div>
                  </div>
                  <div className={styles.sidebarStat}>
                    <div className={styles.sidebarStatValue}>
                      {selectedStageData.slaHit}%
                    </div>
                    <div className={styles.sidebarStatLabel}>
                      SLA Performance
                    </div>
                  </div>
                  <div className={styles.sidebarStat}>
                    <div className={styles.sidebarStatValue}>
                      {selectedStageData.details.averageProcessingTime}
                    </div>
                    <div className={styles.sidebarStatLabel}>
                      Avg Processing Time
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className={styles.sidebarSection}>
                <h4>Performance</h4>
                <div className={styles.performanceMetric}>
                  <div className={styles.performanceHeader}>
                    <span>This Week</span>
                    <span className={styles.performanceValue}>
                      {selectedStageData.details.performance.thisWeek}%
                      <span
                        className={`${styles.performanceTrend} ${
                          selectedStageData.details.performance.trend === "up"
                            ? styles.trendUp
                            : styles.trendDown
                        }`}
                      >
                        {selectedStageData.details.performance.trend === "up"
                          ? "↑"
                          : "↓"}
                      </span>
                    </span>
                  </div>
                  <div className={styles.performanceSubtext}>
                    Last week: {selectedStageData.details.performance.lastWeek}%
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className={styles.sidebarSection}>
                <h4>Recent Activity</h4>
                <div className={styles.activityList}>
                  {selectedStageData.details.recentActivity.map((activity) => (
                    <div key={activity.id} className={styles.activityItem}>
                      <div
                        className={styles.activityStatus}
                        style={{
                          backgroundColor: getStatusColor(activity.status),
                        }}
                      ></div>
                      <div className={styles.activityContent}>
                        <div className={styles.activityText}>
                          <strong>{activity.shipmentId}</strong> -{" "}
                          {activity.action}
                        </div>
                        <div className={styles.activityTime}>
                          <Clock size={12} />
                          {activity.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Tasks */}
              <div className={styles.sidebarSection}>
                <h4>Upcoming Tasks</h4>
                <div className={styles.tasksList}>
                  {selectedStageData.details.upcomingTasks.map((task) => (
                    <div key={task.id} className={styles.taskItem}>
                      <div
                        className={styles.taskPriority}
                        style={{
                          backgroundColor: getPriorityColor(task.priority),
                        }}
                      ></div>
                      <div className={styles.taskContent}>
                        <div className={styles.taskText}>{task.task}</div>
                        <div className={styles.taskDue}>
                          <Calendar size={12} />
                          Due in {task.dueTime}
                        </div>
                      </div>
                      <ArrowRight size={16} className={styles.taskArrow} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Throughput Details */}
              <div className={styles.sidebarSection}>
                <h4>Throughput Analysis</h4>
                <div className={styles.throughputDetails}>
                  <div className={styles.throughputRow}>
                    <div className={styles.throughputLabel}>
                      <div className={`${styles.dot} ${styles.green}`}></div>
                      On Time
                    </div>
                    <div className={styles.throughputValue}>
                      {selectedStageData.throughput.onTime}
                    </div>
                  </div>
                  <div className={styles.throughputRow}>
                    <div className={styles.throughputLabel}>
                      <div className={`${styles.dot} ${styles.amber}`}></div>
                      Delayed
                    </div>
                    <div className={styles.throughputValue}>
                      {selectedStageData.throughput.delayed}
                    </div>
                  </div>
                  <div className={styles.throughputRow}>
                    <div className={styles.throughputLabel}>
                      <div className={`${styles.dot} ${styles.red}`}></div>
                      Waiting
                    </div>
                    <div className={styles.throughputValue}>
                      {selectedStageData.throughput.waiting}
                    </div>
                  </div>
                </div>
                <div className={styles.lastUpdated}>
                  Last updated: {selectedStageData.details.lastUpdated}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

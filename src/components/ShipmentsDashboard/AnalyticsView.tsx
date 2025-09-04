import React from 'react';
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
  AlertTriangle
} from 'lucide-react';
import styles from '../shipmentsDashboard/shipmentsDashboard.module.css';


const lucideIconMap = {
    inventory_2: Package2,           // closest to "inventory"
    assignment_ind: UserCheck,       // closest to "assignment/user"
    local_shipping: Truck,           // truck for shipping
    transfer_within_a_station: RefreshCw, // movement/transfer
    task_alt: ClipboardCheck,        // completion/check
    check_circle: CheckCircle2       // check mark
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

interface Insight {
  text: string;
  icon: string;
  color: 'green' | 'orange' | 'blue' | 'default';
}

interface AnalyticsViewProps {
  analyticsData: AnalyticsData;
  analyticsLifeCycle: LifecycleStage[];
  analyticsInsights: Insight[];
  selectedAnalyticsRange: string;
  setSelectedAnalyticsRange: (range: string) => void;
  formatCurrency: (amount: number) => string;
  openTotalFreightPopup: () => void;
  openAverageFreightPopup: () => void;
  openActiveCarriersPopup: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analyticsData,
  analyticsLifeCycle,
  analyticsInsights,
  selectedAnalyticsRange,
  setSelectedAnalyticsRange,
  formatCurrency,
  openTotalFreightPopup,
  openAverageFreightPopup,
  openActiveCarriersPopup
}) => {
  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.analyticsHeader}>
        <h2>Shipment Analytics</h2>
        <div className={styles.headerControls}>
          <select
            className={styles.analyticsDropdown}
            value={selectedAnalyticsRange}
            onChange={e => setSelectedAnalyticsRange(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <button className={styles.exportButton}>Export</button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Total Shipments</span>
            <Truck size={24} color="#757575" className={styles.cardIcon} />
          </div>
          <div className={styles.cardValue}>{analyticsData.totalShipments}</div>
        </div>

        <div className={styles.statCard} onClick={openTotalFreightPopup}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Total Freight Value</span>
            <IndianRupee size={24} color="#757575" className={styles.cardIcon} />
          </div>
          <div className={styles.cardValue}>{formatCurrency(analyticsData.totalFreightValue)}</div>
        </div>

        <div className={styles.statCard} onClick={openAverageFreightPopup}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Average Freight</span>
            <TrendingUp size={24} color="#757575" className={styles.cardIcon} />
          </div>
          <div className={styles.cardValue}>{formatCurrency(analyticsData.averageFreight)}</div>
        </div>

        <div className={styles.statCard} onClick={openActiveCarriersPopup}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Active Carriers</span>
            <Users size={24} color="#757575" className={styles.cardIcon} />
          </div>
          <div className={styles.cardValue}>{analyticsData.activeCarriers}</div>
        </div>
      </div>

      {/* Shipment Life Cycle */}
      <div className={styles.lifecycleSection}>
        <h3>Shipment Life Cycle</h3>
        <p>Track shipments through each stage of the process</p>
        
        <div className={styles.lifecycleGrid}>
          {analyticsLifeCycle.map((stage, index) => {
            const IconComp = lucideIconMap[stage.icon as keyof typeof lucideIconMap] || CheckCircle2;
            return (
              <div key={index} className={styles.lifecycleCard}>
                <div className={styles.cardContent}>
                  <div className={styles.lifecycleHeader}>
                    <div className={styles.headerLeft}>
                      <div className={`${styles.iconContainer} ${index % 2 === 0 ? styles.blue : styles.green}`}>
                        <IconComp size={24} color={index % 2 === 0 ? "#4384F7" : "#41B57F"} className={styles.stageIcon} />
                      </div>
                      <div className={styles.titleContainer}>
                        <div className={styles.cardTitle}>{stage.stage}</div>
                        <div className={styles.cardSubtitle}>{stage.subtitle}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.lifecycleBody}>
                    <div className={styles.bodyRight}>
                      <div className={styles.metricPair}>
                        <div className={styles.metricLabel}>Total</div>
                        <div className={styles.metricValue}>{stage.total}</div>
                      </div>
                      <div className={styles.metricPair}>
                        <div className={styles.metricLabel}>SLA Hit</div>
                        <div className={styles.metricValue}>{stage.slaHit}</div>
                      </div>
                    </div>
                    
                    <div className={styles.throughputDotsWrapper}>
                      <div className={styles.throughputDots}>
                        <div className={styles.dotItem}>
                          <div className={`${styles.dot} ${styles.green}`}></div>
                          <span>{stage.throughput.onTime}</span>
                        </div>
                        <div className={styles.dotItem}>
                          <div className={`${styles.dot} ${styles.amber}`}></div>
                          <span>{stage.throughput.delayed}</span>
                        </div>
                        <div className={styles.dotItem}>
                          <div className={`${styles.dot} ${styles.red}`}></div>
                          <span>{stage.throughput.waiting}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.lifecycleFooter}>
                    <div className={styles.timeMetric}>
                      <Clock size={18} color="#757575" className={styles.cardIcon} />
                      <span>{stage.time}</span>
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
            const IconComp = lucideInsightIcons[insight.icon as keyof typeof lucideInsightIcons] || CheckCircle2;
            return (
              <div key={index} className={styles.insightCard}>
                <IconComp
                  size={22}
                  color={insight.color === 'green' ? '#20b578' :
                         insight.color === 'orange' ? '#FFB300' :
                         insight.color === 'blue' ? '#4384F7' : '#757575'}
                  className={`${styles.insightIcon} ${styles[insight.color]}`}
                />
                <p>{insight.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

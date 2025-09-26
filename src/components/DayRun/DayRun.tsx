'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Filter, Calendar, MessageSquare, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './DayRun.css';

interface DayRun {
  _id: string;
  start: string;
  day: number;
  distance: number;
  travel_time: number;
  remarks: string;
  polyline: string;
}

interface VehicleData {
  _id: string;
  sn: number;
  vehicle: string;
  doNumber: string;
  gateInNumber: string;
  gateOutTime: string;
  customer: string;
  delivery: string;
  totalDistance: number;
  promisedDeliveryDate: string;
  status: 'On Time' | 'Delay' | 'Critical';
  remainingDistance: number;
  travelledDistance: number;
  dayRuns: DayRun[];
  avg_distance: number;
}

interface ProcessedVehicleData extends VehicleData {
  avgDistancePerDay: number;
  dayRunsCount: number;
}

interface DateTab {
  id: string;
  label: string;
  date: string;
  displayDate: string;
}
interface DayStatistics {
  totalVehicles: number;
  onTime: number;
  delayed: number;
  critical: number;
  avgDistance: number;
  totalDistance: number;
}
// Helper function to generate date tabs
const generateDateTabs = (): DateTab[] => {
  const tabs = [];
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    tabs.push({
      id: `T-${i}`,
      label: `T-${i}`,
      date: date.toISOString().split('T')[0],
      displayDate: date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        weekday: 'short'
      })
    });
  }
  return tabs;
};
const DayRun: React.FC = () => {
  const [dateTabs] = useState(generateDateTabs());
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [dataByDate, setDataByDate] = useState<{[key: string]: ProcessedVehicleData[]}>({});
  const [statisticsByDate, setStatisticsByDate] = useState<{[key: string]: DayStatistics}>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [modalVehicle, setModalVehicle] = useState<ProcessedVehicleData | null>(null);
  const [remarkModal, setRemarkModal] = useState<{vehicle: ProcessedVehicleData, day: number} | null>(null);
  const [filters, setFilters] = useState({
    status: 'All',
    dayRuns: 'All'
  });

  useEffect(() => {
    // Generate mock data for each date tab
    const mockDataByDate: {[key: string]: VehicleData[]} = {};
    const mockStatsByDate: {[key: string]: DayStatistics} = {};

    dateTabs.forEach((tab, tabIndex) => {
      const vehicles: VehicleData[] = [];

      // Generate 4-8 vehicles per date tab for variety
      const vehicleCount = 4 + Math.floor(Math.random() * 5);

      for (let i = 0; i < vehicleCount; i++) {
        const statuses: ('On Time' | 'Delay' | 'Critical')[] = ['On Time', 'Delay', 'Critical'];
        const customers = ['JSW Steel L', 'Tata Steel Lt', 'SAIL', 'UltraTech Cc', 'Adani Ports'];
        const cities = ['Chennai', 'Bangalore', 'Patna', 'Mysuru', 'Jaipur', 'Raipur', 'Coimbatore', 'Pune'];

        const dayRunCount = 1 + Math.floor(Math.random() * 4);
        const dayRuns: DayRun[] = [];
        let totalDayRunDistance = 0;

        for (let day = 1; day <= dayRunCount; day++) {
          const distance = 100 + Math.floor(Math.random() * 250);
          totalDayRunDistance += distance;

          dayRuns.push({
            _id: `run_${tab.id}_${i}_${day}`,
            start: new Date(Date.now() - (tabIndex + 1) * 24 * 60 * 60 * 1000 - (day - 1) * 12 * 60 * 60 * 1000).toISOString(),
            day: day,
            distance: distance,
            travel_time: 8000 + Math.floor(Math.random() * 10000),
            remarks: "",
            polyline: `sample_polyline_${day}`
          });
          }

        const totalDistance = totalDayRunDistance + Math.floor(Math.random() * 150);
        const travelledDistance = totalDayRunDistance;

        vehicles.push({
          _id: `veh_${tab.id}_${i}`,
          sn: i + 1,
          vehicle: `${['AP', 'KA', 'TN', 'MH', 'GJ'][Math.floor(Math.random() * 5)]}04GH${3400 + Math.floor(Math.random() * 100)}`,
          doNumber: `DO${900000 + Math.floor(Math.random() * 10000)}`,
          gateInNumber: `GI${900000 + Math.floor(Math.random() * 1000)}`,
          gateOutTime: `${tab.displayDate.split(',')[1]?.trim() || tab.displayDate} ${18 + Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 6)}0`,
          customer: customers[Math.floor(Math.random() * customers.length)],
          delivery: cities[Math.floor(Math.random() * cities.length)],
          totalDistance: totalDistance,
          promisedDeliveryDate: `${15 + Math.floor(Math.random() * 3)} Aug ${10 + Math.floor(Math.random() * 10)}:30`,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          remainingDistance: totalDistance - travelledDistance,
          travelledDistance: travelledDistance,
          avg_distance: totalDayRunDistance / dayRunCount,
          dayRuns: dayRuns
        });
          }

      mockDataByDate[tab.id] = vehicles;
      // Calculate statistics for this day
      const onTime = vehicles.filter(v => v.status === 'On Time').length;
      const delayed = vehicles.filter(v => v.status === 'Delay').length;
      const critical = vehicles.filter(v => v.status === 'Critical').length;
      const totalDistance = vehicles.reduce((sum, v) => sum + v.totalDistance, 0);
      const avgDistance = vehicles.length > 0 ? totalDistance / vehicles.length : 0;
      mockStatsByDate[tab.id] = {
        totalVehicles: vehicles.length,
        onTime,
        delayed,
        critical,
        avgDistance: Math.round(avgDistance),
        totalDistance: Math.round(totalDistance)
      };
    });

    // Process the data
    const processData = (vehicles: VehicleData[]): ProcessedVehicleData[] => {
      return vehicles.map(vehicle => {
        const totalDayRunDistance = vehicle.dayRuns.reduce((sum, dayRun) => sum + dayRun.distance, 0);
        const avgDistancePerDay = vehicle.dayRuns.length > 0 ? totalDayRunDistance / vehicle.dayRuns.length : 0;

        return {
          ...vehicle,
          remainingDistance: vehicle.totalDistance - vehicle.travelledDistance,
          avgDistancePerDay: Math.round(avgDistancePerDay),
          dayRunsCount: vehicle.dayRuns.length
        };
      });
    };

    const processedDataByDate: {[key: string]: ProcessedVehicleData[]} = {};
    Object.keys(mockDataByDate).forEach(tabId => {
      processedDataByDate[tabId] = processData(mockDataByDate[tabId]);
    });
    setDataByDate(processedDataByDate);
    setStatisticsByDate(mockStatsByDate);
  }, [dateTabs]);

  // Get filtered data for expanded day
  const getFilteredData = (dayId: string) => {
    const dayData = dataByDate[dayId] || [];
    return dayData.filter(vehicle => {
    const statusMatch = filters.status === 'All' || vehicle.status === filters.status;
    const dayRunsMatch = filters.dayRuns === 'All' ||
      (filters.dayRuns === '4+' ? vehicle.dayRunsCount >= 4 : vehicle.dayRunsCount === parseInt(filters.dayRuns));
    return statusMatch && dayRunsMatch;
  });
  };

  // Pagination for expanded view
  const filteredData = expandedDay ? getFilteredData(expandedDay) : [];
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPageData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  // Reset pagination when expanding different day
  useEffect(() => {
    setCurrentPage(1);
  }, [expandedDay]);
  const toggleDayExpansion = (dayId: string) => {
    setExpandedDay(expandedDay === dayId ? null : dayId);
  };

  const openVehicleModal = (vehicle: ProcessedVehicleData) => {
    setModalVehicle(vehicle);
  };

  const closeVehicleModal = () => {
    setModalVehicle(null);
  };

  const openRemarkModal = (vehicle: ProcessedVehicleData, day: number) => {
    setRemarkModal({ vehicle, day });
  };

  const closeRemarkModal = () => {
    setRemarkModal(null);
  };

  const handleRemarkSubmit = (remark: string) => {
    console.log('Remark submitted:', remark, 'for vehicle:', remarkModal?.vehicle.vehicle);
    closeRemarkModal();
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'On Time': return 'status-on-time';
      case 'Delay': return 'status-delay';
      case 'Critical': return 'status-critical';
      default: return '';
    }
  };

  const getPerformanceTrend = (dayId: string, previousDayId: string) => {
    const currentStats = statisticsByDate[dayId];
    const previousStats = statisticsByDate[previousDayId];
    if (!currentStats || !previousStats) return { icon: Minus, class: 'neutral' };
    const currentPerformance = (currentStats.onTime / currentStats.totalVehicles) * 100;
    const previousPerformance = (previousStats.onTime / previousStats.totalVehicles) * 100;
    if (currentPerformance > previousPerformance) {
      return { icon: TrendingUp, class: 'positive' };
    } else if (currentPerformance < previousPerformance) {
      return { icon: TrendingDown, class: 'negative' };
    } else {
      return { icon: Minus, class: 'neutral' };
    }
  };
  return (
    <div className="day-run-container">
      <div className="day-run-content">
        <div className="page-header">
          <h1>Day Run Analysis - Gate Out Date Overview</h1>
          <p className="page-subtitle">7-day vehicle performance overview grouped by facility exit date</p>
        </div>
        {/* Compact Overview Cards */}
        <div className="days-overview">
          {dateTabs.map((tab, index) => {
            const stats = statisticsByDate[tab.id];
            const isExpanded = expandedDay === tab.id;
            const previousDayId = dateTabs[index + 1]?.id;
            const trend = previousDayId ? getPerformanceTrend(tab.id, previousDayId) : { icon: Minus, class: 'neutral' };
            const TrendIcon = trend.icon;
            return (
              <div key={tab.id} className={`day-card ${isExpanded ? 'expanded' : ''}`}>
                <div
                  className="day-card-header"
                  onClick={() => toggleDayExpansion(tab.id)}
                >
                  <div className="day-info">
                    <div className="day-label-row">
                      <span className="day-label">{tab.label}</span>
                      <TrendIcon className={`trend-icon ${trend.class}`} />
                    </div>
                    <span className="day-date">{tab.displayDate}</span>
                  </div>

                  {stats && (
                    <div className="day-stats">
                      <div className="stat-group">
                        <span className="stat-value">{stats.totalVehicles}</span>
                        <span className="stat-label">Total</span>
            </div>
                      <div className="stat-group">
                        <span className="stat-value green">{stats.onTime}</span>
                        <span className="stat-label">On Time</span>
                      </div>
                      <div className="stat-group">
                        <span className="stat-value orange">{stats.delayed}</span>
                        <span className="stat-label">Delayed</span>
                  </div>
                      <div className="stat-group">
                        <span className="stat-value red">{stats.critical}</span>
                        <span className="stat-label">Critical</span>
                  </div>
                      <div className="stat-group">
                        <span className="stat-value">{stats.avgDistance}km</span>
                        <span className="stat-label">Avg Dist</span>
                </div>
              </div>
            )}
                  <div className="expand-icon">
                    {isExpanded ? <ChevronDown /> : <ChevronRight />}
          </div>
        </div>
                {/* Expanded Vehicle Details */}
                {isExpanded && (
                  <div className="day-card-content">
                    {/* Filters for expanded view */}
                    <div className="expanded-filters">
                      <div className="filter-row">
            <div className="filter-item">
              <Filter className="filter-icon" />
              <label>Status:</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="filter-select"
              >
                <option value="All">All</option>
                <option value="On Time">On Time</option>
                <option value="Delay">Delayed</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="filter-item">
              <Calendar className="filter-icon" />
              <label>Day Runs:</label>
              <select
                value={filters.dayRuns}
                onChange={(e) => setFilters(prev => ({ ...prev, dayRuns: e.target.value }))}
                className="filter-select"
              >
                <option value="All">All</option>
                <option value="1">1 Day</option>
                <option value="2">2 Days</option>
                <option value="3">3 Days</option>
                <option value="4+">4+ Days</option>
              </select>
            </div>
          </div>
        </div>


                    {/* Vehicle Table */}
                    <div className="vehicles-table-container">
                      <table className="vehicles-table">
                <thead>
                  <tr>
                    <th>SN</th>
                    <th>Vehicle</th>
                    <th>DO Number</th>
                    <th>Customer</th>
                    <th>Delivery</th>
                            <th>Distance (Kms)</th>
                    <th>Day Runs</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPageData.length > 0 ? (
                    currentPageData.map((vehicle, index) => (
                      <tr key={vehicle._id} className="vehicle-row">
                        <td>
                          <div
                            className="vehicle-cell clickable"
                            onClick={() => openVehicleModal(vehicle)}
                          >
                            <ChevronRight className="vehicle-expand-icon" />
                            {startIndex + index + 1}
                          </div>
                        </td>
                                <td className="font-mono">{vehicle.vehicle}</td>
                                <td className="font-mono text-sm">{vehicle.doNumber}</td>
                                <td className="text-sm">{vehicle.customer}</td>
                                <td className="text-sm">{vehicle.delivery}</td>
                                <td className="text-right">{Math.round(vehicle.totalDistance)}</td>
                                <td className="text-center">{vehicle.dayRunsCount}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(vehicle.status)}`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="action-btn"
                            onClick={() => openRemarkModal(vehicle, 1)}
                            title="Add Remark"
                          >
                            <MessageSquare className="action-icon" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                              <td colSpan={9} className="no-data">
                                No vehicles match the current filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

                    {/* Pagination for expanded view */}
          {totalPages > 1 && (
                      <div className="expanded-pagination">
                <button
                  className="action-btn"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                        <span className="pagination-info">
                          Page {currentPage} of {totalPages} ({filteredData.length} vehicles)
                </span>
                <button
                  className="action-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
                    )}
            </div>
          )}
              </div>
            );
          })}
        </div>

        {/* Vehicle Detail Modal */}
        {modalVehicle && (
          <div className="modal-overlay" onClick={closeVehicleModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Vehicle Details - {modalVehicle.vehicle}</h3>
                <button className="modal-close" onClick={closeVehicleModal}>
                  <X className="close-icon" />
                </button>
              </div>
              <div className="modal-body">
                <div className="vehicle-info">
                  <div className="info-row">
                    <span className="label">DO Number:</span>
                    <span className="value">{modalVehicle.doNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Gate In Number:</span>
                    <span className="value">{modalVehicle.gateInNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Customer:</span>
                    <span className="value">{modalVehicle.customer}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Delivery:</span>
                    <span className="value">{modalVehicle.delivery}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Total Distance:</span>
                    <span className="value">{Math.round(modalVehicle.totalDistance)} Kms</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Average Distance per Day:</span>
                    <span className="value">{modalVehicle.avgDistancePerDay} Kms</span>
                  </div>
                </div>
                <div className="day-breakdown">
                  <h4>Day-wise Breakdown</h4>
                  <table className="breakdown-table">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Date</th>
                        <th>Distance (Kms)</th>
                        <th>Travel Time (Hours)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalVehicle.dayRuns.map((dayRun) => (
                        <tr key={dayRun._id}>
                          <td>Day {dayRun.day}</td>
                          <td>{new Date(dayRun.start).toLocaleDateString()}</td>
                          <td>{Math.round(dayRun.distance)}</td>
                          <td>{(dayRun.travel_time / 3600).toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remark Modal */}
        {remarkModal && (
          <div className="modal-overlay" onClick={closeRemarkModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add Remark - {remarkModal.vehicle.vehicle}</h3>
                <button className="modal-close" onClick={closeRemarkModal}>
                  <X className="close-icon" />
                </button>
              </div>
              <div className="modal-body">
                <form className="remark-form" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const remark = formData.get('remark') as string;
                  handleRemarkSubmit(remark);
                }}>
                  <label htmlFor="remark">Remark:</label>
                  <textarea
                    name="remark"
                    id="remark"
                    className="remark-textarea"
                    placeholder="Enter control tower remark..."
                    required
                  />
                  <div className="remark-actions">
                    <button type="button" className="cancel-btn" onClick={closeRemarkModal}>
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      Submit Remark
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayRun;
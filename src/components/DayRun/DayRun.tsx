'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Filter, Calendar, MessageSquare, X } from 'lucide-react';
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

const DayRun: React.FC = () => {
  const [data, setData] = useState<ProcessedVehicleData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [modalVehicle, setModalVehicle] = useState<ProcessedVehicleData | null>(null);
  const [remarkModal, setRemarkModal] = useState<{vehicle: ProcessedVehicleData, day: number} | null>(null);
  const [filters, setFilters] = useState({
    status: 'All', // All, On Time, Delay, Critical
    dayRuns: 'All' // All, 1, 2, 3, 4+
  });

  useEffect(() => {
    const mockVehicleData: VehicleData[] = [
      // T-2 (11 Aug) Vehicles
      {
        _id: "veh_t2_001",
        sn: 1,
        vehicle: 'AP04GH3433',
        doNumber: 'DO902349',
        gateInNumber: 'GI908740',
        gateOutTime: '11 Aug 18:20',
        customer: 'JSW Steel L',
        delivery: 'Patna',
        totalDistance: 700,
        promisedDeliveryDate: '15 Aug 17:30',
        status: 'On Time',
        remainingDistance: 200,
        travelledDistance: 500,
        avg_distance: 233.33,
        dayRuns: [
          {
            _id: "run_t2_001_1",
            start: "2024-08-11T18:20:00.000Z",
            day: 1,
            distance: 100,
            travel_time: 8000,
            remarks: "",
            polyline: "sample_polyline_1"
          },
          {
            _id: "run_t2_001_2",
            start: "2024-08-12T06:00:00.000Z",
            day: 2,
            distance: 300,
            travel_time: 15000,
            remarks: "",
            polyline: "sample_polyline_2"
          },
          {
            _id: "run_t2_001_3",
            start: "2024-08-13T06:00:00.000Z",
            day: 3,
            distance: 100,
            travel_time: 8000,
            remarks: "",
            polyline: "sample_polyline_3"
          }
        ]
      },
      {
        _id: "veh_t2_002",
        sn: 2,
        vehicle: 'KA04GH3422',
        doNumber: 'DO902399',
        gateInNumber: 'GI908741',
        gateOutTime: '11 Aug 19:20',
        customer: 'Tata Steel Lt',
        delivery: 'Mysuru',
        totalDistance: 820,
        promisedDeliveryDate: '15 Aug 13:30',
        status: 'Delay',
        remainingDistance: 470,
        travelledDistance: 350,
        avg_distance: 116.67,
        dayRuns: [
          {
            _id: "run_t2_002_1",
            start: "2024-08-11T19:20:00.000Z",
            day: 1,
            distance: 150,
            travel_time: 10000,
            remarks: "",
            polyline: "sample_polyline_1"
          },
          {
            _id: "run_t2_002_2",
            start: "2024-08-12T06:00:00.000Z",
            day: 2,
            distance: 100,
            travel_time: 8000,
            remarks: "",
            polyline: "sample_polyline_2"
          },
          {
            _id: "run_t2_002_3",
            start: "2024-08-13T06:00:00.000Z",
            day: 3,
            distance: 100,
            travel_time: 8000,
            remarks: "",
            polyline: "sample_polyline_3"
          }
        ]
      },
      {
        _id: "veh_t2_003",
        sn: 3,
        vehicle: 'AP04GH4497',
        doNumber: 'DO902387',
        gateInNumber: 'GI908742',
        gateOutTime: '11 Aug 18:30',
        customer: 'SAIL',
        delivery: 'Ranji',
        totalDistance: 900,
        promisedDeliveryDate: '15 Aug 15:30',
        status: 'Delay',
        remainingDistance: 500,
        travelledDistance: 400,
        avg_distance: 133.33,
        dayRuns: [
          {
            _id: "run_t2_003_1",
            start: "2024-08-11T18:30:00.000Z",
            day: 1,
            distance: 150,
            travel_time: 10000,
            remarks: "",
            polyline: "sample_polyline_1"
          },
          {
            _id: "run_t2_003_2",
            start: "2024-08-12T06:00:00.000Z",
            day: 2,
            distance: 150,
            travel_time: 10000,
            remarks: "",
            polyline: "sample_polyline_2"
          },
          {
            _id: "run_t2_003_3",
            start: "2024-08-13T06:00:00.000Z",
            day: 3,
            distance: 100,
            travel_time: 8000,
            remarks: "",
            polyline: "sample_polyline_3"
          }
        ]
      },
      {
        _id: "veh_t2_004",
        sn: 4,
        vehicle: 'KA04GH3423',
        doNumber: 'DO247710',
        gateInNumber: 'GI908743',
        gateOutTime: '11 Aug 18:30',
        customer: 'UltraTech Cc',
        delivery: 'Raipur',
        totalDistance: 670,
        promisedDeliveryDate: '15 Aug 05:30',
        status: 'On Time',
        remainingDistance: 220,
        travelledDistance: 450,
        avg_distance: 150,
        dayRuns: [
          {
            _id: "run_t2_004_1",
            start: "2024-08-11T18:30:00.000Z",
            day: 1,
            distance: 200,
            travel_time: 12000,
            remarks: "",
            polyline: "sample_polyline_1"
          },
          {
            _id: "run_t2_004_2",
            start: "2024-08-12T06:00:00.000Z",
            day: 2,
            distance: 100,
            travel_time: 8000,
            remarks: "",
            polyline: "sample_polyline_2"
          },
          {
            _id: "run_t2_004_3",
            start: "2024-08-13T06:00:00.000Z",
            day: 3,
            distance: 150,
            travel_time: 10000,
            remarks: "",
            polyline: "sample_polyline_3"
          }
        ]
      },
      // T-3 (10 Aug) Vehicles
      {
        _id: "veh_t3_001",
        sn: 1,
        vehicle: 'AP04GH3490',
        doNumber: 'DO902322',
        gateInNumber: 'GI908750',
        gateOutTime: '10 Aug 18:20',
        customer: 'JSW Steel L',
        delivery: 'Coimbatore',
        totalDistance: 1700,
        promisedDeliveryDate: '15 Aug 17:30',
        status: 'Delay',
        remainingDistance: 930,
        travelledDistance: 770,
        avg_distance: 425,
        dayRuns: [
          {
            _id: "run_t3_001_1",
            start: "2024-08-10T18:20:00.000Z",
            day: 1,
            distance: 200,
            travel_time: 12000,
            remarks: "",
            polyline: "sample_polyline_1"
          },
          {
            _id: "run_t3_001_2",
            start: "2024-08-11T06:00:00.000Z",
            day: 2,
            distance: 250,
            travel_time: 15000,
            remarks: "",
            polyline: "sample_polyline_2"
          },
          {
            _id: "run_t3_001_3",
            start: "2024-08-12T06:00:00.000Z",
            day: 3,
            distance: 170,
            travel_time: 12000,
            remarks: "",
            polyline: "sample_polyline_3"
          },
          {
            _id: "run_t3_001_4",
            start: "2024-08-13T06:00:00.000Z",
            day: 4,
            distance: 150,
            travel_time: 10000,
            remarks: "",
            polyline: "sample_polyline_4"
          }
        ]
      },
      {
        _id: "veh_t3_002",
        sn: 2,
        vehicle: 'KA04GH3465',
        doNumber: 'DO902340',
        gateInNumber: 'GI908751',
        gateOutTime: '10 Aug 19:20',
        customer: 'Tata Steel Lt',
        delivery: 'Mysuru',
        totalDistance: 1800,
        promisedDeliveryDate: '14 Aug 13:30',
        status: 'Critical',
        remainingDistance: 930,
        travelledDistance: 870,
        avg_distance: 450,
        dayRuns: [
          {
            _id: "run_t3_002_1",
            start: "2024-08-10T19:20:00.000Z",
            day: 1,
            distance: 250,
            travel_time: 15000,
            remarks: "",
            polyline: "sample_polyline_1"
          },
          {
            _id: "run_t3_002_2",
            start: "2024-08-11T06:00:00.000Z",
            day: 2,
            distance: 220,
            travel_time: 13000,
            remarks: "",
            polyline: "sample_polyline_2"
          },
          {
            _id: "run_t3_002_3",
            start: "2024-08-12T06:00:00.000Z",
            day: 3,
            distance: 200,
            travel_time: 12000,
            remarks: "",
            polyline: "sample_polyline_3"
          },
          {
            _id: "run_t3_002_4",
            start: "2024-08-13T06:00:00.000Z",
            day: 4,
            distance: 200,
            travel_time: 12000,
            remarks: "",
            polyline: "sample_polyline_4"
          }
        ]
      },
      {
        _id: "veh_t3_003",
        sn: 3,
        vehicle: 'AP04GH4455',
        doNumber: 'DO902327',
        gateInNumber: 'GI908752',
        gateOutTime: '10 Aug 18:30',
        customer: 'SAIL',
        delivery: 'Jaipur',
        totalDistance: 620,
        promisedDeliveryDate: '13 Aug 15:30',
        status: 'On Time',
        remainingDistance: 2,
        travelledDistance: 618,
        avg_distance: 155,
        dayRuns: [
          {
            _id: "run_t3_003_1",
            start: "2024-08-10T18:30:00.000Z",
            day: 1,
            distance: 180,
            travel_time: 12000,
            remarks: "",
            polyline: "sample_polyline_1"
          },
          {
            _id: "run_t3_003_2",
            start: "2024-08-11T06:00:00.000Z",
            day: 2,
            distance: 150,
            travel_time: 10000,
            remarks: "",
            polyline: "sample_polyline_2"
          },
          {
            _id: "run_t3_003_3",
            start: "2024-08-12T06:00:00.000Z",
            day: 3,
            distance: 160,
            travel_time: 11000,
            remarks: "",
            polyline: "sample_polyline_3"
          },
          {
            _id: "run_t3_003_4",
            start: "2024-08-13T06:00:00.000Z",
            day: 4,
            distance: 128,
            travel_time: 9000,
            remarks: "",
            polyline: "sample_polyline_4"
          }
        ]
      },
      {
        _id: "veh_t3_004",
        sn: 4,
        vehicle: 'KA04GH3439',
        doNumber: 'DO247786',
        gateInNumber: 'GI908753',
        gateOutTime: '10 Aug 20:30',
        customer: 'UltraTech Cc',
        delivery: 'Raipur',
        totalDistance: 2000,
        promisedDeliveryDate: '15 Aug 05:30',
        status: 'Critical',
        remainingDistance: 1180,
        travelledDistance: 820,
        avg_distance: 500,
        dayRuns: [
          {
            _id: "run_t3_004_1",
            start: "2024-08-10T20:30:00.000Z",
            day: 1,
            distance: 180,
            travel_time: 12000,
            remarks: "",
            polyline: "sample_polyline_1"
          },
          {
            _id: "run_t3_004_2",
            start: "2024-08-11T06:00:00.000Z",
            day: 2,
            distance: 190,
            travel_time: 13000,
            remarks: "",
            polyline: "sample_polyline_2"
          },
          {
            _id: "run_t3_004_3",
            start: "2024-08-12T06:00:00.000Z",
            day: 3,
            distance: 250,
            travel_time: 15000,
            remarks: "",
            polyline: "sample_polyline_3"
          },
          {
            _id: "run_t3_004_4",
            start: "2024-08-13T06:00:00.000Z",
            day: 4,
            distance: 200,
            travel_time: 12000,
            remarks: "",
            polyline: "sample_polyline_4"
          }
        ]
      }
    ];

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

    const processedData = processData(mockVehicleData);
    setData(processedData);
  }, []);

  // Pagination logic
  const filteredData = data.filter(vehicle => {
    const statusMatch = filters.status === 'All' || vehicle.status === filters.status;
    const dayRunsMatch = filters.dayRuns === 'All' ||
      (filters.dayRuns === '4+' ? vehicle.dayRunsCount >= 4 : vehicle.dayRunsCount === parseInt(filters.dayRuns));
    return statusMatch && dayRunsMatch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

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

  return (
    <div className="day-run-container">
      <div className="day-run-content">
        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-box">
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

        {/* Summary Statistics */}
        <div className="filter-section">
          <div className="filter-box">
            <div className="summary-header-item">
              <span className="header-label">Total Vehicles</span>
              <span className="header-value">{currentData.length}</span>
            </div>
            <div className="summary-header-item">
              <span className="header-label">On Time</span>
              <span className="header-value">{currentData.filter(v => v.status === 'On Time').length}</span>
            </div>
            <div className="summary-header-item">
              <span className="header-label">Delayed</span>
              <span className="header-value">{currentData.filter(v => v.status === 'Delay').length}</span>
            </div>
            <div className="summary-header-item">
              <span className="header-label">Critical</span>
              <span className="header-value">{currentData.filter(v => v.status === 'Critical').length}</span>
            </div>
          </div>
        </div>

        {/* Single Table */}
        <div className="day-run-table-container">
          <div className="day-section">
            <div className="table-wrapper">
              <table className="day-run-table">
                <thead>
                  <tr>
                    <th>SN</th>
                    <th>Vehicle</th>
                    <th>DO Number</th>
                    <th>Gate In Number</th>
                    <th>Gate Out Time</th>
                    <th>Customer</th>
                    <th>Delivery</th>
                    <th>Total Distance (Kms)</th>
                    <th>Avg Distance/Day (Kms)</th>
                    <th>Day Runs</th>
                    <th>Promised Delivery Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((vehicle, index) => (
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
                        <td>{vehicle.vehicle}</td>
                        <td>{vehicle.doNumber}</td>
                        <td>{vehicle.gateInNumber}</td>
                        <td>{vehicle.gateOutTime}</td>
                        <td>{vehicle.customer}</td>
                        <td>{vehicle.delivery}</td>
                        <td>{Math.round(vehicle.totalDistance)}</td>
                        <td>{vehicle.avgDistancePerDay}</td>
                        <td>{vehicle.dayRunsCount}</td>
                        <td>{vehicle.promisedDeliveryDate}</td>
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
                      <td colSpan={13} style={{ textAlign: 'center', padding: '40px' }}>
                        No vehicles match the current filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="filter-section">
              <div className="filter-box" style={{ justifyContent: 'center' }}>
                <button
                  className="action-btn"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{ marginRight: '10px' }}
                >
                  Previous
                </button>
                <span style={{ margin: '0 15px', fontWeight: '500' }}>
                  Page {currentPage} of {totalPages} ({filteredData.length} total vehicles)
                </span>
                <button
                  className="action-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{ marginLeft: '10px' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
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
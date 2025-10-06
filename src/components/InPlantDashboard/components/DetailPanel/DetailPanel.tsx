'use client';

import React, { useEffect, useState,useCallback } from 'react';
import { X, Download, AlertTriangle, FileText, User, Phone, Building, Clock, CheckCircle, Circle } from 'lucide-react';
import { Vehicle } from '../../InPlantDashboard';
import './DetailPanel.css';
import { useRouter } from 'next/navigation';
import { httpsGet, httpsPost } from '@/utils/Communication';

interface DetailPanelProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  isOpen: boolean;
}

interface TimelineEvent {
  stageId: string;
  stageName: string;
  entryTime: string;
  exitTime?: string;
  duration?: number;
  status: 'completed' | 'current' | 'pending';
  events: Array<{
    eventType: string;
    eventTime: string;
    performedBy: string;
    notes: string;
  }>;
  documents: Array<{
    type: string;
    documentUrl: string;
    uploadedAt: string;
  }>;
  weighingData?: {
    tareWeight: number;
    weightSlipNumber: string;
    operatorId: string;
  };
}

const DetailPanel: React.FC<DetailPanelProps> = ({ vehicle, onClose, isOpen }) => {
  const router = useRouter();
  console.log('DetailPanel rendered with:', { vehicle, isOpen });
  const [activeTab, setActiveTab] = useState<'timeline' | 'documents' | 'notes'>('timeline');
  const [timelineData, setTimelineData] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
 

 

  // useEffect(() => {
    const fetchTimelineData = useCallback(async (vehicleId: string) => {
      if (!vehicle) {
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await httpsPost(`InplantDashboard/timeline/${vehicle.id}`, {}, {}, 1);
        if (response && response.data) {
          setTimelineData(response.data);
        } else {
          throw new Error('Failed to load timeline data');
        }
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError('Failed to load timeline data. Please try again.');
        setTimelineData([]);
      } finally {
        setIsLoading(false);
      }
    }, [setIsLoading, setError, setTimelineData]); 

  //   fetchTimelineData();
  // }, [vehicle]);
  useEffect(() => {
    if (!vehicle || !vehicle.id) {
        return;
    }
    // Call the callable function with the current vehicle's ID
    fetchTimelineData(vehicle.id); 
}, [vehicle, fetchTimelineData]); 
  const handleSubmit = async () => {
    if (!vehicle) {
      // Log a warning if this happens, though it shouldn't based on component usage
      console.warn("Attempted to submit remark with no vehicle selected.");
      return; 
  }
    if (!remark.trim()) {
      alert("Please enter a remark before submitting.");
      return;
    }

    setIsSubmitting(true);
    const url = 'inPlantVehicles/updateRemarks'; // API endpoint

    // Payload structure for the API call
    const payload = {
      // Assuming the API expects the shipment ID and the remark content
      attached_driver: vehicle?.driver?.id, 
      shipper_remark: remark.trim(),
    };

    try {
      // Use httpsPost for the API call
      const response = await httpsPost(
        url, 
        payload, 
        router, 
        1, // Retries
        false // Is external
      );

      if (response?.statusCode === 200) {
        // Success feedback (e.g., toast/snackbar)
        console.log("Remark submitted successfully:", response);
        onClose(); // Close modal on success
        await fetchTimelineData(vehicle.id);
      } else {
        // Failure feedback
        console.error("Failed to submit remark:", response?.message || "Unknown error");
        alert(`Failed to submit remark. ${response?.message || ''}`);
      }
    } catch (error) {
      console.error("API call error during remark submission:", error);
      alert("An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!vehicle) return null;

  if (isLoading) {
    return <div className="loading-indicator">Loading timeline data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const formatTime = (isoString: string): string => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getStatusIcon = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="timeline-icon completed" />;
      case 'current':
        return <Clock size={20} className="timeline-icon current" />;
      case 'pending':
        return <Circle size={20} className="timeline-icon pending" />;
    }
  };

  const handleExportPDF = () => {
    console.log('Exporting PDF for vehicle:', vehicle.vehicleNumber);
  };

  const handleSendAlert = () => {
    console.log('Sending alert for vehicle:', vehicle.vehicleNumber);
  };

  return (
    <div className={`detail-panel ${isOpen ? 'open' : ''}`}>
      {/* Panel Header */}
      <div className="detail-header">
        <div className="header-info">
          Vehicle Details
        </div>
        <button onClick={onClose} className="close" aria-label="Close details">
          <X size={20} />
        </button>
      </div>

      {/* Vehicle Summary */}
      <div className="vehicle-summary">
        <div className="summary-grid">
          <div className="summary-item">
            <User size={16} />
            <div>
              <span className="label">Driver</span>
              <span className="value">{vehicle.driver.name}</span>
              <span className="meta">{vehicle.driver.phone}</span>
            </div>
          </div>

          <div className="summary-item">
            <Building size={16} />
            <div>
              <span className="label">Transporter</span>
              <span className="value">{vehicle.carrier.name}</span>
            </div>
          </div>

          <div className="summary-item">
            <Building size={16} />
            <div>
              <span className="label">Shipper</span>
              <span className="value">{vehicle.shipper.name}</span>
            </div>
          </div>

          <div className="summary-item">
            <FileText size={16} />
            <div>
              <span className="label">Shipment ID</span>
              <span className="value">{vehicle.shipmentId}</span>
              <span className="meta">{vehicle.orderReference}</span>
            </div>
          </div>
        </div>

        <div className="current-status">
          <div className={`status-badge ${vehicle.overallStatus}`}>
            {vehicle.overallStatus === 'delayed' && <AlertTriangle size={14} />}
            {vehicle.overallStatus.replace('_', ' ').toUpperCase()}
          </div>
          <div className="status-details">
            Currently at: <strong>{vehicle.currentStage.stageName}</strong>
            <br />
            Duration: <strong>{formatDuration(vehicle.currentStage.duration)}</strong>
            {vehicle.currentStage.duration > vehicle.currentStage.expectedDuration && (
              <span className="delayed-text">
                ({formatDuration(vehicle.currentStage.duration - vehicle.currentStage.expectedDuration)} over expected)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button
          className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Journey Timeline
        </button>
        {/* <button
          className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </button> */}
        <button
          className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Notes
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'timeline' && (
          <div className="timeline-content">
            {timelineData.map((item, index) => (
              <div key={`${item.stageId}-${index}`} className={`timeline-item ${item.status}`}>
                <div className="timeline-marker">
                  {getStatusIcon(item.status)}
                  {index < timelineData.length - 1 && <div className="timeline-line" />}
                </div>

                <div className="timeline-content-area">
                  <div className="timeline-header">
                    <h4 className="stage-name">{item.stageName}</h4>
                    <div className="stage-timing">
                      {item.status === 'completed' && item.exitTime && (
                        <span className="time-range">
                          {formatTime(item.entryTime)} - {formatTime(item.exitTime)}
                        </span>
                      )}
                      {item.status === 'current' && (
                        <span className="current-time">
                          Started: {formatTime(item.entryTime)}
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="pending-time">Pending</span>
                      )}
                    </div>
                  </div>

                  {item.duration !== undefined && (
                    <div className="stage-duration">
                      Duration: <strong>{formatDuration(item.duration)}</strong>
                      {item.status === 'current' && vehicle.currentStage.expectedDuration && (
                        <span className={`expected ${item.duration > vehicle.currentStage.expectedDuration ? 'exceeded' : ''}`}>
                          (Expected: {formatDuration(vehicle.currentStage.expectedDuration)})
                        </span>
                      )}
                    </div>
                  )}

                  {item.weighingData && (
                    <div className="weighing-details">
                      {item.weighingData.tareWeight !== undefined && (
                        <div className="weight-info">
                          Tare Weight: <strong>{item.weighingData.tareWeight?.toLocaleString()} kg</strong>
                        </div>
                      )}
                      {item.weighingData.weightSlipNumber && (
                        <div className="slip-info">
                          Weight Slip: <strong>{item.weighingData.weightSlipNumber}</strong>
                        </div>
                      )}
                      {item.weighingData.operatorId && (
                        <div className="operator-info">
                          Operator: <strong>{item.weighingData.operatorId}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {item.events.length > 0 && (
                    <div className="stage-events">
                      {item.events.map((event, eventIndex) => (
                        <div key={eventIndex} className="event-item">
                          <div className="event-time">{formatTime(event.eventTime)}</div>
                          <div className="event-details">
                            <div className="event-performer">{event.performedBy}</div>
                            <div className="event-notes">{event.notes}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.documents.length > 0 && (
                    <div className="stage-documents">
                      {item.documents.map((doc, docIndex) => (
                        <div key={docIndex} className="document-item">
                          <FileText size={14} />
                          <span>{doc.type.replace('_', ' ')}</span>
                          <button className="doc-download">Download</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="documents-content">
            {/* <div className="documents-list">
              <div className="document-category">
                <h4>Entry Documents</h4>
                <div className="document-item">
                  <FileText size={16} />
                  <div className="doc-info">
                    <span className="doc-name">Entry Pass</span>
                    <span className="doc-meta">Uploaded 3 hours ago</span>
                  </div>
                  <button className="doc-action">View</button>
                </div>
              </div>

              <div className="document-category">
                <h4>Weight Certificates</h4>
                <div className="document-item">
                  <FileText size={16} />
                  <div className="doc-info">
                    <span className="doc-name">Weight Slip - WB-1234</span>
                    <span className="doc-meta">Generated 2.5 hours ago</span>
                  </div>
                  <button className="doc-action">Download</button>
                </div>
              </div>
            </div> */}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="notes-content">
            <div className="notes-list">
              {/* // display notes */}
              {timelineData.flatMap((stage) => 
                  stage.events.map((event, index) => (
                    <div key={`${stage.stageId}-${index}`} className="note-item">
                      <div className="note-header">
                        <span className="note-stage">{stage.stageName}</span>
                        <span className="note-time">{formatTime(event.eventTime)}</span>
                      </div>
                      <p className="note-text">{event.notes}</p>
                      <span className="note-performer">By: {event.performedBy}</span>
                    </div>
                  ))
                ).reverse()}
            </div>

            <div className="add-note">
              <textarea    value={remark} 
           onChange={(e) => {
            const inputValue = e.target.value;
            const filteredValue = inputValue.replace(/[^a-zA-Z\s0-9]/g, '');
           setRemark(filteredValue);}} placeholder="Add a note..." className="note-input" rows={3}></textarea>
              <button onClick={handleSubmit}  className="add-note-btn" >Add Note</button>
            </div>
          </div>
        )}
      </div>

      {/* Panel Footer */}
      {/* <div className="detail-footer">
        <button onClick={handleExportPDF} className="footer-btn secondary">
          <Download size={16} />
          Export PDF
        </button>
        <button onClick={handleSendAlert} className="footer-btn secondary">
          <AlertTriangle size={16} />
          Send Alert
        </button>
      </div> */}
    </div>
  );
};

export default DetailPanel;
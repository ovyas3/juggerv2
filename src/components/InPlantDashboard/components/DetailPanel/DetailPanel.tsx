'use client';

import React, { useEffect, useState } from 'react';
import { X, Download, AlertTriangle, FileText, User, Phone, Building, Clock, CheckCircle, Circle } from 'lucide-react';
import { Vehicle } from '../../InPlantDashboard';
import './DetailPanel.css';

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
  const [activeTab, setActiveTab] = useState<'timeline' | 'documents' | 'notes'>('timeline');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!vehicle) return null;

  // Mock timeline data - in real app this would come from API
  const mockTimeline: TimelineEvent[] = [
    {
      stageId: 'ENTRY_GATE',
      stageName: 'Gate Entry',
      entryTime: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      exitTime: new Date(Date.now() - 170 * 60 * 1000).toISOString(),
      duration: 10,
      status: 'completed',
      events: [
        {
          eventType: 'security_check',
          eventTime: new Date(Date.now() - 178 * 60 * 1000).toISOString(),
          performedBy: 'Security Officer #12',
          notes: 'Documents verified successfully'
        }
      ],
      documents: [
        {
          type: 'entry_pass',
          documentUrl: '/documents/EP-12345.pdf',
          uploadedAt: new Date(Date.now() - 175 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      stageId: 'WEIGHING',
      stageName: 'Weight In',
      entryTime: new Date(Date.now() - 170 * 60 * 1000).toISOString(),
      exitTime: new Date(Date.now() - 155 * 60 * 1000).toISOString(),
      duration: 15,
      status: 'completed',
      events: [],
      documents: [],
      weighingData: {
        tareWeight: 8500,
        weightSlipNumber: 'WB-1234',
        operatorId: 'OP-45'
      }
    },
    {
      stageId: 'LOADING',
      stageName: 'Loading Bay 3',
      entryTime: new Date(Date.now() - 155 * 60 * 1000).toISOString(),
      duration: 155,
      status: 'current',
      events: [
        {
          eventType: 'loading_started',
          eventTime: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
          performedBy: 'Loader #23',
          notes: 'Loading process initiated'
        }
      ],
      documents: []
    },
    {
      stageId: 'WEIGHT_OUT',
      stageName: 'Weight Out',
      entryTime: '',
      status: 'pending',
      events: [],
      documents: []
    },
    {
      stageId: 'GATE_OUT',
      stageName: 'Gate Out',
      entryTime: '',
      status: 'pending',
      events: [],
      documents: []
    }
  ];

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
    <>
      <div className="detail-panel-backdrop" onClick={onClose} />
      <div className={`detail-panel ${isOpen ? 'open' : ''}`}>
        {/* Panel Header */}
        <div className="detail-header">
          <div className="header-info">
            <h2>Vehicle Details</h2>
            <span className="vehicle-number">{vehicle.vehicleNumber}</span>
          </div>
          <button onClick={onClose} className="close-btn" aria-label="Close details">
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
          <button
            className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
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
              {mockTimeline.map((item, index) => (
                <div key={item.stageId} className={`timeline-item ${item.status}`}>
                  <div className="timeline-marker">
                    {getStatusIcon(item.status)}
                    {index < mockTimeline.length - 1 && <div className="timeline-line" />}
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
                        <div className="weight-info">
                          Tare Weight: <strong>{item.weighingData.tareWeight.toLocaleString()} kg</strong>
                        </div>
                        <div className="slip-info">
                          Weight Slip: <strong>{item.weighingData.weightSlipNumber}</strong>
                        </div>
                        <div className="operator-info">
                          Operator: <strong>{item.weighingData.operatorId}</strong>
                        </div>
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
              <div className="documents-list">
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
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="notes-content">
              <div className="notes-list">
                <div className="note-item">
                  <div className="note-header">
                    <span className="note-author">System</span>
                    <span className="note-time">2 hours ago</span>
                  </div>
                  <div className="note-text">
                    Vehicle exceeded expected loading time. Alert sent to supervisor.
                  </div>
                </div>

                <div className="note-item">
                  <div className="note-header">
                    <span className="note-author">Loader #23</span>
                    <span className="note-time">1.5 hours ago</span>
                  </div>
                  <div className="note-text">
                    Loading in progress. Material handling requires special care due to fragile items.
                  </div>
                </div>
              </div>

              <div className="add-note">
                <textarea placeholder="Add a note..." className="note-input" rows={3}></textarea>
                <button className="add-note-btn">Add Note</button>
              </div>
            </div>
          )}
        </div>

        {/* Panel Footer */}
        <div className="detail-footer">
          <button onClick={handleExportPDF} className="footer-btn secondary">
            <Download size={16} />
            Export PDF
          </button>
          <button onClick={handleSendAlert} className="footer-btn secondary">
            <AlertTriangle size={16} />
            Send Alert
          </button>
        </div>
      </div>
    </>
  );
};

export default DetailPanel;
import React, { useState } from "react";
import styles from "./shipmentsDashboard.module.css";
import { Button } from "../UI/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../UI/dropdown-menu";
import {
  MoreHorizontal,
  Search,
  Eye,
  Share2,
  Mail,
  XCircle,
  Download,
  WifiOff,
  Wifi,
  Clock,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle,
} from "lucide-react";
import { LocationDialog } from "../../components/ShipmentsDashboard/LocationTracking/LocationDialog";
import greenSIM from "../../assets/green-SIM.svg";
import redSIM from "../../assets/red-SIM.svg";
import Image from "next/image";
import { environment } from "@/environments/env.api";

interface Shipment {
  _id: string;
  tripTracker?: any;
  carrier_parent_name: string;
  booked_by?: string;
  driverName?: string;
  driverMobile?: string;
  epods_available?: boolean;
  trip_tracker?: {
    last_location_address?: string;
    last_location_at?: string;
  };
  frieght_price?: number;
  [key: string]: any; // For additional properties
  disableShare?: boolean;
}

interface ShipmentsTableProps {
  isAnalyticsView: boolean;
  isCompactView: boolean;
  tableRef: React.RefObject<HTMLDivElement>;
  selectedShipmentsArray: string[];
  handleSelectAllShipments: (checked: boolean) => void;
  shipmentsArray: Shipment[];
  currentPage: number;
  pageSize: number;
  shipmentType: "inbound" | "outbound" | "all" | "others";
  showLoader: boolean;
  actionSearch: string;
  setActionSearch: (value: string) => void;
  actionMenuCategories: any;
  renderStatusCell: (shipment: Shipment) => React.ReactNode;
  renderSINCell: (shipment: Shipment) => React.ReactNode;
  renderLocationCell: (
    shipment: Shipment,
    copyDestinationCode: any,
    openLocationsPopup: any,
    shipmentType: string,
    locationType: "pickup" | "delivery"
  ) => React.ReactNode;
  renderDateTimeCell: (
    shipment: Shipment,
    shipmentType: string
  ) => React.ReactNode;
  renderVehicleCell: (shipment: Shipment) => React.ReactNode;
  renderConsentCell: (shipment: Shipment) => React.ReactNode;
  renderSubscriptionCell: (shipment: Shipment) => React.ReactNode;
  handleSelectShipment: (id: string, checked: boolean) => void;
  copyDestinationCode: any;
  openLocationsPopup: any;
  formatCurrency: (amount: number) => string;
  // onViewDetails: (shipment: Shipment) => void;
  // onShare: (shipment: Shipment) => void;
  // onSendEmail: (shipment: Shipment) => void;
  // onCancel: (shipment: Shipment) => void;
  // onEditPickup: (shipment: Shipment) => void;
  // onEditDelivery: (shipment: Shipment) => void;
  // onUpdateFreight: (shipment: Shipment) => void;
  // onViewEpods: (shipment: Shipment) => void;
}

export const ShipmentsTable: React.FC<ShipmentsTableProps> = ({
  isAnalyticsView,
  isCompactView,
  tableRef,
  selectedShipmentsArray,
  handleSelectAllShipments,
  shipmentsArray,
  currentPage,
  pageSize,
  shipmentType,
  showLoader,
  actionSearch,
  setActionSearch,
  actionMenuCategories,
  renderStatusCell,
  renderSINCell,
  renderLocationCell,
  renderDateTimeCell,
  renderVehicleCell,
  renderConsentCell,
  renderSubscriptionCell,
  handleSelectShipment,
  copyDestinationCode,
  openLocationsPopup,
  formatCurrency,
  // onViewDetails,
  // onShare,
  // onSendEmail,
  // onCancel,
  // onEditPickup,
  // onEditDelivery,
  // onUpdateFreight,
  // onViewEpods,
}) => {
  const [actionSearchState, setActionSearchState] = useState("");

  const shouldShowAction = (actionName: string): boolean => {
    if (!actionSearchState) return true;
    return actionName.toLowerCase().includes(actionSearchState.toLowerCase());
  };

  // const renderActionButton = (shipment: Shipment) => {
  //   // Define all action handlers
  //   const handleViewDetails = () => {
  //     onViewDetails?.(shipment);
  //   };

  //   const handleShare = () => {
  //     if (!shipment.disableShare) {
  //       onShare?.(shipment);
  //     }
  //   };

  //   const handleSendEmail = () => {
  //     if (!shipment.disableShare) {
  //       onSendEmail?.(shipment);
  //     }
  //   };

  //   const handleCancel = () => {
  //     if (shipment.status !== 'Completed' && shipment.status !== 'Cancelled') {
  //       onCancel?.(shipment);
  //     }
  //   };

  //   // Action menu categories with all actions
  //   const actionCategories = [
  //     {
  //       name: 'QUICK ACTIONS',
  //       actions: [
  //         {
  //           label: 'View',
  //           icon: <Eye className="w-4 h-4 mr-2 text-blue-600" />,
  //           onClick: handleViewDetails,
  //           disabled: false,
  //           show: true
  //         },
  //         {
  //           label: 'Share',
  //           icon: <Share2 className="w-4 h-4 mr-2 text-blue-500" />,
  //           onClick: handleShare,
  //           disabled: shipment.disableShare,
  //           show: true
  //         },
  //         {
  //           label: 'Mail',
  //           icon: <Mail className="w-4 h-4 mr-2 text-orange-600" />,
  //           onClick: handleSendEmail,
  //           disabled: shipment.disableShare,
  //           show: true
  //         },
  //         {
  //           label: 'Cancel',
  //           icon: <XCircle className="w-4 h-4 mr-2 text-red-600" />,
  //           onClick: handleCancel,
  //           disabled: shipment.status === 'Completed' || shipment.status === 'Cancelled',
  //           show: true
  //         }
  //       ]
  //     },
  //     {
  //       name: 'TRACKING & GPS',
  //       actions: [
  //         {
  //           label: 'SIM Tracking',
  //           icon: <Download className="w-4 h-4 mr-2 text-amber-600" />,
  //           onClick: () => {},
  //           disabled: shipment.status === 'Completed' || shipment.status === 'Assigned' || shipment.status === 'Cancelled',
  //           show: true // Add condition based on user permissions
  //         },
  //         {
  //           label: 'GPS Disconnection Reason',
  //           icon: <WifiOff className="w-4 h-4 mr-2 text-orange-600" />,
  //           onClick: () => { /* openUpdateRemarks(shipment, 'gpsRemoveReason') */ },
  //           disabled: false,
  //           show: true // Add condition based on user permissions
  //         },
  //         {
  //           label: 'Add GPS Connection',
  //           icon: <Wifi className="w-4 h-4 mr-2 text-amber-600" />,
  //           onClick: () => { /* openAddGpsConnection(shipment) */ },
  //           disabled: !shipment.carrier,
  //           show: true // Add condition based on user permissions
  //         },
  //         {
  //           label: 'Update Delay Reason',
  //           icon: <Clock className="w-4 h-4 mr-2 text-teal-600" />,
  //           onClick: () => { /* openUpdateRemarks(shipment, 'delayReason') */ },
  //           disabled: false,
  //           show: true // Add condition based on user permissions
  //         }
  //       ]
  //     },
  //     {
  //       name: 'LOCATION & ROUTES',
  //       actions: [
  //         {
  //           label: 'Edit Pickup',
  //           icon: <MapPin className="w-4 h-4 mr-2 text-pink-600" />,
  //           onClick: () => { onEditPickup?.(shipment); },
  //           disabled: shipment.status === 'Completed' || shipment.status === 'Cancelled',
  //           show: true // Add condition based on user permissions
  //         },
  //         {
  //           label: 'Edit Delivery',
  //           icon: <MapPin className="w-4 h-4 mr-2 text-pink-600" />,
  //           onClick: () => { onEditDelivery?.(shipment); },
  //           disabled: shipment.status === 'Completed' || shipment.status === 'Cancelled',
  //           show: true // Add condition based on user permissions
  //         },
  //         {
  //           label: 'Pull Freight with Routes',
  //           icon: <DollarSign className="w-4 h-4 mr-2 text-amber-800" />,
  //           onClick: () => { /* openPullFreightDialog(shipment) */ },
  //           disabled: false,
  //           show: true // Add condition based on user permissions
  //         },
  //         {
  //           label: 'Recalculate Distance',
  //           icon: <MapPin className="w-4 h-4 mr-2 text-pink-600" />,
  //           onClick: () => { /* openDistanceCalculation(shipment) */ },
  //           disabled: false,
  //           show: true // Add condition based on user permissions
  //         }
  //       ]
  //     },
  //     {
  //       name: 'FREIGHT & PAYMENT',
  //       actions: [
  //         {
  //           label: 'Update Carrier Freight',
  //           icon: <DollarSign className="w-4 h-4 mr-2 text-gray-600" />,
  //           onClick: () => { onUpdateFreight?.(shipment); },
  //           disabled: false,
  //           show: true // Add condition: shipment.rate?.type === 'manual' && showFreight
  //         },
  //         {
  //           label: 'Flush Freight',
  //           icon: <DollarSign className="w-4 h-4 mr-2 text-gray-600" />,
  //           onClick: () => { /* updateFreightNew(shipment) */ },
  //           disabled: false,
  //           show: true // Add condition based on user permissions
  //         },
  //         {
  //           label: 'Create Advance Payment',
  //           icon: <DollarSign className="w-4 h-4 mr-2 text-indigo-600" />,
  //           onClick: () => { /* createPaymentAdvice(shipment) */ },
  //           disabled: shipment.status === 'Cancelled',
  //           show: true // Add condition: !shipment.isOwnFleet_shipment
  //         },
  //         {
  //           label: 'Change Invoice Type',
  //           icon: <FileText className="w-4 h-4 mr-2 text-amber-800" />,
  //           onClick: () => { /* openChangeInvoiceType(shipment) */ },
  //           disabled: false,
  //           show: true // Add condition based on user permissions
  //         }
  //       ]
  //     },
  //     {
  //       name: 'DOCUMENTS & STATUS',
  //       actions: [
  //         {
  //           label: 'Upload Approval Documents',
  //           icon: <FileText className="w-4 h-4 mr-2 text-purple-600" />,
  //           onClick: () => { /* openAttachDialog(shipment) */ },
  //           disabled: false,
  //           show: true // Add condition: shipment.rate?.type === 'manual'
  //         },
  //         {
  //           label: 'View ePODs',
  //           icon: <FileText className="w-4 h-4 mr-2 text-amber-800" />,
  //           onClick: () => { onViewEpods?.(shipment); },
  //           disabled: !shipment.carrier,
  //           show: true // Add condition based on user permissions
  //         },
  //         {
  //           label: 'Submit Mark As Arrived',
  //           icon: <CheckCircle className="w-4 h-4 mr-2 text-green-600" />,
  //           onClick: () => { /* completeShipment(shipment, 'arrived') */ },
  //           disabled: shipment.status === 'Completed' || shipment.status === 'Cancelled',
  //           show: true // Add condition: functions.shipment_management || (roles.owner || roles.fleet)
  //         },
  //         {
  //           label: 'Recalculate Customer Gate In/Out',
  //           icon: <MapPin className="w-4 h-4 mr-2 text-pink-600" />,
  //           onClick: () => { /* openUploadDialog(shipment) */ },
  //           disabled: shipment.disableInvoiceEdit && (shipmentType === 'outbound' || shipmentType === 'all'),
  //           show: true // Add condition based on user permissions
  //         }
  //       ]
  //     }
  //   ];

  //   // Filter actions based on search
  //   const filteredCategories = actionCategories.map(category => ({
  //     ...category,
  //     actions: category.actions.filter(action =>
  //       action.show &&
  //       (action.label.toLowerCase().includes(actionSearchState.toLowerCase()) ||
  //        actionSearchState === '')
  //     )
  //   })).filter(category => category.actions.length > 0);

  //   return (
  //     <div className={styles.actionCell}>
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreHorizontal className="h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end" className={styles.actionMenu}>
  //           <div className={styles.searchContainer}>
  //             <Search className={styles.searchIcon} />
  //             <input
  //               type="text"
  //               placeholder="Search actions..."
  //               value={actionSearchState}
  //               onChange={(e) => setActionSearchState(e.target.value)}
  //               className={styles.searchInput}
  //               onClick={(e) => e.stopPropagation()}
  //             />
  //           </div>

  //           <div className={styles.actionsGrid}>
  //             {filteredCategories.map((category, catIndex) => (
  //               <div key={catIndex} className={styles.actionSection}>
  //                 <div className={styles.sectionHeader}>{category.name}</div>
  //                 {category.actions.map((action, actionIndex) => (
  //                   <DropdownMenuItem
  //                     key={`${catIndex}-${actionIndex}`}
  //                     onSelect={(e) => {
  //                       e.preventDefault();
  //                       if (!action.disabled) {
  //                         action.onClick();
  //                       }
  //                     }}
  //                     className={`${styles.actionItem} ${action.disabled ? styles.disabled : ''}`}
  //                     disabled={action.disabled}
  //                   >
  //                     <span className="flex items-center">
  //                       {action.icon}
  //                       <span>{action.label}</span>
  //                     </span>
  //                   </DropdownMenuItem>
  //                 ))}
  //               </div>
  //             ))}
  //           </div>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     </div>
  //   );
  // };

  if (isAnalyticsView) return null;

  return (
    <div
      className={`${styles.tableContainer} ${
        isCompactView ? styles.compactView : ""
      }`}
      ref={tableRef}
    >
      <table className={`${styles.matTable} ${styles.table}`}>
        <thead className={styles.matHeaderRow}>
          <tr>
            <th className={`${styles.matHeaderCell} ${styles.matColumnSelect}`}>
              <input
                type="checkbox"
                onChange={(e) => handleSelectAllShipments(e.target.checked)}
                checked={
                  selectedShipmentsArray.length ===
                    Math.min(shipmentsArray.length, 10) &&
                  shipmentsArray.length > 0
                }
              />
            </th>
            <th className={`${styles.matHeaderCell} ${styles.matColumnSno}`}>
              S.No
            </th>
            <th className={`${styles.matHeaderCell} ${styles.matColumnStatus}`}>
              Status
            </th>
            <th className={`${styles.matHeaderCell} ${styles.matColumnSIN}`}>
              SIN
            </th>
            <th
              className={`${styles.matHeaderCell} ${styles.matColumnPickup} ${styles.stickyColumn}`}
            >
              {shipmentType === "outbound" ? "Delivery" : "Pickup"}
            </th>
            {["all", "others"].includes(shipmentType) && (
              <th
                className={`${styles.matHeaderCell} ${styles.matColumnDelivery} ${styles.stickyColumn}`}
              >
                Delivery
              </th>
            )}
            {/* <th className={`${styles.matHeaderCell} ${styles.matColumnDateTime}`}>Date & Time</th> */}
            <th
              className={`${styles.matHeaderCell} ${styles.matColumnCarrier}`}
            >
              Carrier
            </th>

            {shipmentType === "inbound" && (
              <th className={styles.matHeaderCell}>Booked By</th>
            )}

            <th className={styles.matHeaderCell}>Vehicle Number</th>
            <th className={`${styles.matHeaderCell} ${styles.matColumnTrack}`}>
              Track
            </th>
            <th className={styles.matHeaderCell}>Driver</th>
            <th
              className={`${styles.matHeaderCell} ${styles.matColumnDriverPhone}`}
            >
              Driver Phone
            </th>
            <th className={`${styles.matHeaderCell} ${styles.matColumnEpod}`}>
              EPOD
            </th>
            <th
              className={`${styles.matHeaderCell} ${styles.matColumnConsent}`}
            >
              Consent
            </th>
            <th
              className={`${styles.matHeaderCell} ${styles.matColumnSubscribed}`}
            >
              Subscribed
            </th>
            <th
              className={`${styles.matHeaderCell} ${styles.matColumnLastLocation}`}
            >
              Last Known Location
            </th>
            <th className={styles.matHeaderCell}>Freight (₹)</th>
            <th className={styles.matHeaderCell}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {showLoader ? (
            <tr>
              <td colSpan={19} className={styles.matCell}>
                Loading...
              </td>
            </tr>
          ) : shipmentsArray.length === 0 ? (
            <tr>
              <td
                colSpan={19}
                className={`${styles.matCell} ${styles.noOrders}`}
              >
                No shipments found
              </td>
            </tr>
          ) : (
            shipmentsArray.map((shipment, index) => (
              <tr key={shipment._id} className={styles.matRow}>
                <td className={`${styles.matCell} ${styles.matColumnSelect}`}>
                  <input
                    type="checkbox"
                    checked={selectedShipmentsArray.includes(shipment._id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectShipment(shipment._id, e.target.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>

                <td className={`${styles.matCell} ${styles.matColumnSno}`}>
                  {currentPage * pageSize + index + 1}
                </td>
                <td className={`${styles.matCell} ${styles.matColumnStatus}`}>
                  {renderStatusCell(shipment)}
                </td>
                <td className={`${styles.matCell} ${styles.matColumnSIN}`}>
                  {renderSINCell(shipment)}
                </td>
                <td
                  className={`${styles.matCell} ${styles.matColumnPickup} ${styles.stickyColumn}`}
                >
                  {renderLocationCell(
                    shipment,
                    copyDestinationCode,
                    (type: string, locs: any[]) =>
                      openLocationsPopup(type, locs, shipment),
                    shipmentType,
                    "pickup"
                  )}
                </td>
                {["all", "others"].includes(shipmentType) && (
                  <td
                    className={`${styles.matCell} ${styles.matColumnDelivery} ${styles.stickyColumn}`}
                  >
                    {renderLocationCell(
                      shipment,
                      copyDestinationCode,
                      (type: string, locs: any[]) =>
                        openLocationsPopup(type, locs, shipment),
                      shipmentType,
                      "delivery"
                    )}
                  </td>
                )}
                {/* <td className={`${styles.matCell} ${styles.matColumnDateTime}`}>
                  {renderDateTimeCell(shipment, shipmentType)}
                </td> */}
                <td className={`${styles.matCell} ${styles.matColumnCarrier}`}>
                  {shipment.carrier_parent_name}
                </td>

                {shipmentType === "inbound" && (
                  <td className={styles.matCell}>{shipment.booked_by}</td>
                )}

                <td className={styles.matCell}>
                  {renderVehicleCell(shipment)}
                </td>

                <td className={`${styles.matCell} ${styles.matColumnTrack}`}>
                  <a
                    href={`${environment.TRACKER_URL || ""}${
                      shipment.unique_code
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title={
                      shipment.trip_tracker
                        ? "Track shipment"
                        : "Tracking not available"
                    }
                    className={styles.trackLink}
                  >
                    {shipment.trip_tracker ? (
                      <Image
                        src={greenSIM}
                        alt="Tracking available"
                        width={20}
                        height={20}
                        className={styles.flagImg}
                      />
                    ) : (
                      <Image
                        src={redSIM}
                        alt="Tracking not available"
                        width={20}
                        height={20}
                        className={styles.flagImg}
                      />
                    )}
                  </a>
                </td>

                <td className={styles.matCell}>
                  <div>{shipment.driverName}</div>
                </td>

                <td
                  className={`${styles.matCell} ${styles.matColumnDriverPhone}`}
                >
                  <div>{shipment.driverMobile}</div>
                </td>

                <td className={`${styles.matCell} ${styles.matColumnEpod}`}>
                  {shipment.epods_available ? (
                    <span className={styles.flagImgG}>✓</span>
                  ) : (
                    <span className={styles.flagImgR}>✗</span>
                  )}
                </td>

                <td className={`${styles.matCell} ${styles.matColumnConsent}`}>
                  {renderConsentCell(shipment)}
                </td>

                <td
                  className={`${styles.matCell} ${styles.matColumnSubscribed}`}
                >
                  {renderSubscriptionCell(shipment)}
                </td>

                <td
                  className={`${styles.matCell} ${styles.matColumnLastLocation}`}
                >
                  {shipment.trip_tracker?.last_location_address ? (
                    <LocationDialog
                      address={shipment.trip_tracker.last_location_address}
                      lastUpdated={shipment.trip_tracker?.last_location_at}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className={styles.locationButton}
                        title="View location"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Location button clicked");
                        }}
                      >
                        <MapPin className={styles.locationIcon} />
                      </Button>
                    </LocationDialog>
                  ) : (
                    "-"
                  )}
                </td>
                <td className={styles.matCell}>
                  {shipment.frieght_price
                    ? formatCurrency(shipment.frieght_price)
                    : "N/A"}
                </td>

                <td className={styles.cellActions}>
                  <div className={styles.quickActions}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={styles.actionsMenuButton}
                          title="More actions"
                        >
                          <MoreHorizontal className={styles.actionIcon} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className={styles.actionMenuDropdown}
                        onInteractOutside={() => setActionSearchState("")}
                      >
                        <div className={styles.actionMenuSearch}>
                          <Search className={styles.searchIcon} />
                          <input
                            type="text"
                            placeholder="Search actions..."
                            className={styles.actionSearchInput}
                            onChange={(e) =>
                              setActionSearchState(e.target.value)
                            }
                            value={actionSearchState}
                          />
                        </div>
                        <div className={styles.actionCategoriesGrid}>
                          {Object.entries(actionMenuCategories)
                            .filter(
                              ([_, items]) =>
                                actionSearchState === "" ||
                                (items as any[]).some((item) =>
                                  item.label
                                    .toLowerCase()
                                    .includes(actionSearchState.toLowerCase())
                                )
                            )
                            .map(([category, items]) => (
                              <div
                                key={category}
                                className={styles.actionCategory}
                              >
                                <div className={styles.actionCategoryHeader}>
                                  {category}
                                </div>
                                <div className={styles.actionCategoryItems}>
                                  {(items as any[])
                                    .filter(
                                      (item) =>
                                        actionSearchState === "" ||
                                        item.label
                                          .toLowerCase()
                                          .includes(
                                            actionSearchState.toLowerCase()
                                          )
                                    )
                                    .map((item, index) => {
                                      const IconComponent = item.icon;
                                      return (
                                        <DropdownMenuItem
                                          key={index}
                                          className={styles.actionMenuItem}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            if (item.onClick) {
                                              item.onClick(shipment); // This will call the onClick handler with the shipment
                                            }
                                          }}
                                        >
                                          <IconComponent
                                            className={`${
                                              styles.actionMenuIcon
                                            } ${item.color || ""}`}
                                          />
                                          <span className={styles.actionLabel}>
                                            {item.label}
                                          </span>
                                        </DropdownMenuItem>
                                      );
                                    })}
                                </div>
                              </div>
                            ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

import React, { useState } from "react";
import styles from "./ShipmentsDashboard.module.css";
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
  UserCheck
} from "lucide-react";
import { LocationDialog } from "../../components/ShipmentsDashboard/LocationTracking/LocationDialog";
import greenSIM from "../../assets/green-SIM.svg";
import redSIM from "../../assets/red-SIM.svg";
import spotdrivericon from "../../assets/spotdriver-blue.svg";
import Image from "next/image";
import { environment } from "@/environments/env.api";
import { toTitleCase } from "@/utils/stringUtils"
import simTrackingIcon from "../../assets/sim_tracking.svg";
import gpsTrackingIcon from "../../assets/gps_tracking.svg";
import mobileIcon from "../../assets/mobile.svg";
import { httpsPost } from "@/utils/Communication";
import { useSnackbar } from "@/hooks/snackBar";
import OrdersPopup from "./OrdersPopup";

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
    methods?: string[];
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
  renderLastLocationCell: (shipment: Shipment) => React.ReactNode;
  actionMenuOpenId: string | null;
  setActionMenuOpenId: (id: string | null) => void;
  closeActionMenu: () => void;
  openSubscribeModal: (shipment: any) => void;
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
  renderLocationCell,
  renderDateTimeCell,
  renderVehicleCell,
  renderLastLocationCell,
  renderConsentCell,
  renderSubscriptionCell,
  handleSelectShipment,
  copyDestinationCode,
  openLocationsPopup,
  formatCurrency,
  actionMenuOpenId,
  setActionMenuOpenId,
  closeActionMenu,
  openSubscribeModal,
  // onViewDetails,
  // onShare,
  // onSendEmail,
  // onCancel,
  // onEditPickup,
  // onEditDelivery,
  // onUpdateFreight,
  // onViewEpods,
}) => {
  const { showMessage } = useSnackbar();
  const [actionSearchState, setActionSearchState] = useState("");
  const [showDownLoadLoader, setShowDownLoadLoader] = useState(false);
  const [showOrdersPopup, setShowOrdersPopup] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const handleBubbleClick = (orders: string[]) => {
    setSelectedOrders(orders);
    setShowOrdersPopup(true);
  };

  const closeOrdersPopup = () => {
    setShowOrdersPopup(false);
  };

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


const downloadLocHistory = async (type: "SIM" | "APP" | "GPS", shipmentId: string) => {
  setShowDownLoadLoader(true);
  try {
    const payload = { shipment: shipmentId, method: type };
    const response = await httpsPost("reports/path_report", payload, {}, 1);
    if (response && response.data && response.data.link) {
      window.open(response.data.link, "_blank");
    }
    if(response && response.error){
     showMessage(response.message, "error");
    }
  } catch (err: any) {
    console.error("Error downloading location history:", err);
    setShowDownLoadLoader(false);
    showMessage(err?.error?.message || "Failed to download location history", "error");
  }
  setShowDownLoadLoader(false);
};

const  renderConsentAndSubscriptionIcons = (shipment: any, openSubscribeModal: (shipment: any) => void) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
      {shipment.showGreenConsent ? (
        <span title="Consent Given" style={{cursor: "default"}}>
          <CheckCircle size={18} color="#22c55e" />
        </span>
      ) : shipment.showRedConsent ? (
        <span title="Consent Not Given" style={{cursor: "default"}}>
          <XCircle size={18} color="#ef4444" />
        </span>
      ) : (
        <span title="Consent Not Available" style={{cursor: "default"}}>
          <XCircle size={18} color="#9ca3af" />
        </span>
      )}
      {shipment.showSubscriptionStatus && !shipment.gpsVehicle && (
        <span
          style={{ cursor: "pointer" }}
          title={shipment.showGreenConsent ? "Subscribed" : "Not Subscribed"}
          onClick={(e) => {
            e.stopPropagation();
            openSubscribeModal(shipment);
          }}
        >
          {shipment.showGreenConsent ? (
            <UserCheck size={18} color="#22c55e" />
          ) : (
            <UserCheck size={18} color="#ef4444" />
          )}
        </span>
      )}
    </div>
  );
}

  if (isAnalyticsView) return null;

  return (
    <div
      className={`${styles.tableContainer} ${
        isCompactView ? styles.compactView : ""
      }`}
      ref={tableRef}
      data-shipment-type={shipmentType} 
    >
      <table
        className={`${styles.matTable} ${styles.table}`}
      >
        <thead className={styles.matHeaderRow}>
          <tr className={styles.headerRow}>
            <th
              className={`${styles.matHeaderCell} ${styles.matColumnSelect} ${styles.stickyTop} ${styles.stickyColumn}`}
            >
              Select
              {/* <input
                type="checkbox"
                onChange={(e) => handleSelectAllShipments(e.target.checked)}
                checked={
                  selectedShipmentsArray.length ===
                    Math.min(shipmentsArray.length, 10) &&
                  shipmentsArray.length > 0
                }
              /> */}
            </th>
            <th
              className={`${styles.matHeaderCell} ${styles.matColumnSno} ${styles.stickyTop} ${styles.stickyColumn}`}
            >
              S.No.
            </th>
            <th
              className={`${styles.matHeaderCell} ${styles.matColumnStatus} ${styles.stickyTop}${styles.stickyColumn}`}
            >
              Status
            </th>
            <th
              className={`${styles.matHeaderCell} ${styles.matColumnSIN} ${styles.stickyTop} ${styles.stickyColumn}`}
            >
              SIN
            </th>
            {/* Pickup Column - Hide for outbound */}
            {shipmentType !== "outbound" && (
              <th
                className={`${styles.matHeaderCell} ${styles.matColumnPickup} ${styles.stickyTop} ${styles.stickyColumn}`}
              >
                Pickup
              </th>
            )}

            {/* Delivery Column - Hide for inbound */}
            {shipmentType !== "inbound" && (
              <th
                className={`${styles.matHeaderCell} ${styles.matColumnDelivery} ${styles.stickyTop} ${styles.stickyColumn}`}
              >
                Delivery
              </th>
            )}

            {/* <th className={`${styles.matHeaderCell} ${styles.matColumnDateTime}`}>Date & Time</th> */}
            {/* <th
              className={`${styles.matHeaderCell} ${styles.matColumnCarrier}`}
            > */}
            <th
              className={`${styles.matHeaderCell} ${styles.matColumnCarrier} ${
                ["all", "others"].includes(shipmentType)
                  ? styles.leftAfterDelivery // Pickup(200) + Delivery(200) = 400
                  : styles.leftAfterPickup // Pickup only = 200
              }`}
            >
              Carrier
            </th>

            {shipmentType === "inbound" && (
              <th className={`${styles.matHeaderCell} ${styles.matColumnBookedBy}`}>Booked By</th>
            )}

            <th className={`${styles.matHeaderCell} ${styles.matColumnVehicleNumber}`}>Vehicle Number</th>
            <th className={`${styles.matHeaderCell} ${styles.matColumnTrack}`}>
              Track
            </th>
            <th className={`${styles.matHeaderCell} ${styles.matColumnDriver}`}>Driver</th>
            <th
              className={`${styles.matHeaderCell} ${styles.matColumnDestinationCode}`}
            >
              Destination Code
            </th>
            <th
              className={`${styles.matHeaderCell} ${styles.matColumnSpotDriver}`}
            >
              Spot Driver
            </th>
            <th
              className={`${styles.matHeaderCell} ${styles.matColumnDriverPhone}`}
            >
              Phone
            </th>
            <th className={`${styles.matHeaderCell} ${styles.matColumnEpod}`}>
              ePOD
            </th>
            <th className={`${styles.matHeaderCell} ${styles.matColumnConsent}`}>
  Consent / Subscribed
</th>
            <th className={`${styles.matHeaderCell} ${styles.matColumnSerialNo}`}>Serial No.</th>
            <th className={`${styles.matHeaderCell} ${styles.matColumnEpodReceived}`}>ePOD Received</th>
            <th className={`${styles.matHeaderCell} ${styles.matColumnPpd}`}>
  erp Reference
</th>
<th className={`${styles.matHeaderCell} ${styles.matColumnDoNumber}`}>
  OBD Number
</th>
            <th className={`${styles.matHeaderCell} ${styles.matColumnDelayed}`}>Delayed</th>
            <th className={`${styles.matHeaderCell} ${styles.matColumnSaleOrder}`}>Sale Order</th>
            <th className={`${styles.matHeaderCell} ${styles.matColumnEpodRequested}`}>ePOD Requested</th>
            <th className={`${styles.matHeaderCell} ${styles.matColumnCommercialInvoiceExist}`}>Commercial Invoice Exist</th>
            <th
              className={`${styles.matHeaderCell} ${styles.matColumnLastLocation}`}
            >
              Last Known Location
            </th>
            <th className={styles.matHeaderCell}>Freight (₹)</th>
            <th
              className={`${styles.matHeaderCell} ${styles.matColumnActions} ${styles.stickyRight}`}
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {showLoader ? (
            <tr>
              <td colSpan={20} className={styles.matCell}>
                Loading...
              </td>
            </tr>
          ) : shipmentsArray.length === 0 ? (
            <tr>
              <td
                colSpan={20}
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
                  {shipment.sin}
                </td>

                {/* Pickup Cell - Hide for outbound */}
                {shipmentType !== "outbound" && (
                  <td
                    className={`${styles.matCell} ${styles.matColumnPickup} ${styles.stickyColumn}`}
                  >
                    {renderLocationCell(
                      shipment,
                      copyDestinationCode,
                      (type: string, locs: any) =>
                        openLocationsPopup(type, locs, shipment),
                      shipmentType,
                      "pickup"
                    )}
                  </td>
                )}

                {/* Delivery Cell - Hide for inbound */}
                {shipmentType !== "inbound" && (
                  <td
                    className={`${styles.matCell} ${styles.matColumnDelivery} ${styles.stickyColumn}`}
                  >
                    {renderLocationCell(
                      shipment,
                      copyDestinationCode,
                      (type: string, locs: any) =>
                        openLocationsPopup(type, locs, shipment),
                      shipmentType,
             
                      "delivery"
                    )}
                  </td>
                )}

                {/* <td className={`${styles.matCell} ${styles.matColumnDateTime}`}>
                  {renderDateTimeCell(shipment, shipmentType)}
                </td> */}
                {/* <td className={`${styles.matCell} ${styles.matColumnCarrier}`}> */}
                <td
                  className={`${styles.matCell} ${styles.matColumnCarrier} ${
                    styles.stickyColumn
                  } ${
                    ["all", "others"].includes(shipmentType)
                      ? styles.leftAfterDelivery
                      : styles.leftAfterPickup
                  }`}
                >
                  {toTitleCase(shipment.carrier_parent_name)}
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

                    {shipment.trip_tracker && shipment.trip_tracker.methods && (
                      <span className={styles.trackingIconsWrapper}>
                        {shipment.trip_tracker.methods.map((trip: string, idx: number) => {
                          if (trip === "SIM") {
                            return (
                              <span
                                key={`sim-${idx}`}
                                className={styles.sim_tracking}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadLocHistory("SIM", shipment._id);
                                }}
                                title="Sim Tracker"
                                style={{ cursor: "pointer", marginLeft: 4 }}
                              >
                                <Image src={simTrackingIcon} alt="Sim Tracker" width={18} height={18} />
                              </span>
                            );
                          }
                          if (trip === "APP") {
                            return (
                              <span
                                key={`app-${idx}`}
                                className={styles.sim_tracking}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadLocHistory("APP", shipment._id);
                                }}
                                title="Mobile Tracker"
                                style={{ cursor: "pointer", marginLeft: 4 }}
                              >
                                <Image src={mobileIcon} alt="Mobile Tracker" width={18} height={18} />
                              </span>
                            );
                          }
                          if (trip === "GPS") {
                            return (
                              <span
                                key={`gps-${idx}`}
                                className={styles.sim_tracking}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadLocHistory("GPS", shipment._id);
                                }}
                                title="GPS Tracker"
                                style={{ cursor: "pointer", marginLeft: 4 }}
                              >
                                <Image src={gpsTrackingIcon} alt="GPS Tracker" width={18} height={18} />
                              </span>
                            );
                          }
                          return null;
                        })}
                      </span>
                    )}
                </td>

                <td className={styles.matCell}>
                  <div>{toTitleCase(shipment.driverName || "")}</div>
                </td>

                <td className={`${styles.matCell} ${styles.matColumnDestinationCode}`}>
                  {shipment.destination_code || "-"}
                </td>

                <td
                  className={`${styles.matCell} ${styles.matColumnSpotDriver}`}
                >
                  {shipment.isSpotDriver ? (
                    <img
                      src={spotdrivericon.src}
                      alt="Spot Driver"
                      title="Spot Driver"
                      style={{ height: "20px", width: "20px" }}
                    />
                  ) : (
                    <span className={styles.flagImgR}>✗</span>
                  )}
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
  {renderConsentAndSubscriptionIcons(shipment, openSubscribeModal)}
</td>

                <td className={styles.matCell}>
                  {shipment.serial_number
                    ? `${shipment.is_unplanned ? "US" : "SS"} - ${shipment.serial_number}`
                    : "-"}
                </td>
                <td className={styles.matCell}>
                  {shipment.whatsApp?.isEpodReceived ? "Yes" : "No"}
                </td>
                <td className={styles.matCell}>
  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
    {shipment.ppd_updated ? (
      <span title="PPD Updated">
        <CheckCircle size={16} color="#22c55e" />
      </span>
    ) : (
      <span title="PPD Not Updated" style={{ color: "#9ca3af", fontSize: 16, lineHeight: 1 }}>–</span>
    )}
    <span>{shipment.ppd ? shipment.ppd : <span title="No PPD Available" style={{ color: "#9ca3af", fontSize: 16, lineHeight: 1 }}>–</span>}</span>
  </span>
</td>
<td className={styles.matCell}>
  {shipment.do_number || "-"}
</td>
                <td className={styles.matCell}>
                  {shipment.delayed_shipment ? (
                    <span style={{ color: "#e03e3e" }}>Yes</span>
                  ) : (
                    "No"
                  )}
                </td>
                <td className={styles.matCell}>
                  {shipment.sale_order
                    ? (() => {
                        const orders = shipment.sale_order.split(",");
                        return (
                          <span style={{ display: "flex", alignItems: "center",justifyContent: "center", gap: 8 }}>
                            <span>{orders[0]}</span>
                            {orders.length > 1 && (
                              <span
                                className={styles.buble_round}
                                onClick={() => handleBubbleClick(orders.slice(1))}
                                style={{
                                  background: "#EDE7F6",
                                  borderRadius: "50%",
                                  padding: "0px 3px",
                                  fontSize: "12px",
                                  width: "22px",
                                  height: "22px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  color: "#5e35b1"
                                }}
                              >
                                +{orders.length - 1}
                              </span>
                            )}
                          </span>
                        );
                      })()
                    : "-"}
                </td>
                <td className={styles.matCell}>
                  {shipment.whatsApp?.isEpodRequested ? "Yes" : "No"}
                </td>
                <td className={styles.matCell}>
                  {shipment.commercial_invoice_exist ? "Yes" : "No"}
                </td>

                <td
                  className={`${styles.matCell} ${styles.matColumnLastLocation}`}
                >
                  {renderLastLocationCell(shipment)}
                </td>
                <td className={`${styles.matCell} ${styles.matColumnFreightPrice}`}>
                  {shipment.frieght_price
                    ? formatCurrency(shipment.frieght_price)
                    : "-"}
                </td>

                <td
                  className={`${styles.cellActions} ${styles.matColumnActions} ${styles.stickyRight}`}
                >
                  <div className={styles.quickActions}>
                    <DropdownMenu
                      open={actionMenuOpenId === shipment._id}
                      onOpenChange={(open) => {
                        setActionMenuOpenId(open ? shipment._id : null);
                      }}
                    >
                      <DropdownMenuTrigger asChild>
                        <button
                          className={styles.actionsMenuButton}
                          title="More actions"
                          onClick={() => setActionMenuOpenId(shipment._id)}
                        >
                          <MoreHorizontal className={styles.actionIcon} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className={styles.actionMenuDropdown}
                        onInteractOutside={() => {
                          setActionSearchState("");
                        }}
                        sideOffset={15}
                      >
                        <div className={styles.actionMenuSearch}>
                          <div className={styles.actionSearchContainer}>
                            <Search className={styles.TableSearchIcon} />
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
                          <div className={styles.shipmentInfo}>
                            <div className={styles.shipmentSin}>#{shipment.sin}</div>
                          </div>
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
                                          onSelect={(e) => {
                                            e.preventDefault();
                                            console.log("DropdownMenuItem onSelect triggered for:", item.label);
                                            closeActionMenu();
                                            console.log("closeActionMenu called from DropdownMenuItem");
                                            if (item.onClick) {
                                              item.onClick(shipment);
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
      {showOrdersPopup && (
        <OrdersPopup 
          orders={selectedOrders} 
          onClose={closeOrdersPopup} 
        />
      )}
    </div>
  );
};

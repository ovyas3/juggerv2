import React, { useMemo } from "react";
import { Grid, Box, Typography, Link, Tooltip } from "@mui/material";
import Image from "next/image";

// --- Helper to format duration ---
const formatDuration = (seconds?: number): string => {
  if (seconds === undefined || isNaN(seconds)) return "N/A";
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d > 0 ? `${d}days ` : ""}${h > 0 ? `${h}hours ` : ""}${m}minutes`;
};

// --- Helper to format distance ---
const formatDistance = (meters?: number): string => {
  if (meters === undefined || isNaN(meters)) return "N/A";
  return (meters / 1000).toFixed(2);
};

// --- Helper to format date and time ---
const formatDateTime = (dateString?: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    let formatted = new Intl.DateTimeFormat("en-GB", { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(date).replace(' at', ',');
    return formatted.replace(/ (am|pm)$/i, (match) => match.toUpperCase());
  } catch (e) {
    return "N/A";
  }
};

// --- Helper to get document icon ---
const getDocIcon = (link: string) => {
  const extension = link.split(".").pop()?.toLowerCase() || "";
  if (["png", "jpg", "jpeg", "gif"].includes(extension))
    return "/assets/image-icon.svg";
  if (extension === "pdf") return "/assets/PDF-icon.svg";
  if (["doc", "csv", "docx", "txt", "xlsx"].includes(extension))
    return "/assets/Doc-icon.svg";
  return "/assets/default-doc-icon.svg"; // A default icon
};

// Define types for the new data structure
interface FormattedOrder {
  sale_order: string;
  invoices: string[];
}

interface DeliveryOrder {
  deliveryId: string;
  orders: FormattedOrder[];
}

// --- Main Component ---
const ShipmentDetailsTab = ({
  shipmentData,
  showFreight,
  ownFleet,
  type,
  isMykl,
  isTata,
}: {
  shipmentData: any;
  showFreight: boolean;
  ownFleet: boolean;
  type: string;
  isMykl: boolean;
  isTata: boolean;
}) => {


  const { singleSaleOrder, deliveryOrders } = useMemo(() => {
    if (!shipmentData || !shipmentData.order) {
      return { 
        singleSaleOrder: null, 
        deliveryOrders: [] 
      };
    }
    const hasDeliveryOrders = shipmentData.order.delivery_locations?.some(
      (d: any) => d.orders?.length > 0
    );
    const result: {
      singleSaleOrder: string | null;
      deliveryOrders: DeliveryOrder[];
    } = {
      singleSaleOrder: null,
      deliveryOrders: [],
    };
    if (isTata) {
      if (hasDeliveryOrders) {
        const orderDeliveryMap = new Map<string, any[]>();
        shipmentData.order.delivery_locations.forEach((delLoc: any) => {
          const locId =
            delLoc.loc_id?._id?.toString() || delLoc.loc_id?.toString();
          if (delLoc.orders?.length > 0) {
            orderDeliveryMap.set(locId, delLoc.orders);
          }
        });

        shipmentData.deliveries.forEach((delivery: any) => {
          const deliveryLocationId = delivery.location?._id?.toString() || "";
          const ordersForDelivery =
            orderDeliveryMap.get(deliveryLocationId) || [];
          const formattedOrders: FormattedOrder[] = [];

          ordersForDelivery.forEach((order: any) => {
            const invoiceNumbers = (order.invoices || [])
              .map((inv: any) => inv.invoice_number)
              .filter(Boolean);
            if (order.sale_order_number?.includes("/")) {
              const parts = order.sale_order_number
                .split("/")
                .map((s: string) => s.trim());
              parts.forEach((part: string) => {
                formattedOrders.push({
                  sale_order: part,
                  invoices: invoiceNumbers,
                });
              });
            } else if (order.sale_order_number) {
              formattedOrders.push({
                sale_order: order.sale_order_number,
                invoices: invoiceNumbers,
              });
            }
          });
          result.deliveryOrders.push({
            deliveryId: delivery._id.toString(),
            orders: formattedOrders,
          });
        });
      } else if (shipmentData.sale_order) {
        result.singleSaleOrder = shipmentData.sale_order;
      }
    }
    return result;
  }, [isTata, shipmentData]); // Ensure shipmentData is the dependency

  if (!shipmentData) {
    return <Typography>Loading details...</Typography>;
  }

  const driver = shipmentData.driver || shipmentData.assigned_driver;
  const pickups = shipmentData.pickups || [];
  const deliveries = shipmentData.deliveries || [];
  const notAccepted = !shipmentData.driver && shipmentData.assigned_driver;
  const currencySymbol = shipmentData.currency_symbol || "₹";



  const getCircleStyles = (id: string): React.CSSProperties => {
    const baseStyle = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      fontWeight: "bold",
      marginRight: "12px",
      fontSize: "0.8rem",
    };
    if (id.startsWith("P"))
      return { ...baseStyle, backgroundColor: "#0b7d2e", color: "white" };
    if (id.startsWith("D"))
      return { ...baseStyle, backgroundColor: "#d8511f", color: "white" };
    return { ...baseStyle, backgroundColor: "#e0e0e0", color: "black" };
  };

  const DetailRow = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        mb: 1.5,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          width: "130px",
          flexShrink: 0,
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: "bold",
        }}
      >
        {value}
      </Typography>
    </Box>
  );

  return (
    <>
      <Grid container sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Typography variant="body2" sx={{ color: "#09337e" }}>
            Client: <strong>{shipmentData.organization?.name || "N/A"}</strong>
          </Typography>
        </Grid>
        <Grid item xs={6} sx={{ textAlign: "right" }}>
          <Typography variant="body2" sx={{ color: "#09337e" }}>
            {isMykl && (
              <>
                Sale Order Id:{" "}
                <strong>{shipmentData.sale_order || "N/A"}</strong>
                <span style={{ margin: "0 8px" }}>|</span>
              </>
            )}
            Order ID: <strong>{shipmentData.order?.OIN || "N/A"}</strong>
          </Typography>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Top-Left: Pickups */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              border: "1px solid #e0e0e0",
              p: 2,
              borderRadius: 1,
              height: "220px",
              overflowY: "auto",
            }}
          >
            {pickups.map((p: any, index: number) => (
              <Box key={p._id || index} sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                >
                  <Box component="span" sx={getCircleStyles(`P${index + 1}`)}>
                    P{index + 1}
                  </Box>
                  <strong>{p.location?.name || "N/A"}</strong>
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ pl: "36px", mb: 0.5, color: "text.secondary" }}
                >
                  {p.location?.area || "N/A"}
                </Typography>
                <Typography variant="body2" display="block" sx={{ pl: "36px" }}>
                  Scheduled Pickup Date & Time: <strong>{formatDateTime(p.scheduled_at)}</strong>
                </Typography>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Top-Right: Deliveries */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              border: "1px solid #e0e0e0",
              p: 2,
              borderRadius: 1,
              height: "220px",
              overflowY: "auto",
            }}
          >
            {deliveries.map((d: any, index: number) => (
              <Box key={d._id || index} sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                >
                  <Box component="span" sx={getCircleStyles(`D${index + 1}`)}>
                    D{index + 1}
                  </Box>
                  <strong>{d.location?.name || "N/A"}</strong>
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ pl: "36px", mb: 0.5, color: "text.secondary" }}
                >
                  {d.location?.area || "N/A"}
                </Typography>
                <Typography variant="body2" display="block" sx={{ pl: "36px" }}>
                  Delivery Date & Time:{" "}
                  <strong>{formatDateTime(d.scheduled_at)}</strong>
                </Typography>

                {/* New logic for Tata Sale Order / Invoices */}
                {isTata && (
                  <Box sx={{ pl: "36px", mt: 1 }}>
                    {singleSaleOrder && (
                      <Typography variant="body2">
                        Sale Order: <strong>{singleSaleOrder}</strong>
                      </Typography>
                    )}
                    {!singleSaleOrder &&
                      deliveryOrders
                        .find((o) => o.deliveryId === d._id)
                        ?.orders.map((order, orderIndex) => (
                          <Typography variant="body2" key={orderIndex}>
                            Sale Order / Invoice:{" "}
                            <strong>
                              {order.sale_order || "N/A"}
                              {order.invoices?.length > 0 &&
                                ` / ${order.invoices.join(", ")}`}
                            </strong>
                          </Typography>
                        ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Bottom-Left: Driver/Vehicle */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              height: "210px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ p: 1, backgroundColor: "#e2e2e2", textAlign: "center" }}
            >
              Driver, Vehicle & Other Details
            </Typography>
            <Grid container sx={{ flexGrow: 1, p: 2, overflowY: "auto" }}>
              <Grid
                item
                xs={6}
                sx={{ borderRight: "1px solid #e0e0e0", pr: 2 }}
              >
                <DetailRow
                  label="Driver"
                  value={
                    <>
                      {driver?.name || "N/A"}{" "}
                      {notAccepted && (
                        <Typography
                          component="sup"
                          variant="caption"
                          sx={{ color: "red", fontWeight: "bold" }}
                        >
                          {" "}
                          Not accepted
                        </Typography>
                      )}
                    </>
                  }
                />
                <DetailRow label="Mobile" value={driver?.mobile || "N/A"} />
                <DetailRow
                  label="Vehicle Type"
                  value={driver?.vehicle_type?.name || "N/A"}
                />
                <DetailRow
                  label="Vehicle No"
                  value={driver?.vehicle_no || "N/A"}
                />
              </Grid>
              <Grid item xs={6} sx={{ pl: 2, overflowY: "auto" }}>
              <DetailRow
                  label="Project Code"
                  value={
                    shipmentData.project_codes?.length > 0
                      ? shipmentData.project_codes
                          .map((pc: any) => pc.name)
                          .join(", ")
                      : "N/A"
                  }
                />
                {!isTata && (
                  <DetailRow
                    label="Sale Order"
                    value={shipmentData.sale_order || "N/A"}
                  />
                )}
                <DetailRow
                  label="Purchase Order"
                  value={
                    shipmentData.purchase_orders?.length > 0
                      ? shipmentData.purchase_orders
                          .map((po: any) => po.name)
                          .join(", ")
                      : "N/A"
                  }
                />
                <DetailRow
                  label="Segmentation"
                  value={
                    shipmentData.segmentations?.length > 0
                      ? shipmentData.segmentations
                          .map((s: any) => s.name)
                          .join(", ")
                      : "N/A"
                  }
                />
                
                <DetailRow label="PPD Number" value={shipmentData.ppd || "N/A"} />
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Bottom-Right: Estimated/Actual */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              height: "210px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ p: 1, backgroundColor: "#e2e2e2", textAlign: "center" }}
            >
              Estimated / Actual
            </Typography>
            <Box sx={{ p: 2, flexGrow: 1, overflowY: "auto" }}>
              <DetailRow
                label="Distance"
                value={`${formatDistance(
                  shipmentData.estimated?.distance
                )} kms | ${formatDistance(
                  shipmentData.trip_tracker?.travelled_distance
                )} kms`}
              />
              <DetailRow
                label="Duration"
                value={`${formatDuration(
                  shipmentData.estimated?.duration
                )} | ${formatDuration(
                  shipmentData.trip_tracker?.travelled_duration
                )}`}
              />

              {!ownFleet && showFreight && (
                <DetailRow
                  label="Carrier Invoice"
                  value={`${currencySymbol}${
                    shipmentData.estimated?.price || "N/A"
                  } | ${currencySymbol}${shipmentData.actual?.price || "N/A"}${
                    shipmentData.rate &&
                    (typeof shipmentData.weight_unit === "string" ||
                      shipmentData.weight_unit?.name)
                      ? ` (Price per ${
                          shipmentData.weight_unit?.name ||
                          shipmentData.weight_unit
                        }: ${currencySymbol}${shipmentData.rate})`
                      : "" // Fallback to empty string if no valid unit
                  }`}
                />
              )}
              {type === "4pl" && showFreight && (
                <DetailRow
                  label="Client Freight"
                  value={`${currencySymbol}${
                    shipmentData.estimated?.client_price || "N/A"
                  } | ${currencySymbol}${
                    shipmentData.actual?.client_price || "N/A"
                  }${
                    shipmentData.client_rate &&
                    (typeof shipmentData.client_weight_unit === "string" ||
                      shipmentData.client_weight_unit?.name)
                      ? ` (Price per ${
                          shipmentData.client_weight_unit?.name ||
                          shipmentData.client_weight_unit
                        }: ${currencySymbol}${shipmentData.client_rate})`
                      : "" // Fallback to empty string if no valid unit
                  }`}
                />
              )}

              <DetailRow
                label="Vehicle Utilization"
                value={`100% | ${shipmentData.vehicleUtilization || "N/A"}`}
              />

              <DetailRow
                label="Documents"
                value={
                  shipmentData.docs?.length > 0 ? (
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {shipmentData.docs.map((doc: any, index: number) => (
                        <Tooltip
                          title={`Download ${doc.link.split("/").pop()}`}
                          key={index}
                        >
                          <Link
                            href={doc.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Image
                              src={getDocIcon(doc.link)}
                              alt={doc.extension || "document"}
                              width={24}
                              height={24}
                            />
                          </Link>
                        </Tooltip>
                      ))}
                    </Box>
                  ) : ("No documents found")
                }
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default ShipmentDetailsTab;

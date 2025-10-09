import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import styles from "./MaterialsTab.module.css";

// TypeScript interfaces for the processed data structure
interface Material {
  description: string;
  quantity: number;
  uom: string;
}

interface CustomerMaterialGroup {
  customer_order_number: string;
  customer_name: string;
  materials: Material[];
}

interface CustomerDeliveryData {
  delivery: number; // Sequence number
  name: string; // Location name
  customer_materials: CustomerMaterialGroup[];
}

// Simplified interface for Commercial Invoices (for RSPL view)
interface CommercialInvoice {
  num: string;
  invoice_products?: Array<{ material_SKU: string }>;
  others?: {
    sold_to_code?: string;
    sold_to_contact_name?: string;
    sold_to_district_name?: string;
  };
}

interface MaterialsTabProps {
  customerData: CustomerDeliveryData[];
  isRSPL: boolean;
  rsplTotalWeight: number;
  uom: string;
  commercialInvoices: CommercialInvoice[];
}

const MaterialsTab: React.FC<MaterialsTabProps> = ({
  customerData,
  isRSPL,
  rsplTotalWeight,
  uom,
  commercialInvoices,
}) => {
  if (isRSPL) {
    // --- RSPL-SPECIFIC VIEW ---
    return (
      <Box className={styles.bodySection}>
        <Box className={`${styles.toggleViewMain} ${styles.materials}`}>
          <Typography className={styles.materialTitle}>
            Product Description
          </Typography>
          <Box className={styles.materialBody}>
            <Typography
              variant="subtitle1"
              component="span"
              className={styles.rsplTotalWeight}
            >
              Total Weight - {rsplTotalWeight} {uom}
            </Typography>

            <Box className={styles.delivery} sx={{ mt: 2 }}>
              {commercialInvoices.length > 0 ? (
                commercialInvoices.map((invoice, i) => (
                  <Box key={i} className={styles.customerData}>
                    <Typography className={styles.customerId}>
                      {i + 1}) Reference Number: {invoice.num}
                    </Typography>
                    <Box className={styles.showMaterials}>
                      {invoice.others && (
                        <Typography
                          variant="subtitle2"
                          className={styles.customerTitle}
                        >
                          Customer - {invoice.others.sold_to_code || "N/A"} -{" "}
                          {invoice.others.sold_to_contact_name || "N/A"} -{" "}
                          {invoice.others.sold_to_district_name || "N/A"}
                        </Typography>
                      )}
                      {invoice.invoice_products &&
                        invoice.invoice_products.map((material, j) => (
                          <Typography key={j} className={styles.materialItem}>
                            Material - {material.material_SKU}
                          </Typography>
                        ))}
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography sx={{ mt: 2 }}>
                  No Commercial Invoices found.
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // --- GENERAL VIEW (Non-RSPL) ---
  if (customerData.length === 0) {
    return (
      <Typography sx={{ p: 2 }}>
        No material data available for this shipment.
      </Typography>
    );
  }
  
  // Define columns for the general view table
  const generalColumns = [
    { label: "S.No.", width: "5%" },
    { label: "Item Name", width: "45%" },
    { label: "Total Quantity", width: "30%" },
    { label: "UOM", width: "20%" },
  ];

  return (
    <Box className={styles.bodySection}>
      <Box className={`${styles.toggleViewMain} ${styles.materials}`}>
        <Typography className={styles.materialTitle} sx={{ fontWeight: "600" }}>
          Product Description
        </Typography>
        <Box className={styles.materialBody}>
          {customerData.map((delivery, i) => (
            <Box key={i} className={styles.delivery}>
              <Typography className={styles.deliveryTitle}>
                <span className={styles.dropIcon}>D{delivery.delivery}</span>
                <strong>{delivery.name}</strong>
              </Typography>

              {delivery.customer_materials.map((cust, j) => (
                <Box key={j} className={styles.customerData}>
                  <Typography className={styles.customerId} sx={{ mt: 2 }}>
                    Reference Number:
                    <strong>
                      {cust.customer_order_number}
                      {cust.customer_name ? ` - ${cust.customer_name}` : ""}
                    </strong>
                  </Typography>

                  <TableContainer
                    component={Box}
                    className={styles.materialsTableContainer}
                  >
                    <Table size="small" className={styles.materialsTable}>
                      <TableHead>
                        <TableRow className={styles.tableHeaderRow}>
                          {generalColumns.map((col, index) => (
                            <TableCell 
                              key={index} 
                              className={styles.tableCell} 
                              sx={{ width: col.width }}
                            >
                              {col.label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cust.materials.map((material, k) => (
                          <TableRow key={k} className={styles.tableBodyRow}>
                            {/* S.No. Cell */}
                            <TableCell
                              className={styles.tableCell}
                              sx={{ width: generalColumns[0].width, textAlign: 'center' }}

                            >
                              {k + 1}
                            </TableCell>
                            {/* Item Name Cell */}
                            <TableCell
                              className={styles.tableCell}
                              sx={{ width: generalColumns[1].width, textAlign: 'center' }}
                            >
                              {material.description}
                            </TableCell>
                            {/* Total Quantity Cell */}
                            <TableCell
                              className={styles.tableCell}
                              sx={{ width: generalColumns[2].width, textAlign: 'center' }}
                            >
                              {material.quantity}
                            </TableCell>
                            {/* UOM Cell */}
                            <TableCell
                              className={styles.tableCell}
                              sx={{ width: generalColumns[3].width, textAlign: 'center' }}
                            >
                              {material.uom}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default MaterialsTab;
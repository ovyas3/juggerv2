import React, { useMemo } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import styles from './BillToTab.module.css';

// Generic Shipment Data Interface
interface ShipmentData {
    deliveries?: Array<any>;
    pickups?: Array<any>;
    [key: string]: any;
}

interface BillToTabProps {
    shipmentData: ShipmentData | null;
}

// --- Data Transformation Hook (Replicating Angular Logic) ---
const useBillToData = (shipmentData: ShipmentData | null) => {
    return useMemo(() => {
        const deliveries = shipmentData?.deliveries || [];
        const pickups = shipmentData?.pickups || [];
        
        // 1. Create a flat list of all relevant invoice details (mimicking the core data source)
        const allInvoices: Array<any> = [];
        
        pickups.forEach(pickup => {
            (pickup.invoices || []).forEach((invoiceGroup: any) => {
                const deliveryId = invoiceGroup.delivery_id?._id;
                
                (invoiceGroup.commercial_invoices || []).forEach((inv: any) => {
                    const delivery = deliveries.find(d => d._id === deliveryId);
                    
                    if (delivery) {
                        const billTo = inv.others?.bill_to
                            ? `${inv.others.bill_to} - ${inv.others.bill_to_name || ''}`
                            : "N/A";
                        
                        const grossWeightKg = inv.gross_weight || 0;
                        const grossWeightMt = (grossWeightKg / 1000).toFixed(3);
                        
                        allInvoices.push({
                            invoiceNumber: inv.num || 'N/A',
                            grossWeight: grossWeightMt,
                            billTo: billTo,
                            deliverySequence: delivery.sequence,
                            deliveryLocationName: `${delivery.location?.reference ? delivery.location.reference + ' - ' : ''}${delivery.location?.name || 'Unknown Location'}`,
                        });
                    }
                });
            });
        });

        // 2. Group the flat list by Delivery Header (sequence + name)
        const groupedData = new Map<string, Array<any>>();
        
        allInvoices.forEach(item => {
            const key = `${item.deliverySequence}-${item.deliveryLocationName}`;
            if (!groupedData.has(key)) {
                groupedData.set(key, []);
            }
            groupedData.get(key)!.push(item);
        });

        // 3. Convert map to array structure for easy rendering
        return Array.from(groupedData.entries()).map(([key, data]) => ({
            deliverySequence: data[0].deliverySequence,
            deliveryHeader: data[0].deliveryLocationName,
            invoices: data,
        }));

    }, [shipmentData]);
};


const BillToTab: React.FC<BillToTabProps> = ({ shipmentData }) => {
    
    const groupedBillToData = useBillToData(shipmentData);

    if (groupedBillToData.length === 0) {
        return (
            <Box className={styles.bodySection}>
                <Typography sx={{ p: 2 }}>No Bill To information available.</Typography>
            </Box>
        );
    }
    
    // Column configuration including S.No.
    const columns = [
        { label: "S.No.", width: '8%' }, // New S.No. column
        { label: "Invoice Number", width: '30%' }, // Adjusted width
        { label: "Gross Weight (MT)", width: '28%' }, // Adjusted width
        { label: "Bill To", width: '34%' }, // Adjusted width
    ];

    return (
        <Box className={styles.bodySection}>
            {groupedBillToData.map((deliveryGroup, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                    {/* Delivery Header (D1 RDC-INDORE) */}
                    <Box className={styles.deliveryHeader}>
                        <span className={styles.dropIcon}>
                            D{deliveryGroup.deliverySequence}
                        </span>
                        <Typography variant="subtitle1" className={styles.deliveryName}>
                            {deliveryGroup.deliveryHeader}
                        </Typography>
                    </Box>

                    {/* Table for all invoices in this delivery group */}
                    <TableContainer component={Box} className={styles.tableContainer}>
                        <Table size="small" className={styles.billToTable}>
                            <TableHead>
                                <TableRow className={styles.tableHeaderRow}>
                                    {columns.map((col, index) => (
                                        <TableCell key={index} className={styles.tableCell} sx={{ width: col.width }}>
                                            {col.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* Each invoice for this delivery group gets its own row */}
                                {deliveryGroup.invoices.map((element, j) => (
                                    <TableRow key={j} className={styles.tableBodyRow}>
                                        <TableCell className={styles.tableCell}>{j + 1}</TableCell> {/* S.No. */}
                                        <TableCell className={styles.tableCell}>{element.invoiceNumber}</TableCell>
                                        <TableCell className={styles.tableCell}>{element.grossWeight}</TableCell>
                                        <TableCell className={styles.tableCell}>{element.billTo}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            ))}
        </Box>
    );
};

export default BillToTab;
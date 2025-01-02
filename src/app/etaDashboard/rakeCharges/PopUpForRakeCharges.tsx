"use client";
import "./RakeCharges.css";
import { useEffect, useState, useRef } from "react";
import React from "react";
import service from '@/utils/timeService';
import { httpsPost, httpsGet } from "@/utils/Communication";
import CloseIcon from "@mui/icons-material/Close";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";

interface Column {
  id: string;
  label: string;
  style: string;
}

const columns: readonly Column[] = [
  { id: "sno", label: "SI No", style: "header-sno-rake-charges" },
  { id: "edemand", label: "e-Demand", style: "header-edemand-rake-charges" },
  { id: "fnrs", label: "FNR No", style: "header-fnr-rake-charges" },
  {
    id: "rrs",
    label: "RR No",
    style: "header-rr-rake-charges",
  },
  {
    id: "consignee",
    label: "Consignee",
    style: "header-consignee-rake-charges",
  },
  { id: "from", label: "From", style: "header-from-rake-charges" },
  { id: "to", label: "To", style: "header-to-rake-charges" },

  { id: "material", label: "Material", style: "header-material-rake-charges" },
  {
    id: "actualWeight",
    label: "Actual Weight",
    style: "header-actual-weight-rake-charges",
  },
  {
    id: "chargeablWeight",
    label: "Chargeable Weight",
    style: "header-chargeable-weight-rake-charges",
  },

  { id: "rate", label: "Rate", style: "header-rate-rake-charges" },
  { id: "freight", label: "Freight", style: "header-freight-rake-charges" },
  {
    id: "invoiceNumber",
    label: "Invoice Number",
    style: "header-invoice-number-rake-charges",
  },

  {
    id: "invoiceDate",
    label: "Invoice Date",
    style: "header-invoice-date-rake-charges",
  },
  {
    id: "idealWeight",
    label: "Ideal Weight",
    style: "header-ideal-weight-rake-charges",
  },
  {
    id: "idealFreight",
    label: "Ideal Freight",
    style: "header-ideal-freight-rake-charges",
  },
  { id: "status", label: "Status", style: "header-status-rake-charges" },
];

function contructingData(shipment: any) {
  return shipment?.map(
    (shipment: {
      sno: any;
      edemand: any;
      fnrs: any;
      rrs: any;
      consignee: any;
      from: any;
      to: any;
      material: any;
      actualWeight: any;
      chargeablWeight: any;
      rate: any;
      freight: any;
      invoiceNumber: any;
      invoiceDate: any;
      idealWeight: any;
      idealFreight: any;
      status: any;
    }) => {
      return {
        sno: shipment?.sno ? shipment?.sno : "--",
        edemand: shipment?.edemand ? shipment?.edemand : "--",
        fnrs: shipment?.fnrs ? shipment?.fnrs : "--",
        rrs: shipment?.rrs ? shipment?.rrs : "--",
        consignee: shipment?.consignee ? shipment?.consignee : "--",
        from: shipment?.from ? shipment?.from : "--",
        to: shipment?.to ? shipment?.to : "--",
        material: shipment?.material ? shipment?.material : "--",
        actualWeight: shipment?.actualWeight === "N/A" ? "--" : shipment?.actualWeight?.toFixed(2),
        chargeablWeight: shipment?.chargeablWeight === "N/A" ? "--" : shipment?.chargeablWeight?.toFixed(2),
        rate: shipment?.rate ? shipment?.rate : "--",
        freight: shipment?.freight ? shipment?.freight : "--",
        invoiceNumber: shipment?.invoiceNumber ? shipment?.invoiceNumber : "--",
        invoiceDate: shipment?.invoiceDate === "Invalid DateTime" ? "--" : service.utcToist(shipment?.invoiceDate, "dd/MM/yyyy"),
        idealWeight: shipment?.idealWeight === "N/A" ? "--" : shipment?.idealWeight?.toFixed(2),
        idealFreight: shipment?.idealFreight === "N/A" ? "--" : shipment?.idealFreight?.toFixed(2),
        status: shipment?.status ? shipment?.status : "--",
      };
    }
  );
}

function PopUpForRakeCharges({
  setOpenPopup,
  payloadDataForPopup,
}: {
  setOpenPopup: React.Dispatch<React.SetStateAction<boolean>>;
  payloadDataForPopup: any;
}) {
  const [rakeChargesList, setRakeChargesList] = useState<any>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const getDetailsForPopup = async () => {
    try {
      const response = await httpsGet(
        `dashboard/rake_charges/dateWise?from=${payloadDataForPopup.from}&to=${payloadDataForPopup.to}`
      );
      if (response.statusCode === 200) {
        setRakeChargesList(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDetailsForPopup();
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={(e) => {
        e.stopPropagation();
        setOpenPopup(false);
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          boxShadow:
            "0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.08)",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "12px",
          position: "relative",
          marginInline: "60px",
          
        }}
      >
        <header
          style={{
            fontSize:'14px',
            display:'flex',
            justifyContent:'space-between',
            marginBottom:'12px'
          }}
        >
          <div>
            Rake Charges On <strong>{new Date(payloadDataForPopup.from).toDateString()}</strong>
          </div>
          <div>Total Freight (in Cr &#8377;): <strong>{payloadDataForPopup.amt}</strong></div>
        </header>

        <div>
          <div
            style={{
              width: "100%",
              height: "90%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Paper
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxShadow: "none",
              }}
            >
              {/* <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={viewContactsList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Contacts per page:"
          sx={{ position: "absolute", top: -40, zIndex: 100, right: -10 }}
        /> */}
              <TableContainer
                sx={{
                  overflow: "auto",
                  borderRadius: "4px",
                  border: "1px solid #E9E9EB",
                }}
              >
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          className={column.style}
                          style={{
                            textAlign: "center",
                            padding: "8px 10px 8px 10px",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#484A57",
                            whiteSpace: "nowrap",
                            paddingInline: 10,
                          }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contructingData(rakeChargesList)?.map(
                      (row: any, rowIndex: any) => {
                        return (
                          <TableRow
                            hover
                            role="checkbox"
                            tabIndex={-1}
                            key={rowIndex}
                          >
                            {columns.map((column) => {
                              const value = row[column.id];
                            //   console.log(value);
                              return (
                                <TableCell
                                  key={column.id}
                                  sx={{
                                    textAlign: "center",
                                    padding: "8px 10px 8px 10px",
                                    fontSize: 10,
                                  }}
                                >
                                  {typeof value !== "object" && value}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
        </div>

        <div></div>

        <div
          className="close-button-rake-charges"
          onClick={(e) => {
            e.stopPropagation();
            setOpenPopup(false);
          }}
        >
          <CloseIcon />
        </div>
      </div>
    </div>
  );
}

export default PopUpForRakeCharges;

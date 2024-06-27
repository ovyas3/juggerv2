"use client";

import React, { useRef, useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import CloseButtonIcon from "@/assets/close_icon.svg";
import Image from "next/image";
import "./RRModal.css";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box } from "@mui/material";
import { httpsGet } from "@/utils/Communication";
import service from "@/utils/timeService";
import { stat } from "fs";


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));


interface PopupProps {
  isOpen: boolean;
  isClose: () => void;
  rrNumbers: string[];
}

const RRModal: React.FC<PopupProps> = ({ isOpen, isClose, rrNumbers }) => {
  const [activeRR, setActiveRR] = useState<string | null>(null);
  const [rrDetails, setRRDetails] = useState<any>({});
  const [rrTableData, setRRTableData] = useState<any>([]);

  console.log(rrNumbers);

  const handleRRDetails = async (rrNumber: string, index: number) => {
    setActiveRR(index.toString());
    const response = await httpsGet(`get/rr_document?fnr=${rrNumber}`);
    console.log(response.data);
    const data = response.data;
    const rrDetail = {
      fnr: data && data.fnr ? data.fnr : 'N/A',
      rrDate: data && data.created_at ? service.utcToist(data.created_at, 'dd/MM/yyyy') : 'N/A',
      // stationFrom: data && data.shipment && data.shipment.pickup_location ? data.shipment.pickup_location : 'N/A',
      // stationTo: data && data.shipment && data.shipment.delivery_location ? data.shipment.delivery_location : 'N/A',
      stationFrom: data && data.from_station ? data.from_station : 'N/A',
      stationTo: data && data.to_station ? data.to_station : 'N/A',
      totalWagons: data && data.no_of_wagons ? data.no_of_wagons : 0,
      invoicedNo: data && data.invoice_number ?  data.invoice_number : 'N/A',
      invoicedDate: data && data.invoice_date ? service.utcToist(data.invoice_date, 'dd/MM/yyyy') : 'N/A',
      distance: data && data.distance ? data.distance : 'N/A',
      totalWeight: data && data.chargeable_weight ? data.chargeable_weight : 'N/A',
      totalFreight: data && data.total_freight ? data.total_freight.toLocaleString('en-IN') : 'N/A',
    };

    const tableData = data && data.wagon_details ? 
        data.wagon_details.map((wagon: any) => {
          return {
            owningRly: wagon.owningRailway ? wagon.owningRailway : 'N/A',
            type: wagon.type ? wagon.type : 'N/A',
            wagonNo: wagon.wagonNumber ? wagon.wagonNumber : 'N/A',
            cc: wagon.CCWeight ? wagon.CCWeight : 'N/A',
            tare: wagon.tareWeight ? wagon.tareWeight : 'N/A',
            noOfArticles: wagon.no_of_articles ? wagon.no_of_articles : 'N/A',
            grossWeight: wagon.grossWeight ? wagon.grossWeight : 'N/A',
            actualWt: wagon.actualWeight ? wagon.actualWeight : 'N/A',
          };
        } )
        : [];

    setRRDetails(rrDetail);
    setRRTableData(tableData);
    console.log(rrDetail);
    console.log(tableData);
  };

  useEffect(() => { 
    if (isOpen && rrNumbers.length > 0) {
      handleRRDetails(rrNumbers[0], 0);
    }
  }, [isOpen, rrNumbers]);

  return (
    <React.Fragment>
       <BootstrapDialog
        onClose={isClose}
        className='rrmodal-styles'
        aria-labelledby="customized-dialog-title"
        open={isOpen}
      > 
      <Box sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="rrmodal-container">
          <div aria-label="close" className="rrmodal-close" onClick={isClose}>
            <Image src={CloseButtonIcon} alt="Close Button" />
          </div>
          <div className="rrmodal-header">
            <h4 className="rrmodal-heading">Railway Receipt</h4>
          </div>
          <div className="rrmodal-body">
            <div className="rrmodal-sidebar">
              <div className="rrmodal-sidebar-content">
                <h4 className="rrmodal-sidebar-heading">RR No.</h4>
                  <div className="rrmodal-sidebar-details-item">
                    {rrNumbers.map((rrNumber:string, index: number) => {
                      return (
                        <p 
                        key={index}
                        className={activeRR === index.toString() ? 'rrmodal-sidebar-details-item-value-active' : 'rrmodal-sidebar-details-item-value'}
                        onClick={() => handleRRDetails(rrNumber, index)}
                        >
                          { rrNumber }
                      </p>
                      );   
                    })}
                  </div>
              </div>
            </div>
            <div className="rrmodal-content">
              <div className="rrmodal-content-upper">
               {rrDetails && <>
                <div className="rrmodal-content-upper-body">
                <div className="rrmodal-content-upper-item">
                   <h4 className="rrmodal-content-upper-item-heading">FNR</h4>
                   <p className="rrmodal-content-upper-item-value">{ rrDetails.fnr }</p>
                </div>
                <div className="rrmodal-content-upper-item">
                  <h4 className="rrmodal-content-upper-item-heading">RR Date</h4>
                  <p className="rrmodal-content-upper-item-value">{ rrDetails.rrDate }</p>
                </div>
                <div className="rrmodal-content-upper-item">
                  <h4 className="rrmodal-content-upper-item-heading">Station From</h4>
                  <p className="rrmodal-content-upper-item-value">{ rrDetails.stationFrom }</p>
                </div>
                <div className="rrmodal-content-upper-item">
                  <h4 className="rrmodal-content-upper-item-heading">Station To</h4>
                  <p className="rrmodal-content-upper-item-value">{ rrDetails.stationTo }</p>
                </div>
                <div className="rrmodal-content-upper-item">
                  <h4 className="rrmodal-content-upper-item-heading">Total Wagons</h4>
                  <p className="rrmodal-content-upper-item-value">{ rrDetails.totalWagons }</p>
                </div>
               </div>
              <div className="rrmodal-content-lower-body">
                <div className="rrmodal-content-upper-item">
                  <h4 className="rrmodal-content-upper-item-heading">Invoiced No.</h4>
                  <p className="rrmodal-content-upper-item-value">{ rrDetails.invoicedNo }</p>
                </div>
                <div className="rrmodal-content-upper-item">
                  <h4 className="rrmodal-content-upper-item-heading">Invoiced Date</h4>
                  <p className="rrmodal-content-upper-item-value">{ rrDetails.invoicedDate }</p>
                </div>
                <div className="rrmodal-content-upper-item">
                  <h4 className="rrmodal-content-upper-item-heading">Distance (km)</h4>
                  <p className="rrmodal-content-upper-item-value">{ rrDetails.distance }</p>
                </div>
                <div className="rrmodal-content-upper-item">
                  <h4 className="rrmodal-content-upper-item-heading">Total Weight (T)</h4>
                  <p className="rrmodal-content-upper-item-value">{ rrDetails.totalWeight }</p>
                </div>
                <div className="rrmodal-content-upper-item">
                  <h4 className="rrmodal-content-upper-item-heading">Total Freight (₹)</h4>
                  <p className="rrmodal-content-upper-item-value">{ rrDetails.totalFreight }</p>
                </div>
              </div>
            </>}
              </div>
              <div className="rrmodal-content-lower">
                <TableContainer component={Paper}>
                  <Table aria-label="simple table" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell align="left" className="rrmodal-table-headers">S.No</TableCell>
                        <TableCell align="left" className="rrmodal-table-headers">Owning Rly</TableCell>
                        <TableCell align="left" className="rrmodal-table-headers">Type</TableCell>
                        <TableCell align="left" className="rrmodal-table-headers">Wagon No.</TableCell>
                        <TableCell align="left" className="rrmodal-table-headers">CC (T)</TableCell>
                        <TableCell align="left" className="rrmodal-table-headers">Tare (T)</TableCell>
                        <TableCell align="left" className="rrmodal-table-headers">No. Of Articles</TableCell>
                        <TableCell align="left" className="rrmodal-table-headers">Gross Weight (T)</TableCell>
                        <TableCell align="left" className="rrmodal-table-headers">Actual Wt (T)</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {rrTableData.map((row: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell align="left" className="rrmodal-table-body-items">{index + 1}</TableCell>
                          <TableCell align="left" className="rrmodal-table-body-items">{row.owningRly}</TableCell>
                          <TableCell align="left" className="rrmodal-table-body-items">{row.type}</TableCell>
                          <TableCell align="left" className="rrmodal-table-body-items">{row.wagonNo}</TableCell>
                          <TableCell align="left" className="rrmodal-table-body-items">{row.cc}</TableCell>
                          <TableCell align="left" className="rrmodal-table-body-items">{row.tare}</TableCell>
                          <TableCell align="left" className="rrmodal-table-body-items">{row.noOfArticles}</TableCell>
                          <TableCell align="left" className="rrmodal-table-body-items">{row.grossWeight}</TableCell>
                          <TableCell align="left" className="rrmodal-table-body-items">{row.actualWt}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          </div>
        </div>
      </Box>
      </BootstrapDialog>
    </React.Fragment>
  );
};

export default RRModal;

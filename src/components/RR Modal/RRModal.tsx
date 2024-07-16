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
  isRRDoc: boolean;
}

const RRModal: React.FC<PopupProps> = ({ isOpen, isClose, rrNumbers, isRRDoc }) => {
  const [activeRR, setActiveRR] = useState<string | null>(null);
  const [rrDetails, setRRDetails] = useState<any>({});
  const [rrTableData, setRRTableData] = useState<any>([]);

  const handleRRDetails = async (rrNumber: string, index: number) => {
    setActiveRR(index.toString());
    try{
      const response = await httpsGet(`get/rr_document?fnr=${rrNumber}`);
      const data = response.data;
      const rrDetail = {
        rrNo: data && data.rr_no
        ? data.rr_no
        : 'N/A',
        rrDate: data && data.created_at ? service.utcToist(data.created_at, 'dd/MM/yyyy') : 'N/A',
        stationFrom: data && data.shipment && data.shipment.pickup_location && data.shipment.pickup_location.code ? data.shipment.pickup_location.code : 'N/A',
        stationTo: data && data.shipment && data.shipment.delivery_location && data.shipment.delivery_location.code ? data.shipment.delivery_location.code : 'N/A',
        totalWagons: data && data.no_of_wagons ? data.no_of_wagons : 'N/A',
        invoicedNo: data && data.invoice_number ?  data.invoice_number : 'N/A',
        invoicedDate: data && data.invoice_date ? service.utcToist(data.invoice_date, 'dd/MM/yyyy') : 'N/A',
        distance: data && data.distance ? data.distance : 'N/A',
        actualWeight: data && data.actual_weight ? data.actual_weight : 'N/A',
        chargeableWeight: data && data.chargeable_weight ? data.chargeable_weight : 'N/A',
        totalFreight: data && data.total_freight ? data.total_freight.toLocaleString('en-IN') : 'N/A',
        senderWeight: data && data.sender_weight ? data.sender_weight : 'N/A',
        consigneeName: data && data.consignee && data.consignee.name ? data.consignee.name : 'N/A',
        consigneeAddress: data && data.consignee && data.consignee.address ? data.consignee.address : 'N/A',
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

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => { 
    if (isOpen && rrNumbers.length > 0) {
      handleRRDetails(rrNumbers[0], 0);
    }
  }, [isOpen, rrNumbers]);

  return (
    <>
      {isRRDoc ?
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
                  <h4 className="rrmodal-sidebar-heading">FNR No.</h4>
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
                <div className="rrmodal-content-left-body">
                  <div className="rrmodal-content-upper-item">
                     <h4 className="rrmodal-content-upper-item-heading">Consignee Name</h4>
                     <p className="rrmodal-content-upper-item-value">{ rrDetails.consigneeName }</p>
                  </div>
                  <div className="rrmodal-content-upper-item">
                     <h4 className="rrmodal-content-upper-item-heading">Consignee Address</h4>
                     <p className="rrmodal-content-upper-item-value">{ rrDetails.consigneeAddress }</p>
                  </div>
                  <div className="rrmodal-content-upper-item">
                     <h4 className="rrmodal-content-upper-item-heading">Sender Weight (MT)</h4>
                     <p className="rrmodal-content-upper-item-value">{ rrDetails.senderWeight }</p>
                  </div>
                  <div className="rrmodal-content-upper-item">
                     <h4 className="rrmodal-content-upper-item-heading">Actual Weight (MT)</h4>
                     <p className="rrmodal-content-upper-item-value">{ rrDetails.actualWeight }</p>
                  </div>
                  <div className="rrmodal-content-upper-item">
                     <h4 className="rrmodal-content-upper-item-heading">Chargable Weight (MT)</h4>
                     <p className="rrmodal-content-upper-item-value">{ rrDetails.chargeableWeight }</p>
                  </div>
                </div>

                <div className="rrmodal-content-right-body">
                  <div className="rrmodal-content-upper-item">
                     <h4 className="rrmodal-content-upper-item-heading">RR No.</h4>
                     <p className="rrmodal-content-upper-item-value">{ rrDetails.rrNo }</p>
                  </div>
                  <div className="rrmodal-content-upper-item">
                    <h4 className="rrmodal-content-upper-item-heading">RR Date</h4>
                    <p className="rrmodal-content-upper-item-value">{ rrDetails.rrDate }</p>
                  </div>
                  <div className="rrmodal-content-upper-item">
                    <h4 className="rrmodal-content-upper-item-heading">Total Wagons</h4>
                    <p className="rrmodal-content-upper-item-value">{ rrDetails.totalWagons }</p>
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
                    <h4 className="rrmodal-content-upper-item-heading">Total Distance (km)</h4>
                    <p className="rrmodal-content-upper-item-value">{ rrDetails.distance }</p>
                  </div>
                  <div className="rrmodal-content-upper-item">
                    <h4 className="rrmodal-content-upper-item-heading">Invoice No.</h4>
                    <p className="rrmodal-content-upper-item-value">{ rrDetails.invoicedNo }</p>
                  </div>
                  <div className="rrmodal-content-upper-item">
                    <h4 className="rrmodal-content-upper-item-heading">Invoiced Date</h4>
                    <p className="rrmodal-content-upper-item-value">{ rrDetails.invoicedDate }</p>
                  </div>            
                  <div className="rrmodal-content-upper-item">
                    <h4 className="rrmodal-content-upper-item-heading">Total Freight (₹)</h4>
                    <p className="rrmodal-content-upper-item-value">{ rrDetails.totalFreight }</p>
                  </div>
                </div>
              </>}
                </div>
                <div className="rrmodal-content-lower">
                  <TableContainer component={Paper} className="table-rrmodal">
                    <Table aria-label="table" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell align="left" className="rrmodal-table-headers">S.No</TableCell>
                          <TableCell align="left" className="rrmodal-table-headers">Owning Rly</TableCell>
                          <TableCell align="left" className="rrmodal-table-headers">Wagon Type</TableCell>
                          <TableCell align="left" className="rrmodal-table-headers">Wagon No.</TableCell>
                          <TableCell align="left" className="rrmodal-table-headers">No. Of Articles</TableCell>
                          <TableCell align="left" className="rrmodal-table-headers">Gross Weight (MT)</TableCell>
                          <TableCell align="center" className="rrmodal-table-headers">Tare (MT)</TableCell>
                          <TableCell align="left" className="rrmodal-table-headers">CC (MT)</TableCell>
                          <TableCell align="left" className="rrmodal-table-headers">Actual Weight (MT)</TableCell>
                        </TableRow>
                      </TableHead>

                        <TableBody>
                        {rrTableData.map((row: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell align="left" className="rrmodal-table-body-items">{index + 1}.</TableCell>
                            <TableCell align="left" className="rrmodal-table-body-items">{row.owningRly}</TableCell>
                            <TableCell align="left" className="rrmodal-table-body-items">{row.type}</TableCell>
                            <TableCell align="left" className="rrmodal-table-body-items">{row.wagonNo}</TableCell>
                            <TableCell align="left" className="rrmodal-table-body-items">{row.noOfArticles}</TableCell>
                            <TableCell align="left" className="rrmodal-table-body-items">{row.grossWeight}</TableCell>
                            <TableCell align="left" className="rrmodal-table-body-items">{row.tare}</TableCell>
                            <TableCell align="left" className="rrmodal-table-body-items">{row.cc}</TableCell>
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
    </React.Fragment> : <></>}
    </>
  );
};

export default RRModal;

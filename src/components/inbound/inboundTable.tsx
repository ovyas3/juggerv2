import { httpsPost } from "@/utils/Communication";
import "./style.css";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import service from "@/utils/timeService";
import wagonIcon from '@/assets/captive_rakes_no_wagons.svg'
import Image from "next/image";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import captiveRakeIndicator from '@/assets/captive_rakes.svg'
import Link from "next/link";
import { useMediaQuery, useTheme } from '@mui/material';



interface Column {
  id: string;
  label: string;
  style: string;
}

const columns: readonly Column[] = [
  { id: "edemand", label: "e-Demand", style: "header_edemand" },
  { id: "fnr", label: "FNR No.", style: "header_fnr" },
  { id: "Commodities", label: "Commodities", style: "header_Commodities" },
  { id:'pickupLocation', label: "Pickup Location", style: "header_pickupLocation" },
  { id:'expLoadingDate', label: "Exp. Loading Date", style: "header_expLoadingDate" },
  { id: "IndentDate", label: "Indent Date", style: "header_IndentDate" },
  { id: "Status", label: "Status", style: "header_Status" },
  { id: "InitialETA", label: "Initial ETA", style: "header_Initialeta" },
  { id: "remarks", label: "Remarks", style: "header_remarks" },
];

function contructingData(shipment: any) {
  return shipment.map(
    (shipment: {
      _id: string;
      edemand_no: string;
      FNR: string;
      all_FNRs: any;
      delivery_location: {
        _id:string;
        name: string;
        code: string;
        state: string;
      };
      pickup_location: {
        _id: string;
        name: string;
        code: string;
        state: string;
      };
      demand_date: string;
      expected_loading_date: string;
      paid_by: string;
      rr_document: any;
      is_captive: Boolean;
      no_of_wagons: number;
      status: string;
      past_etas: any;
      others: {
        confirmationDate: string;
        forwardingNotesCount: number;
        roundTripFlag: string;
        demandedStock: string;
        demandedCommodity: string;
        registrationDate: string;
      };
      captive_id: any;
      remarks: any;
      unique_code: string;
      trip_tracker: any;
      HA: any;
      rr_dates: any;
    }) => {
      return {
        unique_code: shipment?.unique_code ? shipment?.unique_code : "NA",
        _id: shipment?._id ? shipment?._id : "NA",
        edemand: { edemand: shipment?.edemand_no ? shipment?.edemand_no : "NA",},
        fnr: {
            primary:shipment?.FNR ? shipment?.FNR : "NA",
        },
        Commodities: {
            commodity: shipment?.others?.demandedCommodity ? shipment?.others?.demandedCommodity : "NA",
            Stock: shipment?.others?.demandedStock ? shipment?.others?.demandedStock : "NA",
        },
        pickupLocation: { 
            name: shipment?.pickup_location?.name && shipment?.pickup_location?.name ,
            code: shipment?.pickup_location?.code && shipment?.pickup_location?.code ,
            state: shipment?.pickup_location?.state && shipment?.pickup_location?.state ,
        },
        IndentDate: {
            date:shipment?.demand_date? service.utcToist(shipment?.demand_date) : "NA",
            time:shipment?.demand_date? service.utcToistTime(shipment?.demand_date) : "NA",
        },
        Status: {
            raw:shipment?.status ? shipment?.status : "NA",
        },
        InitialETA: {
            date:  shipment?.past_etas.length > 0 ? service.utcToist(shipment?.past_etas[0]?.eta): "NA",
            time:shipment?.demand_date? service.utcToistTime(shipment?.past_etas[0]?.eta) : "NA",
        },
        remarks: { remark: shipment?.remarks[0] ? shipment?.remarks[0] : "NA",},
        HandlingAgent: shipment?.HA[0] ? shipment?.HA : "NA",
        paidBy: shipment?.paid_by ? shipment?.paid_by : "NA",
        expLoadingDate: {
            date : shipment?.expected_loading_date ? service.utcToist(shipment?.expected_loading_date) : "NA",
            time : shipment?.expected_loading_date ? service.utcToistTime(shipment?.expected_loading_date) : "NA",
        },
        no_of_wagons: shipment?.no_of_wagons ? shipment?.no_of_wagons : "NA",
        is_captive: shipment?.is_captive ? shipment?.is_captive : false ,
      };
    }
  );
}

function InboundTable({ allShipment, count, setInBoundPayload }: any) {

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
    };

  useEffect(()=>{
    setInBoundPayload((prevPayload: any) => ({
        ...prevPayload,
        skip: page * rowsPerPage,
        limit: rowsPerPage
      }));
  },[page, rowsPerPage])

  return (
     <div
            id="tableContainer"
            style={{
              width: "100%",
              height: !mobile ? "calc(100vh - 200px)" : "calc(100vh - 300px)",
              display: "flex",
              flexDirection: "column",
              paddingTop:'25px'
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
                            // textAlign: "center",
                            paddingLeft:'10px',
                            paddingBlock:'0px',
                            paddingRight:'0px',
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#484A57",
                          }}
                        >
                          {column.label}
                          {column.id === "pickupLocation" && (
                              <div>Paid By</div>
                          )}
                          {column.id === 'Commodities' && (
                            <div>Demanded Stock</div>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contructingData(allShipment).map(
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
                              return (
                                <TableCell
                                  key={column.id}
                                  sx={{ fontSize: '12px !important', padding:'4px 0px 4px 0px', paddingLeft:'10px' }}
                                >
                                  {typeof value !== "object" && value}
                                  {column.id === 'pickupLocation' && (
                                    <>
                                        <div id='pickupLocationInfo'>
                                            <div>{row.pickupLocation?.name}</div>
                                            <div>{!row.pickupLocation?.name?.includes(row.pickupLocation?.code) && row.pickupLocation?.code}</div>
                                            <div>{row.pickupLocation?.state}</div>
                                        </div>
                                        <div id='paidBy'>{row.paidBy}</div>
                                    </>
                                  )}
                                  {column.id === "expLoadingDate" && ( row.expLoadingDate.date  !== 'NA' && row.expLoadingDate.time !== 'NA' ?
                                    <>
                                        <div style={{fontSize:12}}>{row.expLoadingDate?.date}</div>
                                        <div style={{fontSize:12}}>{row.expLoadingDate?.time}</div>
                                    </> : 'NA'
                                  )}
                                  {column.id === "IndentDate" && ( row.IndentDate.date  !== 'NA' && row.IndentDate.time !== 'NA' ?
                                    <>
                                        <div style={{fontSize:12}}>{row.IndentDate?.date}</div>
                                        <div style={{fontSize:12}}>{row.IndentDate?.time}</div>
                                    </> : 'NA'
                                  )}
                                  {column.id === 'Status' && (
                                      <>
                                        <div className={row.Status?.raw === 'Delivered' ? 'deliveredStatusraw' : 'transitStatusRaw'} >{row.Status?.raw === 'ITNS' ? 'In Transit' : 'Delivered'}</div>
                                      </>
                                  )}
                                  {column.id === 'edemand' && (
                                      <>
                                        <div style={{marginTop:8, fontSize:12}}>{row.edemand.edemand}</div>
                                        <div>
                                            <div id="logoContainer">
                                                <div><Image src={wagonIcon.src} alt="noOfWagons" height={24} width={24} /></div>
                                                <div style={{marginTop:4, fontSize:12}}>{row.no_of_wagons}</div>
                                                <ArrowDownwardIcon id='ArrowDownwardIcon' style={{ fontSize: '11px' }} />
                                                <p id='noOfWagons'>Number of Wagons</p>
                                            </div>
                                        </div>
                                      </>
                                  )}
                                  {column.id === 'fnr' && (
                                    <>  
                                        <div style={{fontSize:12}}>Primary</div>
                                        <Link target="_blank"
                                            href={"/tracker?unique_code=" + row.unique_code}
                                            onClick={(e) => { e.stopPropagation() }}
                                            style={{fontSize:12}}
                                        >{row.fnr.primary}</Link>
                                        <div>
                                            {row.is_captive && <Image src={captiveRakeIndicator.src} alt="captiveRakeIndicator" height={24} width={24} />}
                                        </div>
                                    </>
                                  )}
                                  {column.id === 'Commodities' && (
                                    <>
                                        <div style={{fontSize:12}}>{row.Commodities.commodity}</div>
                                        <div style={{marginTop:8, color: '#71747A', fontSize:12}}>{row.Commodities.Stock}</div>
                                    </>
                                  )}
                                  {column.id === 'InitialETA' && ( row.InitialETA.date  !== 'NA' && row.InitialETA.time !== 'NA' ?
                                    <>
                                        <div style={{fontSize:12}}>{row.InitialETA.date}</div>
                                        <div style={{fontSize:12}}>{row.InitialETA.time}</div>
                                    </> : 'NA'
                                  )}
                                  {column.id === 'remarks' && (
                                    <>
                                        <div style={{fontSize:12}}>{row.remarks.remark}</div>
                                    </>
                                  )}

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
              <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    component="div"
                    count={count}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Shipments per page:"
                    sx={{ height: 40, overflowY: 'hidden', position: 'absolute', top: '-37px', right: '-15px' }}
                />
            </Paper>
          </div>
  );
}
export default InboundTable;

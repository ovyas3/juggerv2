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
import service from '@/utils/timeService';

interface Column {
  id: string;
  label: string;
  style: string;
}

const columns: readonly Column[] = [
  { id: "sno", label: "S No.", style: "header_sno" },
  { id: "edemand", label: "e-Demand", style: "header_edemand" },
  { id: "fnr", label: "FNR", style: "header_fnr" },
  { id: "destination", label: "Destination", style: "header_destination" },
  { id: "rrDate", label: "RR Date", style: "header_rrDate" },
  { id: "initialEta", label: "Initial ETA", style: "header_initialEta" },
  { id: "currentEta", label: "Current ETA", style: "header_finalEta" },
  { id: "drawnOut", label: "Drawn Out Time", style: "header_drawnOut" },
  { id: "delay", label: "Delay", style: "header_delay" },
  { id: "remarks", label: "Remarks", style: "header_remarks" },
];

function contructingData(shipment: any) {
  return shipment.map(
    (shipment: {
      _id: string;
      edemand_no: string;
      FNR: string;
      delivery_location: {
        code: string,
        name: string,
        state: string,
      };
      rr_date: string;
      initial_eta: string;
      current_eta: string;
      delay: string;
      remarks: [{
        date: string,
        remark: string,
        user: string,
        _id: string
      }];
      drawnout_time: string;
      eta: string;
      rr_document: [{
        _id: string,
        rr_no: string,
        rr_date: string
      }];
    }) => {
      return {
        _id:shipment?._id ? shipment?._id : 'NA',
        edemand: shipment?.edemand_no ? shipment?.edemand_no : 'NA',
        fnr: shipment?.FNR ? shipment?.FNR : 'NA',
        destination: shipment?.delivery_location ? shipment?.delivery_location : 'NA',
        rrDate: { 
          date: shipment?.rr_document[0]?.rr_date ? service.utcToist(shipment?.rr_document[0]?.rr_date) : 'NA',
          time: shipment?.rr_document[0]?.rr_date ? service.utcToistTime(shipment?.rr_document[0]?.rr_date) : 'NA' ,
        },
        initialEta: {
          date:shipment?.initial_eta ? service.utcToist(shipment?.initial_eta) : 'NA',
          time: shipment?.initial_eta ? service.utcToistTime(shipment?.initial_eta) : 'NA',
        },
        currentEta: {
          date:shipment?.eta ? service.utcToist(shipment?.eta) : 'NA',
          time: shipment?.eta ? service.utcToistTime(shipment?.eta) : 'NA',
        },
        delay: shipment?.delay ? shipment?.delay : 'NA',
        remarks: shipment?.remarks ? shipment?.remarks[0]?.remark || 'NA' : 'NA',
        drawnOut: {
          date: shipment?.drawnout_time ? service.utcToist(shipment?.drawnout_time) : 'NA',
          time: shipment?.drawnout_time ? service.utcToistTime(shipment?.drawnout_time) : 'NA',
        },
      };
    }
  );
}

function EtaDashboardModal({
  providedShipments,
  setOpenModalDelay,
  headingForModel,
}: any) {
  const [allShipments, setAllShipments] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  

  async function getDelayShipments() {
    const payload = { ids: providedShipments };
    const response = await httpsPost(
      "eta_dashboard/details",
      payload,
      0,
      false
    );
    if (response.statusCode === 200) setAllShipments(contructingData(response.data));
  }
  useEffect(() => {
    getDelayShipments();
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 300,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      onClick={(e) => {
        e.stopPropagation();
        setOpenModalDelay(false);
      }}
    >
      <div
        style={{
          width: "80vw",
          minWidth: 1200,
          height: 650,
          backgroundColor: "white",
          position: "relative",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          borderRadius: 20,
          padding: 25,
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div style={{ fontSize: "20px", fontWeight: "500" }}>
          {headingForModel}
        </div>
        <div id="tableContainer" style={{width: '100%', height: '95%', display: 'flex', flexDirection: 'column', paddingTop: 24 }}>
          <Paper sx={{ width: "100%", position: "relative",  height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 'none'}}>
            <TableContainer sx={{ overflow: 'auto', borderRadius: '4px', border: '1px solid #E9E9EB' }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell key={column.id} className={column.style}  style={{ textAlign: 'center', padding: '8px 0px 8px 0px', fontSize: 12, fontWeight: 600, color: '#484A57', wordWrap:'break-word' }}>
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allShipments.map((row:any, rowIndex) => {
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
                              <TableCell key={column.id} sx={{ textAlign: 'center', fontSize:12}}>
                                {typeof value !== 'object' && value}
                                {column.id === 'sno' && (<div>{rowIndex + 1 + page * rowsPerPage}.</div>)}
                                {column.id === 'destination' && (
                                    <>
                                      <div>{row.destination.code}</div>
                                      <div>{row.destination.name}</div>
                                      <div>{row.destination.state}</div>
                                    </>
                                )}
                              {column.id === 'rrDate' && ( row.rrDate.date !== 'NA' && row.rrDate.time !== 'NA' ?
                                  <div>
                                    <div>{row.rrDate.date}</div>
                                    <div>{row.rrDate.time}</div>
                                  </div> : 'NA'
                                )}
                                {column.id === 'initialEta' && ( row.initialEta.date !== 'NA' && row.initialEta.time !== 'NA' ?
                                  <>
                                    <div>{row.initialEta.date}</div>
                                    <div>{row.initialEta.time}</div>
                                  </> : 'NA'
                                )}
                                {column.id === 'currentEta' && ( row.currentEta.date !== 'NA' && row.currentEta.time !== 'NA' ?
                                  <>
                                    <div>{row.currentEta.date}</div>
                                    <div>{row.currentEta.time}</div>
                                  </> : 'NA'
                                )}
                                {column.id === 'drawnOut' && ( row.drawnOut.date !== 'NA' && row.drawnOut.time !== 'NA' ?
                                  <>
                                    <div>{row.drawnOut.date}</div><div>{row.drawnOut.time}</div>
                                  </>: 'NA'
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            
          </Paper>
        </div>
        <div className="closeContaioner">
          <CloseIcon
            onClick={(e) => {
              e.stopPropagation();
              setOpenModalDelay(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default EtaDashboardModal;

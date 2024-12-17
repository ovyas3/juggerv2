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
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Popover from "@mui/material/Popover";
import { useSnackbar } from '@/hooks/snackBar';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import rrDocumentIcon from '@/assets/rr_document_icon.svg';
import {Tooltip} from "@mui/material";
import RRModal from '../RR Modal/RRModal';




interface Column {
  id: string;
  label: string;
  style: string;
}

const columns: readonly Column[] = [
  { id: "edemand", label: "e-Demand", style: "header_edemand" },
  { id: "fnr", label: "", style: "header_fnr" },
  { id: "Commodities", label: "Commodities", style: "header_Commodities" },
  { id:'pickupLocation', label: "Pickup Location", style: "header_pickupLocation" },
  // { id:'expLoadingDate', label: "Exp. Loading Date", style: "header_expLoadingDate" },
  // { id: "IndentDate", label: "Indent Date", style: "header_IndentDate" },
  { id: "fois_last_update", label: '', style: "header_lastFoisUpdate" },
  { id: "Status", label: "Status", style: "header_Status" },
  { id: "InitialETA", label: "Initial ETA", style: "header_Initialeta" },
  { id: "remarks", label: "Remarks", style: "header_remarks" },
  { id: "action", label: "Action", style: "header_action_inbound" },
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
      polyline:any;
      captive:any;
    }) => {
      // const {rr_dates} = shipment;
      // let newRRDate = new Date(rr_dates[0]);
      // newRRDate.setHours(newRRDate.getHours() - 5);
      // newRRDate.setMinutes(newRRDate.getMinutes() - 30);
      return {
        unique_code: shipment?.unique_code ? shipment?.unique_code : "--",
        _id: shipment?._id ? shipment?._id : "--",
        edemand: { edemand: shipment?.edemand_no ? shipment?.edemand_no : "--",},
        fnr: {
            primary:shipment?.FNR ? shipment?.FNR : "--",
        },
        Commodities: {
            commodity: shipment?.others?.demandedCommodity ? shipment?.others?.demandedCommodity : "--",
            Stock: shipment?.others?.demandedStock ? shipment?.others?.demandedStock : "--",
        },
        pickupLocation: { 
            name: shipment?.pickup_location?.name && shipment?.pickup_location?.name ,
            code: shipment?.pickup_location?.code && shipment?.pickup_location?.code ,
            state: shipment?.pickup_location?.state && shipment?.pickup_location?.state ,
        },
        IndentDate: {
            date:shipment?.demand_date? service.utcToist(shipment?.demand_date) : "--",
            time:shipment?.demand_date? service.utcToistTime(shipment?.demand_date) : "--",
        },
        Status: {
            raw:shipment?.status ? shipment?.status : "--",
        },
        InitialETA: {
            date: shipment?.past_etas.length > 0 ? service.utcToist(shipment?.past_etas[0]): "--",
            time: shipment?.past_etas.length > 0 ? service.utcToistTime(shipment?.past_etas[0]) : "--",
        },
        currentETA:{
            date: shipment?.past_etas.length > 0 ? service.utcToist(shipment?.past_etas[shipment?.past_etas.length - 1]): "--",
            time: shipment?.past_etas.length > 0 ? service.utcToistTime(shipment?.past_etas[shipment?.past_etas.length - 1]) : "--",
        },
        remarks: { remark: shipment?.remarks[0] ? shipment?.remarks[0] : "--",},
        HandlingAgent: shipment?.HA[0] ? shipment?.HA : "--",
        paidBy: shipment?.paid_by ? shipment?.paid_by : "--",
        expLoadingDate: {
            date : shipment?.expected_loading_date ? service.utcToist(shipment?.expected_loading_date) : "--",
            time : shipment?.expected_loading_date ? service.utcToistTime(shipment?.expected_loading_date) : "--",
        },
        no_of_wagons: shipment?.no_of_wagons ? shipment?.no_of_wagons : "--",
        is_captive: shipment?.is_captive ? shipment?.is_captive : false ,
        polyline: shipment?.polyline,
        rr_document: shipment?.rr_document,
        all_FNRs: shipment?.all_FNRs,
        captiveName: shipment?.captive?.name && shipment?.captive.name,
        fois_updated_at: {
          date: shipment?.trip_tracker[0]?.fois_updated_at && service.utcToist(shipment?.trip_tracker[0]?.fois_updated_at),
          time: shipment?.trip_tracker[0]?.fois_updated_at && service.utcToistTime(shipment?.trip_tracker[0]?.fois_updated_at),
        },
        rr_date: {
          date: shipment.rr_dates.length > 0 && service.utcToist(shipment.rr_dates[0]) ,
          time: shipment.rr_dates.length > 0 && service.utcToistTime(shipment.rr_dates[0]) ,
        }
      };
    }
  );
}

function InboundTable({ allShipment, count, setInBoundPayload, getInboundList }: any) {

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showActionBox, setShowActionBox] = useState(-1);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { showMessage } = useSnackbar();
  const [searchFNR, setSearchFNR] = useState<number | null>(null);
  
  // rr documents variables
  const [isRRDocOpen, setIsRRDocOpen] = useState(false);
  const [rrDocument, setRrDocument] = useState<any>(null);
  const [rrNumbers, setRRNumbers] = useState<any>(null);
  const [isRRDoc, setIsRRDoc] = useState<boolean>(false);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleCloseAction = () => {
    setAnchorEl(null);
    setShowActionBox(-1);
  };

  const fetchingTrackDetails = (e: any, row: any) => {
    e.stopPropagation();
    setShowActionBox(-1);
    const payload = {
      rakeId: row._id
    }
    httpsPost('fetch/track_details', payload).then((res) => {
      if (res && res.statusCode == 200) {
          showMessage('Track Details Fetched Successfully.', 'success')
          getInboundList();
      } else {
          showMessage('Error Fetching Track Details.', 'error')
      }
    }).catch((err) => {
      showMessage('Error Fetching Track Details.', 'error')
    })
  }

  function clickActionBox(
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
    index: number,
    id: string,
    locationId: string
  ) {
    e.stopPropagation();
    setShowActionBox((prevIndex) => (prevIndex === index ? -1 : index));
  }

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
    };

    const handleRRDoc = (id: any) => {  // for rr documents
      setIsRRDocOpen(true);
      const rrNums = allShipment.filter((shipment: any) => shipment._id === id)[0].all_FNRs;
      setRRNumbers(rrNums);
      const rrDocumnets = allShipment.filter((shipment: any) => shipment._id === id)[0].rr_document;
      const isRRDocument = rrDocumnets && rrDocumnets.length > 0;
      setIsRRDoc(isRRDocument);
  }

  useEffect(()=>{
    setInBoundPayload((prevPayload: any) => ({
        ...prevPayload,
        skip: page * rowsPerPage,
        limit: rowsPerPage
      }));
  },[page, rowsPerPage])

  useEffect(() => {
    if(Math.abs(searchFNR ?? 0).toString().length  === 11){
      setInBoundPayload((prev:any)=>{
        const newState = {...prev};
        newState.fnrNumber = searchFNR;
        return newState
      })
    }else if (searchFNR === 0) {
      setInBoundPayload((prev:any)=>{
        const newState = {...prev};
        delete newState.fnrNumber;
        return newState
      })
    }
  },[searchFNR])

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
                          {/* {column.id === 'Commodities' && (
                            <div>Demanded Stock</div>
                          )} */}
                          {column.id === 'fnr' && (
                            <input 
                              type="number"
                              placeholder="FNR No."
                              style={{
                                maxWidth:'100px',
                                color:'black',
                                fontWeight:600,
                                fontSize:12,
                                border:'1px solid #E9E9EB',
                                padding:'4px 8px 4px 8px',
                                borderRadius:'4px',
                                outline:'none'
                              }}
                              onChange={(e)=>{
                                setSearchFNR(+e.target.value);
                              }}
                            />
                          )} 
                          {column.id === 'InitialETA' && (
                            <div>Current ETA</div>
                          )}
                          {column.id === 'fois_last_update' && (
                            <div style={{textAlign:'center'}}>
                              <div>RR Date</div>
                              <div style={{whiteSpace: 'nowrap' }}>Last <span style={{color:'red'}}>FOIS</span> Ping</div>
                            </div>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contructingData(allShipment).map(
                      (row: any, rowIndex: any) => {
                        console.log(row.rr_date, 'row.rr_date');
                        console.log(row.fois_updated_at, 'row.fois_updated_at');
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
                                  {column.id === "expLoadingDate" && ( row.expLoadingDate.date  !== '--' && row.expLoadingDate.time !== '--' ?
                                    <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                        <div style={{fontSize:12}}>{row.expLoadingDate?.date}</div>
                                        <div style={{fontSize:12}}>{row.expLoadingDate?.time}</div>
                                    </div> : <div style={{textAlign:'center', fontSize:12}} >--</div>
                                  )}
                                  {column.id === "IndentDate" && ( row.IndentDate.date  !== '--' && row.IndentDate.time !== '--' ?
                                    <div style={{textAlign:'center'}}>
                                        <div style={{fontSize:12}}>{row.IndentDate?.date}</div>
                                        <div style={{fontSize:12}}>{row.IndentDate?.time}</div>
                                    </div> : <div style={{textAlign:'center', fontSize:12}} >--</div>
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
                                    <div style={{display:'flex', flexDirection:'column', gap:4}}>  
                                        <div style={{fontSize:12}}>Primary</div>
                                        <Link target="_blank"
                                            href={"/tracker?unique_code=" + row.unique_code}
                                            onClick={(e) => { e.stopPropagation() }}
                                            style={{fontSize:12}}
                                        >{row.fnr.primary}</Link>
                                        <div>
                                            {row.is_captive && 
                                              <Tooltip title={row.captiveName || ''} placement="left" arrow>
                                                <Image src={captiveRakeIndicator.src} alt="captiveRakeIndicator" height={24} width={24} style={{marginRight:6}} />
                                              </Tooltip>
                                            }
                                            {row.rr_document.length > 0 && 
                                              <Tooltip title="View RR Document" placement="right" arrow>
                                                <Image 
                                                  src={rrDocumentIcon.src} 
                                                  alt="rrIndicator" 
                                                  height={24} 
                                                  width={24} 
                                                  style={{cursor:'pointer'}}
                                                  onClick={(e)=>{handleRRDoc(row._id)}}
                                                />
                                              </Tooltip>
                                            }
                                        </div>
                                    </div>
                                  )}
                                  {column.id === 'Commodities' && (
                                    <>
                                        <div style={{fontSize:12}}>{row.Commodities.commodity}</div>
                                        {/* <div style={{marginTop:8, color: '#71747A', fontSize:12}}>{row.Commodities.Stock}</div> */}
                                    </>
                                  )}
                                  {column.id === 'InitialETA' && ( row.InitialETA.date  !== '--' && row.InitialETA.time !== '--' ?
                                    <div style={{textAlign:'center', display:'flex', flexDirection:'column', gap:8,whiteSpace: 'nowrap'}}>
                                        <div style={{fontSize:12}}>{row.InitialETA.date} {row.InitialETA.time}</div>
                                        <div style={{fontSize:12}}>{row.currentETA.date} {row.currentETA.time}</div>
                                    </div>: <div style={{textAlign:'center'}} >--</div>
                                  )}
                                  {column.id === 'remarks' && (
                                    <>
                                        <div style={{fontSize:12, textAlign:'center'}}>{row.remarks.remark}</div>
                                    </>
                                  )}
                                  {column.id === 'action' && (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',marginLeft:-10, }}>
                                      <div 
                                        style={{
                                          height:24, 
                                          width:24, 
                                          backgroundColor:'#3351FF', 
                                          display:'flex', 
                                          justifyContent:'center', 
                                          alignItems:'center', 
                                          borderRadius:4, 
                                          cursor:'pointer'
                                        }} 
                                        onClick={(e: any) => {
                                          clickActionBox(e, rowIndex, "", "");
                                          setAnchorEl(
                                            e.currentTarget as unknown as HTMLButtonElement
                                          );
                                        }}
                                      >
                                        <MoreHorizIcon style={{color:'white'}}/>
                                      </div>
                                      <Popover
                                      open={
                                        showActionBox === rowIndex
                                          ? true
                                          : false
                                      }
                                      anchorEl={anchorEl}
                                      onClose={handleCloseAction}
                                      anchorOrigin={{
                                        vertical: 35,
                                        horizontal: -140,
                                      }}
                                    >
                                      {!row.polyline && (
                                        <div
                                        className="action-popover-wagon-inbound"
                                        onClick={(e) => {
                                          fetchingTrackDetails(e, row);
                                        }}
                                        >
                                          <div><StackedLineChartIcon style={{color:'#7C7E8C', height:20, width:20 }}/></div>
                                          <div>{'Fetch Track Details'}</div>
                                        </div>
                                      )}
                                    </Popover>
                                    </div>
                                  )}
                                  {column.id === 'fois_last_update'&& (
                                    row?.rr_date?.date || row.fois_updated_at?.date ?
                                    <div style={{textAlign:'center' , display:'flex', flexDirection:'column', gap:8, whiteSpace: 'nowrap'}}>
                                      { row?.rr_date?.date ? <div>{row?.rr_date?.date} {row?.rr_date?.time}</div>:<div>--</div>}
                                      { row.fois_updated_at?.date ? <div>{row.fois_updated_at?.date } {row.fois_updated_at?.time}</div>:<div>--</div>}
                                    </div> : <div style={{textAlign:'center'}} >--</div>
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
            <RRModal isOpen={isRRDocOpen} isClose={() => setIsRRDocOpen(false)} rrNumbers={rrNumbers} isRRDoc={isRRDoc} />
      </div>
  );
}
export default InboundTable;

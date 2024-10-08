"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header/header";
import MobileHeader from "@/components/Header/mobileHeader";
import { useWindowSize } from "@/utils/hooks";
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import "./page.css";
import Image from "next/image";
import searchIcon from "@/assets/search_wagon.svg";
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
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { httpsPost } from "@/utils/Communication";
import service from "@/utils/timeService";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import {UploadWagonSheet} from '@/components/Table/tableComp';
import { useTranslations } from 'next-intl';
import RakeHandlingSheet from "./rakeHandlingSheet";
import { MarkPlacement } from "@/app/inPlantDashboard/actionComponents";


interface Column {
  id: string;
  label: string;
  style: string;
}
const columns: readonly Column[] = [
  { id: "sno", label: "SI No.", style: "header_sno" },
  { id: "indent", label: "Indent No.", style: "header_indent" },
  { id: "edemand", label: "e-demand no.", style: "header_edemand" },
  { id: "plant", label: "Plant", style: "header_plant" },
  { id: "exp_loading", label: "Expected Loading", style: "header_exp_loading" },
  { id: "total_wagons", label: "Total Wagons", style: "header_total_wagons" },
  {
    id: "placement_time",
    label: "Placement Time",
    style: "header_placement_time",
  },
  { id: "drawn_in", label: "Drawn In", style: "header_drawnin" },
  { id: "action", label: "Action", style: "header_action" },
];

function contructingData(shipment: any) {
  return shipment.map(
    (shipment: {
      _id: string;
      expected_loading_date: any;
      no_of_wagons: number;
      status: string;
      edemand_no: string;
      placement_time: any;
      drawnin_time: any;
      FNR: string;
      received_no_of_wagons:any;

      indent: string;
      plant: string;
    }) => {
      return {
        id: shipment?._id && shipment._id,
        status: shipment?.status ? shipment?.status : "NA",
        fnr: shipment?.FNR ? shipment?.FNR : "NA",
        indent: {
          indent_no: shipment?.indent ? shipment?.indent : "NA",
        },
        edemand: {
          edemand_no: shipment?.edemand_no ? shipment?.edemand_no : "NA",
        },
        plant: {
          plant_name: shipment?.plant ? shipment?.plant : "NA",
        },
        exp_loading: {
          date: shipment?.expected_loading_date
            ? service.utcToist(shipment?.expected_loading_date)
            : "NA",
          time: shipment?.expected_loading_date
            ? service.utcToistTime(shipment?.expected_loading_date)
            : "NA",
        },
        total_wagons: {
          numberTotal: shipment?.no_of_wagons ? shipment?.no_of_wagons : "NA",
          received_no_of_wagons: shipment?.received_no_of_wagons ? shipment?.received_no_of_wagons : "NA",
        },
        placement_time: {
          date: shipment?.placement_time
            ? service.utcToist(shipment?.placement_time)
            : "NA",
          time: shipment?.placement_time
            ? service.utcToistTime(shipment?.placement_time)
            : "NA",
        },
        drawn_in: {
          date: shipment?.drawnin_time ? service.utcToist(shipment?.drawnin_time) : "NA",
          time: shipment?.drawnin_time
            ? service.utcToistTime(shipment?.drawnin_time)
            : "NA",
        },
      };
    }
  );
}
function WagonTallySheet({setShowAssignWagon, setShowWagonSheet, setShipmentForWagonSheet}:any) {

  const text = useTranslations('WAGONTALLYSHEET');
  const [allWagonsList, setAllWagonsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [payloadForWagons, setPayloadForWagons] = useState({
    skip: 0,
    limit: 10,
  });
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const openAction = Boolean(anchorEl);
  const [showActionBox, setShowActionBox] = React.useState(-1);
  const [openUploadWagonSheetmodal, setOpenUploadWagonSheetModal] = useState(false);
  const [openRakeHandlingSheet, setOpenRakeHandlingSheet] = useState(false);
  const [uploadShipmentwagon, setuploadShipmentwagon] = useState({});
  const [rakeHandlingSheetData, setRakeHandlingSheetData] = useState({});

  const [openMarkPlacementTimeModal, setOpenMarkPlacementTimeModal] = useState(false);
  const [shipmentforPlacementTime, setShipmentforPlacementTime] = useState({});

  const [openDrawnInTimeModal, setOpenDrawnInTimeModal] = useState(false);
  const [shipmentforDrawnInTime, setShipmentforDrawnInTime] = useState({});

  // api calling
  async function getWagonDetails() {
    try {
      const response = await httpsPost(
        "rake_shipment/wagon_tally_details",
        payloadForWagons
      );
      setAllWagonsList(response.data.data);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.log(error);
    }
  }

  // functions
  function clickActionBox(
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
    index: number,
    id: string,
    locationId: string
  ) {
    e.stopPropagation();
    setShowActionBox((prevIndex) => (prevIndex === index ? -1 : index));
  }
  const assignPlantToWagon = (event: any, row: any) => {
    setShowAssignWagon(true);
    setShipmentForWagonSheet(row);
    setShowActionBox(-1);
    setAnchorEl(null);
    setShowWagonSheet(false);
  }
  const drawnInTime = (event: any, row: any) => {
    setOpenDrawnInTimeModal(true);
    setShipmentforDrawnInTime(row);
    setShowActionBox(-1);
    setAnchorEl(null);
  }
  const uploadWagonSheet = (event: any, row: any) => {
    setOpenUploadWagonSheetModal(true);
    setuploadShipmentwagon(row);
    setShowActionBox(-1);
    setAnchorEl(null);
  };
  const markPlacementTime = (event: any, row: any) => {
    setOpenMarkPlacementTimeModal(true);
    setShipmentforPlacementTime(row);
    setShowActionBox(-1);
    setAnchorEl(null);
  }
  const uploadRakeSheet = (event: any, row: any) => {
    setOpenRakeHandlingSheet(true);
    setRakeHandlingSheetData(row);
    setShowActionBox(-1);
    setAnchorEl(null);
  }
  function handleClickAction(event: any) {
    setAnchorEl(event?.currentTarget);
  }
  const handleCloseAction = () => {
    setAnchorEl(null);
    setShowActionBox(-1);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // useEffect
  useEffect(() => {
    getWagonDetails();
  }, [payloadForWagons]);

  useEffect(() => {
    setPayloadForWagons((pre: any) => {
      return {
        ...pre,
        skip: page * rowsPerPage,
        limit: rowsPerPage,
      };
    });
  }, [page, rowsPerPage]);

  const result = [
    {
      indent: "122jhgf222",
      edemand: 222222,
      plant: 1111,
      exp_loading: "29-10-2024T21:10:23:00",
      drawn_in: "29-10-2024T21:10:23:00",
    },
    {
      indent: "sdfvdfvdfsdfsfvdf",
      edemand: 222222,
      plant: 1111,
      exp_loading: "29-10-2024T21:10:23:00",
      drawn_in: "29-10-2024T21:10:23:00",
    },
    {
      indent: "sdfvfdvfdvfdsvsvfvghwd hde ehfwef we f gwefwghfgw  ewf",
      edemand: 222222,
      plant: 1111,
      exp_loading: "29-10-2024T21:10:23:00",
      drawn_in: "29-10-2024T21:10:23:00",
    },
      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },
      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },
      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },
      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },
      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },

      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },
      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },
      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },
      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },
      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },
      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },
      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },
      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },
      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },
      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },
      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },

      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },

      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },
      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },

      {
        indent: 122222,
        edemand: 222222,
        plant: 1111,
        exp_loading: "29-10-2024T21:10:23:00",
        drawn_in: "29-10-2024T21:10:23:00",
      },
  ];

  return (
    <div>
      <div className="wagon-wrapper">

        <div className="search-container">
          <div className="input-wrapper">
            <Image src={searchIcon} alt="" className="icon"></Image>
            <input className="input" placeholder="Search by Indent no." />
          </div>
        </div>

        <div
          style={{
            width: "100%",
            height: "calc(100vh - 160px)",
            display: "flex",
            flexDirection: "column",
            paddingTop: 10,
            paddingInline: 24,
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
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ position: "absolute", top: -40, zIndex: 100, right: -10 }}
            />
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
                          padding: "8px 0px 8px 0px",
                          fontSize: 14,
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
                  {contructingData(allWagonsList).map((row: any, rowIndex: any) => {
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
                              sx={{
                                textAlign: "center",
                                paddingInline: "10px",
                                fontSize: 12,
                              }}
                            >
                              {typeof value !== "object" && value}
                              {column.id === "sno" && (
                                <div style={{ fontSize: 12 }}>
                                  {rowIndex + 1 + page * rowsPerPage}.
                                </div>
                              )}
                              {column.id === "indent" && (
                                <>
                                  <div style={{ fontSize: 12 }}>
                                    {row.indent.indent_no}
                                  </div>
                                </>
                              )}
                              {column.id === "edemand" && (
                                <>
                                  <div style={{ fontSize: 12 }}>
                                    {row.edemand.edemand_no}
                                  </div>
                                </>
                              )}
                              {column.id === "plant" && (
                                <>
                                  <div style={{ fontSize: 12 }}>
                                    {row.plant.plant_name}
                                  </div>
                                </>
                              )}
                              {column.id === "exp_loading" &&
                                (row.exp_loading.date !== "NA" &&
                                row.exp_loading.time !== "NA" ? (
                                  <>
                                    <div style={{ fontSize: 12 }}>
                                      {row.exp_loading.date}
                                    </div>
                                    <div style={{ fontSize: 12 }}>
                                      {row.exp_loading.time === '05:30'? '23:59': row.exp_loading.time}
                                    </div>
                                  </>
                                ) : (
                                  "NA"
                                ))}
                              {column.id === "total_wagons" && (
                                <>
                                  <div style={{ fontSize: 12 }}>
                                    {row.total_wagons.numberTotal}
                                  </div>
                                </>
                              )}
                              {column.id === "placement_time" &&
                                (row.placement_time.date !== "NA" &&
                                row.placement_time.time !== "NA" ? (
                                  <>
                                    <div style={{ fontSize: 12 }}>
                                      {row.placement_time.date}
                                    </div>
                                    <div style={{ fontSize: 12 }}>
                                      {row.placement_time.time}
                                    </div>
                                  </>
                                ) : (
                                  "NA"
                                ))}
                              {column.id === "drawn_in" &&
                                (row.drawn_in.date !== "NA" &&
                                row.drawn_in.time !== "NA" ? (
                                  <>
                                    <div style={{ fontSize: 12 }}>
                                      {row.drawn_in.date}
                                    </div>
                                    <div style={{ fontSize: 12 }}>
                                      {row.drawn_in.time}
                                    </div>
                                  </>
                                ) : (
                                  "NA"
                                ))}
                              {column.id === "action" && (
                                <div id="actionIconContaioner">
                                  <div
                                    id="actionIcon"
                                    onClick={(e: any) => {
                                      clickActionBox(e, rowIndex, "", "");
                                      setAnchorEl(
                                        e.currentTarget as unknown as HTMLButtonElement
                                      );
                                    }}
                                  >
                                    <MoreHorizIcon style={{ color: "white" }} />
                                  </div>
                                  <Popover
                                    open={
                                      showActionBox === rowIndex ? true : false
                                    }
                                    anchorEl={anchorEl}
                                    onClose={handleCloseAction}
                                    anchorOrigin={{
                                      vertical: 35,
                                      horizontal: -150,
                                    }}
                                  >
                                    <div
                                      onClick={(e) =>
                                        uploadWagonSheet(e, row)
                                      }
                                      className="action-popover-wagon"
                                    >
                                      {text('uploadWagonTallySheet')}
                                    </div>
                                    <div className="action-popover-wagon" onClick={(e)=>{markPlacementTime(e, row)}} >
                                      {text('markPlacemantTime')}
                                    </div>
                                    <div className="action-popover-wagon" onClick={(e) => {drawnInTime(e, row)}} >
                                      {text('drawnInTime')}
                                    </div>
                                    <div className="action-popover-wagon" onClick={(e)=>{uploadRakeSheet(e, row)}} >
                                      {text('rakeHandlingSheet')}
                                    </div>
                                    <div className="action-popover-wagon" onClick={(e)=>{assignPlantToWagon(e, row)}}>
                                      {text('assignPlanttoWagon')}
                                    </div>
                                  </Popover>
                                </div>
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
      </div>
      {openUploadWagonSheetmodal && <UploadWagonSheet isClose={setOpenUploadWagonSheetModal} shipment={uploadShipmentwagon}  />}
      {openRakeHandlingSheet && <RakeHandlingSheet isClose={setOpenRakeHandlingSheet} shipment={rakeHandlingSheetData}  />}
      {openMarkPlacementTimeModal && <MarkPlacement isClose={setOpenMarkPlacementTimeModal} shipment={shipmentforPlacementTime} getWagonDetails={getWagonDetails} />}
      {openDrawnInTimeModal && <MarkPlacement isClose={setOpenDrawnInTimeModal} shipment={shipmentforDrawnInTime} different='drawnInTimeFromInplantDashboard' getWagonDetails={getWagonDetails} />}
    </div>
  );
}

export default WagonTallySheet;

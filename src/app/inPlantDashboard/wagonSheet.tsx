"use client";
import React, { useState, useEffect } from "react";
import "./page.css";
import Image from "next/image";
import searchIcon from "@/assets/search_wagon.svg";
import wagonIcon from "@/assets/captive_rakes_no_wagons.svg";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
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
import { UploadWagonSheet } from "@/components/Table/tableComp";
import { useTranslations } from "next-intl";
import RakeHandlingSheet from "./rakeHandlingSheet";
import {
  MarkPlacement,
  AddIndentNumber,
  AssignToMill,
} from "@/app/inPlantDashboard/actionComponents";
import captiveRakeIndicator from "@/assets/captive_rakes.svg";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";
import { redirect, useRouter, useParams } from "next/navigation";
import { ThreeCircles } from "react-loader-spinner";

interface Column {
  id: string;
  label: string;
  style: string;
}
const columns: readonly Column[] = [
  { id: "sno", label: "SI No", style: "header_sno" },
  { id: "indent", label: "Indent No", style: "header_indent" },
  { id: "edemand", label: "e-Demand No", style: "header_edemand" },
  { id: "destination", label: "Destination", style: "header_destination_inplant"},
  { id: "plant_codes", label: "Loading Shop", style: "header_plant" },
  { id: "status", label: "Status", style: "header_status" },
  { id: "exp_loading", label: "Expected Loading", style: "header_exp_loading" },
  { id: "total_wagons", label: "Total Wagons", style: "header_total_wagons" },
  {
    id: "placement_time",
    label: "Placement Time",
    style: "header_placement_time",
  },
  // { id: "drawn_in", label: "Drawn In", style: "header_drawnin" },
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
      // drawnin_time: any;
      FNR: string;
      received_no_of_wagons: any;
      indent_no: string;
      plant_codes: any;
      is_captive: any;
      wagon_data_uploaded: any;
      delivery_location: any;
      hooks: any;
      plants_assigned: [{
        _id: string;
        name: string;
        shipper: string;
      }];
    }) => {
      return {
        id: shipment?._id && shipment._id,
        status: {
          raw: shipment?.status ? shipment?.status : "--",
          statusLabel: shipment?.status
            ? getStatusLabel(shipment?.status)
            : "--",
        },
        fnr: shipment?.FNR ? shipment?.FNR : "--",
        destination_code : shipment?.delivery_location?.code ? shipment?.delivery_location?.code : "--",
        destination_name : shipment?.delivery_location?.name ? shipment?.delivery_location?.name : "--",
        indent: {
          indent_no: shipment?.indent_no ? shipment?.indent_no : "--",
        },
        edemand: {
          edemand_no: shipment?.edemand_no ? shipment?.edemand_no : "--",
        },
        exp_loading: {
          date: shipment?.expected_loading_date
            ? service.utcToist(shipment?.expected_loading_date)
            : "--",
          time: shipment?.expected_loading_date
            ? service.utcToistTime(shipment?.expected_loading_date)
            : "--",
        },
        total_wagons: {
          numberTotal: shipment?.no_of_wagons ? shipment?.no_of_wagons : "--",
          requested_no_of_wagons: shipment?.no_of_wagons
            ? shipment?.no_of_wagons
            : "--",
          received_no_of_wagons: shipment?.received_no_of_wagons
            ? shipment?.received_no_of_wagons
            : "--",
        },
        placement_time: {
          date: shipment?.placement_time
            ? service.utcToist(shipment?.placement_time)
            : "--",
          time: shipment?.placement_time
            ? service.utcToistTime(shipment?.placement_time)
            : "--",
        },
        // drawn_in: {
        //   date: shipment?.drawnin_time
        //     ? service.utcToist(shipment?.drawnin_time)
        //     : "--",
        //   time: shipment?.drawnin_time
        //     ? service.utcToistTime(shipment?.drawnin_time)
        //     : "--",
        // },
        plant_codes: {
          plant_codes: shipment?.plant_codes
            ? shipment?.plant_codes.filter((item: any) => item !== "NA")
            : "--",
        },
        hooks: shipment?.hooks ? shipment?.hooks : [],
        is_captive: shipment?.is_captive ? shipment?.is_captive : false,
        wagon_data_uploaded: shipment?.wagon_data_uploaded
          ? shipment?.wagon_data_uploaded
          : false,
        plants_assigned: shipment?.plants_assigned ? shipment?.plants_assigned.map((item: any) => item.name) : [],
      };
    }
  );
}
function WagonTallySheet({}: any) {
  const text = useTranslations("WAGONTALLYSHEET");
  const [allWagonsList, setAllWagonsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [indentNo, setIndentNo] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [payloadForWagons, setPayloadForWagons] = useState<any>({
    skip: 0,
    limit: 10,
    status: ["AVE", "INPL"],
  });
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const openAction = Boolean(anchorEl);
  const [showActionBox, setShowActionBox] = React.useState(-1);
  const [openUploadWagonSheetmodal, setOpenUploadWagonSheetModal] =
    useState(false);
  const [openRakeHandlingSheet, setOpenRakeHandlingSheet] = useState(false);
  const [uploadShipmentwagon, setuploadShipmentwagon] = useState({});
  const [rakeHandlingSheetData, setRakeHandlingSheetData] = useState({});

  const [openMarkPlacementTimeModal, setOpenMarkPlacementTimeModal] =
    useState(false);
  const [shipmentforPlacementTime, setShipmentforPlacementTime] = useState({});

  // const [openDrawnInTimeModal, setOpenDrawnInTimeModal] = useState(false);
  // const [shipmentforDrawnInTime, setShipmentforDrawnInTime] = useState({});

  const [openAddIndentModal, setOpenAddIndentModal] = useState(false);
  const [shipmentforAddIndent, setShipmentforAddIndent] = useState({});

  const [openAssignWagonToplantModal, setOpenAssignWagonToplantModal] =
    useState(false);
  const [shipmentforAssignWagonToplant, setShipmentforAssignWagonToplant] =
    useState({});

  const [inplantTotal, setInplantTotal] = useState(0);
  const [indentTotal, setIndentTotal] = useState(0);
  const [statusCondition, setStatusCondition] = useState(["AVE", "INPL"]);
  const [activeCount, setActiveCount] = useState<any>(0);

  // api calling
  async function getWagonDetails() {
    try {
      setLoading(true);
      const response = await httpsPost(
        "rake_shipment/wagon_tally_details",
        payloadForWagons,
        router
      );
      setAllWagonsList(response.data.data);
      setTotalCount(response.data.count.totalCount);
      setInplantTotal(response.data.count.totalInPlant);
      setIndentTotal(response.data.count.totalAVE);
      setActiveCount(response.data?.count?.count);
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
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
    router.push(`/inPlantDashboard/wagonAssignSheet?shipmentId=${row?.id}`);
    // setShowAssignWagon(true);
    // setShipmentForWagonSheet(row);
    // setOpenAssignWagonToplantModal(true);
    // setShipmentforAssignWagonToplant(row);
    setShowActionBox(-1);
    setAnchorEl(null);
    // setShowWagonSheet(false);
  };
  // const drawnInTime = (event: any, row: any) => {
  //   setOpenDrawnInTimeModal(true);
  //   setShipmentforDrawnInTime(row);
  //   setShowActionBox(-1);
  //   setAnchorEl(null);
  // };
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
  };
  const uploadRakeSheet = (event: any, row: any) => {
    setOpenRakeHandlingSheet(true);
    setRakeHandlingSheetData(row);
    setShowActionBox(-1);
    setAnchorEl(null);
  };
  const AddIndentNumberOnWagonSheet = (event: any, row: any) => {
    setOpenAddIndentModal(true);
    setShipmentforAddIndent(row);
    setShowActionBox(-1);
    setAnchorEl(null);
  };
  const assignHooksToLoadingShop = (event: any, row: any) => {
    router.push(
      `/inPlantDashboard/assignHooksToLoadingShop?shipmentId=${row?.id}`
    );
    setShowActionBox(-1);
    setAnchorEl(null);
  };
  const wagonTallySheet = (event: any, row: any) => {
    router.push(
      `/inPlantDashboard/wagonTallySheet?shipmentId=${row?.id}`
    );
    setShowActionBox(-1);
    setAnchorEl(null);
  };
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
  const handleStatusClick = (status: string) => {
    switch (status) {
      case "total":
        setPayloadForWagons((prev: any) => {
          let newState = { ...prev };
          if (newState.status.length > 0) {
            newState.status = [];
            setStatusCondition(newState.status);
          } else {
            newState.status = ["AVE", "INPL"];
            setStatusCondition(newState.status);
          }
          return newState;
        });
        break;
      case "indent":
        setPayloadForWagons((prev: any) => {
          let newState = { ...prev };
          if (!newState.status.includes("AVE")) {
            newState.status = [...newState.status, "AVE"];
            setStatusCondition(newState.status);
          } else {
            newState.status = newState.status.filter(
              (item: string) => item !== "AVE"
            );
            setStatusCondition(newState.status);
          }
          return newState;
        });
        break;
      case "inplant":
        setPayloadForWagons((prevState: any) => {
          let newState = { ...prevState };
          if (!newState.status.includes("INPL")) {
            newState.status = [...newState.status, "INPL"];
            setStatusCondition(newState.status);
          } else {
            newState.status = newState.status.filter(
              (item: string) => item !== "INPL"
            );
            setStatusCondition(newState.status);
          }
          return newState;
        });
        break;
    }
  };
  const getColorForStatus = (status: any) => {
    let bgColor = "white";
    let textColor = "black";
    switch (status) {
      case "AVE":
        if (statusCondition.includes("AVE")) {
          bgColor = "#E6EAFF";
          textColor = "#536AFE";
        }
        break;
      case "INPL":
        if (statusCondition.includes("INPL")) {
          bgColor = "#F4FCFC";
          textColor = "#174D68";
        }
        break;
      case "total":
        if (
          statusCondition.includes("AVE") &&
          statusCondition.includes("INPL")
        ) {
          bgColor = "#000000";
          textColor = "white";
        }
    }
    return { bgColor, textColor };
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

  useEffect(() => {
    if (!indentNo) {
      setPayloadForWagons((pre: any) => {
        const { indent_no, ...rest } = pre;
        return rest;
      });
    }
  }, [indentNo]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ThreeCircles
          visible={true}
          height="100"
          width="100"
          color="#20114d"
          ariaLabel="three-circles-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );
  }

  return (
    <div>
      <div className="wagon-wrapper">
        <div id="search-container">
          <div id="space-giver"
          ></div>
          <div className="input-wrapper">
            <input
              className="input"
              placeholder="Search by Indent no."
              onChange={(e) => setIndentNo(e.target.value)}
            />
            <Image
              src={searchIcon}
              alt=""
              className="icon"
              onClick={() => {
                setPayloadForWagons({
                  ...payloadForWagons,
                  indent_no: indentNo,
                });
              }}
              style={{ cursor: "pointer" }}
            />
          </div>
          <div id="status-display">
            <div
              className="status-display-boxes"
              style={{
                backgroundColor: getColorForStatus("total").bgColor,
                color: getColorForStatus("total").textColor,
              }}
              onClick={() => {
                handleStatusClick("total");
              }}
            >
              <div style={{ fontSize: "16px" }}>{totalCount}</div>
              <div>{text("total")}</div>
            </div>
            <div
              className="status-display-boxes"
              style={{
                backgroundColor: getColorForStatus("AVE").bgColor,
                color: getColorForStatus("AVE").textColor,
              }}
              onClick={() => {
                handleStatusClick("indent");
              }}
            >
              <div style={{ fontSize: "16px" }}>{indentTotal}</div>
              <div>{text("indent")}</div>
            </div>
            <div
              className="status-display-boxes"
              style={{
                backgroundColor: getColorForStatus("INPL").bgColor,
                color: getColorForStatus("INPL").textColor,
              }}
              onClick={() => {
                handleStatusClick("inplant");
              }}
            >
              <div style={{ fontSize: "16px" }}>{inplantTotal}</div>
              <div>{text("inplant")}</div>
            </div>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            height: "calc(100vh - 176px)",
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
              count={activeCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Shipments per page"
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
                  {contructingData(allWagonsList).map(
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
                                sx={{
                                  textAlign: "center",
                                  paddingInline: "10px",
                                  fontSize: 12,
                                }}
                              >
                                {typeof value !== "object" && value}
                                {column.id === "status" && (
                                  <>
                                    <div
                                      style={{ whiteSpace: "nowrap" }}
                                      className={`${
                                        row.status.raw === "AVE"
                                          ? "aveStatus"
                                          : "inplStatus"
                                      }`}
                                    >
                                      {row.status.statusLabel}
                                    </div>
                                  </>
                                )}
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
                                    <div id="captive-rake-indicator-wagon-indicator">
                                      {row.is_captive && (
                                        <div
                                          style={{
                                            height: 24,
                                          }}
                                        >
                                          <Image
                                            src={captiveRakeIndicator.src}
                                            alt=""
                                            height={24}
                                            width={24}
                                          />
                                        </div>
                                      )}
                                      {row.wagon_data_uploaded && (
                                        <div
                                          className="SourceOutlinedIcon"
                                          style={{ position: "relative" }}
                                        >
                                          <SourceOutlinedIcon
                                            style={{ fontSize: 23 }}
                                          />
                                          <div className="wagons-uploaded-wagonSheet">
                                            Wagons Uploaded
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                                {column.id === "destination" && (
                                  <>
                                    <div 
                                      style={{ 
                                        fontSize: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 156,
                                        paddingLeft: 16
                                      }}
                                    >
                                      {row.destination_code} {row.destination_name}
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
                                  (row.exp_loading.date !== "--" &&
                                  row.exp_loading.time !== "--" ? (
                                    <>
                                      <div style={{ fontSize: 12 }}>
                                        {row.exp_loading.date}
                                      </div>
                                      <div style={{ fontSize: 12 }}>
                                        {row.exp_loading.time === "05:30"
                                          ? "23:59"
                                          : row.exp_loading.time}
                                      </div>
                                    </>
                                  ) : (
                                    "--"
                                  ))}
                                {column.id === "total_wagons" && (
                                  <>
                                    <div
                                      style={{
                                        paddingLeft: 20,
                                        fontSize: 12,
                                        marginTop: -9,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <div className="no_of_wagons">
                                        <div className="request_wagons">
                                          <div className="request_wagons_logo">
                                            <Image
                                              src={wagonIcon.src}
                                              alt=""
                                              className="request_image"
                                              height={11}
                                              width={11}
                                            />
                                            <ArrowUpwardIcon
                                              className="ArrowUpwardIcon"
                                              style={{ fontSize: "11px" }}
                                            />
                                          </div>
                                          <div
                                            style={{
                                              width: 30,
                                              textAlign: "left",
                                            }}
                                          >
                                            {
                                              row.total_wagons
                                                .requested_no_of_wagons
                                            }
                                          </div>
                                          <div className="hover_req">
                                            Wagons requested
                                          </div>
                                        </div>
                                        <div
                                          className="divider_wagons"
                                          style={{ marginLeft: -10 }}
                                        ></div>
                                        <div className="received_wagons">
                                          <div className="request_wagons_logo">
                                            <Image
                                              src={wagonIcon.src}
                                              alt=""
                                              className="request_image"
                                              height={11}
                                              width={11}
                                            />
                                            <ArrowDownwardIcon
                                              className="ArrowDownwardIcon"
                                              style={{ fontSize: "11px" }}
                                            />
                                          </div>
                                          <div
                                            style={{
                                              textAlign: "left",
                                              width: 30,
                                            }}
                                          >
                                            {
                                              row.total_wagons
                                                .received_no_of_wagons
                                            }
                                          </div>
                                          <div className="hover_rece">
                                            Wagons received
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                                {column.id === "placement_time" &&
                                  (row.placement_time.date !== "--" &&
                                  row.placement_time.time !== "--" ? (
                                    <>
                                      <div style={{ fontSize: 12 }}>
                                        {row.placement_time.date}
                                      </div>
                                      <div style={{ fontSize: 12 }}>
                                        {row.placement_time.time}
                                      </div>
                                    </>
                                  ) : (
                                    "--"
                                  ))}
                                {/* {column.id === "drawn_in" &&
                                  (row.drawn_in.date !== "--" &&
                                  row.drawn_in.time !== "--" ? (
                                    <>
                                      <div style={{ fontSize: 12 }}>
                                        {row.drawn_in.date}
                                      </div>
                                      <div style={{ fontSize: 12 }}>
                                        {row.drawn_in.time}
                                      </div>
                                    </>
                                  ) : (
                                    "--"
                                  ))} */}
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
                                      <MoreHorizIcon
                                        style={{ color: "white" }}
                                      />
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
                                        horizontal: -150,
                                      }}
                                    >
                                      <div
                                        className="action-popover-wagon"
                                        onClick={(e) => {
                                          AddIndentNumberOnWagonSheet(e, row);
                                        }}
                                      >
                                        {text("indentNumber")}
                                      </div>
                                      <div
                                        onClick={(e) =>
                                          uploadWagonSheet(e, row)
                                        }
                                        className="action-popover-wagon"
                                      >
                                        {text("uploadWagonTallySheet")}
                                      </div>
                                      <div
                                        className="action-popover-wagon"
                                        onClick={(e) => {
                                          uploadRakeSheet(e, row);
                                        }}
                                      >
                                        {text("rakeHandlingSheet")}
                                      </div>
                                      {row.wagon_data_uploaded ? (
                                        <div
                                          className="action-popover-wagon"
                                          onClick={(e) => {
                                            assignPlantToWagon(e, row);
                                          }}
                                        >
                                          {text("assignWagonToPlant")}
                                        </div>
                                      ) : (
                                        <div
                                          className="action-popover-wagon-disabled"
                                        >
                                          {text("assignWagonToPlant")}
                                        </div>
                                      )}
                                      {row?.hooks && row?.hooks?.length >
                                        0 ? (
                                        <div
                                          className="action-popover-wagon"
                                          onClick={(e) => {
                                            assignHooksToLoadingShop(e, row);
                                          }}
                                        >
                                          {text("assignsHooksToLoadingShop")}
                                        </div>
                                      ) : (
                                        <div
                                          className="action-popover-wagon-disabled"
                                        >
                                          {text("assignsHooksToLoadingShop")}
                                        </div>
                                      )}
                                      {row?.hooks && row?.hooks?.length >
                                        0 ? (
                                        <div
                                          className="action-popover-wagon"
                                          onClick={(e) => {
                                            wagonTallySheet(e, row)
                                          }}
                                        >
                                          {text("wagonTallySheet")}
                                        </div>
                                      ) : (
                                        <div
                                          className="action-popover-wagon-disabled"
                                          onClick={(e) => {
                                            console.log("row", row);
                                            console.log("row.hooks", row.hooks);
                                          }}
                                        >
                                          {text("wagonTallySheet")}
                                        </div>
                                      )}
                                      {/* <div
                                        className="action-popover-wagon"
                                        onClick={(e) => {
                                          markPlacementTime(e, row);
                                        }}
                                      >
                                        {text("markPlacemantTime")}
                                      </div> */}
                                      {/* <div
                                        className="action-popover-wagon"
                                        onClick={(e) => {
                                          drawnInTime(e, row);
                                        }}
                                      >
                                        {text("drawnInTime")}
                                      </div> */}
                                      {/* {row.wagon_data_uploaded && (
                                        <div
                                          className="action-popover-wagon"
                                          onClick={(e) => {}}
                                        >
                                          {text("assignHooksToWagon")}
                                        </div>
                                      )} */}
                                    </Popover>
                                  </div>
                                )}
                                {column.id === "plant_codes" && (
                                  <>
                                    <div style={{ fontSize: 10, textWrap:'nowrap' }}>
                                      {
                                      row?.plants_assigned.length ? (
                                        <div>
                                          {row?.plants_assigned
                                            .slice(0, 2)
                                            .map((plant: any, index: any) => (
                                              <div key={index}>{plant}</div>
                                            ))}
                                          {row?.plants_assigned
                                            .length > 2 && (
                                            <div className="more-plants">
                                              <span
                                                style={{ color: "#AB886D" }}
                                              >
                                                +
                                                {row?.plants_assigned
                                                  .length - 2}{" "}
                                                more
                                              </span>
                                              <div className="hidden-plants">
                                                {row?.plants_assigned
                                                  .slice(2)
                                                  .map(
                                                    (
                                                      plant: any,
                                                      index: any
                                                    ) => (
                                                      <div key={index}>
                                                        {plant}
                                                      </div>
                                                    )
                                                  )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        "--"
                                      )}
                                    </div>
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
          </Paper>
        </div>
      </div>
      {openUploadWagonSheetmodal && (
        <UploadWagonSheet
          isClose={setOpenUploadWagonSheetModal}
          shipment={uploadShipmentwagon}
          getWagonDetails={getWagonDetails}
        />
      )}
      {openRakeHandlingSheet && (
        <RakeHandlingSheet
          isClose={setOpenRakeHandlingSheet}
          shipment={rakeHandlingSheetData}
          getWagonDetails={getWagonDetails}
        />
      )}
      {openMarkPlacementTimeModal && (
        <MarkPlacement
          isClose={setOpenMarkPlacementTimeModal}
          shipment={shipmentforPlacementTime}
          getWagonDetails={getWagonDetails}
        />
      )}
      {/* {openDrawnInTimeModal && (
        <MarkPlacement
          isClose={setOpenDrawnInTimeModal}
          shipment={shipmentforDrawnInTime}
          different="drawnInTimeFromInplantDashboard"
          getWagonDetails={getWagonDetails}
        />
      )} */}
      {openAddIndentModal && (
        <AddIndentNumber
          isClose={setOpenAddIndentModal}
          shipment={shipmentforAddIndent}
          getWagonDetails={getWagonDetails}
        />
      )}
      {openAssignWagonToplantModal && (
        <AssignToMill
          isClose={setOpenAssignWagonToplantModal}
          getWagonDetails={getWagonDetails}
          shipmentForWagonSheet={shipmentforAssignWagonToplant}
        />
      )}
    </div>
  );
}

export default WagonTallySheet;

function getStatusLabel(status: string) {
  switch (status) {
    case "INPL":
      return "In Plant";
      break;
    case "AVE":
      return "Available Indent";
      break;
    case "Received":
      return "Received";
      break;
    default:
      return status;
  }
}

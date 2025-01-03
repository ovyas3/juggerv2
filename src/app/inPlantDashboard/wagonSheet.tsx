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
import { UploadDailyRakeHandlingSheet } from "@/components/Table/tableComp";
import { useTranslations } from "next-intl";
import RakeHandlingSheet from "./rakeHandlingSheet";
import {
  MarkPlacement,
  AddIndentNumber,
  AssignToMill,
} from "@/app/inPlantDashboard/actionComponents";
import captiveRakeIndicator from "@/assets/captive_rakes.svg";
import wagonsUploaded from "@/assets/wagons_uploaded.svg"
import { redirect, useRouter, useParams } from "next/navigation";
import { ThreeCircles } from "react-loader-spinner";
import uploadIcon from '@/assets/uploadIcon.svg';
import Tooltip from '@mui/material/Tooltip';
import { useSearchParams } from 'next/navigation';
import { useSnackbar } from "@/hooks/snackBar";

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
  { id: "plant_ageing", label: "Plant Ageing", style: "header_plant_ageing" },
  { id: "current_status_ageing", label: "Current Status Ageing", style: "header_current_status_ageing" },
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
      plant_ageing: any;
      current_status_ageing: any;
      // drawnin_time: any;
      FNR: string;
      rake_no: string;
      arrival_pl: any;
      formation_pl: any;
      wagon_type: any;
      weighment: any;
      received_no_of_wagons: any;
      indent_no: string;
      plant_codes: any;
      is_captive: any;
      wagon_data_uploaded: any;
      delivery_location: any;
      hooks: any;
      showWagonTallySheet: boolean;
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
        plant_ageing: shipment?.plant_ageing || '--',
        rake_no: shipment?.rake_no || '--',
        current_status_ageing: shipment?.current_status_ageing || '--',
        weighment: shipment?.weighment || false,
        arrival_pl: shipment?.arrival_pl || '',
        formation_pl: shipment?.formation_pl || '',
        wagon_type: shipment?.wagon_type?.length > 0 && shipment.wagon_type.join(', ') || '',
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
          date_time: shipment?.placement_time,
          date: shipment?.placement_time
            ? service.utcToist(shipment?.placement_time)
            : "--",
          time: shipment?.placement_time
            ? service.utcToistTime(shipment?.placement_time)
            : "--",
        },
        showWagonTallySheet: shipment?.showWagonTallySheet ? shipment?.showWagonTallySheet : false,
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
  const searchParams = useSearchParams()
  const text = useTranslations("WAGONTALLYSHEET");
  const [allWagonsList, setAllWagonsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const indent_no_from_params = searchParams.get('indent_no')
  const [indentNo, setIndentNo] = useState(
    indent_no_from_params ? indent_no_from_params : ''
  );
  const [payloadForWagons, setPayloadForWagons] = useState<any>({
    skip: 0,
    limit: 10,
    status: ["INPL"],
    ...(indent_no_from_params && { indent_no:indent_no_from_params }),
  });
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [inPlantFilter, setInPlantFilter] = useState("all");

  const openAction = Boolean(anchorEl);
  const [showActionBox, setShowActionBox] = React.useState(-1);
  const [openUploadWagonSheetmodal, setOpenUploadWagonSheetModal] =
    useState(false);
  const [openRakeHandlingSheet, setOpenRakeHandlingSheet] = useState(false);
  const [uploadShipmentwagon, setuploadShipmentwagon] = useState({});
  const [rakeHandlingSheetData, setRakeHandlingSheetData] = useState({});

  const [openUploadDailyRakeHandlingSheet, setOpenUploadDailyRakeHandlingSheet] = useState(false);
  const [UploadDailyRakeHandlingSheetData, setUploadDailyRakeHandlingSheetData] = useState({});

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
  const [inplantTotal24, setInplantTotal24] = useState(0);
  const [inplantTotal48, setInplantTotal48] = useState(0);
  const [indentTotal, setIndentTotal] = useState(0);
  const [statusCondition, setStatusCondition] = useState(["INPL"]);
  const [activeCount, setActiveCount] = useState<any>(0);
  const { showMessage } = useSnackbar();

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
      setInplantTotal24(response.data.count.totalInPlant24);
      setInplantTotal48(response.data.count.totalInPlant48);
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
    if(!row.wagon_data_uploaded) {
      return showMessage('Please upload wagon sheet to assign plant', 'error');
    }
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
  const uploadDailyRakeHandlingSheet = (event: any, row: any = {}) => {
    setOpenUploadDailyRakeHandlingSheet(true);
    setUploadDailyRakeHandlingSheetData(row);
    setShowActionBox(-1);
    setAnchorEl(null);
  }
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
    if(!row?.hooks || row?.hooks?.length === 0){
      return showMessage('Please assign wagons to loading shop and try again', 'error');
    }
    router.push(
      `/inPlantDashboard/assignHooksToLoadingShop?shipmentId=${row?.id}`
    );
    setShowActionBox(-1);
    setAnchorEl(null);
  };
  const wagonTallySheet = (event: any, row: any) => {
    if(!row?.showWagonTallySheet){
      return showMessage('Please complete assign hooks to loading shop and try again', 'error');
    }
    router.push(
      `/inPlantDashboard/wagonTallySheet?shipmentId=${row?.id}`
    );
    setShowActionBox(-1);
    setAnchorEl(null);
  };
  const wagonWayBill = (event: any, row: any) => {
    if(!row?.wagon_data_uploaded){
      return showMessage('Please upload wagon sheet to view wagon way bill', 'error');
    }
    window.open(
      `/inPlantDashboard/wagonWayBill?shipmentId=${row?.id}`,
      "_blank"
    );
    setShowActionBox(-1);
    setAnchorEl(null);
  };
  const printableWagonTallySheet = (event: any, row: any) => {
    if(!row?.showWagonTallySheet){
      return showMessage('Please complete wagon tally sheet and try again', 'error');
    }
    window.open(
      `/inPlantDashboard/printableWagonTallySheet?shipmentId=${row?.id}`,
      "_blank"
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
          console.log(newState.status, "newState.status");
          if (newState.status.length > 0 && newState.status.includes("AVE")) {
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
            // Deselect all in-plant filter options when in-plant is deselected
            setInPlantFilter("all");
            delete newState.plant_ageing;
          }
          return newState;
        });
        break;
    }
  };

  const handleInPlantFilter = (filter: string) => {
    // Only allow changes if INPL status is selected
    if (statusCondition.includes("INPL")) {
      setInPlantFilter(filter);
      setPayloadForWagons((prev: any) => {
        let newState = { ...prev };
        if (filter === "all") {
          delete newState.plant_ageing;
        } else if (filter === ">24hrs") {
          newState.plant_ageing = "24";
        } else if (filter === ">48hrs") {
          newState.plant_ageing = "48";
        }
        return newState;
      });
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
        break;
      case "inplantFilter":
        bgColor = "#fffbeb";
        textColor = "#92400e";
        break;
    }
    return { bgColor, textColor };
  };

  useEffect(()=>{
    getWagonDetails();
  },[payloadForWagons, inPlantFilter])

  useEffect(() => {
    const indentNoFromParams = searchParams.get("indent_no");
    setIndentNo(indentNoFromParams || "");
  
    setPayloadForWagons((prev: any) => {
      if (indentNoFromParams?.length) {
        return { ...prev, indent_no: indentNoFromParams };
      } else {
        const { indent_no, ...rest } = prev;
        return rest;
      }
    });

  }, [searchParams]);
  
  useEffect(() => {
    setPayloadForWagons((pre: any) => {
      return {
        ...pre,
        skip: page * rowsPerPage,
        limit: rowsPerPage,
      };
    });
  }, [page, rowsPerPage]);


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

  const getStatusLabel = (status: string, plantAgeing: string) => {
    let label = "";
    let additionalText = "";
    switch (status) {
      case "INPL":
        label = "In Plant";
        if (inPlantFilter === ">24hrs") {
          additionalText = " <strong>>24hrs</strong>";
        } else if (inPlantFilter === ">48hrs") {
          additionalText = " <strong>>48hrs</strong>";
        }
        break;
      case "AVE":
        label = "Available Indent";
        break;
      case "Received":
        label = "Received";
        break;
      default:
        label = status;
    }
    return { label, additionalText };
  };

  return (
    <div>
      <div className="wagon-wrapper">
        <div id="search-container">
          <div id="space-giver"></div>
          <div className="input-wrapper">
            <input
              className="input"
              placeholder="Search by Indent no."
              value={indentNo}
              onChange={(e) => setIndentNo(e.target.value)}
            />
            <Image
              src={searchIcon}
              alt=""
              className="icon"
              onClick={() => {
                if(indentNo) {
                  router.push(`/inPlantDashboard?indent_no=${indentNo}`)
                } else {
                  router.push(`/inPlantDashboard`)
                }
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
            <div className="filterbox">
              <div
                className="status-display-boxes"
                style={{
                  backgroundColor: getColorForStatus("INPL").bgColor,
                  color: getColorForStatus("INPL").textColor,
                  marginRight: '8px'
                }}
                onClick={() => {
                  handleStatusClick("inplant");
                }}
              >
                <div style={{ fontSize: "16px" }}>{inplantTotal}</div>
                <div>{text("inplant")}</div>
              </div>
              <div className="in-plant-filterbox">
                <div
                  className={`status-display-boxes ${inPlantFilter === "all" ? "active" : ""}`}
                  onClick={() => handleInPlantFilter("all")}
                >
                  <div>{text("inplantAll")}</div>
                </div>
                <div
                  className={`status-display-boxes ${inPlantFilter === ">24hrs" ? "active" : ""}`}
                  onClick={() => handleInPlantFilter(">24hrs")}
                >
                 <div style={{ fontSize: "16px" }}>{inplantTotal24}</div>
                  <div>{text("inplant24")}</div>
                </div>
                <div
                  className={`status-display-boxes ${inPlantFilter === ">48hrs" ? "active" : ""}`}
                  onClick={() => handleInPlantFilter(">48hrs")}
                >
                  <div style={{ fontSize: "16px" }}>{inplantTotal48}</div>
                  <div>{text("inplant48")}</div>
                </div>
              </div>
            </div>
            <div id='uploadRakeHandlingSheetContainer' onClick={(e) => uploadDailyRakeHandlingSheet(e)}>
            <Tooltip title={'Upload Rake Handling Sheet'} arrow >
              <div id='rakeHandlingSheetUpload'>
              <div><Image src={uploadIcon.src} height={24} width={24} alt="uploadIcon"  /></div>
              <div>{text('upload-rake-handling-sheet')}</div>
              </div>
            </Tooltip>
            </div>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            height: "calc(100vh - 176px)",
            display: "flex",
            flexDirection: "column",
            paddingTop: 50,
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
                        {
                          (column.id === 'plant_ageing' || column.id === 'current_status_ageing') && 
                          <div>(HH:MM)</div>
                        }
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
                                      {(() => {
                                        const { label, additionalText } =
                                          getStatusLabel(
                                            row.status.raw,
                                            row.plant_ageing
                                          );
                                        return (
                                          <span
                                            dangerouslySetInnerHTML={{
                                              __html: `${label}${additionalText}`,
                                            }}
                                          />
                                        );
                                      })()}
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
                                      {row.wagon_data_uploaded && (
                                        <div
                                          className="SourceOutlinedIcon"
                                          style={{
                                            position: "relative",
                                            height: "16px",
                                            width: "16px",
                                          }}
                                        >
                                          <Image
                                            alt=""
                                            src={wagonsUploaded}
                                            style={{
                                              height: "16px",
                                              width: "16px",
                                            }}
                                          />
                                          <div className="wagons-uploaded-wagonSheet">
                                            Wagons Uploaded
                                          </div>
                                        </div>
                                      )}
                                      {/* {!row.is_captive && (
                                        <div
                                          style={{
                                            height: 24,
                                            display:'flex',
                                            alignItems:'center'
                                          }}
                                        >
                                          <Image
                                            src={captiveRakeIndicator.src}
                                            alt=""
                                            height={24}
                                            width={24}
                                          />
                                        </div>
                                      )} */}
                                      {row.captive_id?.name &&
                                        row.is_captive && (
                                          <div
                                            style={{
                                              color: "rgb(233, 30, 99)",
                                              fontSize: "12px",
                                              width: "max-content",
                                            }}
                                          >
                                            {row.captive_id?.name || "SFTO-06"}
                                          </div>
                                        )}
                                    </div>
                                  </>
                                )}
                                {column.id === "destination" && (
                                  <div
                                    style={{
                                      fontSize: 12,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    {row.destination_code}
                                    {row.destination_name}
                                  </div>
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
                                        vertical: "bottom",
                                        horizontal: "left",
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
                                      {/* <div
                                        onClick={(e) =>
                                          uploadDailyRakeHandlingSheet(e, row)
                                        }
                                        className="action-popover-wagon"
                                      >
                                        {text("uploadDailyRakeHandlingSheet")}
                                      </div> */}
                                      {/* <div
                                        onClick={(e) =>
                                          uploadWagonSheet(e, row)
                                        }
                                        className="action-popover-wagon"
                                      >
                                        {text("uploadDailyRakeHandlingSheet")}
                                      </div> */}
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
                                          wagonWayBill(e, row);
                                        }}
                                      >
                                        {text("wagonWayBill")}
                                      </div>
                                      <div
                                        onClick={(e) => {
                                          uploadRakeSheet(e, row);
                                        }}
                                        className="action-popover-wagon"
                                      >
                                        {text("rakeHandlingSheet")}
                                      </div>
                                      <div
                                        className="action-popover-wagon"
                                        onClick={(e) => {
                                          assignPlantToWagon(e, row);
                                        }}
                                      >
                                        {text("assignWagonToPlant")}
                                      </div>
                                      <div
                                        className="action-popover-wagon"
                                        onClick={(e) => {
                                          assignHooksToLoadingShop(e, row);
                                        }}
                                      >
                                        {text("assignsHooksToLoadingShop")}
                                      </div>
                                      <div
                                        className="action-popover-wagon"
                                        onClick={(e) => {
                                          wagonTallySheet(e, row);
                                        }}
                                      >
                                        {text("wagonTallySheet")}
                                      </div>
                                      <div
                                        className="action-popover-wagon"
                                        onClick={(e) => {
                                          printableWagonTallySheet(e, row);
                                        }}
                                      >
                                        {text("wagonSheetDetails")}
                                      </div>
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
                                    <div
                                      style={{
                                        fontSize: 10,
                                        textWrap: "nowrap",
                                      }}
                                    >
                                      {row?.plants_assigned.length ? (
                                        <div>
                                          {row?.plants_assigned
                                            .slice(0, 2)
                                            .map((plant: any, index: any) => (
                                              <div key={index}>{plant}</div>
                                            ))}
                                          {row?.plants_assigned.length > 2 && (
                                            <div className="more-plants">
                                              <span
                                                style={{ color: "#AB886D" }}
                                              >
                                                +
                                                {row?.plants_assigned.length -
                                                  2}
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
      {openUploadDailyRakeHandlingSheet && (
        <UploadDailyRakeHandlingSheet
          isClose={setOpenUploadDailyRakeHandlingSheet}
          shipment={UploadDailyRakeHandlingSheetData}
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


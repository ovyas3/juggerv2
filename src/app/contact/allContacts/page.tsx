"use client";
import React, { useEffect, useState, Suspense } from "react";
import Header from "@/components/Header/header";
import MobileHeader from "@/components/Header/mobileHeader";
import { useWindowSize } from "@/utils/hooks";
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsGet, httpsPost } from "@/utils/Communication";
import { useTranslations } from "next-intl";
import { redirect, useRouter, useParams } from "next/navigation";
import service from "@/utils/timeService";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Popover from "@mui/material/Popover";
import { ThreeCircles } from "react-loader-spinner";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import searchIcon from "@/assets/search_wagon.svg";
import Image from "next/image";
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
import "./style.css";

interface Column {
  id: string;
  label: string;
  style: string;
}

const columns: readonly Column[] = [
  { id: "sno", label: "SI No", style: "header_sno" },
  { id: "stationName", label: "Station Name", style: "header_stationName" },
  { id: "stationCode", label: "Station Code", style: "header_stationCode" },
  // { id: "fnr", label: "FNR No", style: "header_fnr" },
  {
    id: "contactPersonRole",
    label: "Contact Person Role",
    style: "header_contactPersonRole",
  },
  { id: "name", label: "Name", style: "header_nameDistinct" },
  { id: "contact", label: "Contact No.", style: "header_contact_no" },
  // { id: "reason", label: "Reason", style: "header_reason" },
  // { id: "comment", label: "Comment", style: "header_comment" },
  // { id: "action", label: "Action", style: "header_action" },
];

function contructingData(shipment: any) {
  return shipment.map(
    (shipment: {
      _id: string;
      rakeShipment: {
        FNR: string;
      };
      stn: {
        name: string;
        code: string;
      };
      role: string;
      name: string;
      ph_no: string;
      avgRating: number;
    }) => {
      return {
        id: shipment?._id ? shipment._id : "--",
        stationName: shipment?.stn.name ? shipment?.stn.name : "--",
        //   fnr: shipment?.rakeShipment.FNR ? shipment?.rakeShipment.FNR : "--",
        contactPersonRole: shipment?.role ? shipment?.role : "--",
        contactPersonName: {
          contactPersonName: shipment?.name ? shipment?.name : "--",
        },
        contact: shipment?.ph_no ? shipment?.ph_no : "--",
        //   reason: shipment?.reason ? shipment?.reason : "--",
        //   comment: shipment?.comment ? shipment?.comment : "--",
        rating: shipment?.avgRating ? shipment?.avgRating : 0,
        //   created_at: shipment?.created_at ? shipment?.created_at : "--",
        //   contactTime:shipment?.contactTime ? shipment?.contactTime : '--',
        stationCode: shipment?.stn.code ? shipment?.stn.code : "--",
      };
    }
  );
}

function AllContacts() {
  return (
    <Suspense fallback={<ThreeCircles />}>
      <AllContactsContext />
    </Suspense>
  );
}

export default AllContacts;

const AllContactsContext = () => {
  const mobile = useWindowSize(500);
  const t = useTranslations("ETADASHBOARD");
  const route = useRouter();
  const [contactList, setContactList] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [showActionBox, setShowActionBox] = React.useState(-1);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [searchCode, setSearchCode] = useState<number | string>(-1);
  const [count, setCount] = useState(0);
  const [distinctContactPayload, setDistinctContactPayload] = useState({
    skip:0,
    limit:10,
  })

  const handleChangePage = (event: unknown, newPage: number) => {setPage(newPage);};

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {setRowsPerPage(+event.target.value);setPage(0);};

  function clickActionBox(
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
    index: number,
    id: string,
    locationId: string
  ) {
    e.stopPropagation();
    setShowActionBox((prevIndex: any) => (prevIndex === index ? -1 : index));
  }
  const handleCloseAction = () => {
    setAnchorEl(null);
    setShowActionBox(-1);
  };

  const getDistinctContacts = async () => {
    const response = await httpsGet(`contact_details/getDistinctContacts?limit=${distinctContactPayload.limit}&skip=${distinctContactPayload.skip}`);
    if (response.statusCode === 200) {
      setContactList(response.data.distinctContacts);
      setCount(response.data.getCount);
    }
  };

  const handleContactDetailsBysearch = async () => {
    if(searchCode === -1 || searchCode === '') return;
    const response = await httpsGet(`contact_details/getDistinctContacts?limit=100&skip=0&stnCode=${searchCode.toString().toLocaleUpperCase()}`);
    if (response.statusCode === 200) {
      setContactList(response.data.distinctContacts);
      setCount(response.data.getCount);
    }
  };

  useEffect(() => {
    getDistinctContacts();
  }, [distinctContactPayload]);

  useEffect(()=>{
    setDistinctContactPayload({limit:rowsPerPage,skip:page*rowsPerPage})
  },[rowsPerPage,page])

  useEffect(()=>{
    if(searchCode === ''){
      setPage(0);
      setRowsPerPage(10);
      setDistinctContactPayload({limit:10,skip:0})
    }
  },[searchCode])

  return (
    <div>
      {mobile ? (
        <Header title={"Contact Details"} isMapHelper={false} />
      ) : (
        <MobileHeader />
      )}

      <div
        className={`content_container_contact ${
          mobile ? "adjustMargin" : "adjustMarginMobile"
        }`}
      >
        <div id="searchContainer">
          <div id="backToAllContacts" onClick={() => route.push("/contact")}>
            <div>
              <ArrowBackIcon style={{ fontSize: 18, marginTop: 4 }} />
            </div>
            <div>All Contacts</div>
          </div>

          <div id="searchBoxAllContacts">
            <Image
              src={searchIcon}
              alt=""
              style={{ cursor: "pointer" }}
              onClick={() => handleContactDetailsBysearch()}
            />
            <input
              id="inputSearch"
              placeholder="search station code"
              onChange={(e) => {
                setSearchCode(e.target.value);
              }}
            />
          </div>
        </div>

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
              display: "flex",
              flexDirection: "column",
              boxShadow: "none",
              height:'calc(100vh - 165px)'
            }}
          >
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={count}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Contacts per page"
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
                  {contructingData(contactList).map(
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
                                  padding: "8px 10px 8px 10px",
                                  fontSize: 10,
                                }}
                              >
                                {typeof value !== "object" && value}
                                {column.id === "sno" && (
                                  <div style={{ fontSize: 12 }}>
                                    {rowIndex + 1 + page * rowsPerPage}.
                                  </div>
                                )}
                                {column.id === "name" && (
                                  <div>
                                    <div>
                                      {row.contactPersonName.contactPersonName}
                                    </div>
                                    <div
                                      style={{
                                        color: "gold",
                                        display: "flex",
                                        gap: 3,
                                        marginTop: 2,
                                        fontSize: 10,
                                        justifyContent: "center",
                                      }}
                                    >
                                      {Array.from(
                                        { length: row.rating },
                                        (_, i) => (
                                          <span key={i}>★</span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                                {/* {column.id === "stationName" && (
                                    <div>
                                      {service.utcToist(
                                        row.contactTime,
                                        "dd-MMM-yy HH:mm"
                                      )}
                                    </div>
                                  )} */}
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
                                        style={{ color: "white", fontSize: 16 }}
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
                                        vertical: 30,
                                        horizontal: -120,
                                      }}
                                    >
                                      <div
                                        className="action-popover-wagon"
                                        onClick={(e) => {}}
                                      >
                                        Rate Again
                                      </div>
                                      {/* <div
                                      className="action-popover-wagon"
                                      onClick={(e) => {}}
                                    >
                                      Delete Contact
                                    </div> */}
                                    </Popover>
                                  </div>
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

      {mobile ? (
        <SideDrawer />
      ) : (
        <div>
          <MobileDrawer />
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { httpsPost } from "@/utils/Communication";
import service from "@/utils/timeService";
import Popover from "@mui/material/Popover";
import { UploadWagonSheet } from "@/components/Table/tableComp";
import { UploadDailyRakeHandlingSheet } from "@/components/Table/tableComp";
import { useTranslations } from "next-intl";
import {
  MarkPlacement,
  AddIndentNumber,
  AssignToMill,
} from "@/app/inPlantDashboard/actionComponents";
import captiveRakeIndicator from "@/assets/captive_rakes.svg";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";
import { redirect, useRouter, useParams } from "next/navigation";
import { ThreeCircles } from "react-loader-spinner";
import uploadIcon from "@/assets/uploadIcon.svg";
import Tooltip from "@mui/material/Tooltip";
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
import EditContact from './contactOptions/EditContact'
import DeleteContacts from './contactOptions/DeleteContacts'

interface Column {
  id: string;
  label: string;
  style: string;
}
const columns: readonly Column[] = [
  { id: "sno", label: "SI No", style: "header_sno" },
  { id: "stationName", label: "Station Name", style: "header_stationName" },
  { id: "stationCode", label: "Station Code", style: "header_stationCode" },
  { id: "fnr", label: "FNR No", style: "header_fnr" },
  {
    id: "contactPersonRole",
    label: "Contact Person Role",
    style: "header_contactPersonRole",
  },
  { id: "name", label: "Name", style: "headerContact_name" },
  { id: "contact", label: "Contact No.", style: "header_contact_no" },
  { id: "reason", label: "Reason", style: "header_reason" },
  { id: "comment", label: "Comment", style: "header_comment" },
  { id: "action", label: "Action", style: "header_action" },
];

function contructingData(shipment: any) {
  return shipment.map(
    (shipment: {
      _id: string;
      rakeShipment: {
        FNR:string
      };
      stnName: {
        name:string;
        code:string;
      };
      reason: string;
      role: string;
      name: string;
      mobile: string;
      comment: string;
      rating: number;
    }) => {
      return {
        id: shipment?._id ? shipment?._id : '--',
        stationName: shipment?.stnName?.name
          ? shipment?.stnName?.name
          : "--",
        fnr: shipment?.rakeShipment?.FNR ? shipment?.rakeShipment?.FNR : "--",
        contactPersonRole: shipment?.role
          ? shipment?.role
          : "--",
        contactPersonName: {
          contactPersonName: shipment?.name
            ? shipment?.name
            : "--",
        },
        contact: shipment?.mobile
          ? shipment?.mobile
          : "--",
        reason: shipment?.reason ? shipment?.reason : "--",
        comment: shipment?.comment ? shipment?.comment : "--",
        rating: shipment?.rating ? shipment?.rating : 0,
        stationCode: shipment?.stnName?.code ? shipment?.stnName?.code : "--",
      };
    }
  );
}

const ContactTable = ({ contactDetails, getContactDetails, setContactDetailsPayload, contactCount }: any) => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [showActionBox, setShowActionBox] = React.useState(-1);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const [openEditModel, setOpenEditModel] = useState(false);
  const [editContact, setEditContact] = useState({})

  const [openDeleteModel, setOpenDeleteModel] = useState(false);
  const [deleteContact, setDeleteContact] = useState({});

  function clickActionBox(
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
    index: number,
    id: string,
    locationId: string
  ) {
    e.stopPropagation();
    setShowActionBox((prevIndex: any) => (prevIndex === index ? -1 : index));
  }

  const handleChangePage = (event: unknown, newPage: number) => {setPage(newPage);};

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {setRowsPerPage(+event.target.value);setPage(0);};

  const handleCloseAction = () => {
    setAnchorEl(null);
    setShowActionBox(-1);
  };

  useEffect(()=>{
    setContactDetailsPayload((prev:any)=>{
      const newState = {...prev};
      newState.skip = page * rowsPerPage;
      newState.limit = rowsPerPage;
      return newState
    })
  },[rowsPerPage,page])

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 236px)",
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={contactCount}
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
                      fontSize: 12,
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
              {contructingData(contactDetails).map(
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
                              padding: "8px 0px 8px 0px",
                              fontSize: 12,
                            }}
                          >
                            {typeof value !== "object" && value}
                            {column.id === "sno" && (
                              <div style={{ fontSize: 12 }}>
                                {rowIndex + 1 + page * rowsPerPage}.
                              </div>
                            )}
                            {column.id === "name" && (
                              <div style={{ textAlign: "left" }}>
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
                                    showActionBox === rowIndex ? true : false
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
                                    onClick={(e) => {
                                      setOpenEditModel(true)
                                      setEditContact(row)
                                      setAnchorEl(null);
                                      setShowActionBox(-1);
                                    }}
                                  >
                                    Edit Contact
                                  </div>
                                  <div
                                    className="action-popover-wagon"
                                    onClick={(e) => {
                                      setOpenDeleteModel(true);
                                      setDeleteContact(row);
                                      setAnchorEl(null);
                                      setShowActionBox(-1);
                                    }}
                                  >
                                    Delete Contact
                                  </div>
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
      {openEditModel &&  <EditContact contact={editContact} isClose={setOpenEditModel} getContactDetails={getContactDetails} ></EditContact> }
      {openDeleteModel && <DeleteContacts contact={deleteContact} isClose={setOpenDeleteModel} getContactDetails={getContactDetails}/>}
    </div>
  );
};
export default ContactTable;

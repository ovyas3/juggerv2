import { useEffect, useState, useRef } from "react";
import React from "react";

import Checkbox from "@mui/material/Checkbox";
import { useCallback } from "react";
// import './table.css'
import service from "@/utils/timeService";
import trash from "@/assets/trash_icon.png";

import { useTranslations } from "next-intl";

import TextField from "@mui/material/TextField";

import { ClickAwayListener, Popper, Tooltip } from "@mui/material";
import Button from "@mui/material/Button";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { httpsPost, httpsGet } from "@/utils/Communication";
import {
  UPDATE_RAKE_CAPTIVE_ID,
  REMARKS_UPDATE_ID,
  FETCH_TRACK_DETAILS,
  UPDATE_ELD,
  GET_HANDLING_AGENT_LIST,
  UPDATE_DELIVER_STATUS_WITH_REMARK,
} from "@/utils/helper";
import CloseIcon from "@mui/icons-material/Close";
import { MenuItem } from "@mui/material";
import "./style.css";

import {
  sortArray,
  separateLatestObject,
  calculateDaysDifference,
  getColorCode,
  getUniqueValues,
} from "@/utils/hooks";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Popover from "@mui/material/Popover";
import { Typography } from "@mui/material";
import { useSnackbar } from "@/hooks/snackBar";
import ListSubheader from "@mui/material/ListSubheader";
import FormControl from "@mui/material/FormControl";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import RvHookupIcon from "@mui/icons-material/RvHookup";
import Autocomplete from "@mui/material/Autocomplete";

import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import ListItemText from "@mui/material/ListItemText";

import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import { useRouter } from "next/navigation";
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded";
import CircularProgress from "@mui/material/CircularProgress";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EastIcon from "@mui/icons-material/East";
import WestIcon from "@mui/icons-material/West";

import CustomMultiSelect from "../UI/CustomMultiSelect/CustomMultiSelect";
import CustomDateTimePicker from "../UI/CustomDateTimePicker/CustomDateTimePicker";

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

export const RemarksInbound = ({
  shipmentId,
  setOpen,
  remarksList,
  getAllShipment,
}: any) => {

  const router = useRouter();
  const [others, setOthers] = useState("");
  const t = useTranslations("ORDERS");
  const placeholder = "Select a remark";
  const [remarks, setRemarks] = useState(placeholder);
  const [openRemarks, setOpenRemarks] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { showMessage } = useSnackbar();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const handleRemarkSelect = (remark: string) => {
    setRemarks(remark);
    setOpenRemarks(false);
  };

  function handleOthers(e: React.ChangeEvent<HTMLInputElement>) {
    setOthers(e.target.value);
  }

  function handleSubmit(e: React.MouseEvent) {
    e.stopPropagation();
    setOpen(false);
    setOpenRemarks(false);

    if (remarks === placeholder) {
      showMessage("Please select a remark", "error");
      return;
    }

    const remarkObject = {
      id: shipmentId,
      remarks: [
        {
          date: service.getEpoch(new Date()),
          remark: remarks === "Others" ? others : remarks,
        },
      ],
    };

    async function remake_update_By_Id(payload: object, router: any) {
      const response = await httpsPost(REMARKS_UPDATE_ID, payload, router);
      return response;
    }

    const response = remake_update_By_Id(remarkObject, router);
    response
      .then((res: any) => {
        if (res.statusCode === 200) {
          showMessage("Remark Updated", "success");
          getAllShipment();
        }
      })
      .catch((err) => {
        console.log(err);
      });

    setRemarks(placeholder);
    setOthers("");
  }
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setOpenRemarks(true);
  };

  const handleClose = (e: any) => {
    e.stopPropagation();
    setOpenRemarks(false);
  };
  return (
    <div
      style={{
        position: "fixed",
        zIndex: 999,
        top: 0,
        left: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
      }}
      onClick={(e) => {
        setOpen(false);
      }}
    >
      <div
        style={{
          minWidth: 602,
          backgroundColor: "white",
          borderRadius: 12,
          padding: 24,
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div style={{ color: '#131722', fontSize: 20, fontWeight: 500, marginBottom: '36px' }}>Remarks</div>
            <div style={{ color: '#42454E', fontSize: 12 }}>Select Remarks</div>


            <div style={{ position: 'relative' }}>
                <FormControl fullWidth >
                    <Select
                        labelId="remarks-select-label"
                        id="remarks-select"
                        value={remarks}
                        onClick={(e) => handleClick(e)}
                        open={false}
                        sx={{
                            height: 36,
                            fontSize: 14,
                            outline: 'none'
                        }}
                    >
                        <MenuItem value={remarks}>
                            {remarks}
                        </MenuItem>
                    </Select>
                </FormControl>

                <Popper
                    open={openRemarks}
                    anchorEl={anchorEl}
                    placement="bottom-start"
                    style={{ zIndex: 1300, width: 'calc(30vw - 48px)', minWidth: '272px' }}
                >
                    <ClickAwayListener onClickAway={(e) => handleClose(e)}>
                        <Paper style={{ maxHeight: 300, overflow: 'auto' }}>
                            {remarksList && Object.entries(remarksList)?.map(([category, options]:any) => [
                                <ListSubheader key={category}>{category}</ListSubheader>,
                                ...options?.map((option: string, index: number) => (
                                    <MenuItem
                                        key={`${category}-${index}`}
                                        onClick={(e) => { handleRemarkSelect(option); handleClose(e); }}
                                    >
                                        {option}
                                    </MenuItem>
                                ))
                            ])}
                        </Paper>
                    </ClickAwayListener>
                </Popper>

                {remarks === 'Others' && (
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Other Reason"
                        variant="outlined"
                        value={others}
                        onChange={handleOthers}
                    />
                )}

                <div style={{ marginTop: 64, display: 'flex', justifyContent: 'end' }}>
                    <Button
                        variant="contained"
                        size='small'
                        color="secondary"
                        style={{ textTransform: 'none', backgroundColor: '#3351FF' }}
                        onClick={handleSubmit}
                    >
                        {t('submit')}
                    </Button>
                </div>
            </div>
            <div
                style={{
                    height: '32px',
                    width: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    position: 'absolute',
                    top: -40,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    zIndex: 999,
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.5s ease-in-out',
                    transform: `rotate(${isHovered ? 90 : 0}deg)`
                }}
                onClick={(e) => { e.stopPropagation() }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <CloseIcon
                    onClick={(e) => { e.stopPropagation(); setOpen(false) }}
                />
            </div>
      </div>
    </div>
  );
};

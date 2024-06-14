"use client";

import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import CloseButtonIcon from "@/assets/close_icon.svg";
import Image from "next/image";
import "./popup.css";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Box } from "@mui/material";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const data = [
  {
    title: "No. of Rakes",
    number: "32",
    description: "No.of captive rakes in each scheme",
    subData: [
      {
        subTitle: "SFTO",
        subNumber: "14",
      },
      {
        subTitle: "GPWIS",
        subNumber: "12",
      },
      {
        subTitle: "BFNV",
        subNumber: "06",
      },
    ],
  },
  {
    title: "No. of Wagons",
    number: "1720",
    description: "No.of wagons in each scheme",
    subData: [
      {
        subTitle: "SFTO",
        subNumber: "627",
      },
      {
        subTitle: "GPWIS",
        subNumber: "729",
      },
      {
        subTitle: "BFNV",
        subNumber: "364",
      },
    ],
  },
  {
    title: "No. of Wagons with Remarks",
    number: "79",
    description: "No.of wagon with remarks in each scheme",
    subData: [
      {
        subTitle: "SFTO",
        subNumber: "29",
      },
      {
        subTitle: "GPWIS",
        subNumber: "30",
      },
      {
        subTitle: "BFNV",
        subNumber: "20",
      },
    ],
  },
];

const childData = [
  {
    title: "Rake ID",
    number: "18013109984",
  },
  {
    title: "No. of Wagons",
    number: "44",
  },
  {
    title: "Scheme Type",
    number: "GPWIS",
  },
];

export const Popup = () => {
  const [open, setOpen] = useState(true);
  const [childOpen, setChildOpen] = useState(false);
  const [schemeType, setSchemeType] = useState("");
  const [wagonType, setWagonType] = useState("");

  const handleSchemeTypeChange = (event: SelectChangeEvent) => {
    setSchemeType(event.target.value);
  };

  const handleWagonTypeChange = (event: SelectChangeEvent) => {
    setWagonType(event.target.value);
  };

  useEffect(() => {
    console.log(schemeType);
    console.log(wagonType);
  }, [schemeType, wagonType]);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleChildClickOpen = () => {
    console.log("child clicked");
    setChildOpen(true);
  };

  const handleChildClose = () => {
    setChildOpen(false);
  };

  const DialogComponent = () =>
    data.map((item, index) => (
      <div className="upper-containers" key={index}>
        <DialogContent>
          <p className="title">{item.title}</p>
          <p className="number">{item.number}</p>
        </DialogContent>
        {item.description && <p className="description">{item.description}</p>}
        <div className="row">
          {item.subData.map((subItem, subIndex) => (
            <DialogContent key={subIndex}>
              <p className="sub-title">{subItem.subTitle}</p>
              <p className="sub-number-top">{subItem.subNumber}</p>
            </DialogContent>
          ))}
        </div>
      </div>
    ));

  const TableComponent = () => (
    <TableContainer
      component={Paper}
      sx={{
        border: "1px solid #DFE3EB",
        borderRadius: "12px",
        height: "350px",
      }}
    >
      <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
        <TableHeadComponent />
        <TableBody>
          <TableRowComponent />
          <TableRowComponent />
          <TableRowComponent />
          <TableRowComponent />
          <TableRowComponent />
          <TableRowComponent />
          <TableRowComponent />
          <TableRowComponent />
          <TableRowComponent />
          <TableRowComponent />
          <TableRowComponent />
          <TableRowComponent />
          <TableRowComponent />
          <TableRowComponent />
          <TableRowComponent />
          <TableRowComponent />
        </TableBody>
      </Table>
    </TableContainer>
  );

  const TableHeadComponent = () => (
    <TableHead>
      <TableRow>
        <TableCell align="left" className="table-columns">
          <TextField
            id="outlined-basic"
            label="Rake ID"
            variant="outlined"
            InputLabelProps={{
              classes: {
                root: "my-label-class",
              },
            }}
          />
        </TableCell>
        <TableCell align="left" className="table-columns">
          <div className="select-container">
            <FormControl>
              <InputLabel id="demo-simple-select-label">Scheme Type</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={schemeType}
                label="Scheme Type"
                onChange={handleSchemeTypeChange}
              >
                <MenuItem value={"SFTO"}>SFTO</MenuItem>
                <MenuItem value={"GPWIS"}>GPWIS</MenuItem>
                <MenuItem value={"BFNV"}>BFNV</MenuItem>
              </Select>
            </FormControl>
          </div>
        </TableCell>
        <TableCell align="left" className="table-columns">
          No.of Wagons
        </TableCell>
        <TableCell align="left" className="table-columns">
          Date Of Commissioning
        </TableCell>
        <TableCell align="left" className="table-columns">
          ROH Done
        </TableCell>
        <TableCell align="left" className="table-columns">
          ROH Due
        </TableCell>
        <TableCell align="left" className="table-columns">
          POH Done
        </TableCell>
        <TableCell align="left" className="table-columns">
          POH Due
        </TableCell>
      </TableRow>
    </TableHead>
  );

  const TableRowComponent = () => (
    <TableRow
      key={1}
      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
      className="table-rows-container"
      onClick={handleChildClickOpen}
    >
      <TableCell align="center" className="table-rows">
        18013109984
      </TableCell>
      <TableCell align="center" className="table-rows">
        GPWIS
      </TableCell>
      <TableCell align="center" className="table-rows">
        44
      </TableCell>
      <TableCell align="left" className="table-rows">
        31/12/2022
      </TableCell>
      <TableCell align="left" className="table-rows">
        31/12/2022
      </TableCell>
      <TableCell align="left" className="table-rows">
        Dec 24
      </TableCell>
      <TableCell align="left" className="table-rows">
        N/A
      </TableCell>
      <TableCell align="left" className="table-rows">
        Dec 24
      </TableCell>
    </TableRow>
  );

  const ChildDialogComponent = () =>
    childData.map((item, index) => (
      <div className="child-upper-containers" key={index}>
        <DialogContent>
          <p className="title">{item.title}</p>
          <p className="number">{item.number}</p>
        </DialogContent>
      </div>
    ));

  const ChildTableHeadComponent = () => (
    <TableHead>
      <TableRow>
        <TableCell align="left" className="table-columns">
          <TextField
            id="outlined-basic"
            label="Wagon No."
            variant="outlined"
            className="rake-search"
            InputLabelProps={{
              classes: {
                root: "my-label-class",
              },
            }}
          />
        </TableCell>
        <TableCell align="left" className="table-columns">
          <div className="select-container">
            <FormControl>
              <InputLabel id="demo-simple-select-label">Wagon Type</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={wagonType}
                label="Wagon Type"
                onChange={handleWagonTypeChange}
              >
                <MenuItem value={"BRN"}>BRN</MenuItem>
                <MenuItem value={"BFNV"}>BFNV</MenuItem>
              </Select>
            </FormControl>
          </div>
        </TableCell>
        <TableCell align="left" className="table-columns">
          Remarks
        </TableCell>
      </TableRow>
    </TableHead>
  );

  const ChildTableRowComponent = () => (
    <TableRow
      key={1}
      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
      className="table-rows-container"
    >
      <TableCell align="left" className="table-rows">
        18013109984
      </TableCell>
      <TableCell align="left" className="table-rows">
        BRN
      </TableCell>
      <TableCell align="left" className="table-rows">
        N/A
      </TableCell>
    </TableRow>
  );

  const ChildTableComponent = () => (
    <TableContainer
      component={Paper}
      sx={{
        border: "1px solid #DFE3EB",
        borderRadius: "12px",
        height: "540px",
      }}
    >
      <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
        <ChildTableHeadComponent />
        <TableBody>
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
          <ChildTableRowComponent />
        </TableBody>
      </Table>
    </TableContainer>
  );

  const childPopUp = () => (
    <BootstrapDialog
      onClose={handleChildClose}
      className="child-dialog-styles"
      aria-labelledby="customized-dialog-title"
      open={childOpen}
    >
      <div className="child-dialog-container">
        <div
          aria-label="close"
          onClick={handleChildClose}
          className="child-close-icon"
        >
          <Image src={CloseButtonIcon} alt="close" />
        </div>

        <div className="child-upper-container">
          <ChildDialogComponent />
        </div>

        <div className="child-lower-container">
          <ChildTableComponent />
        </div>
      </div>
    </BootstrapDialog>
  );

  return (
    <React.Fragment>
      {/* <Button variant="outlined" onClick={handleClickOpen}>
        Open dialog
      </Button> */}

      {/* <BootstrapDialog
        onClose={handleClose}
        className='dialog-styles'
        aria-labelledby="customized-dialog-title"
        open={open}
      > */}
      <Box sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="dialog-container">
          <div aria-label="close" onClick={handleClose} className="close-icon">
            {/* <Image src={CloseButtonIcon} alt="close" /> */}
          </div>
          <div className="upper-container">
            <DialogComponent />
          </div>
          <div className="lower-conatiner">
            <TableComponent />
          </div>
        </div>
      </Box>
      {/* </BootstrapDialog> */}
      {childPopUp()}
    </React.Fragment>
  );
};

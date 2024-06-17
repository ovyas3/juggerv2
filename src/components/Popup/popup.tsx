"use client";

import React, { useRef, useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import CloseButtonIcon from "@/assets/close_icon.svg";
import TrackingIcon from "@/assets/tracking_icon.svg";
import NonTrackingIcon from "@/assets/non_tracking_icon.svg";
import LinkIcon from "@/assets/link.svg";
import ReturnIcon from "@/assets/return_icon.svg";
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
import Select from "@mui/material/Select";
import { Box } from "@mui/material";
import { httpsGet } from "@/utils/Communication";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const data = [
  // {
  //   title: "No. of Rakes",
  //   number: "32",
  //   description: "No.of captive rakes in each scheme",
  //   subData: [
  //     {
  //       subTitle: "SFTO",
  //       subNumber: "14",
  //     },
  //     {
  //       subTitle: "GPWIS",
  //       subNumber: "12",
  //     },
  //     {
  //       subTitle: "BFNV",
  //       subNumber: "06",
  //     },
  //   ],
  // },
  {
    title: "No. of Wagons",
    number: "1720",
    description: "No.of wagons",
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
    description: "No.of wagon with remarks",
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

// const dummyChildData = [
//   {
//     title: "Rake ID",
//     number: "18013109984",
//   },
//   {
//     title: "No. of Wagons",
//     number: "44",
//   },
//   {
//     title: "Scheme Type",
//     number: "GPWIS",
//   },
// ];

export const Popup = () => {
  const [childOpen, setChildOpen] = useState(false);
  const [parentTableData, setParentTableData] = useState<any>([]);
  const [filteredData, setFilteredData] = useState<any>([]);
  const [schemeType, setSchemeType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [wagonType, setWagonType] = useState('');
  const [searchChildTerm, setSearchChildTerm] = useState('');
  const [childData, setChildData] = useState<any>({});
  const [childTableData, setChildTableData] = useState<any>([]);
  const [childFilteredData, setChildFilteredData] = useState<any>([]);

  // Get data for parent dialog component
  const getDataParentTabele = async () => {
    const res = await httpsGet('all_captive_rakes_details', 0);
    const currentTime = new Date();
    // Create a new array
    const newData = res.map((item : any) => {
      const updatedAt = new Date(item.updated_at);
      const diffInHours = Math.abs(currentTime.getTime() - updatedAt.getTime()) / 36e5; // 36e5 is the number of milliseconds in one hour
      return {
        rake_id: item.rake_id,
        scheme_type: item.scheme,
        no_of_wagons: item.wagons ? item.wagons.length : 0,
        date_of_commissioning: item.commissioned ? new Date(item.commissioned).toLocaleDateString('en-GB') : 'N/A',
        roh_done: item.roh ? new Date(item.roh).toLocaleDateString('en-GB') : 'N/A',
        roh_due: item.roh_due ? new Date(item.roh_due).toLocaleDateString('en-GB') : 'N/A',
        poh_done: item.poh ? new Date(item.poh).toLocaleDateString('en-GB') : 'N/A',
        poh_due: item.poh_due ? new Date(item.poh_due).toLocaleDateString('en-GB') : 'N/A',
        wagons: item.wagons,
        isTracking: diffInHours < 2 ? true : false,
        diffInHours: diffInHours
      }
    });
    const filteredNewData = newData.filter((item: any, index: number, array: any[]) => {
      return array.findIndex((el) => el.rake_id === item.rake_id) === index && item.rake_id !== undefined;
    });
    console.log(filteredNewData);
    setParentTableData(filteredNewData);
    setFilteredData(filteredNewData);

    const dialogData = [
      {
       title: "No. of Rakes",
       number: filteredNewData ? filteredNewData.length : 0,
       description: "No.of captive rakes in each scheme",
       subData: [
        {
          subTitle: "SFTO",
          subNumber: filteredNewData ? filteredNewData.filter((item: any) => item.scheme_type === 'SFTO').length : 0,
        },
        {
          subTitle: "GPWIS",
          subNumber: filteredNewData ? filteredNewData.filter((item: any) => item.scheme_type === 'GPWIS').length : 0,
        },
        {
          subTitle: "BFNV",
          subNumber: filteredNewData ? filteredNewData.filter((item: any) => item.scheme_type === 'BFNV').length : 0,
        },
      ],
      },
      {
        title: "No. of Wagons",
        number: filteredNewData ? filteredNewData.reduce((acc: number, item: any) => acc + item.no_of_wagons, 0) : 0,
        description: "No.of wagons",
        subData: [
          {
            subTitle: "SFTO",
            subNumber: filteredNewData ? filteredNewData.filter((item: any) => item.scheme_type === 'SFTO').reduce((acc: number, item: any) => acc + item.no_of_wagons, 0) : 0,
          },
          {
            subTitle: "GPWIS",
            subNumber: filteredNewData ? filteredNewData.filter((item: any) => item.scheme_type === 'GPWIS').reduce((acc: number, item: any) => acc + item.no_of_wagons, 0) : 0,
          },
          {
            subTitle: "BFNV",
            subNumber: filteredNewData ? filteredNewData.filter((item: any) => item.scheme_type === 'BFNV').reduce((acc: number, item: any) => acc + item.no_of_wagons, 0) : 0,
          },
        ],
      },
    ];
  }

  useEffect(() => {
    getDataParentTabele();
  }, []);

  const handleFilterChange = (newSearchTerm = searchTerm, newSchemeType = schemeType) => {
    const filteredBySearchTerm = newSearchTerm
      ? parentTableData.filter((item: any) =>
          item.rake_id.toLowerCase().includes(newSearchTerm.toLowerCase())
        )
      : parentTableData;

    const finalFilteredData = (newSchemeType === 'ALL' || !newSchemeType)
      ? filteredBySearchTerm
      : filteredBySearchTerm.filter((item: any) => item.scheme_type === newSchemeType);

    setFilteredData(finalFilteredData);
  };

  const handleSearchChange = (event: any) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    handleFilterChange(newSearchTerm, schemeType);
  };

  const handleSchemeTypeChange = (event: any) => {
    const selectedSchemeType = event.target.value;
    setSchemeType(selectedSchemeType);
    handleFilterChange(searchTerm, selectedSchemeType);
  };

  // Open and close state for parent dialog
  // const handleClickOpen = () => {
  //   setOpen(true);
  // };
  // const handleClose = () => {
  //   setOpen(false);
  // };

  // Child Data handling

  // Open and close state for child dialog
  const handleChildClickOpen = (item: any) => {
    const newChildUpperData = {
      rake_id: item.rake_id,
      scheme_type: item.scheme_type,
      no_of_wagons: item.no_of_wagons
    };
    const newChildLowerData = item.wagons.map((wagon: any, index: number) => (
      {
        wagon_no: wagon.wg_no,
        wagon_type: wagon.wagon_type ? wagon.wagon_type.name : 'N/A',
        remark: wagon.remark ? wagon.remark : 'N/A'
      }
    ));
    setChildData(newChildUpperData);
    setChildTableData(newChildLowerData);
    setChildFilteredData(newChildLowerData);
    setChildOpen(true);
  }

  const handleChildClose = () => {
    setChildOpen(false);
  }

  const handleChildFilterChange = (newSearchChildTerm = searchChildTerm, newWagonType = wagonType) => {
    console.log(newSearchChildTerm, newWagonType, childTableData, childFilteredData);
    const filteredBySearchTerm = newSearchChildTerm
      ? childTableData.filter((item: any) =>
          item.wagon_no.toLowerCase().includes(newSearchChildTerm.toLowerCase())
        )
      : childTableData;

    const finalFilteredData = (newWagonType === "ALL" || !newWagonType)
      ? filteredBySearchTerm
      : filteredBySearchTerm.filter((item: any) => item.wagon_type === newWagonType);

    setChildFilteredData(finalFilteredData);
    console.log(finalFilteredData);
  };

  const handleChildSearchChange = (event: any) => {
    const newSearchTerm = event.target.value;
    setSearchChildTerm(newSearchTerm);
    handleChildFilterChange(newSearchTerm, wagonType);
  };

  const handleWagonTypeChange = (event: any) => {
    const selectedWagonType = event.target.value;
    setWagonType(selectedWagonType);
    handleChildFilterChange(searchChildTerm, selectedWagonType);
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
        </TableBody>
      </Table>
    </TableContainer>
  );

  const TableHeadComponent = () => {

    const inputRef = useRef<any>(null);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);
  
     return (
      <TableHead>
        <TableRow>
          <TableCell align="left" className="table-columns">
            <TextField
              inputRef={inputRef}
              id="outlined-basic"
              label="Rake ID"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange} 
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
                  <MenuItem value={"ALL"}>ALL</MenuItem>
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
  }

  const TableRowComponent = () => (
    filteredData.map((item: any) => (
      <TableRow
        key={item.rake_id}
        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
        className='table-rows-container'
        onClick={() => handleChildClickOpen(item)}>
         <TableCell align="left" className='table-rows'>
          <p className="rake-id">{item.rake_id}</p>
          {item.isTracking ? <Image src={TrackingIcon} alt="tracking"/>: <Image src={NonTrackingIcon} alt="tracking"/>}
        </TableCell>
         <TableCell align="center" className='table-rows'>{item.scheme_type}</TableCell>
         <TableCell align="center" className='table-rows'>{item.no_of_wagons}</TableCell>
         <TableCell align="left" className='table-rows'>{item.date_of_commissioning}</TableCell>
         <TableCell align="left" className='table-rows'>{item.roh_done}</TableCell>
         <TableCell align="left" className='table-rows'>{item.roh_due}</TableCell>
         <TableCell align="left" className='table-rows'>{item.poh_done}</TableCell>
         <TableCell align="left" className='table-rows'>{item.poh_due}</TableCell>
      </TableRow>
      ))
  );

  const ChildDialogComponent = () => (
    childData && (
      <div className="child-upper-containers" key={childData.rake_id}>
      <DialogContent>
        <p className="title">Rake ID</p>
        <p className="number">{childData.rake_id}</p>
      </DialogContent>
      <DialogContent>
        <p className="title">No. of Wagons</p>
        <p className="number">{childData.no_of_wagons}</p>
      </DialogContent>
      <DialogContent>
        <p className="title">Scheme Type</p>
        <p className="number">{childData.scheme_type}</p>
      </DialogContent>
    </div>
    )
  );

  const ChildTableHeadComponent = () => {
    const inputRef = useRef<any>(null);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);

    return (
      <TableHead>
        <TableRow>
          <TableCell align="left" className="table-columns">
            <TextField
              inputRef={inputRef}
              id="outlined-basic"
              label="Wagon No."
              variant="outlined"
              value={searchChildTerm}
              onChange={handleChildSearchChange}
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
                  <MenuItem value={"ALL"}>ALL</MenuItem>
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
  }

  const ChildTableRowComponent = () => (
    childFilteredData.map((item: any) => (
      <TableRow
        key={item.wagon_no}
        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
        className='table-rows-container'
      >
        <TableCell align="left" className='table-rows'>
          <p>{item.wagon_no}</p>
          <Image src={LinkIcon} alt="link"/>
        </TableCell>
        <TableCell align="left" className='table-rows'>BRN</TableCell>
        <TableCell align="left" className='table-rows'>{item.remark}</TableCell>
      </TableRow>
    ))
  );


  const ChildTableComponent = () => (
    <TableContainer
      component={Paper}
      sx={{
        border: "1px solid #DFE3EB",
        borderRadius: "12px",
        height: "500px",
      }}
    >
      <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
        <ChildTableHeadComponent />
        <TableBody>
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
          <Image src={ReturnIcon} alt="close" />
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
          {/* <div aria-label="close" onClick={handleClose} className="close-icon">
            <Image src={CloseButtonIcon} alt="close" /> 
          </div> */}
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

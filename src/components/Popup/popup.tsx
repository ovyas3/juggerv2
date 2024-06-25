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
import { styled as muiStyled } from '@mui/material/styles';
import { title } from "process";
import service from "@/utils/timeService";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

interface PopupProps {
  data: any;
}

export const Popup: React.FC<PopupProps> = ({ data }) => {
  const [childOpen, setChildOpen] = useState(false);
  const [parentTableData, setParentTableData] = useState<any>([]);
  const [filteredData, setFilteredData] = useState<any>([]);
  const [schemeType, setSchemeType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [wagonType, setWagonType] = useState<any>('');
  const [showWagonTypes, setShowWagonTypes] = useState(false);
  const [searchChildTerm, setSearchChildTerm] = useState('');
  const [childData, setChildData] = useState<any>({});
  const [childTableData, setChildTableData] = useState<any>([]);
  const [childFilteredData, setChildFilteredData] = useState<any>([]);
  // const [dialogDatas, setDialogDatas] = useState<any>([]);

  const CustomTextField = muiStyled(TextField)(({ theme }) => ({
    '& .MuiInputLabel-root': {
      transition: 'transform 0.2s ease-out, color 0.2s ease-out',
      fontSize: '12px !important',
      color: '#42454E !important',
      fontWeight: '600 !important',
      fontFamily: '"Inter", sans-serif !important',
      position: 'absolute !important',
      left: '0px !important',
      top: '-11px !important',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      transform: 'translateY(5px) !important',
      fontSize: '10px !important',
      color: '#454545 !important',
      position: 'absolute !important',
      left: '14px !important',
      lineHeight: '1em !important',
      letterSpacing: '0.00938em !important',
    },
    '& .MuiInputLabel-root.MuiInputLabel-shrink':{
      transform: 'translateY(5px) !important',
      fontSize: '10px !important',
      color: '#454545 !important',
      position: 'absolute !important',
      left: '14px !important',
      lineHeight: '1em !im portant',
      letterSpacing: '0.00938em !important',
    }
  }));

  
  // Get data for parent dialog component
  const getDataParentTabele = async () => {
    setSearchTerm('');
    setSchemeType('');
    const currentTime = new Date();
    const newData = data && data.map((item : any) => {
      const updatedAt = new Date(item.updated_at);
      const diffInHours = Math.abs(currentTime.getTime() - updatedAt.getTime()) / 36e5; // 36e5 is the number of milliseconds in one hour
      return {
        _id: item._id,  
        rake_id: item.rake_id,
        scheme_type: item.scheme,
        no_of_wagons: item.no_of_wagons ? item.no_of_wagons : 0,
        date_of_commissioning: item.commissioned ? service.utcToist(item.commissioned, 'dd/MM/yyyy') : 'N/A',
        roh_done: item.roh ? service.utcToist(item.roh, 'dd/MM/yyyy') : 'N/A',
        roh_due: item.roh_due ? service.utcToist(item.roh_due, 'dd/MM/yyyy') : 'N/A',
        poh_done: item.poh ? service.utcToist(item.poh, 'dd/MM/yyyy') : 'N/A',
        poh_due: item.poh_due ? service.utcToist(item.poh_due, 'dd/MM/yyyy') : 'N/A',
        isTracking: item.is_tracking ? item.is_tracking : false
      }
    });
    const filteredNewData = newData.filter((item: any, index: number, array: any[]) => {
      return array.findIndex((el) => el.rake_id === item.rake_id) === index && item.rake_id !== undefined;
    });

    setParentTableData(filteredNewData);
    setFilteredData(filteredNewData);

   

    // setDialogDatas(dialogData);
  }

  const getWagonTypes = async () => {
    const res = await httpsGet('wagon_type/get/all_wagon_type', 0);
    const wagonType = res && res.data && res.data.map((item: any) => item.name);
    setShowWagonTypes(wagonType);
  }

  useEffect(() => {
    getWagonTypes();
  }, []);

  useEffect(() => {
    getDataParentTabele();
  }, [data]);

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

  // Open and close state for child dialog
  const handleChildClickOpen = async (item: any) => {
    setSearchChildTerm('');
    setWagonType('');
    const newChildUpperData = {
      _id: item._id,
      rake_id: item.rake_id,
      scheme_type: item.scheme_type,
      no_of_wagons: item.no_of_wagons
    };
    const res = await httpsGet(`get_all_wagon_details?rakeId=${newChildUpperData._id}`, 0);
    const newChildLowerData = res && res.map((item: any) => {
      return {
        wagon_no: item.wg_no,
        wagon_type: item.wagon_type ? item.wagon_type.name : '',
        remark: item.remark ? item.remark : 'N/A'
      }
    });
    const filteredNewChildData = newChildLowerData.filter((item: any, index: number, array: any[]) => {
      return array.findIndex((el) => el.wagon_no === item.wagon_no) === index && item.wagon_no !== undefined;
    }
    );
    setChildData(newChildUpperData);
    setChildTableData(filteredNewChildData);
    setChildFilteredData(filteredNewChildData);
    setChildOpen(true);
  }

  const handleChildClose = () => {
    setChildOpen(false);
    setChildFilteredData([]);
    setSearchChildTerm('');
    setWagonType('');
  }

  const handleChildFilterChange = (newSearchChildTerm = searchChildTerm, newWagonType = wagonType) => {
    const filteredBySearchTerm = newSearchChildTerm
      ? childTableData.filter((item: any) =>
          item.wagon_no.toLowerCase().includes(newSearchChildTerm.toLowerCase())
        )
      : childTableData;

    const finalFilteredData = (newWagonType === "ALL" || !newWagonType)
      ? filteredBySearchTerm
      : filteredBySearchTerm.filter((item: any) => item.wagon_type === newWagonType);

    setChildFilteredData(finalFilteredData);
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

  const TableComponent = () => (
    <TableContainer
      component={Paper}
    >
      <Table aria-label="simple table" stickyHeader>
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
      if (inputRef.current && searchTerm !== '') {
        inputRef.current.focus();
      }
    }, [searchTerm]);
  
     return (
      <TableHead>
        <TableRow>
          <TableCell align="left" className="table-columns">
            S.No
          </TableCell>
          <TableCell align="left" className="table-columns">
          <CustomTextField
            inputRef={inputRef}
            label="Rake ID"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          </TableCell>
          <TableCell align="left" className="table-columns">
            <div className="select-container">
              <FormControl>
                <InputLabel id="demo-customized-select-label"
                sx={{
                  fontSize: '12px !important',
                  color: '#42454E !important',
                  fontWeight: '600 !important',
                  fontFamily: '"Inter", sans-serif !important',
                  position: 'absolute !important',
                  left: '0px !important',
                  top: '-11px !important',
                  transition: 'transform 0.2s ease-out, color 0.2s ease-out !important',
                  '&.Mui-focused': {
                    transform: 'translateY(5px) !important',
                    fontSize: '10px !important',
                    color: '#454545 !important',
                    lineHeight: '1em !important',
                    letterSpacing: '0.00938em !important',
                    position: 'absolute !important',
                    left: '14px !important',
                  },
                  '&.MuiInputLabel-shrink': {
                    transform: 'translateY(5px) !important',
                    fontSize: '10px !important',
                    color: '#454545 !important',
                    lineHeight: '1em !important',
                    letterSpacing: '0.00938em !important',
                    position: 'absolute !important',
                    left: '14px !important',
                }
                }}>Scheme Type</InputLabel>
                <Select
                  labelId="demo-customized-select-label"
                  id="demo-customized-select"
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
    filteredData.map((item: any, index: number) => (
      <TableRow
        key={item.rake_id}
        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
        className='table-rows-container'
        onClick={() => handleChildClickOpen(item)}>
        <TableCell align="left" className='table-rows' style={{paddingLeft: '24px'}}>{index + 1}.</TableCell>
         <TableCell align="left" className='table-rows'>
          <p className="rake-id">{item.rake_id}</p>
          {item.isTracking ? <Image src={TrackingIcon} alt="tracking"/>: <Image src={NonTrackingIcon} alt="tracking"/>}
        </TableCell>
         <TableCell align="center" className='table-rows'>{item.scheme_type}</TableCell>
         <TableCell align="center" className='table-rows'>{item.no_of_wagons}</TableCell>
         <TableCell align="left" className='table-rows' style={{paddingLeft: '18px'}}>{item.date_of_commissioning}</TableCell>
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
      if (inputRef.current && searchChildTerm !== '') {
        inputRef.current.focus();
      }
    }, [searchChildTerm]);

    return (
      <TableHead>
        <TableRow>
          <TableCell align="left" className="table-columns">
            <CustomTextField
              inputRef={inputRef}
              id="outlined-basic"
              label="Wagon No."
              variant="outlined"
              value={searchChildTerm}
              onChange={handleChildSearchChange}
            />
          </TableCell>
          <TableCell align="left" className="table-columns">
            <div className="select-container">
              <FormControl>
                <InputLabel id="demo-simple-select-label"
                sx={{
                  fontSize: '12px !important',
                  color: '#42454E !important',
                  fontWeight: '600 !important',
                  fontFamily: '"Inter", sans-serif !important',
                  position: 'absolute !important',
                  left: '0px !important',
                  top: '-11px !important',
                  transition: 'transform 0.2s ease-out, color 0.2s ease-out !important',
                  '&.Mui-focused': {
                    transform: 'translateY(5px) !important',
                    fontSize: '10px !important',
                    color: '#454545 !important',
                    lineHeight: '1em !important',
                    letterSpacing: '0.00938em !important',
                    position: 'absolute !important',
                    left: '14px !important',
                  },
                  '&.MuiInputLabel-shrink': {
                    transform: 'translateY(5px) !important',
                    fontSize: '10px !important',
                    color: '#454545 !important',
                    lineHeight: '1em !important',
                    letterSpacing: '0.00938em !important',
                    position: 'absolute !important',
                    left: '14px !important',
                }
                }}>Wagon Type</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={wagonType}
                  label="Wagon Type"
                  onChange={handleWagonTypeChange}
                >
                  <MenuItem value={"ALL"}>ALL</MenuItem>
                  {
                    Array.isArray(showWagonTypes) && showWagonTypes.map((item: any, index: number) => (
                      <MenuItem key={index} value={item}>{item}</MenuItem>
                    ))
                  }
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
    childFilteredData && childFilteredData.map((item: any) => (
      <TableRow
        key={item.wagon_no}
        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
        className='table-rows-container'
      >
        <TableCell align="left" className='table-rows'>
          <p>{item.wagon_no}</p>
          <Image src={LinkIcon} alt="link"/>
        </TableCell>
        <TableCell align="left" className='table-rows'>{item.wagon_type}</TableCell>
        <TableCell align="left" className='table-rows'>{item.remark}</TableCell>
      </TableRow>
    ))
  );


  const ChildTableComponent = () => (
    <TableContainer
      component={Paper}
    >
      <Table aria-label="simple table" stickyHeader>
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
      <Box sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="dialog-container">
          <div className="lower-conatiner">
            <TableComponent />
          </div>
        </div>
      </Box>
      {childPopUp()}
    </React.Fragment>
  );
};

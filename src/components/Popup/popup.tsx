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
import TablePagination from "@mui/material/TablePagination";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Tooltip from "@mui/material/Tooltip";
import { TooltipProps } from "@mui/material/Tooltip";
import Select from "@mui/material/Select";
import { Box, Tab } from "@mui/material";
import { httpsGet, httpsPost } from "@/utils/Communication";
import { styled as muiStyled } from '@mui/material/styles';
import service from "@/utils/timeService";
import { useRouter } from "next/navigation";
import CustomDateTimePicker from '@/components/UI/CustomDateTimePicker/CustomDateTimePicker';
import { useSnackbar } from '@/hooks/snackBar';
import CustomDatePicker from '@/components/UI/CustomDatePicker/CustomDatePicker'
           

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

interface StyledTooltipProps extends TooltipProps {
  className?: string;
}

const CustomTooltip = styled(({ className, ...props }: StyledTooltipProps) => (
  <Tooltip 
    {...props} 
    classes={{ popper: className }} 
    PopperProps={{
      popperOptions: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [14, -10], // Adjust the second value to change the vertical offset
            },
          },
        ],
      },
    }}
  />
))({
  '& .MuiTooltip-tooltip': {
    backgroundColor: '#000',
    color: '#fff',
    width: '80px',
    height: '32px',
    boxShadow: '0px 0px 2px rgba(0,0,0,0.1)',
    fontSize: '8px',
    fontFamily: '"Inter", sans-serif',
  },
  '& .MuiTooltip-arrow': {
    color: '#000',
  },
});

interface PopupProps {
  data: any;
  handleSchemeTypeAndTable:any
}

export const Popup: React.FC<PopupProps> = ({ data, handleSchemeTypeAndTable }) => {
  const rowsPerPageOptions = [5, 10, 25, 50];
  const router = useRouter();
  const [childOpen, setChildOpen] = useState(false);
  const [parentTableData, setParentTableData] = useState<any>([]);
  const [filteredData, setFilteredData] = useState<any>([]);
  const [schemeType, setSchemeType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchRakeName, setSearchRakeName] = useState('')
  const [wagonType, setWagonType] = useState<any>('');
  const [showWagonTypes, setShowWagonTypes] = useState(false);
  const [searchChildTerm, setSearchChildTerm] = useState('');
  const [childData, setChildData] = useState<any>({});
  const [childTableData, setChildTableData] = useState<any>([]);
  const [childFilteredData, setChildFilteredData] = useState<any>([]);
  const [count, setCount] = useState<number>(0);
  const [childFilteredDataCount, setChildFilteredDataCount] = useState<number>(0);
  // const [dialogDatas, setDialogDatas] = useState<any>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(rowsPerPageOptions[0]);

  const [rohDone, setRohDone] = useState<Date | null>(null);
  const [rohDue, setRohDue] = useState('--');

  const [pohDone, setPohDone] = useState<Date | null>(null);
  const [pohDue, setPohDue] = useState('--')

  const [bpcDone, setBpcDone] = useState<Date | null>(null);
  const [bpcDue, setBpcDue] = useState('--')

  const [selectedSchemeTypeForDates, setSelectedSchemeTypeForDates] = useState('');
  const {showMessage} = useSnackbar();

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

  const handleChangePage = (event:any, newPage:number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event:any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get data for parent dialog component
  const getDataParentTabele = async () => {
    setCount(0);
    setPage(0);
    setRowsPerPage(rowsPerPageOptions[0]);
    setSearchTerm('');
    setSearchRakeName('')
    setSchemeType('');
    const currentTime = new Date();
    const newData = data && data.map((item : any) => {
      const updatedAt = new Date(item.updated_at);
      const diffInHours = Math.abs(currentTime.getTime() - updatedAt.getTime()) / 36e5; // 36e5 is the number of milliseconds in one hour
      return {
        _id: item._id,  
        rake_id: item.rake_id,
        scheme_type: item.scheme,
        rake_name: item.name ? item.name : 'N/A',
        no_of_wagons: item.no_of_wagons ? item.no_of_wagons : 0,
        date_of_commissioning: item.commissioned ? service.utcToist(item.commissioned, 'dd/MM/yyyy') : 'N/A',
        roh_done: item.roh ? service.utcToist(item.roh, 'dd/MM/yyyy') : 'N/A',
        roh_due: item.roh_due ? service.utcToist(item.roh_due, 'dd/MM/yyyy') : 'N/A',
        poh_done: item.poh ? service.utcToist(item.poh, 'dd/MM/yyyy') : 'N/A',
        poh_due: item.poh_due ? service.utcToist(item.poh_due, 'dd/MM/yyyy') : 'N/A',
        isTracking: item.is_tracking ? item.is_tracking : false,
        bpc_done: item.bpc ? service.utcToist(item.bpc, 'dd/MM/yyyy') : 'N/A',
        bpc_due: item.bpc_due ? service.utcToist(item.bpc_due, 'dd/MM/yyyy') : 'N/A',
      }
    });
    const filteredNewData = newData.filter((item: any, index: number, array: any[]) => {
      return array.findIndex((el) => el.rake_id === item.rake_id) === index && item.rake_id !== undefined;
    });

    setParentTableData(filteredNewData);
    setFilteredData(filteredNewData);
    const count_data = filteredNewData.length;
    setCount(count_data);
    // setDialogDatas(dialogData);
  }

  const getWagonTypes = async () => {
    const res = await httpsGet('wagon_type/get/all_wagon_type', 0, router);
    const wagonType = res && res.data && res.data.map((item: any) => item.name);
    setShowWagonTypes(wagonType);
  }

  useEffect(() => {
    getWagonTypes();
  }, []);

  useEffect(() => {
    getDataParentTabele();
  }, [data]);

  const handleFilterChange = (newSearchTerm = searchTerm, newSearchRakeName = searchRakeName ,newSchemeType = schemeType) => {
    const filteredByRakeName = newSearchRakeName
    ? parentTableData.filter((item: any) =>
        item.rake_name.toLowerCase().includes(newSearchRakeName.toLowerCase())
      )
    : parentTableData;  

    const filteredBySearchTerm = newSearchTerm
      ? filteredByRakeName.filter((item: any) =>
          item.rake_id.toLowerCase().includes(newSearchTerm.toLowerCase())
        )
      : filteredByRakeName;

    const finalFilteredData = (newSchemeType === 'ALL' || !newSchemeType)
      ? filteredBySearchTerm
      : filteredBySearchTerm.filter((item: any) => item.scheme_type === newSchemeType);

    const count_data = finalFilteredData.length;
    setFilteredData(finalFilteredData);
    setCount(count_data);
  };

  const handleSearchChange = (event: any) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    handleFilterChange(newSearchTerm,searchRakeName,schemeType);
  };

  const handleSearchRakeName = (event: any) => {
    const newSearchRakename = event.target.value;
    setSearchRakeName(newSearchRakename);
    handleFilterChange(searchTerm, newSearchRakename ,schemeType);
  };

  const handleSchemeTypeChange = (event: any) => {
    const selectedSchemeType = event.target.value;
    setSchemeType(selectedSchemeType);
    handleFilterChange(searchTerm, searchRakeName,selectedSchemeType);
  };

  // Open and close state for child dialog
  const handleChildClickOpen = async (item: any) => {
    setSearchChildTerm('');
    setWagonType('');
    setChildFilteredDataCount(0);
    setSelectedSchemeTypeForDates(item.scheme_type);

    setRohDone((prev: any) => {
      const [day, month, year] = item.roh_done?.split("/") || [];
      if (!day || !month || !year) {
        console.error("Invalid roh_done format");
        return null;
      }
      const utcDate = new Date(Date.UTC(+year, +month - 1, +day));
      return utcDate;
    });
    setRohDue(item.roh_due);

    setPohDone((prev:any)=>{
      const [day, month, year] = item.poh_done?.split("/") || [];
      if(!day || !month || !year){
        console.error("Invalid roh_done format");
        return null;
      }
      const utcDate = new Date(Date.UTC(+year, +month - 1, +day));
      return utcDate;
    });
    setPohDue(item.poh_due);

    setBpcDone((prev:any)=>{
      const [day, month, year] = item.bpc_done?.split("/") || [];
      if(!day || !month || !year){
        console.error("Invalid roh_done format");
        return null;
      }
      const utcDate = new Date(Date.UTC(+year, +month - 1, +day));
      return utcDate;
    });
    setBpcDue(item.bpc_due);

    const newChildUpperData = {
      _id: item._id,
      rake_name: item.rake_name ? item.rake_name : 'N/A',
      rake_id: item.rake_id,
      scheme_type: item.scheme_type,
      no_of_wagons: item.no_of_wagons
    };
    const res = await httpsGet(`get_all_wagon_details?rakeId=${newChildUpperData._id}`, 0, router);
    const newChildLowerData = res && res.map((item: any) => {
      return {
        wagon_no: item.wg_no,
        wagon_type: item.wagon_type ? item.wagon_type.name : '',
        remark: item.remark ? item.remark : 'N/A',
        tare_weight: item.wagon_type && item.wagon_type.tare_weight ? item.wagon_type.tare_weight : 'N/A',
        cc_weight: item.wagon_type && item.wagon_type.capacity ? item.wagon_type.capacity : 'N/A',
      }
    });
    const filteredNewChildData = newChildLowerData.filter((item: any, index: number, array: any[]) => {
      return array.findIndex((el) => el.wagon_no === item.wagon_no) === index && item.wagon_no !== undefined;
    }
    );
    const count_data = filteredNewChildData.length;
    setChildData(newChildUpperData);
    setChildTableData(filteredNewChildData);
    setChildFilteredData(filteredNewChildData);
    setChildFilteredDataCount(count_data);
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
    
    const count_data = finalFilteredData.length;

    setChildFilteredData(finalFilteredData);
    setChildFilteredDataCount(count_data);
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
    <Paper sx={{border: 'none !important', overflowX: 'auto !important', boxShadow: 'none !important'}}>
      <TablePagination
      component="div"
      count={count}
      page={page}
      onPageChange={handleChangePage}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      rowsPerPageOptions={rowsPerPageOptions}
      labelRowsPerPage="Rakes per page:"
    />
    <TableContainer
      component={Paper}
      className="table-parent-container"
      >
      <Table aria-label="simple table" stickyHeader>
        <TableHeadComponent />
      <TableBody>
          <TableRowComponent />
        </TableBody>
      </Table>
    </TableContainer>
    </Paper>
  );

  const TableHeadComponent = () => {

    const inputRef = useRef<any>(null);
    const inputRefRakeName = useRef<any>(null);

    useEffect(() => {
      if (inputRef.current && searchTerm !== '') {
        inputRef.current.focus();
      }
    }, [searchTerm]);


    useEffect(() => {
      if (inputRefRakeName.current && searchRakeName !== '') {
        inputRefRakeName.current.focus();
      }
    }, [searchRakeName]);
  
     return (
      <TableHead>
        <TableRow>
          <TableCell align="center" className="table-columns">
            S.No
          </TableCell>
          <TableCell align="left" className="table-columns">
            <CustomTextField
            inputRef={inputRefRakeName}
            label="Rake Name"
            value={searchRakeName}
            onChange={handleSearchRakeName}
          />
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
          <TableCell align="left" className="table-columns">
            BPC Done
          </TableCell>
          <TableCell align="left" className="table-columns">
            BPC Due
          </TableCell>
        </TableRow>
      </TableHead>
    );
  }

  const TableRowComponent = () => (
    filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item: any, index: number) => {
      const serialNumber = page * rowsPerPage + index + 1;
      return  (
        <TableRow
          key={item.rake_id}
          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
          className='table-rows-container'
          onClick={() => handleChildClickOpen(item)}>
          <TableCell align="left" className='table-rows'>{serialNumber}.</TableCell>
          <TableCell align="left" className='table-rows'>{item.rake_name}</TableCell>
           <TableCell align="left" className='table-rows'>
            <p className="rake-id">{item.rake_id}</p>
            {item.isTracking ? <Image src={TrackingIcon} alt="tracking"/>: <Image src={NonTrackingIcon} alt="tracking"/>}
          </TableCell>
           <TableCell align="left" className='table-rows'>{item.scheme_type}</TableCell>
           <TableCell align="left" className='table-rows'>{item.no_of_wagons}</TableCell>
           <TableCell align="left" className='table-rows'>{item.date_of_commissioning}</TableCell>
           <TableCell align="left" className='table-rows'>{item.roh_done}</TableCell>
           <TableCell align="left" className='table-rows'>{item.roh_due}</TableCell>
           <TableCell align="left" className='table-rows'>{item.poh_done}</TableCell>
           <TableCell align="left" className='table-rows'>{item.poh_due}</TableCell>
           <TableCell align="left" className='table-rows'>{item.bpc_done}</TableCell>
           <TableCell align="left" className='table-rows'>{item.bpc_due}</TableCell>
        </TableRow>
        );
    })
  );

  const ChildDialogComponent = () => (
    childData && (
      <div className="child-upper-containers" key={childData.rake_id}>
      {/* <DialogContent>
        <p className="title">Rake Name</p>
        <p className="number">{childData.rake_name}</p>
      </DialogContent> */}
      <DialogContent>
        <p className="title">Rake ID</p>
        <p className="number">{childData.rake_id}</p>
      </DialogContent>
      <DialogContent>
        <p className="title">No. of Wagons</p>
        <p className="number">{childFilteredDataCount}</p>
      </DialogContent>
      <DialogContent>
        <p className="title">Scheme Type</p>
        <p className="number">{childData.scheme_type}</p>
      </DialogContent>
    </div>
    )
  );

  const updateTime = async ({payload}:{payload:any}) => {
    const response = await httpsPost(`edit/cr_dates`,payload);
    if(response.statusCode === 200){
      showMessage('ROH Date Updated', 'success');
      handleSchemeTypeAndTable(payload.type);
    }
  }
  useEffect(()=>{
    if(rohDone !== null && rohDone !== undefined && typeof rohDone !== 'string'){
      let payload = {
        _id:childData._id,
        type:selectedSchemeTypeForDates,
        data:{
          date: rohDone,
          type:'ROH'
        }
      }
      updateTime({payload});
    }
 },[rohDone])

 useEffect(()=>{
  if(pohDone !== null && pohDone !== undefined && typeof pohDone !== 'string'){
    let payload = {
      _id:childData._id,
      type:selectedSchemeTypeForDates,
      data:{
        date: pohDone,
        type:'POH'
      }
    }
    updateTime({payload});
  }
},[pohDone])

useEffect(()=>{
  if(bpcDone !== null && bpcDone !== undefined && typeof bpcDone !== 'string'){
    let payload = {
      _id:childData._id,
      type:selectedSchemeTypeForDates,
      data:{
        date: bpcDone,
        type:'BPC'
      }
    }
    updateTime({payload});
  }
},[bpcDone])

useEffect(()=>{
  data.filter((item: any) => {
    if(item._id === childData._id){
      setRohDue(service.utcToist(item?.roh_due, 'dd/MM/yyyy'));
      setPohDue(service.utcToist(item?.poh_due, 'dd/MM/yyyy'));
      setBpcDue(service.utcToist(item?.bpc_due, 'dd/MM/yyyy'));
    }
  })
},[data])

  const ChildDatePikerComponent = () => {
    return(<div style={{borderTop:'1px solid #E5E5E5', paddingTop:'24px'}}>
      <div style={{display:'flex', paddingInline:'24px' ,justifyContent:'space-between'}}>
     <div>
       <label style={{fontSize:12, }}>ROH Done</label>
       <div style={{width:176, height:36}} onClick={(e)=>e.stopPropagation()}>
       <CustomDatePicker value={typeof rohDone === 'string' ? null : rohDone} onChange={(date:any) => {setRohDone(date);}} label={null} />
       </div>
     </div>

     <div>
       <label style={{fontSize:12, }}>POH Done</label>
       <div style={{width:176, height:36}} onClick={(e)=>e.stopPropagation()}>
       <CustomDatePicker value={typeof pohDone === 'string' ? null : pohDone} onChange={(date:any) => {setPohDone(date);}} label={null} />
       </div>
     </div>

     <div>
       <label style={{fontSize:12, }}>BPC Done</label>
       <div style={{width:176, height:36}} onClick={(e)=>e.stopPropagation()}>
         <CustomDatePicker value={typeof bpcDone === 'string' ? null : bpcDone} onChange={(date:any) => {setBpcDone(date);}} label={null} />
       </div>
     </div>
      </div>
      
      <div style={{display:'flex', paddingInline:'24px' ,justifyContent:'space-between', marginTop:'30px', marginBottom:'16px'}}>
     <div>
       <label style={{fontSize:12, }}>ROH Due</label>
       <div style={{width:176, height:36, fontSize:16}}>{rohDue?.toString() ?? ''}</div>
     </div>

     <div>
       <label style={{fontSize:12, }}>POH Due</label>
       <div style={{width:176, height:36, fontSize:16}}>{pohDue?.toString() ?? ''}</div>
     </div>

     <div>
       <label style={{fontSize:12, }}>BPC Due</label>
       <div style={{width:176, height:36, fontSize:16}}>{bpcDue?.toString() ?? ''}</div>
     </div>
      </div>
   </div>);
    
    };

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
            S.No
          </TableCell>
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
          <TableCell align="left" className="table-columns" sx={{paddingLeft: '0px !important'}}>
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
    childFilteredData && childFilteredData.map((item: any, index: number) => (
      <TableRow
        key={item.wagon_no}
        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
        className='table-rows-container'
      >
        <TableCell align="left" className='table-rows' >{index + 1}.</TableCell>
        <TableCell align="left" className='table-rows'>
          <p>{item.wagon_no}</p>
          <Image src={LinkIcon} alt="link"/>
        </TableCell>
        <TableCell align="left" className='table-rows' style={{cursor: 'pointer'}}>
        <CustomTooltip arrow title={<div style={{display: 'flex', 
                                          flexDirection: 'column', 
                                          justifyContent: 'center',
                                          gap: '2px'
                                          }}>
                                            <p style={{marginTop: '2px'}}>TARE WT: {item.tare_weight}</p>
                                            <p>CC WT: {item.cc_weight}</p>
                              </div>}>
            {item.wagon_type}
        </CustomTooltip>
        </TableCell>
        <TableCell align="left" className='table-rows'>{item.remark}</TableCell>
      </TableRow>
    ))
  );

  const ChildTableComponent = () => (
    <>
    <TableContainer
      component={Paper}
      className="table-child-container"
    >
      <Table aria-label="simple table" stickyHeader>
        <ChildTableHeadComponent />
        <TableBody>
          <ChildTableRowComponent />
        </TableBody>
      </Table>
    </TableContainer>
    </>
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

        <div id='child-middle-container'>
          <ChildDatePikerComponent />
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

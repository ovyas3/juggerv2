"use client"
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { Column } from "@/utils/interface";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Box, Button, IconButton, Input, InputAdornment, InputLabel, Link, MenuItem, Modal, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, styled, useMediaQuery } from "@mui/material";
import ShareIcon from '@mui/icons-material/Share';
import './StationHeader.css';
import FormControl from '@mui/material/FormControl';
import { useSnackbar } from "@/hooks/snackBar";
import CloseButtonIcon from "@/assets/close_icon.svg";
import Image from "next/image";
import PlaceIcon from '@mui/icons-material/Place';
import editIcon from '../../assets/edit_icon.svg';
import Autocomplete from '@mui/material/Autocomplete';
import { httpsGet, httpsPost } from "@/utils/Communication";
import { STATES, STATIONS, ZONES,ADDSTATIONS,EDITSTATIONS } from "@/utils/helper";
import SearchIcon from '@/assets/search_icon.svg';
import { v4 as uuidv4 } from 'uuid';

type Station = {
    id: string;
    name: string;
    code: string;
    zone: string;
    state: string;
    lat: string;
    long: string;
  };
type Station1 = {
    name: string;
    code: string;
    zone: string;
    state: string;
    lat: string;
    long: string;
}
async function getStations(searchValue = '', searchType = 'Station Code', page = 0, rowsPerPage = 10) {
    const skip = page * rowsPerPage;
    let url = `${STATIONS}?skip=${skip}&limit=${rowsPerPage}`;
    if (searchValue) {
        const searchField = searchType === 'Station Code' ? 'code' : 'state';
        url += `&${searchField}=${encodeURIComponent(searchValue)}&partialMatch=true`;
    }
    const result = await httpsGet(url);
    return result;
}

const StationHeader = ({ count } : any) => {

    const t = useTranslations('ORDERS');
    const { showMessage } = useSnackbar();

    const [columns, setColumns] = useState<Column[]>([]);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [page, setPage] = React.useState(0);
    const [response, setResponse] = useState<Station[]>([]);
    const [rowId, setRowID] = useState('');
    const [showActionBox, setShowActionBox] = useState(-1);
    const [open, setOpen] = useState(false);
    const [actionOptions, setActionOptions] = useState('');
    const [edit, setEdit] = useState(false);
    const [schemeType, setSchemeType] = useState('');
    const [cancelBtn1, setCancelBtn1] = useState(false);
    const [cancelBtn2, setCancelBtn2] = useState(false);
    const [item1, setItem1] = useState('');
    const [closeAdd, setCloseAdd] = useState(false);
    const [closeEdit, setCloseEdit] = useState(false)
    const [item,setItem] = useState(false);
    const [zones, setZones] = useState<string[]>([]);
    const [states, setStates] = useState<string[]>([]);
    const [searchType, setSearchType] = useState('Station Code');
    const [editStationId, setEditStationId] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    const [lat1, setLat1] = useState('');
    const [lat2, setLat2] = useState('');
    const [long1, setLong1] = useState('');
    const [long2, setLong2] = useState('');

    const [addStationName, setAddStationName] = useState('');
    const [addStationCode, setAddStationCode] = useState('');
    const [addZone, setAddZone] = useState('');
    const [addState, setAddState] = useState('');
    const [addLat, setAddLat] = useState('');
    const [addLong, setAddLong] = useState('');
    const [editIndex1, setEditIndex1] = useState<number | null>(null);

    const [selectedStation, setSelectedStation] = useState(null);
    const [editStationName, setEditStationName] = useState('');
    const [editStationCode, setEditStationCode] = useState('');
    const [editZone, setEditZone] = useState('');
    const [editState, setEditState] = useState('');
    const [editLat, setEditLat] = useState('');
    const [editLong, setEditLong] = useState('');
    const [searchValue, setSearchValue] = useState<string>('');


    const [latError, setLatError] = useState<string>('')
    const [longError, setLongError] = useState<string>('');

    const [editLatValid, setEditLatValid] = useState(false); 
    const [editLongValid, setEditLongValid] = useState(false); 
    const [addlatValid, setAddLatValid] = useState(false);
    const [addlongValid, setAddLongValid] = useState(false);

    const [codeValid, setCodeValid] = useState(false);
    const [pageInput, setPageInput] = useState<string>(String(page + 1));
    const [totalPages, setTotalPages] = useState(Math.ceil(totalCount / rowsPerPage));
    const isSmallScreen = useMediaQuery('(max-width:808px)');

  
    const handleOpen = (e: any) => {e.stopPropagation(); setOpen(true);}
    const handleClose = (e: any) => {e.stopPropagation(); setOpen(false)}

    const handleOpen1 = (e: any) => {e.stopPropagation();setEdit(true);setActionOptions(e.currentTarget.id);const id = Number(e.currentTarget.id);
    setEditIndex1(id); }
    const handleClose1 = (e: any) => {e.stopPropagation(); setEdit(false)}

    useEffect(() => {
        getStations(searchValue, searchType, page, rowsPerPage)
        .then((data: any) => {
            if (data.data.stations) {
                setResponse(data.data.stations);
                setTotalCount(data.data.count); 
              } else {
                console.error('Data fetched is not an array:', data);
              }
        })
        .catch((error: any) => {
            console.error('Error fetching stations:', error);
        })
    }, [searchValue, searchType, page, rowsPerPage])

    useEffect(() => {
        const getZones = async () => {
            try {
                const result = await httpsGet(ZONES);
                setZones( result && result.data)
            } catch (error) {
                console.error('Error fetching zones:', error);
            }
        };

        getZones();
    }, []);

    useEffect(() => {
        const getStates = async () => {
            try {
                const result = await httpsGet(STATES);
                setStates( result && result.data)
            } catch (error) {
                console.error('Error fetching states:', error);
            }
        };

        getStates();
    }, []);


    useEffect(() => {
        const commonColumns: Column[] = [
            { id: 'sno', label: 'S.No', class: 'sNo1', innerClass: ''  },
            { id: 'name', label: 'Station Name', class: 'stationName1', innerClass: '' },
            { id: 'code', label: 'Station Code', class: 'stationCode1', innerClass: '' },
            { id: 'zone', label: 'Zone', class: 'zone1', innerClass: 'inner_pickup' },
            { id: 'state', label: 'State', class: 'state1', innerClass: 'inner_pickup' },
            { id: 'location', label: 'Location', class: 'location1', innerClass: '' },
            { id: 'action', label: 'Action', class: 'action1', innerClass: '' },
        ];
        setColumns(commonColumns);
    }, [])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            event.stopPropagation();
            const target = event.target as HTMLElement;
            const actionButton = target.closest('.action_icon');
            if (!actionButton && showActionBox !== -1) {
                event.stopPropagation();
                setShowActionBox(-1); 
            }
            event.stopPropagation();
        }
        if (showActionBox !== -1) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showActionBox]);

    useEffect(() => {
        setTotalPages(Math.ceil(totalCount / rowsPerPage));
    }, [totalCount, rowsPerPage]);

    const handleSchemeTypeChange = (event: any) => {
        const selectedSchemeType = event.target.value;
        setSchemeType(selectedSchemeType);
      };

    function clickActionBox(e: React.MouseEvent<SVGSVGElement, MouseEvent>, index: number, id: string) {
        e.stopPropagation();
        setRowID(id);
        setShowActionBox(prevIndex => (prevIndex === index ? -1 : index));
    }

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
        setPageInput(String(newPage + 1));
        getStations(searchValue, searchType, newPage, rowsPerPage)
        .then((data: any) => {
            if (data.data.stations) {
                setResponse(data.data.stations);
                setTotalCount(data.data.count);
            } else {
                console.error('Data fetched is not an array:', data);
            }
        })
        .catch((error: any) => {
            console.error('Error fetching stations:', error);
        });
    };

    const handleChangeRowsPerPage = (event: any) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
        getStations(searchValue, searchType, 0, newRowsPerPage)
            .then((data: any) => {
                if (data.data.stations) {
                    setResponse(data.data.stations);
                    setTotalCount(data.data.count);
                } else {
                    console.error('Data fetched is not an array:', data);
                }
            })
            .catch((error: any) => {
                console.error('Error fetching stations:', error);
            });
      }; 

      const handleSearch = (searchText: any) => {
        setSearchValue(searchText);
        setPage(0); 
      
        getStations(searchText, searchType, 0, rowsPerPage)
            .then((data: any) => {
                if (data.data.stations) {
                    setResponse(data.data.stations);
                    setTotalCount(data.data.count);
                } else {
                    console.error('Data fetched is not an array:', data);
                }
            })
            .catch((error: any) => {
                console.error('Error fetching stations:', error);
            });
    };
      


    const handleAddsubmit = async () => {
        
        if(addStationName !== '' && addStationCode !== '' && addStationCode.length>=2 && addZone !== '' && addState !== ''  && addLat !== '' && addLong !=='' && addlatValid === true && addlongValid === true && codeValid === true){
            const newStation: Station= {
                id: uuidv4(),
                name: addStationName,
                code: addStationCode,
                lat: addLat,
                long: addLong,
                state: addState,
                zone: addZone 
            } 
            
                const addStationResponse = await httpsPost(ADDSTATIONS, newStation);
                if(addStationResponse.statusCode === 200){
                    const addedStation = {
                        ...newStation
                    };
                    setResponse(prevResponse => [...prevResponse, addedStation]);
                }
                setOpen(false)
                setAddStationName('')
                setAddStationCode('')
                setAddZone('')
                setAddState('')
                setAddLat('')
                setAddLong('')
                setAddLatValid(false)
                setAddLongValid(false)
           
           

        }
        else{
            if(addLong == ''){
                showMessage('Longitude is required', 'error')
            }
            if(addLat == ''){
                showMessage('Latitude is required', 'error')
            }
            if(addZone == ''){
                showMessage('Zone is required', 'error')
            }
            if(addStationCode == ''){
                showMessage('Station code is required', 'error')
            }
            if(addStationCode.length < 2){
                showMessage('Station code must be at least 2 characters', 'error')
            }
            if(addStationName == ''){
                showMessage('Station name is required', 'error')
            }
        }
    }
    const handleEditSubmit = async () => {

        const updatedStation = {
            id: editStationId, 
            name: editStationName,
            code: editStationCode,
            lat: editLat,
            long: editLong,
            state: editState,
            zone: editZone
        }

        if(editStationName !== '' && editStationCode !== '' && editStationCode.length>=2 && editZone !== '' && editState !== '' && editLat !== '' && editLong !=='' && editLatValid === true && editLongValid === true && codeValid === true){

            const editedStation = await httpsPost(EDITSTATIONS, updatedStation);

            setResponse(prevResponse => prevResponse.map(station => 
                station.id === editStationId ? editedStation : station
            ));
            setEditIndex1(null);
            setEditStationName('')
            setEditStationCode('')
            setEditZone('')
            setEditState('')
            setEditLat('')
            setEditLong('')
            setEdit(false)
            setEditLatValid(false)
            setEditLongValid(false)
        }
        else{
            if(editLong == ''){
                showMessage('Longitude is required', 'error')
            }
            if(editLat == ''){
                showMessage('Latitude is required', 'error')
            }
            if(editZone == ''){
                showMessage('Zone is required', 'error')
            }
            if(editStationCode == ''){
                showMessage('Station code is required', 'error')
            }
            if(editStationCode.length < 2){
                showMessage('Station code must be at least 2 characters', 'error')
            }
            if(editStationName == ''){
                showMessage('Station name is required', 'error')
            }
        }
    }

    const handleAddCancel = () => {
        setCancelBtn1(!cancelBtn1)
        setOpen(false)
        setAddStationName('')
        setAddStationCode('')
        setAddZone('')
        setAddState('')
        setAddLat('')
        setAddLong('')
        setAddLatValid(false)
        setAddLongValid(false)
    }
    const handleEditCancel = () => {
        setCancelBtn2(!cancelBtn2)
        setEdit(false)
        setEditStationName('')
        setEditStationCode('')
        setEditZone('')
        setEditState('')
        setEditLat('')
        setEditLong('')
        setEditLatValid(false)
        setEditLongValid(false)
    }

    const handleItem1 = (e: any) => {
        const value = e.target.value;
        setItem1(value);
    }
    const handleAddPopUpClose = (e: any) => {
        setCloseAdd(!closeAdd)
        setOpen(false)
        setAddStationName('')
        setAddStationCode('')
        setAddZone('')
        setAddState('')
        setAddLat('')
        setAddLong('')
        setAddLatValid(false)
        setAddLongValid(false)
    }   
    
    const handleEditPopUpClose = (e: any) => {
        setCloseEdit(!closeEdit)
        setEdit(false)
        setEditStationName('')
        setEditStationCode('')
        setEditZone('')
        setEditState('')
        setEditLat('')
        setEditLong('')
        setEditLatValid(false)
        setEditLongValid(false)
    }

    const validateAddLat = (lat: string) => {
        const trimmedLat = lat.trim();
        if (trimmedLat === '' || /^\s*-$/.test(trimmedLat)) {
            setLatError('');
            setAddLatValid(false);
            return;
        }

        if (/-.*-/.test(trimmedLat) || /-.+\D/.test(trimmedLat.substring(1))) {
            showMessage('Minus symbol is only allowed at the beginning', 'error');
            setLatError('Minus symbol is only allowed at the beginning');
            setAddLatValid(false);
            return;
        }

        const isValid = /^-?\d+(\.\d*)?$/.test(trimmedLat); 
        if (!isValid && trimmedLat.trim() !== '' &&  !(/^\s*-$/.test(trimmedLat))) {
            showMessage('Latitude must be a numeric value', 'error')
            setLatError('Latitude must be a numeric value');
            setAddLatValid(false)
        } 
        else{
            const latNum = parseFloat(trimmedLat);
            if(!isNaN(latNum) && latNum >= -90 && latNum <=90){
                setLatError('');
                setAddLatValid(true)
                setLat1(lat)
            }
            else{
                showMessage('Latitude must be between -90 and 90', 'error')
                setLatError('Latitude must be between -90 and 90');
                setAddLatValid(false)
            }    
        }
    }
    
    const validateAddLong = (long: string) => {
        const trimmedLong = long.trim();
        if (trimmedLong === '' || /^\s*-$/.test(trimmedLong)) {
            setLongError('');
            setAddLongValid(false);
            return;
        }
        
        if (/-.*-/.test(trimmedLong) || /-.+\D/.test(trimmedLong.substring(1))) {
            showMessage('Minus symbol is only allowed at the beginning', 'error');
            setLongError('Minus symbol is only allowed at the beginning');
            setAddLongValid(false);
            return;
        }
        const isValid = /^-?\d+(\.\d*)?$/.test(trimmedLong);
        if (!isValid && trimmedLong.trim() !== '' &&  !(/^\s*-$/.test(trimmedLong))) {
            showMessage('Longitude must be a numeric value', 'error')
            setLongError('Longitude must be a numeric value');
            setAddLongValid(false)
        } 
        else{
            const longNum = parseFloat(trimmedLong);
            if(!isNaN(longNum) && longNum >= -180 && longNum <= 180){
                setLongError('');
                setAddLongValid(true)
                setLong1(long)
                }
                else{
                    showMessage('Longitude must be between -180 and 180', 'error')
                setLongError('Longitude must be between -180 and 180');
                setAddLongValid(false)
            }
        }
    }
    const validateEditLat = (lat: string) => {    
        const trimmedLat =  String(lat).trim();
        if (trimmedLat === '' || /^\s*-$/.test(trimmedLat)) {
            setLatError('');
            setEditLatValid(false);
            return;
        }

        if (/-.*-/.test(trimmedLat) || /-.+\D/.test(trimmedLat.substring(1))) {
            showMessage('Minus symbol is only allowed at the beginning', 'error');
            setLatError('Minus symbol is only allowed at the beginning');
            setEditLatValid(false);
            return;
        }

        const isValid = /^-?\d+(\.\d*)?$/.test(trimmedLat); 
        if (!isValid && trimmedLat.trim() !== '' &&  !(/^\s*-$/.test(trimmedLat))) {
            showMessage('Latitude must be a numeric value', 'error')
            setLatError('Latitude must be a numeric value');
            setEditLatValid(false)
        } 
        else{
            const latNum = parseFloat(trimmedLat);
            if(!isNaN(latNum) && latNum >= -90 && latNum <=90){
                setLatError('');
                setEditLatValid(true)
                setLat2(lat)
            }
            else{
                showMessage('Latitude must be between -90 and 90', 'error')
                setLatError('Latitude must be between -90 and 90');
                setEditLatValid(false)
            }    
        }
    }
    const validateEditLong = (long: string) => {
        const trimmedLong = String(long).trim();
        if (trimmedLong === '' || /^\s*-$/.test(trimmedLong)) {
            setLongError('');
            setEditLongValid(false);
            return;
        }

        if (/-.*-/.test(trimmedLong) || /-.+\D/.test(trimmedLong.substring(1))) {
            showMessage('Minus symbol is only allowed at the beginning', 'error');
            setLongError('Minus symbol is only allowed at the beginning');
            setEditLongValid(false);
            return;
        }
        const isValid = /^-?\d+(\.\d*)?$/.test(trimmedLong); 
        if (!isValid && trimmedLong.trim() !== '' &&  !(/^\s*-$/.test(trimmedLong))) {
            showMessage('Longitude must be a numeric value', 'error')
            setLongError('Longitude must be a numeric value');
            setEditLongValid(false)
        } 
        else{
            const longNum = parseFloat(trimmedLong);
            if(!isNaN(longNum) && longNum >= -180 && longNum <= 180){
                setLongError('');
                setEditLongValid(true)
                setLong2(long)
            }
            else{
                showMessage('Longitude must be between -180 and 180', 'error')
                setLongError('Longitude must be between -180 and 180');
                setEditLongValid(false)
            }
        }
    }

    const validateStationCode = (stationCode : string) => {
        const isValid = /^[a-zA-Z]+$/.test(stationCode);
        if(!isValid) {
            showMessage('Station code must contain only letters', 'error')
            setCodeValid(false)
        }
        else{
            setCodeValid(true)
        }
    }

    const handleLocation = (lat: number, long: number) => {
        const url= `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;
        window.open(url, '_blank')
    }

    const handleEditClick = (row: any, index: any) => {
        setEditStationName(row.name);
        setEditStationCode(row.code);
        setEditZone(row.zone);
        const latitude =row.geo_point ? row.geo_point.coordinates[1] : row.lat
        const longitude = row.geo_point ? row.geo_point.coordinates[0] : row.long
        setEditLat(latitude);
        setEditLong(longitude);
        setEditState(row.state);
        setEditStationId(row._id)
        setEditIndex1(row._id)
        setCodeValid(true);
        setEditLatValid(true);
        setEditLongValid(true);
    }

    const filteredResponse = response.filter((row: any) => {
        const searchValueLower = searchValue.toLowerCase();
    
        if (searchType === 'Station Code') {
            return row.code && row.code.toLowerCase().trim().startsWith(searchValueLower);
        } else if (searchType === 'State') {
            return row.state && row.state.toLowerCase().trim().startsWith(searchValueLower);
        }
        return true;
    });
    

    const startIndex = page * rowsPerPage;
    const paginatedData = filteredResponse.slice(startIndex, startIndex + rowsPerPage);

    
    const CustomFormControl = styled(FormControl)({
        '& .MuiOutlinedInput-root': {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
          },
        },
    });

    const handlePageInputChange = ( event: React.ChangeEvent<HTMLInputElement> ) => {
        const value = event.target.value;
        const numValue = parseInt(value, 10);
        if (value === '' || (!isNaN(numValue) && numValue > 0 && numValue <= totalPages)) {
            setPageInput(value);
        }
    }

    const handlePageInputSubmit = ( event: React.KeyboardEvent<HTMLInputElement> ) => {
        if (event.key === 'Enter') {
            if(pageInput.trim() == ''){
                return;
            }
            const newPage = parseInt(pageInput.toString(), 10) - 1;
            if (newPage >= 0 && newPage < totalPages) {
                handleChangePage(null, newPage);
            } else {
                showMessage('Invalid page number', 'error');
                setPageInput(String(page + 1));
            }
        }
    }

    const getPlaceholder = () => {
        if(isSmallScreen){
            return 'Serach...'
        }
        return searchType === 'Station Code' ? 'Search for station code' : 'Search for state'
    }
    

    return(
        <div className="target1">
            <div className="search-container">
                <div className="search-wrapper">
                    <TextField
                    type="search"
                    variant="outlined"
                    value={searchValue}
                    onChange={(event) => {
                        setSearchValue(event.target.value);
                        handleSearch(event.target.value);
                    }}
                    placeholder={getPlaceholder()}
                    className="search-input"
                    InputProps={{
                        startAdornment: (
                        <InputAdornment position="start">
                            <Select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            className="search-select"
                            >
                            <MenuItem value="Station Code">Station Code</MenuItem>
                            <MenuItem value="State">State</MenuItem>
                            </Select>
                        </InputAdornment>
                        ),
                        endAdornment: (
                        <InputAdornment position="end">
                            <Image src={SearchIcon} alt="" style={{ cursor: 'pointer' }} />
                        </InputAdornment>
                        ),
                    }}
                    />
                </div>
    
                <button className="add-btn" onClick={(e) => { e.stopPropagation(); handleOpen(e); }}>
                    Add Station
                </button>
            </div>
            <div className="table-container">
                <Paper sx={{
                        width: '100%', overflow: 'hidden', boxShadow: 'none',
                        '.mui-78c6dr-MuiToolbar-root-MuiTablePagination-toolbar ': {
                            padding: '0 2 0 24',
                        },
                        '    .mui-78c6dr-MuiToolbar-root-MuiTablePagination-toolbar': {
                            minHeight: 40
                        },
                        '.mui-dmz9g-MuiTableContainer-root ': {
                            border: ' 1px solid #E9E9EB',
                            borderRadius: '8px'
                        },
                        '.mui-1briqcb-MuiTableCell-root': {
                            fontFamily: 'inherit'
                        }
                    }}
                >
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'end',
                        overflowX: 'auto'
                    }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            marginLeft: '20px'
                        }}>
                            <span style={{ marginRight: '8px', whiteSpace: 'nowrap' }}>Go to page : </span>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center',  
                                borderRadius: '4px', 
                                border: "1px solid #E0E0E0",
                                padding: '2px 4px',
                                minWidth : '150px',
                            }}>
                                <input
                                    value={pageInput}
                                    onChange={handlePageInputChange}
                                    onKeyPress={handlePageInputSubmit}
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        width: '50%',
                                        fontSize: '14px'
                                    }}
                                    min={1}
                                    max={totalPages}
                                />
                                <span style={{  fontSize: '14px', width: "50%"}}>/ {totalPages}</span>
                            </div>
                        </div>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50, 100]}
                            component="div"
                            count={totalCount}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Shipments per page:"
                        />
                    </div>
                    <TableContainer sx={{
                        border: '1px solid #E9E9EB', borderRadius: '8px', maxHeight: 'calc(90vh - 110px)', minHeight: '200px',
                        overflowY: 'scroll',
                        '&::-webkit-scrollbar': {
                            display: 'none',
                        },
                        scrollbarWidth: 'none',
                        '-ms-overflow-style': 'none',
                    }}>
                        <Table className="main-table" stickyHeader aria-label="sticky table">
                            <TableHead className="head" sx={{
                                '.mui-y8ay40-MuiTableCell-root ': { padding: 0 },
                                '.mui-78trlr-MuiButtonBase-root-MuiIconButton-root ': { width: '5px' },
                                '.mui-y8ay40-MuiTableCell-root': { fontFamily: 'inherit' },
                            }}>
                                <TableRow>
                                    {columns.map((column) => {
                                        return(
                                            <TableCell  
                                                key={column.id}
                                                style={{ fontSize: 12, fontWeight: 'bold', color: '#484A57', paddingLeft: '10px' }}
                                                className={column.class}
                                            >
                                                <div className={column.innerClass} style={{ overflow: "scroll"}}>
                                                    {column.label}
                                                </div>
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {response
                                .map((row: any, rowIndex: any) => {
                                    return(
                                        <TableRow  key={row._id} sx={{ cursor: 'pointer' }}>
                                            {columns.map((item, index) => {
                                                const value = item.id === 'sno' ? startIndex+rowIndex + 1 : row[item.id];
                                                const columnClassNames: any = {
                                                    stationName: 'body_stationName',
                                                    stationCode: 'body_stationCode',
                                                    zone: 'body_zone',
                                                    state: 'body_state',
                                                    location: 'body_location',
                                                    action: 'body_action'
                                                }
                                                return(
                                                    <TableCell key={row._id} sx={{ fontSize: '12px', color: '#44475B', p: '16px 10px 24px 10px' }} className={columnClassNames[item.id]}>
                                                        
                                                        
                                                            { item.id === 'action' && (
                                                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                                    <div className="action_icon">
                                                                        <MoreHorizIcon
                                                                            style={{ color: 'white', cursor: 'pointer', scale: '0.9'}}
                                                                            onClick={(e) => {clickActionBox(e, rowIndex, row._id); setItem(true)}}
                                                                        />
                                                                        <div className={`action_button_target ${showActionBox === rowIndex ? 'show' : ''}`}>
                                                                            <div className="action_button_options" onClick={(e) => {e.stopPropagation()}}>
                                                                                <ActionItem 
                                                                                    icon = {<Image src={ editIcon } alt='edit'/>}
                                                                                    text = {('edit')}
                                                                                    onClick={(e: any) =>{ e.stopPropagation(); handleOpen1(e);handleEditClick(row,rowIndex);validateEditLat(row.geo_point ? row.geo_point.coordinates[1] : row.lat);validateEditLong( row.geo_point ? row.geo_point.coordinates[0] : row.long)}}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            { item.id ==='location' ? (
                                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                                                    {<IconButton onClick={() => handleLocation(row.geo_point.coordinates[1], row.geo_point.coordinates[0])}>
                                                                        <PlaceIcon style={{ color: '#0168FF' }}/>
                                                                    </IconButton>}
                                                                    <div  onClick={() => handleLocation(
                                                                    row.geo_point ? row.geo_point.coordinates[1] : row.lat, 
                                                                    row.geo_point ? row.geo_point.coordinates[0] : row.long
                                                                )}>
                                                                    {row.geo_point ? `${row.geo_point.coordinates[1]}, ${row.geo_point.coordinates[0]}` : `${row.lat}, ${row.long}`}
                                                                {(typeof value) === 'object' ? '' : ''}
                                                                    </div>
                                                                </div>
                                                            ): ''}
                                                            { item.id ==='state' && (
                                                                <div>
                                                                    { value && value.state }
                                                                    {(typeof value) === 'object' ? '' : value}
                                                                </div>
                                                            )}
                                                            { item.id ==='zone' && (
                                                                <div>
                                                                    {value && value.zone}
                                                                    {(typeof value) === 'object' ? '' : value}
                                                                </div>
                                                            )}
                                                            { item.id ==='code' && (
                                                                <div>
                                                                    {value && value.code}
                                                                    {(typeof value) === 'object' ? '' : value}
                                                                </div>
                                                            )}
                                                            { item.id ==='name' && (
                                                                <div>
                                                                    {value && value.name}
                                                                    {(typeof value) === 'object' ? '' : value}
                                                                </div>
                                                            )}
                                                            {
                                                                item.id === 'sno' && (
                                                                    <div>
                                                                    {value}
                                                                    </div>
                                                                )
                                                            }
                                                        
                                                    </TableCell>
                                                )
                                            })}
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
                <Modal open={ open } onClose={(e) => {handleClose(e); setAddStationName(''); setAddStationCode(''); setAddZone('');setAddState(''); setAddLat(''); setAddLong(''); setAddLatValid(false); setAddLongValid(false)}} sx={{ display: 'flex' ,alignItems: 'center', justifyContent: 'center'}}>
                    <Box onClick={(e) => e.stopPropagation()} sx={{
                        display: 'flex',
                        alignItems: 'start',
                        justifyContent: 'start',
                        fontSize: '50px',
                        minWidth: '30vw',
                        maxheight: '60vh',
                        backgroundColor: 'white',
                        outline: 'none',
                        borderRadius: '12px',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow:'visible'
                    }}>
                    <div className="close-icon1" onClick={handleAddPopUpClose}>  
                        <Image src={ CloseButtonIcon } alt="close icon"/>
                    </div>
                    <div className="whole-popup">
                        <div className="heading">
                            <p>    
                                Add Station
                            </p>
                        </div>
                    <div className="select-container">
                        <div className="select-div">
                                <InputLabel className="label">Station Name</InputLabel>
                                <Input type="text" className="input" value={addStationName} onChange={(e) => setAddStationName(e.target.value)}/>
                        </div>
                        <div className="select-div">
                                <InputLabel className="label">Station Code</InputLabel>
                                <input type="text" className="input" value={addStationCode} maxLength={4}  onChange={(e) => {setAddStationCode(e.target.value); validateStationCode(e.target.value)}}/>
                        </div>
                        <div className="select-div">
                            <InputLabel className="label">Zone</InputLabel>
                            <Autocomplete
                                className="form-select"
                                style={{ height: '32px',width: "100%",fontSize: "16x", borderRadius: "5px",marginTop: '30px'}}
                                value={addZone}
                                onChange={(e, newValue) => setAddZone(newValue || '')}
                                options={zones}
                                renderInput={(params) => <TextField {...params}  />}
                            />
                        </div>
                        <div className="select-div">
                            <InputLabel className="label">State</InputLabel>
                            <Autocomplete
                                className="form-select"
                                style={{ height: '32px',width: "100%",fontSize: "16x", borderRadius: "5px",marginTop: '30px'}}
                                value={addState}
                                onChange={(e, newValue) => setAddState(newValue || '')}
                                options={states}
                                renderInput={(params) => <TextField {...params}  />}
                            />
                        </div>
                        <div className="select-div">
                                <InputLabel className="label">Latitude</InputLabel>
                                <Input type="text" className="input" value={addLat} onChange={(e) => {setAddLat(e.target.value); validateAddLat(e.target.value)}}/>
                        </div>
                        <div className="select-div">
                                <InputLabel className="label">Longitude</InputLabel>
                                <Input type="text" className="input" value={addLong} onChange={(e) => {setAddLong(e.target.value); validateAddLong(e.target.value)}}/>
                        </div>
                        </div> 
                        <div className="link-btn">
                            <div className="link1">
                                {addlatValid && addlongValid && <Link className="link" href={`https://www.google.com/maps/search/?api=1&query=${lat1},${long1}`} target="_blank" rel="noopener noreferrer">View on Map</Link>}
                            </div>
                            <div className="btn1">
                                <Button onClick={() => handleAddCancel()} className="btn" id="btn2" >
                                    CANCEL
                                </Button>
                                <Button className="btn" onClick={(e) =>{ handleAddsubmit() }}
                                    style={{backgroundColor:  "#1976d2" , color:  "white" }}
                                    >
                                    SUBMIT
                                </Button>
                            </div>
                        </div>
                    </div>
                    </Box>
                </Modal>
                <Modal open={ edit } onClose={(e) => {handleClose1(e); setEditStationName(''); setEditStationCode(''); setEditZone('');setEditState('');setEditLat(''); setEditLong('');setEditLatValid(false); setEditLongValid(false)}} sx={{ display: 'flex' ,alignItems: 'center', justifyContent: 'center'}}>
                    <Box onClick={(e) => e.stopPropagation()} sx={{
                        display: 'flex',
                        alignItems: 'start',
                        justifyContent: 'start',
                        fontSize: '50px',
                        minWidth: '30vw',
                        maxheight: '60vh',
                        backgroundColor: 'white',
                        outline: 'none',
                        borderRadius: '12px',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow:'visible'
                    }}>  
                    <div className="close-icon1" onClick={handleEditPopUpClose}>  
                        <Image src={ CloseButtonIcon } alt="close icon"/>
                    </div>

                    <div className="whole-popup">
                        <div className="heading">
                            <p>    
                                Edit Station
                            </p>
                        </div>
                    <div className="select-container">
                        <div className="select-div">
                                <InputLabel className="label">Station Name</InputLabel>
                                <Input type="text" className="input" value={editStationName} onChange={(e) => setEditStationName(e.target.value)}/>
                        </div>
                        <div className="select-div">
                                <InputLabel className="label">Station Code</InputLabel>
                                <input type="text" className="input" value={editStationCode} maxLength={4}  onChange={(e) => {setEditStationCode(e.target.value); validateStationCode(e.target.value)}}/>
                        </div>
                        <div className="select-div">
                            <InputLabel className="label">Zone</InputLabel>
                            <Autocomplete
                                style={{ height: '32px',width: "100%",fontSize: "16x", borderRadius: "5px",marginTop: '30px'}}
                                className="form-select"
                                value={editZone}
                                onChange={(e, newValue) => setEditZone(newValue || '')}
                                options={zones}
                                renderInput={(params) => <TextField {...params}  />}
                            />
                        </div>
                        <div className="select-div">
                            <InputLabel className="label">Zone</InputLabel>
                            <Autocomplete
                                style={{ height: '32px',width: "100%",fontSize: "16x", borderRadius: "5px",marginTop: '30px'}}
                                className="form-select"
                                value={editState}
                                onChange={(e, newValue) => setEditState(newValue || '')}
                                options={states}
                                renderInput={(params) => <TextField {...params}  />}
                            />
                        </div>
                        <div className="select-div">
                                <InputLabel className="label">Latitude</InputLabel>
                                <Input type="text" className="input" value={editLat} onChange={(e) => {setEditLat(e.target.value); validateEditLat(e.target.value) }}/>
                        </div>
                        <div className="select-div">
                                <InputLabel className="label">Longitude</InputLabel>
                                <Input type="text" className="input" value={editLong} onChange={(e) => {setEditLong(e.target.value); validateEditLong(e.target.value)}}/>
                        </div>
                        </div> 
                        <div className="link-btn">
                            <div className="link1">
                                {editLatValid && editLongValid && <Link className="link" href={`https://www.google.com/maps/search/?api=1&query=${editLat},${editLong}`} target="_blank" rel="noopener noreferrer">View on Map</Link>}
                            </div>
                            <div className="btn1">
                                <Button onClick={() => handleEditCancel()} className="btn" id="btn2" >
                                    CANCEL
                                </Button>
                                <Button className="btn" onClick={(e) =>{ handleEditSubmit()}}
                                    style={{backgroundColor:  "#1976d2" , color:  "white" }}
                                    >
                                    SUBMIT
                                </Button>
                            </div>
                        </div>
                    </div>            
                    </Box>
                </Modal>
            </div>
        </div>
    )
}

export default StationHeader

const ActionItem = ({ icon, text, onClick, id }: any) => (
    <div className='action_items' onClick={onClick} id={id}>
        <div>{icon}</div>
        <div>{text}</div>
    </div>
);


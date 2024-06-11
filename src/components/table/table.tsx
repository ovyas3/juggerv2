'use client'

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DescriptionIcon from '@mui/icons-material/Description';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Checkbox from '@mui/material/Checkbox';
import { useState, useEffect } from 'react'
import './table.css'
import { all } from 'axios';

function formatDateTime(date: Date): object {
    console.log(date)
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const timeString = `${hours}:${minutes} ${ampm}`;
    const day = date.getDate();
    const shortMonthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const month = shortMonthNames[date.getMonth()];
    const year = date.getFullYear();
    const formattedDate = `${day} ${month} ${year}`;

    return { timeString, formattedDate };
}


const convertArrayToFilteredArray = (inputArray: any) => {
    return inputArray.map((item: { is_fois_fetched?: any; edemand_no?: any; FNR?: any; delivery_location?: any; others?: any; remarks?: any; }) => {

        const { edemand_no, FNR, allFNRs, delivery_location, others, remarks } = item;

        return {
            edemand: edemand_no,
            fnr: {
                primary: FNR,
                allFNRs: allFNRs || 'NA',
            },
            destination: {
                name: delivery_location.name || 'NA',
                code: delivery_location.code || 'NA'
            },
            material: others.demandedCommodity || 'NA',
            pickupdate: others.confirmationDate || 'NA',
            // ownedby: 'NA',
            status: item.is_fois_fetched || 'NA',
            // initialETA: 'NA',
            currentEta: 'NA',
            remarks: 'NA',
            handlingAgent: 'NA',
            action: '',
            iconheader: ''
        }
    });
};

// Define the Column interface
interface Column {
    id: keyof Data;
    label: string | React.ReactNode;
    class: string;
    innerClass: string;
}

// Define the Data interface
// interface Data {
//     edemand: string;
//     fnr: object;
//     destination: string;
//     material: string;
//     pickupdate: Date;
//     ownedby: string;
//     status: object;
//     initialETA: Date;
//     currentEta: Date;
//     remarks: string;
//     handlingAgent: string;
//     action: any;
//     iconheader: any;
// }


// // Function to create data
// function createData(
//     edemand: string,
//     fnr: object,
//     destination: string,
//     material: string,
//     pickupdate: Date,
//     ownedby: string,
//     status: object,
//     initialETA: Date,
//     currentEta: Date,
//     remarks: string,
//     handlingAgent: string,
//     action: any,
//     iconheader: any
// ): Data {
//     return {
//         edemand,
//         fnr,
//         destination,
//         material,
//         pickupdate,
//         ownedby,
//         status,
//         initialETA,
//         currentEta,
//         remarks,
//         handlingAgent,
//         action,
//         iconheader: ''

//     };
// }


// Main component
export default function TableData({ onSkipLimit, allShipments }: any) {

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [edemand, setEdemand] = React.useState(true);
    const [showEdemand, setShowEdemad] = React.useState(false);
    const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

    // console.log(allShipments)


    const response = convertArrayToFilteredArray(allShipments)
    // console.log(response)



    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const [columns, setColumns] = useState<Column[]>([]);

    const [destinationIndex, setDestinationIndex] = useState(null)

    function hoverEffect (index) {
        setDestinationIndex(index)
        console.log(index)
    }

    useEffect(() => {
        const commonColumns: Column[] = [
            { id: 'fnr', label: 'FNR No.', class: 'fnr', innerClass: 'inner_fnr' },
            { id: 'destination', label: 'Destination', class: 'destination', innerClass: '' },
            { id: 'material', label: 'Material', class: 'material', innerClass: '' },
            { id: 'pickupdate', label: 'Pickup Date', class: 'pickupdate', innerClass: '' },
            // { id: 'ownedby', label: 'Owned By', class: 'ownedby', innerClass: '' },
            { id: 'status', label: 'Status', class: 'status', innerClass: 'inner_status' },
            // { id: 'initialETA', label: 'Initial ETA', class: 'initialETA', innerClass: '' },
            { id: 'currentEta', label: 'Current ETA', class: 'currentEta', innerClass: '' },
            { id: 'remarks', label: 'Remarks', class: 'remarks', innerClass: '' },
            { id: 'handlingAgent', label: 'Handling Agent', class: 'handlingAgent', innerClass: '' },
            { id: 'action', label: 'Action', class: 'action', innerClass: '' },
            { id: 'iconheader', label: <IconButton onClick={() => { setShowEdemad(!showEdemand) }}><MoreVertIcon /></IconButton>, class: 'iconheader', innerClass: 'inner_iconheader' },
        ];

        if (edemand) {
            commonColumns.unshift({ id: 'edemand', label: 'E Demand', class: 'edamand', innerClass: '' });
        }

        onSkipLimit(rowsPerPage, page * rowsPerPage)

        setColumns(commonColumns);
    }, [edemand, showEdemand, rowsPerPage, page]);



    return (
        <div className='target'>
            <Paper
                sx={{
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
                }}>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={response.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
                <TableContainer sx={{ minHeight: 440 }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead sx={{
                            '.mui-y8ay40-MuiTableCell-root ': { padding: 0 },
                            '.mui-78trlr-MuiButtonBase-root-MuiIconButton-root ': { width: '5px' }
                        }}>
                            <TableRow >
                                {columns.map((column) => {
                                    return (
                                        <TableCell
                                            key={column.id}
                                            style={{ fontSize: 12, fontWeight: 'bold', color: '#7C7E8C', paddingLeft: '10px' }}
                                            className={column.class}

                                        >
                                            <div className={column.innerClass}>
                                                <div>
                                                    {column.label}
                                                    {
                                                        column.id === 'edemand' && edemand ?
                                                            <div></div>
                                                            : <></>
                                                    }
                                                    {
                                                        column.id === 'iconheader' && showEdemand ?
                                                            <div className='inner_iconheader_before'>
                                                                <Checkbox {...label} size='small' checked={edemand}
                                                                    onClick={() => { setEdemand(edemand => !edemand) }}
                                                                />
                                                                <div style={{ color: 'black', fontWeight: 'normal' }}>E Demand</div>
                                                            </div>
                                                            : <></>
                                                    }
                                                </div>

                                            </div>

                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {response.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row : object,firstindex: number) => {
                                return (
                                    <TableRow hover key={row.edemand}>
                                        {columns.map((item,index) => {
                                            const value = row[item.id];
                                            const columnClassNames: any = {
                                                edemand: 'body_edemand',
                                                fnr: 'body_fnr',
                                                destination: 'body_destination',
                                                material: 'body_material',
                                                pickupdate: 'body_pickupdate',
                                                ownedby: 'body_ownedby',
                                                status: 'body_status',
                                                initialETAL: 'body_initialETA',
                                                currentEta: 'body_currentEta',
                                                remarks: 'body_remarks',
                                                handlingAgent: 'body_handlingAgent',
                                                action: 'body_action',
                                                iconheader: 'body_iconheader'
                                            }

                                            if (item.id === 'pickupdate') console.log(typeof value)

                                            return (
                                                <TableCell key={index} sx={{ p: 0, pl: '10px', pt: '16px', pb: '16px', fontSize: '12px', color: '#44475B' }}
                                                    className={columnClassNames[item.id]} >
                                                    <div>
                                                        {(typeof value) === 'object' ? '' : value}
                                                        {item.id === 'action' ?
                                                            <div className='action_icon'><MoreHorizIcon style={{ color: 'white' }} /></div>
                                                            : <></>
                                                        }
                                                        {
                                                            item.id === 'fnr' ?
                                                                <div className='fnr_container'>
                                                                    <div className='fnr_inner_data'>{value.primary}</div>
                                                                    
                                                                    <div className='fnr_inner_inner_nachoes'>{value.allFNRs}</div>
                                                                </div>
                                                                : <></>
                                                        }
                                                        {
                                                            item.id === 'destination'?
                                                                <div>
                                                                    <div className=''
                                                                        onMouseOver={()=>{hoverEffect(firstindex)}}
                                                                    >{value.code}</div>
                                                                    <div style={{
                                                                        display:  destinationIndex === firstindex  ? 'block' : 'none',
                                                                    }}>{value.name}</div>
                                                                </div>
                                                                :<></>
                                                        }


                                                    </div>

                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

        </div>
    );
}


// {   
//     item.id === 'handlingAgent' ? 
//         <div><DescriptionIcon/></div>
//         :<></>
//     }
//     {
//         item.id === 'fnr' ?
//             <div className='fnr_container'>
//                 <div className='fnr_inner_data'>{value.standard}</div>
//                 <div className='fnr_inner_inner_data'>
//                     <div className='fnr_inner_inner_num'>{value.num}</div>
//                     <div className='fnr_inner_inner_count'>
//                         <div style={{ fontSize: '9px', color: 'white' }}>+{value.count}</div></div>
//                 </div>
//                 <div className='fnr_inner_inner_nachoes'>{value.nachoes}</div>
//             </div>
//             : <></>
//     }
//     {
//         item.id === 'pickupdate' ?

//             <div style={{ display: 'flex', flexDirection: 'column' }}>
//                 {/* <div>{formatDateTime(row.pickupdate).formattedDate}</div>
//                 <div>{formatDateTime(row.pickupdate).timeString}</div> */}
//             </div>
//             : <></>
//     }
//     {
//         item.id === 'initialETA' ?

//             <div style={{ display: 'flex', flexDirection: 'column' }}>
//                 {/* <div>{formatDateTime(row.pickupdate).formattedDate}</div>
//                 <div>{formatDateTime(row.pickupdate).timeString}</div> */}
//             </div>
//             : <></>
//     }
//     {
//         item.id === 'currentEta' ?

//             <div style={{ display: 'flex', flexDirection: 'column' }}>
//                 <div>{formatDateTime(row.pickupdate).formattedDate}</div>
//                 <div>{formatDateTime(row.pickupdate).timeString}</div>
//             </div>
//             : <></>
//     }
//     {
//         item.id === 'status' ?
//         <div className='status_container'>
//             <div className='status_title'>{value.status}</div>
//             <div className='status_body'>{value.address}</div>
//             <div className='time'>{formatDateTime(value.eta).timeString}</div>
//         </div>
//         :<></>
//     }
//     {
//         item.id === 'action' ?
//         <div className='action_icon'><MoreHorizIcon style={{color:'white'}}/></div>
//         :<></>
//     }




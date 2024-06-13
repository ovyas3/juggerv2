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
import {useState, useEffect} from 'react'
import './table.css'

function formatDateTime(date : Date) : object {
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

// Define the Column interface
interface Column {
    id: keyof Data;
    label: string | React.ReactNode;
    class: string;
    innerClass: string;
}

// Define the Data interface
interface Data {
    edemand: string;
    fnr: object;
    destination: string;
    material: string;
    pickupdate: Date;
    ownedby: string;
    status: object;
    initialETA: Date;
    currentEta: Date;
    remarks: string;
    handlingAgent: string;
    action: any;
    iconheader: any;
}

// Column definitions


// Function to create data
function createData(
    edemand: string,
    fnr: object,
    destination: string,
    material: string,
    pickupdate: Date,
    ownedby: string,
    status: object,
    initialETA: Date,
    currentEta: Date,
    remarks: string,
    handlingAgent: string,
    action: any,
    iconheader: any
): Data {
    return {
        edemand,
        fnr,
        destination,
        material,
        pickupdate,
        ownedby,
        status,
        initialETA,
        currentEta,
        remarks,
        handlingAgent,
        action,
        iconheader: ''

    };
}

// Sample rows data
const rows = [

    createData(
        'BRHK126NGKO',
        {
            standard: 'primary',
            num: '96297261867',
            count: 5,
            nachoes: 'CT'
        },
        'JWS - Ballery Gwalior',
        'Hot Roll String',
        new Date('2024-06-01T10:30:00'),
        'Capative Rake',
        {
            status: 'In Transit',
            address: 'foundation building, 134/A maal road, 1122015',
            eta: new Date('2024-06-05T10:30:00'),
        },
        new Date('2024-06-05T10:30:00'),
        new Date('2024-06-03T20:00:00'),
        'Delay by 1 day due to alien attack',
        'Jai Shri Ram',
        '',
        ''
    ),
    createData(
        'JKLO789TUVM',
        {
            standard: 'express',
            num: '98765432109',
            count: 2,
            nachoes: 'CA'
        },
        'Speedy Deliveries Inc. - California',
        'Spicy Tofu Wrap',
        new Date('2024-06-03T09:00:00'),
        'Air Freight',
        {
            status: 'Delivery',
            address: '456 Elm St, Los Angeles, CA 90001',
            eta: new Date('2024-06-03T12:30:00'),
        },
        new Date('2024-06-03T12:30:00'),
        new Date('2024-06-03T06:00:00'),
        'Delayed due to weather conditions',
        'Please deliver before 3:00 PM',
        '',
        ''
    ),
    createData(
        'ABCD123WXYZ',
        {
            standard: 'standard',
            num: '24681357900',
            count: 1,
            nachoes: 'TX'
        },
        'Texan Logistics - Dallas',
        'BBQ Pulled Pork Sandwich',
        new Date('2024-06-04T11:15:00'),
        'Ground Shipping',
        {
            status: 'In Transit',
            address: '789 Oak St, Dallas, TX 75201',
            eta: new Date('2024-06-06T11:00:00'),
        },
        new Date('2024-06-06T11:00:00'),
        new Date('2024-06-06T07:30:00'),
        'Traffic congestion delaying delivery',
        'Your patience is appreciated',
        '',
        ''
    ),
    createData(
        'PQRS567ABCD',
        {
            standard: 'primary',
            num: '13579246800',
            count: 4,
            nachoes: 'FL'
        },
        'Sunshine Express - Miami',
        'Fish Tacos',
        new Date('2024-06-05T13:00:00'),
        'Sea Freight',
        {
            status: 'Arrived',
            address: '321 Palm St, Miami, FL 33101',
            eta: new Date('2024-06-06T10:00:00'),
        },
        new Date('2024-06-06T10:00:00'),
        new Date('2024-06-06T06:30:00'),
        'Customs clearance in progress',
        'Almost there!',
        '',
        ''
    ),
    createData(
        'EFGH456IJKL',
        {
            standard: 'secondary',
            num: '10293847560',
            count: 2,
            nachoes: 'WA'
        },
        'Cascade Logistics - Seattle',
        'Salmon Sushi Roll',
        new Date('2024-06-06T16:30:00'),
        'Rail Freight',
        {
            status: 'In Transit',
            address: '567 Pine St, Seattle, WA 98101',
            eta: new Date('2024-06-07T14:00:00'),
        },
        new Date('2024-06-07T14:00:00'),
        new Date('2024-06-07T09:30:00'),
        'Mechanical issues with train',
        'We apologize for the inconvenience',
        '',
        ''
    ),
    createData(
        'QRST789UVWX',
        {
            standard: 'standard',
            num: '76543210987',
            count: 3,
            nachoes: 'IL'
        },
        'Windy City Couriers - Chicago',
        'Deep Dish Pizza',
        new Date('2024-06-07T12:00:00'),
        'Ground Shipping',
        {
            status: 'Delivery',
            address: '890 Maple Ave, Chicago, IL 60601',
            eta: new Date('2024-06-07T14:30:00'),
        },
        new Date('2024-06-07T14:30:00'),
        new Date('2024-06-07T10:00:00'),
        'Heavy traffic on delivery route',
        'Delivery expected soon',
        '',
        ''
    ),
    createData(
        'LMNO678PQRS',
        {
            standard: 'express',
            num: '98765432101',
            count: 1,
            nachoes: 'NY'
        },
        'Metro Express - New York',
        'New York Cheesecake',
        new Date('2024-06-08T10:45:00'),
        'Air Freight',
        {
            status: 'Delivered',
            address: '123 Broadway, New York, NY 10002',
            eta: new Date('2024-06-08T09:30:00'),
        },
        new Date('2024-06-08T09:30:00'),
        new Date('2024-06-08T06:00:00'),
        'Delivered ahead of schedule',
        'Enjoy your dessert!',
        '',
        ''
    ),
    createData(
        'WXYZ123QRST',
        {
            standard: 'primary',
            num: '09876543210',
            count: 2,
            nachoes: 'CA'
        },
        'Golden State Couriers - San Francisco',
        'Avocado Toast',
        new Date('2024-06-09T08:30:00'),
        'Ground Shipping',
        {
            status: 'In Transit',
            address: '456 Pine St, San Francisco, CA 94101',
            eta: new Date('2024-06-10T10:00:00'),
        },
        new Date('2024-06-10T10:00:00'),
        new Date('2024-06-10T06:30:00'),
        'Delay due to road construction',
        'Thank you for your understanding',
        '',
        ''
    )
];

// Main component
export default function TableData() {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [edemand, setEdemand] = React.useState(true);
    const [showEdemand, setShowEdemad] = React.useState(false);
    const label = { inputProps: { 'aria-label': 'Checkbox demo' } };



    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const [columns, setColumns] = useState<Column[]>([]);

    useEffect(() => {
        const commonColumns: Column[] = [
            { id: 'fnr', label: 'FNR No.', class: 'fnr', innerClass: 'inner_fnr' },
            { id: 'destination', label: 'Destination', class: 'destination', innerClass: '' },
            { id: 'material', label: 'Material', class: 'material', innerClass: '' },
            { id: 'pickupdate', label: 'Pickup Date', class: 'pickupdate', innerClass: '' },
            { id: 'ownedby', label: 'Owned By', class: 'ownedby', innerClass: '' },
            { id: 'status', label: 'Status', class: 'status', innerClass: 'inner_status' },
            { id: 'initialETA', label: 'Initial ETA', class: 'initialETA', innerClass: '' },
            { id: 'currentEta', label: 'Current ETA', class: 'currentEta', innerClass: '' },
            { id: 'remarks', label: 'Remarks', class: 'remarks', innerClass: '' },
            { id: 'handlingAgent', label: 'Handling Agent', class: 'handlingAgent', innerClass: '' },
            { id: 'action', label: 'Action', class: 'action', innerClass: '' },
            { id: 'iconheader', label: <IconButton onClick={() => { setShowEdemad(!showEdemand) }}><MoreVertIcon /></IconButton>, class: 'iconheader', innerClass: 'inner_iconheader' },
        ];

        if (edemand) {
            commonColumns.unshift({ id: 'edemand', label: 'E Demand', class: 'edamand', innerClass: '' });
        }

        setColumns(commonColumns);
    }, [edemand, showEdemand]);



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
                    count={rows.length}
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
                                    return(
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
                                                     :<></>
                                                    }
                                                    {
                                                    column.id === 'iconheader' && showEdemand ?
                                                    <div className='inner_iconheader_before'>
                                                        <Checkbox {...label} size='small'  checked={edemand}
                                                            onClick={() => { setEdemand(edemand => !edemand) }}
                                                        />
                                                        <div style={{color:'black', fontWeight:'normal'}}>E Demand</div>
                                                    </div>
                                                    :<></>
                                                    }
                                                </div>
                                                {column.id === 'status' ?
                                                    <div className="fois">
                                                        <div className='fois_label'>FOIS</div>
                                                        <div className='inner_fois' ></div>
                                                    </div>
                                                    : <></>
                                                }
                                            </div>
    
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                                return (
                                    <TableRow hover key={row.edemand}>
                                        {columns.map((item) => {
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
                                            
                                            return (
                                                <TableCell key={item.id} sx={{ p: 0, pl: '10px', pt: '16px', pb: '16px', fontSize: '12px', color: '#44475B' }}
                                                    className={columnClassNames[item.id]} >
                                                    <div>
                                                        {
                                                            (typeof value) === 'object' ? '' : value

                                                        }
                                                        {
                                                            item.id === 'handlingAgent' ? 
                                                            <div><DescriptionIcon/></div>
                                                            :<></>
                                                        }
                                                        {
                                                            item.id === 'fnr' ?
                                                                <div className='fnr_container'>
                                                                    <div className='fnr_inner_data'>{value.standard}</div>
                                                                    <div className='fnr_inner_inner_data'>
                                                                        <div className='fnr_inner_inner_num'>{value.num}</div>
                                                                        <div className='fnr_inner_inner_count'>
                                                                            <div style={{ fontSize: '9px', color: 'white' }}>+{value.count}</div></div>
                                                                    </div>
                                                                    <div className='fnr_inner_inner_nachoes'>{value.nachoes}</div>
                                                                </div>
                                                                : <></>
                                                        }
                                                        {
                                                            item.id === 'pickupdate' ?

                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    <div>{formatDateTime(row.pickupdate).formattedDate}</div>
                                                                    <div>{formatDateTime(row.pickupdate).timeString}</div>
                                                                </div>
                                                                : <></>
                                                        }
                                                        {
                                                            item.id === 'initialETA' ?

                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    {/* <div>{formatDateTime(row.pickupdate).formattedDate}</div>
                                                                    <div>{formatDateTime(row.pickupdate).timeString}</div> */}
                                                                </div>
                                                                : <></>
                                                        }
                                                        {
                                                            item.id === 'currentEta' ?

                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    {/* <div>{formatDateTime(row.pickupdate).formattedDate}</div>
                                                                    <div>{formatDateTime(row.pickupdate).timeString}</div> */}
                                                                </div>
                                                                : <></>
                                                        }
                                                        {
                                                            item.id === 'status' ?
                                                            <div className='status_container'>
                                                                <div className='status_title'>{value.status}</div>
                                                                <div className='status_body'>{value.address}</div>
                                                                {/* <div className='time'>{formatDateTime(value.eta).timeString}</div> */}
                                                            </div>
                                                            :<></>
                                                        }
                                                        {
                                                            item.id === 'action' ?
                                                            <div className='action_icon'><MoreHorizIcon style={{color:'white'}}/></div>
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





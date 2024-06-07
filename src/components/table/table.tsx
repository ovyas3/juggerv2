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

// Define the Column interface
interface Column {
    id: keyof Data;
    label: string | React.ReactNode;
    minWidth?: number;
    align?: 'right';
    format?: (value: any) => string;
}

// Define the Data interface
interface Data {
    edemand: string;
    fnr: string;
    destination: string;
    material: string;
    pickupdate: string;
    typewagon: string;
    ownedby: string;
    status: string;
    initialETA: string;
    currentEta: string;
    remarks: string;
    handlingAgent: string;
    action: any;
    icon: any;
}

// Column definitions
const columns: Column[] = [
    { id: 'edemand', label: 'E Demand', minWidth: 94 },
    { id: 'fnr', label: 'FNR No.', minWidth: 116 },
    { id: 'destination', label: 'Destination', minWidth: 119 },
    { id: 'material', label: 'Material', minWidth: 88 },
    { id: 'pickupdate', label: 'Pickup Date', minWidth: 70 },
    // { id: 'typewagon', label: 'Type Of Wagon', minWidth: 60 },
    { id: 'ownedby', label: 'Owned By', minWidth: 60 },
    { id: 'status', label: 'Status', minWidth: 154 },
    { id: 'initialETA', label: 'Initial ETA', minWidth: 72 },
    { id: 'currentEta', label: 'Current ETA', minWidth: 72 },
    { id: 'remarks', label: 'Remarks', minWidth: 86 },
    { id: 'handlingAgent', label:'Handling Agent',minWidth:86},
    { id: 'action', label: 'Action', minWidth: 60 },
    { id: 'icon', label: <IconButton><MoreVertIcon /></IconButton>, minWidth: 47 },
];

// Function to create data
function createData(
    edemand: string,
    fnr: string,
    destination: string,
    material: string,
    pickupdate: Date,
    // typewagon: string,
    ownedby: string,
    status: string,
    initialETA: Date,
    currentEta: Date,
    remarks: string,
    handlingAgent:string,
    action: any,
): Data {
    const icon = <IconButton><MoreVertIcon /></IconButton>;
    return {
        edemand,
        fnr,
        destination,
        material,
        pickupdate: pickupdate.toLocaleDateString(),
        // typewagon,
        ownedby,
        status,
        initialETA: initialETA.toLocaleDateString(),
        currentEta: currentEta.toLocaleDateString(),
        remarks,
        handlingAgent,
        action,
        
    };
}

// Sample rows data
const rows = [
    createData('ED001', 'FNR001', 'Mumbai', 'Coal', new Date('2024-06-01'), 'CompanyX', 'In Transit', new Date('2024-06-05'), new Date('2024-06-07'), 'On schedule', 'abcd',null),
    createData('ED002', 'FNR002', 'Delhi', 'Iron Ore', new Date('2024-06-02'),  'CompanyY', 'Delayed', new Date('2024-06-06'), new Date('2024-06-10'), 'Delayed due to weather', 'abcd',null),
    createData('ED003', 'FNR003', 'Chennai', 'Cement', new Date('2024-06-03'),  'CompanyZ', 'Delivered', new Date('2024-06-07'), new Date('2024-06-07'), 'Delivered on time', 'abcd',null),
];

// Main component
export default function StickyHeadTable() {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <div style={{ margin: 5 }}>
            <Paper sx={{ width: '100%', overflow: 'hidden', border: '1px solid', position: 'relative', borderColor:'#E9E9EB', borderRadius:6 }}>
                <TableContainer sx={{ minHeight: 440 }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow style={{ position: 'relative',height:48, fontSize:12, fontWeight:500 , }}>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        style={{ minWidth: column.minWidth, fontSize:12, fontWeight:600,  }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.fnr}>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id}>
                                                    {value}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </div>
    );
}

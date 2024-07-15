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

interface Column {
    id: string,
    label: string;
    minWidth?: number;
   
}

interface Data {
    [key: string]: any; 
  }

const columns: readonly Column[] = [
    { id: 'name', label: 'Name', minWidth: 100 },
    { id: 'email', label: 'Email', minWidth: 100 },
    { id: 'mobile', label: 'Mobile', minWidth: 100 },
    { id: 'units', label: 'Units', minWidth: 100 },
    { id: 'verified', label: 'Verified', minWidth: 100 },
    { id: 'action', label: 'Action', minWidth:100  },
];

interface Data {
    name: string;
    email: string;
    mobile: string;
    units: string;
    verified: string;
    action:any
}

function createData(
    name: string,
    email: string,
    mobile: string,
    units: string,
    verified: string,
    action:any
): Data {
    return { name, email, mobile, units, verified, action };
}

const rows = [
    createData('this', 'Is', 'dummy', 'data', 'for','checking'),
    // createData('India', 'IN', '1324171354', '3287263', 'sdfffefer',''),
    // createData('India', 'IN', '1324171354', '3287263', 'sdfffefer',''),
    // createData('India', 'IN', '1324171354', '3287263', 'sdfffefer',''),
    // createData('India', 'IN', '1324171354', '3287263', 'sdfffefer',''),
    // createData('India', 'IN', '1324171354', '3287263', 'sdfffefer',''),
    // createData('India', 'IN', '1324171354', '3287263', 'sdfffefer',''),
    // createData('India', 'IN', '1324171354', '3287263', 'sdfffefer',''),    
];

function AgentTable() {

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
        <div style={{ width: '100%', height: '90%', display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxShadow:'none' }}>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{minHeight:50}}
                />
                <TableContainer sx={{ flexGrow: 1, overflow: 'auto',boxShadow:'  0 2px 4px rgba(26, 22, 22, 0.2)',borderRadius: '4px' }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row, firstIndex) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={firstIndex}>
                                            {columns.map((column, index):any => {
                                                const value = row[column.id];
                                                return (
                                                    <TableCell key={column.id} >
                                                        {value}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })
                            }
                        </TableBody>
                    </Table>
                </TableContainer>

            </Paper>
        </div>
    )
}

export default AgentTable;
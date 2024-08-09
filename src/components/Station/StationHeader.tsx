import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { useState, useEffect } from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import './StationHeader.css'
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface Column {
    id: string
    label: string;
    style: string;
}

const columns: readonly Column[] = [
    { id: 'sno', label: 'S.No', style: 'sno_header' },
    { id: 'stationName', label: 'Station Name', style: 'stationName_header' },
    { id: 'stationCode', label: 'Station Code', style: 'stationCode_header' },
    { id: 'zone', label: 'Zone', style: 'zone_header' },
    { id: 'state', label: 'State', style: 'state_header' },
    { id: 'location', label: 'Location', style: 'location_header' },
    { id: 'action', label: 'Action', style: 'action_header' },
];

function contructingData(stationList: any) {
    return stationList.map((
        station: {
            _id: string,
            code: string,
            geo_point: { type: string, coordinates: number[] },
            name: string,
            state: string,
            zone: string,
        }) => {
        return {
            _id: station?._id ? station?._id : 'NA',
            stationName: station?.name ? station?.name : 'NA',
            stationCode: station?.code ? station?.code : 'NA',
            zone: station?.zone ? station?.zone : 'NA',
            state: station?.state ? station?.state : 'NA',
            location: station?.geo_point?.coordinates ? station?.geo_point?.coordinates : 'NA',
        }
    })
}



export default function StationHeader({ countStation, allStations, setStationPayload }: any) {

    const [resultStation, setResultStation] = useState(contructingData([]));
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    useEffect(() => {
        setResultStation(contructingData(allStations))
    }, [allStations])

    console.log(resultStation)

    return (
        <div style={{ width: '100%', height: '90%', display: 'flex', flexDirection: 'column', paddingTop: 28 }}>
        <Paper sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 'none' }}>
             <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={countStation}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ position: 'absolute', top: -40, zIndex: 100, right: -10 }}
            />
            <TableContainer sx={{ overflow: 'auto', borderRadius: '4px', border: '1px solid #E9E9EB' }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell key={column.id} className={column.style} style={{ textAlign: 'center', padding: '8px 0px 8px 0px', fontSize: 14, fontWeight: 600, color: '#484A57' }}>
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {resultStation.map((row: any, rowIndex:number) => {
                            return (
                                <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                                    {columns.map((column) => {
                                        const value = row[column.id];
                                        return (
                                            <TableCell key={column.id} sx={{ textAlign: 'center', padding:'16px 8px 16px 8px' }}>
                                                {typeof value === 'string' && value}
                                                {column.id === 'sno' && (<div>{rowIndex + 1 + page * rowsPerPage}.</div>)}
                                                {column.id === 'location' && (
                                                    <div className='loactionClass'>
                                                        <div><LocationOnIcon style={{color:"#2962FF"}}/></div>
                                                         <div>{value[0]}, {value[1]}</div>
                                                    </div>
                                                ) }
                                                {column.id === 'action' && (
                                                    <div className='blue-square-station' >
                                                         <MoreVertIcon style={{ color: 'white', cursor: 'pointer', fontSize: '16px' }}/>
                                                    </div>
                                                )}
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

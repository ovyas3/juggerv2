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

import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { color } from 'framer-motion';
import './agentTable.css'

interface Column {
    id: string,
    label: string;
    style:string  
}
interface Data {
    [key: string]: any; 
  }
const columns: readonly Column[] = [
    {id: 'sno', label:'S No.',style:'header_sno' },
    { id: 'name', label: 'Handling Agent Name', style:'header_name' },
    { id: 'email', label: 'Email',  style:'header_email' },
    { id: 'mobile', label: 'Mobile', style:'header_mobile'},
    { id: 'verified', label: 'Verified', style:'header_verified'  },
    { id: 'action', label: 'Action',style:'header_action'  },
];

function contructingData(agentList:any) {
    return agentList.map((
        agent:{
            handling_agent:{name:string},
            email_id:string,
            mobile:string,
            agentId:string,
            status:string
    }) => {
        return {
            name :agent?.handling_agent?.name ? agent?.handling_agent?.name : 'NA', 
            email:agent?.email_id ? agent?.email_id : 'NA', 
            mobile: agent?.mobile ? agent?.mobile : 'NA', 
            agentID:agent?.agentId ? agent?.agentId : 'NA', 
            verified: agent?.status ? agent?.status : 'NA',
            id:agent?.agentId ? agent?.agentId : 'NA',
        }
    })
}

function AgentTable({agentList,count,setSkipAndLimit}:any) {  

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [result, setResult] = React.useState([]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    useEffect(()=>{
        const finalResult = contructingData(agentList)
        setResult(finalResult)
    },[agentList])

    useEffect(()=>{
        setSkipAndLimit({skip:page*rowsPerPage,limit:rowsPerPage})
    },[page,rowsPerPage])

    return (
        <div style={{ width: '100%', height: '90%', display: 'flex', flexDirection: 'column', marginTop: '35px'}}>
             <Paper sx={{position:'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxShadow:'none' }}>
                <TablePagination
                    rowsPerPageOptions={[5,10, 25,50, 100]}
                    component="div"
                    count={count}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{position:'absolute',top:-40, zIndex:100, right:-10 }}
                />
                <TableContainer sx={{ overflow: 'auto',borderRadius: '4px', border:'1px solid #E9E9EB' }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell  
                                    key={column.id} className={column.style} style={{textAlign:'center',padding:'8px 0px 8px 0px', fontSize:14, fontWeight:600, color:'#484A57'}}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {result.map((row, rowIndex) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id} sx={{ textAlign:'center' }}>
                                                    {typeof value !== 'object' && value }
                                                    {column.id === 'sno' && (
                                                        <div>{rowIndex+1+page*rowsPerPage}.</div>
                                                    )}
                                                    {column.id === 'action' && (
                                                        <div style={{backgroundColor:'#3352FF',borderRadius:'6px',height:'28px', width:'28px', display:'flex', justifyContent:'center', alignItems:'center'}}>
                                                            <MoreVertIcon  style={{ color: 'black', cursor: 'pointer', fontSize: '16px' }}/>
                                                        </div>
                                                    )}
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
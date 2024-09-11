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
import Popover from '@mui/material/Popover';
import { httpsGet, httpsPost } from '@/utils/Communication';
import { useSnackbar } from '@/hooks/snackBar';

interface Column {
    id: string,
    label: string;
    style: string
}
const columns: readonly Column[] = [
    { id: 'sno', label: 'S No.', style: 'header_sno' },
    { id: 'name', label: 'Handling Agent Name', style: 'header_name' },
    { id: 'pan', label: 'PAN Number', style: 'header_pan' },
    { id: 'email', label: 'Email', style: 'header_email' },
    { id: 'mobile', label: 'Mobile', style: 'header_mobile' },
    { id: 'verified', label: 'Verified', style: 'header_verified' },
    { id: 'action', label: 'Action', style: 'header_action' },
   
];

function contructingData(agentList: any) {
    return agentList.map((
        agent: {
            _id: string,
            handling_agent: { parent_name: string },
            email_id: string,
            mobile: string,
            agentId: string,
            status: string,
            pan: string
        }) => {
        return {
            _id: agent?._id ? agent?._id : 'NA',
            name: agent?.handling_agent?.parent_name ? agent?.handling_agent?.parent_name : 'NA',
            email: agent?.email_id ? agent?.email_id : 'NA',
            mobile: agent?.mobile ? agent?.mobile : 'NA',
            agentID: agent?.agentId ? agent?.agentId : 'NA',
            verified: agent?.status ? agent?.status.toLowerCase() : 'NA',
            id: agent?.agentId ? agent?.agentId : 'NA',
            pan: agent?.pan ? agent?.pan : 'NA'
        }
    })
}

function AgentTable({ agentList, count, setSkipAndLimit,getHandlingAgents }: any) {

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [result, setResult] = React.useState([]);

    const [openModal, setOpenModal] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const [showActionBox, setShowActionBox] = React.useState(-1);
    const { showMessage } = useSnackbar();

    function clickActionBox(e: React.MouseEvent<SVGSVGElement, MouseEvent>, index: number, id: string, locationId: string) {
        e.stopPropagation();
        setShowActionBox(prevIndex => (prevIndex === index ? -1 : index));
    }
    
    const handleChangePage = (event: unknown, newPage: number) => {setPage(newPage);};

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {setRowsPerPage(+event.target.value);setPage(0);};

    const handleClickPopoverClose =()=>{setAnchorEl(null);setShowActionBox(-1);}

    const sendingReinvite = async (item:any)=>{
        const payload = {invite_id : item._id}
        try {
            await httpsPost('re_invite/HA', payload).then((res) => {
                if (res && res.statusCode == 200) {
                    showMessage('Invited Successfully.', 'success');
                    setAnchorEl(null);
                    setShowActionBox(-1);
                    getHandlingAgents({skipAndLimit: {skip: 0, limit:10 }});
                }
            }).catch((err) => {
                console.log(err)
            })
        } catch (error) {
            console.log(error)
        }
    }
    const sendingVerification = async (item:any)=>{
        if(item?.verified === 'expired'){
            showMessage('REINVITE is required', 'error');
            return;
        }

        const payload = {invite_id : item._id}
        try {
            await httpsPost('verify/HA', payload).then((res) => {
                if (res && res.statusCode == 200) {
                    showMessage('verified Successfully.', 'success');
                    setAnchorEl(null);
                    setShowActionBox(-1);
                    getHandlingAgents({skipAndLimit: {skip: 0, limit:10 }});
                }
            }).catch((err) => {
                console.log(err)
            })
        } catch (error) {
            console.log(error)
        }
    }

    const deleteInviteHandlingAgent = async (item:any)=>{
       const invite_id = item._id;
       try {
        const response = await httpsGet(`delete/invited_HA?invite_id=${invite_id}`);
        if (response && response.statusCode == 200) {
            showMessage('deleted Successfully.', 'success');
            getHandlingAgents({skipAndLimit: {skip: 0, limit:10 }});
            setAnchorEl(null);
            setShowActionBox(-1);
        }
        else {
            showMessage('Something went wrong while deleting.', 'error');
        }
       } catch (error) {
        showMessage('Something went wrong while deleting.', 'error');
        console.log(error)
       }
    }

    useEffect(() => {
        const finalResult = contructingData(agentList)
        setResult(finalResult)
    }, [agentList])

    useEffect(() => {
        setSkipAndLimit({ skip: page * rowsPerPage, limit: rowsPerPage })
    }, [page, rowsPerPage])

    return (
        <div style={{ width: '100%', height: '90%', display: 'flex', flexDirection: 'column', paddingTop: 28 }}>
            <Paper sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 'none' }}>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    component="div"
                    count={count}
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
                            {result.map((row: any, rowIndex) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id} sx={{ textAlign: 'center' }}>
                                                    {typeof value !== 'object' && value}
                                                    {column.id === 'sno' && (<div>{rowIndex + 1 + page * rowsPerPage}.</div>)}
                                                    {column.id === 'action' && (
                                                        <div className='blue-square'>
                                                            <MoreVertIcon style={{ color: 'white', cursor: 'pointer', fontSize: '16px' }} 
                                                                onClick={(e)=>{clickActionBox(e, rowIndex, '', '');setAnchorEl(e.currentTarget as unknown as HTMLButtonElement);}} />
                                                            <Popover
                                                                open={showActionBox === rowIndex ? true : false}
                                                                anchorEl={anchorEl}
                                                                onClose={handleClickPopoverClose}
                                                                anchorOrigin={{vertical: 25,horizontal: -130,}}
                                                            >
                                                                <div className='action_items_box_HA' >
                                                                    {row.verified !== 'verified' && <div id='verified' onClick={(e)=>{sendingVerification(row)}}>Verification</div> }
                                                                    {row.verified === 'expired' && <div id='reInvite' onClick={(e)=>{sendingReinvite(row)}} >Re-Invite</div>}
                                                                    <div id='Delete' onClick={(e)=>{deleteInviteHandlingAgent(row)}}>Delete</div>
                                                                </div>
                                                            </Popover>
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
            <div className='modal_background_HA' onClick={(e) => { e.stopPropagation(); setOpenModal(false);} } style={{ display: openModal ? 'flex' : 'none'}} ></div>
        </div>
    )
}

export default AgentTable;
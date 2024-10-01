"use client";

import React from "react";
import Header from "@/components/Header/header";
import MobileHeader from "@/components/Header/mobileHeader";
import { useWindowSize } from "@/utils/hooks";
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import "./page.css";
import Image from "next/image";
import searchIcon from "@/assets/search_wagon.svg";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from "@mui/material";

interface Column {
    id: string,
    label: string;
    style: string
}
const columns: readonly Column[] = [
    { id: 'sno', label: 'SI No.', style: 'header_sno' },
    { id: 'indent', label: 'Indent No.', style: 'header_indent' },
    { id: 'edemand', label: 'e-demand no.', style: 'header_edemand' },
    { id: 'plant', label: 'Plant', style: 'header_plant' },
    { id: 'exp_loading', label: 'Expected Loading', style: 'header_exp_loading' },
    { id: 'total_wagons', label: 'Total Wagons', style: 'header_total_wagons' },
    { id: 'placement_time', label: 'Placement Time', style: 'header_placement_time' },
    { id: 'drawn_in', label: 'Drawn In', style: 'header_drawnin' },
    { id: 'action', label: 'Action', style: 'header_action' },
];

const page = () => {
  const mobile = useWindowSize(500);
  
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const handleChangePage = (event: unknown, newPage: number) => {setPage(newPage);};
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {setRowsPerPage(+event.target.value);setPage(0);};
  const result = [{ indent: 122222,edemand: 222222,plant:1111,exp_loading:"29-10-2024T21:10:23:00",drawn_in:"29-10-2024T21:10:23:00" }];


  return (
    <div className="wagon-tally-container">
      {mobile ? (
        <Header title={"Wagon Tally Sheet"} isMapHelper={false} />
      ) : (
        <MobileHeader />
      )}
      <div className="wagon-wrapper">
        <div className="search-container">
          <div className="input-wrapper">
            <Image src={searchIcon} alt="" className="icon" ></Image>
            <input className="input" placeholder="Search by Indent no."/>
          </div>
        </div>

        <div>
        <div style={{ width: '100%', height: '90%', display: 'flex', flexDirection: 'column', paddingTop: 28 }}>
            <Paper sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 'none' }}>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    component="div"
                    count={24}
                    rowsPerPage={10}
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
                                                    {column.id === 'indent' && (<div>{}</div>)}
                                                    {column.id === 'edemand' && (<div>{}</div>)}
                                                    {column.id === 'plant' && (<div>{}</div>)}
                                                    {column.id === 'exp_loading' && (<div>{}</div>)}
                                                    {column.id === 'total_wagons' && (<div>{}</div>)}
                                                    {column.id === 'placement_time' && (<div>{}</div>)}
                                                    {column.id === 'drawn_in' && (<div>{}</div>)}
                                                    {/* {column.id === 'action' && (<div>{}</div>)} */}
   


                                                    {/* {column.id === 'action' && (
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
                                                                    <div id='Delete' onClick={(e)=>{deleteActiveHandlingAgent(row)}}>Delete</div>
                                                                </div>
                                                            </Popover>
                                                        </div>
                                                    )} */}
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

        </div>
      </div>
      {mobile ? (
        <SideDrawer />
      ) : (
        <div className="bottom_bar">
          <MobileDrawer />
        </div>
      )}
    </div>
  );
};

export default page;

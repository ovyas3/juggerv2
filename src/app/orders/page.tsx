'use client'
import {useTranslations} from 'next-intl';
import SideDrawer from '@/components/Drawer/Drawer';
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header/header';
import './orders.css'
import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ReplayIcon from '@mui/icons-material/Replay';
import Filters from '@/components/Filters/filters';
import TableData from '@/components/table/table';
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import MobileHeader from "@/components/Header/mobileHeader";
import { useWindowSize } from "@/utils/hooks";
import { ShipmentsObjectPayload } from "@/utils/interface";
import { httpsPost } from "@/utils/Communication";
import { GET_SHIPMENTS } from "@/utils/helper";




const OrdersPage = () => {
  const t = useTranslations('ORDERS');
  const mobile = useWindowSize(600);
  const [allShipment, setAllShipment] = useState([]);

  //shipment payload
  const [ShipmentsPayload, setShipmentsPayload] = useState({
    is_outbound: true,
    from: '',
    to: '',
  })

  //adding to and from to shipmentpayload
  const handleToFromChange = (to : string, from: string) => {
    setShipmentsPayload(prevState => ({
      ...prevState,
      to: to,
      from: from
    }));
  };

  //adding limit and skip to shipmentpayload
  const handleSkipLimitChange = (limit : number, skip: number) => {
    setShipmentsPayload(prevState => ({
      ...prevState,
      limit: limit,
      skip: skip
    }));
  }

  // function which bring allshipment
  async function getAllShipment (){
    const response =await httpsPost(GET_SHIPMENTS,ShipmentsPayload);
    // console.log(response)
    setAllShipment(response.data)

  }

  useEffect(()=>{
    if(ShipmentsPayload.from && ShipmentsPayload.to) getAllShipment();
  },[ShipmentsPayload])


  // console.log(ShipmentsPayload)
  console.log(allShipment)

  return (
    <div  >
      <div className='orderContainer'>
        {mobile ? <SideDrawer /> : null}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          {
            mobile ? <Header></Header> : <MobileHeader />
          }

          <div style={{ paddingInline: 24, paddingTop: 24, paddingBottom: 65,  position:'relative' }}>

            {/* ----search fnr---- */}
            <div className='input_fnr_reload'>
              <div className='reload'>
                <ReplayIcon style={{ color: '#707070' }} />
              </div>
            </div>

            {/* ----otbound ---- */}
            {mobile ?
              <div className='outbound_inbound'>
                <div className="outbound_inner">{t('outbound')}</div>
              </div>
              :
              <div className='mobile_outbound_inbound'>
                <div className='mobile_outbound'>{t('outbound')}</div>
              </div>
            }


            {/* ----filter---- */}
            <div className='filters'>
              <Filters onToFromChange={handleToFromChange} />
            </div>

            {/* ----table---- */}
            <div>
              <TableData onSkipLimit={handleSkipLimitChange} allShipments={allShipment} />
            </div>

          </div>
        </div>
      </div>
      {mobile ? null :
        <div className="bottom_bar">
          <MobileDrawer />
        </div>}
    </div>
  );
};

OrdersPage.displayName = 'OrdersPage';

export default OrdersPage;

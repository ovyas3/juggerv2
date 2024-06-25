'use client'
import { useTranslations } from 'next-intl';
import SideDrawer from '../../components/Drawer/Drawer';
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header/header';
import './orders.css'
import ReplayIcon from '@mui/icons-material/Replay';
import Filters from '@/components/Filters/filters';
import TableData from '@/components/Table/table';
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import MobileHeader from "@/components/Header/mobileHeader";
import { useWindowSize } from "@/utils/hooks";
import { ShipmentsObjectPayload } from "@/utils/interface";
import { httpsGet, httpsPost } from "@/utils/Communication";
import { GET_SHIPMENTS, CAPTIVE_RAKE } from "@/utils/helper";


const getStatusCode = (status: string): string => {
  switch (status) {
    case "In Transit":
      return "ITNS"
    case "Delivered":
      return 'All' // todo:adding according to backend
    case "In Plant":
      return 'All'// todo:adding according to backend
    default:
      return 'All'
  }
}

const OrdersPage = () => {
  const t = useTranslations('ORDERS');
  const mobile = useWindowSize(500);
  const [allShipment, setAllShipment] = useState([]);
  const [count, setCount] = useState(0);
  const [rakeCaptiveList, setRakeCaptiveList] = useState([]);

  const [reload, setReload] = useState(false)
  const [statusForShipment, setStatusForShipment] = useState('All')
  const [reloadOnHeaderChange, setReloadOnHeaderChange] = useState(false);


  //shipment payload
  const [ShipmentsPayload, setShipmentsPayload] = useState<any>({
    is_outbound: true,
    to: '',
    from: '',
  })

  //adding to and from to shipmentpayload
  const handleToFromChange = (to: string, from: string) => {
    setShipmentsPayload((prevState:any) => ({
      ...prevState,
      to: to,
      from: from
    }));
  };

  //adding limit and skip to shipmentpayload
  const handleSkipLimitChange = (limit: number, skip: number,) => {
    setShipmentsPayload((prevState:any) => ({
      ...prevState,
      limit: limit,
      skip: skip
    }));
  }

  const handleChangeByFnr = (fnr: string)=>{
    setShipmentsPayload((prevState:any) => ({
      ...prevState,
      fnrNumber: fnr,
    }));
  }

  const handleChangeStatus = (status: string) =>{
    setShipmentsPayload((prevState:any) => {
      if (status === "All") {
       
        // Create a new object without the status property
        const { status, ...newState } = prevState;
        return newState;
      } else {
        return {
          ...prevState,
          status: getStatusCode(status)
        };
      }
    });
   
  }

  // function which bring allshipment   OB ITNS CPTD
  async function getAllShipment() {
    console.log(ShipmentsPayload)
    const response = await httpsPost(GET_SHIPMENTS, ShipmentsPayload);
    console.log(response)
    setAllShipment(response.data.data)
    setCount(response.data.count)
  }

  async function getCaptiveRake() {
    const list_captive_rake = await httpsGet(CAPTIVE_RAKE);
    console.log(list_captive_rake)
    setRakeCaptiveList(list_captive_rake.data)

  }

  useEffect(() => {
    getCaptiveRake();
  }, [])

  useEffect(() => {
    if (ShipmentsPayload.from && ShipmentsPayload.to) getAllShipment();
  }, [ShipmentsPayload])

  if(reloadOnHeaderChange) getAllShipment();

  return (
    <div  >
      <div className='orderContainer'>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          {
            mobile ? <Header title={'Shipments'} setReloadOnHeaderChange={setReloadOnHeaderChange} /> : <MobileHeader />
          }

          <div className='tableContainer' style={{ paddingInline: 24, paddingTop: 10, paddingBottom: mobile ? 24 : 65, position: 'relative', marginTop: mobile ? '56px' : '0px', marginLeft: mobile ? '70px' : '0px' }}>

            {/* ----search fnr---- */}
            <div className='input_fnr_reload'>
              <div className={`reload ${reload ? 'loading' : ''}`} onClick={() => {
                const { fnrNumber, ...updatedShipmentsPayload } = ShipmentsPayload;
    
                // Update the state
                setShipmentsPayload(updatedShipmentsPayload);
                
                // Log the updated payload
                console.log(updatedShipmentsPayload);
                getAllShipment();
                setReload(true)
                setTimeout(() => { setReload(false) }, 3000)
              }}>
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
            <div className='filters' >
              <Filters onToFromChange={handleToFromChange}   onChangeStatus={handleChangeStatus} />

            </div>

            {/* ----table---- */}
            <div className='tableData'>
              <TableData onSkipLimit={handleSkipLimitChange} allShipments={allShipment} count={count} rakeCaptiveList={rakeCaptiveList} statusForShipment={statusForShipment} onFnrChange={handleChangeByFnr} reload={reload}/>
            </div>

          </div>
        </div>
      </div>
      {mobile ? <SideDrawer /> : <div className="bottom_bar">
        <MobileDrawer />
      </div>}
    </div>
  );
};

OrdersPage.displayName = 'OrdersPage';

export default OrdersPage;

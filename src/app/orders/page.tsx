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
import { httpsGet, httpsPost } from "@/utils/Communication";
import { GET_SHIPMENTS, CAPTIVE_RAKE, REMARKS_LIST } from "@/utils/helper";
import { useSnackbar } from '@/hooks/snackBar';
import service from '@/utils/timeService';


const getStatusCode = (status: string): string => {
  switch (status) {
    case "In Transit":
      return "ITNS"
    case "Delivered":
      return 'Delivered'
    case "In Plant":
      return 'OB'
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
  const [reloadOnHeaderChange, setReloadOnHeaderChange] = useState(false);
  const { showMessage } = useSnackbar();
  const [selected_bound, setSelected_bound] = useState('outbound')
  const [remarksList, setRemarksList] = useState([])


  //shipment payload
  const [ShipmentsPayload, setShipmentsPayload] = useState<any>({
    is_outbound: true,
    to: '',
    from: '',
    status: ['ITNS', 'Delivered']
  })

  //adding to and from to shipmentpayload
  const handleToFromChange = (to: string, from: string) => {
    setShipmentsPayload((prevState: any) => ({
      ...prevState,
      to: service.getEpoch(new Date(to)),
      from: service.getEpoch(new Date(from)),
    }));
  };

  //adding limit and skip to shipmentpayload
  const handleSkipLimitChange = (limit: number, skip: number,) => {
    setShipmentsPayload((prevState: any) => ({
      ...prevState,
      limit: limit,
      skip: skip
    }));
  }

  const handleChangeByFnr = (fnr: string) => {
    setShipmentsPayload((prevState: any) => ({
      ...prevState,
      fnrNumber: fnr,
    }));
  }

  const handleChangeStatus = (status: string[]) => {
    setShipmentsPayload((prevState: any) => {
      if (status.length === 0) {
        const { status, ...newState } = prevState;
        return newState;
      } else {
        const modifiedStatus = status.map(getStatusCode);
        return { ...prevState, status: modifiedStatus };
      }
    });
  }

  // function which bring allshipment 
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
  async function getRemarksList (){
    const list_remarks = await httpsGet(REMARKS_LIST);
    console.log(list_remarks)
    setRemarksList(list_remarks.data)
  }

  function clearFilter() { 
    setShipmentsPayload((prevState: any) => {
      const newState = {...prevState} 
      delete newState["eDemand"]
      delete newState["destination"]
    
      return newState
  });
}

  useEffect(() => {
    getCaptiveRake();
    getRemarksList();
  }, [])

  useEffect(() => {
    if (ShipmentsPayload.from && ShipmentsPayload.to) getAllShipment();
  }, [ShipmentsPayload])

  console.log(remarksList)

  return (
    <div  >
      <div className='orderContainer'>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          {
            mobile ? <Header title={'Shipments'} setReloadOnHeaderChange={setReloadOnHeaderChange} /> : <MobileHeader />
          }

          <div className='tableContainer' style={{ paddingInline: 24, paddingTop: 10, paddingBottom: mobile ? 24 : 65, position: 'relative', marginTop: mobile ? '56px' : '0px', marginLeft: mobile ? '70px' : '0px', height: 'calc(100vh - 56px)' }}>

            <div style={{ height: '10%' }}>
              {/* ----search fnr---- */}
              <div className='input_fnr_reload'>
                <div className={`reload ${reload ? 'loading' : ''}`} onClick={() => {
                  showMessage('Refresh Successfully', 'success')
                  const { fnrNumber, ...updatedShipmentsPayload } = ShipmentsPayload;
                  setShipmentsPayload(updatedShipmentsPayload);
                  // console.log(updatedShipmentsPayload);
                clearFilter()
                  // getAllShipment();
                  setReload(true)
                  setTimeout(() => { setReload(false) }, 3000)
                }}>
                  <ReplayIcon style={{ color: '#707070' }} />
                </div>
              </div>

              {/* ----otbound ---- */}
              {mobile ?
                <div className='outbound_inbound'>
                  {['outbound', 'inbound'].map(bound => (
                    <div
                      key={bound}
                      onClick={() => setSelected_bound(bound)}
                      className={`outbound_inner ${selected_bound === bound ? 'selected_bound' : ''}`}
                    >
                      {t(bound)}
                    </div>
                  ))}
                </div>
                :
                <div className='mobile_outbound_inbound'>
                  <div className='mobile_outbound'>{t('outbound')}</div>
                </div>
              }


              {/* ----filter---- */}
              {
                selected_bound === 'outbound' ?
                  <div className='filters' >
                    <Filters onToFromChange={handleToFromChange} onChangeStatus={handleChangeStatus} reload={reload} getShipments={getAllShipment} shipmentsPayloadSetter={setShipmentsPayload}/>
                  </div>
                  : <></>
              }              
            </div>

            {/* ----table---- */}
            {
              selected_bound === 'outbound' ?
                <div className='tableData' style={{ height: '90%' }}>
                  <TableData onSkipLimit={handleSkipLimitChange} allShipments={allShipment} count={count} rakeCaptiveList={rakeCaptiveList} onFnrChange={handleChangeByFnr} reload={reload} />
                </div>
                : <></>
            }
            {
              selected_bound === 'inbound' ?
              <div>COMING SOON !!!!</div>
              :<></>
            }


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

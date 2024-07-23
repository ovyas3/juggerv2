/* eslint-disable react-hooks/exhaustive-deps */
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
import { color } from 'framer-motion';
import {getShipmentStatusSummary} from '@/utils/hooks'


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

const ageingCode = [
  { color: 'green', code: '#18BE8A', text: '1-2 days' },
  { color: 'yellow', code: '#FFD60A', text: '3-6 days' },
  { color: 'orange', code: '#FF9800', text: '6-9 days' },
  { color: 'red', code: '#E6667B', text: '≥10 days' },
]

const getRakeTypeCode = (rakeTypes: string): string => {
  switch (rakeTypes) {
    case "Captive Rakes":
      return "CR"
    case "Indian Railway Rakes":
      return 'IR'
    default:
      return 'All'
  }
}

const OrdersPage = () => {
  const t = useTranslations('ORDERS');
  const mobile = useWindowSize(500);
  const tablePagination = useWindowSize(1300);
  const [allShipment, setAllShipment] = useState([]);
  const [count, setCount] = useState(0);
  const [rakeCaptiveList, setRakeCaptiveList] = useState([]);

  const [reload, setReload] = useState(false)
  const [reloadOnHeaderChange, setReloadOnHeaderChange] = useState(false);
  const { showMessage } = useSnackbar();
  const [selected_bound, setSelected_bound] = useState('outbound')
  const [remarksList, setRemarksList] = useState({})
  const [triggerShipments, setTriggerShipments] = useState(false)

  const [showRefreash, setShowRefreash] = useState(false)


  //shipment payload
  const [ShipmentsPayload, setShipmentsPayload] = useState<any>({
    is_outbound: true,
    to: '',
    from: '',
    status: ['ITNS', 'Delivered'],
    rake_types: ['CR', 'IR']
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

  const handleChangeRakeType = (rakeTypes: string[]) => {
    setShipmentsPayload((prevState: any) => {
      if (rakeTypes.length === 0) {
        const { rake_types, ...newState } = prevState;
        return newState;
      } else {
        const modifiedStatus = rakeTypes.map(getRakeTypeCode);
        return { ...prevState, rake_types: modifiedStatus };
      }
    });
  }

  // function which bring allshipment 
  async function getAllShipment() {
    // console.log(ShipmentsPayload)
    const response = await httpsPost(GET_SHIPMENTS, ShipmentsPayload);
    if (response.data && response.data.data) {
      setAllShipment(response.data.data)
      setCount(response.data.total)
    } else {
      setAllShipment([])
      setCount(0)
    }
  }

  async function getCaptiveRake() {
    const list_captive_rake = await httpsGet(CAPTIVE_RAKE);
    // console.log(list_captive_rake)
    setRakeCaptiveList(list_captive_rake.data)
  }
  async function getRemarksList() {
    const list_remarks = await httpsGet(REMARKS_LIST);
    setRemarksList(list_remarks.data.remark_reasons)
  }

  function clearFilter() {
    setShipmentsPayload((prevState: any) => {
      const newState = { ...prevState }
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
  }, [ShipmentsPayload, triggerShipments])

  return (
    <div>
      <div className='orderContainer'>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          {mobile ? <Header title={'Shipments'} setReloadOnHeaderChange={setReloadOnHeaderChange} isMapHelper={false} /> : <MobileHeader />}
          <div
            className='tableContainer'
            style={{
              paddingInline: 24,
              paddingTop: 10,
              paddingBottom: mobile ? 24 : 65,
              position: 'relative',
              marginTop: mobile ? '56px' : '24px',
              marginLeft: mobile ? '70px' : '0px',
              height: 'calc(100vh - 56px)'
            }}
          >

            <div className='outbound_inbound_ageing'>
              {mobile ? <div className='outbound_inbound'>
                {['outbound', 'inbound'].map(bound => (
                  <div
                    key={bound}
                    onClick={() => setSelected_bound(bound)}
                    className={`outbound_inner ${selected_bound === bound ? 'selected_bound' : ''}`}
                  >
                    {t(bound)}
                  </div>
                ))}</div>
                :
                <div className='mobile_outbound_inbound'>
                  <div className='mobile_outbound'>{t('outbound')}</div>
                </div>
              }
              <div className='ageing_reload'>
                <div className='input_fnr_reload'>
                  <div className={`reload ${reload ? 'loading' : ''}`} onClick={() => {
                    showMessage('Refresh Successfully', 'success')
                    const { fnrNumber, ...updatedShipmentsPayload } = ShipmentsPayload;
                    updatedShipmentsPayload.status = ['ITNS', 'Delivered'];
                    setShipmentsPayload(updatedShipmentsPayload);
                    // console.log(updatedShipmentsPayload)
                    clearFilter()
                    setReload(true)
                    setTimeout(() => { setReload(false) }, 3000)
                  }}
                    onMouseEnter={() => { setShowRefreash(true) }}
                    onMouseLeave={() => { setShowRefreash(false) }}
                  >
                    <ReplayIcon style={{ color: '#707070' }} />
                  </div>
                  <div className='refreash_reload' style={{ opacity: showRefreash ? 1 : 0 }}>refresh filters</div>
                </div>
              </div>
            </div>

            <div className='filter_aging_table_display' style={{display:selected_bound==='inbound'?'none':'block'}}>
              <div className='filters_aging'>
                <div className='filters' style={{ overflowX: 'auto', maxWidth: '87%' }}>
                  <Filters onToFromChange={handleToFromChange} onChangeStatus={handleChangeStatus} onChangeRakeTypes={handleChangeRakeType} reload={reload} getShipments={getAllShipment} shipmentsPayloadSetter={setShipmentsPayload} setTriggerShipments={setTriggerShipments} triggerShipments={triggerShipments} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16}}>
                  <div style={{ fontSize: '12px', color: '#484A57', fontWeight: '500' }}>{t('ageing')}</div>
                  <div className='ageing_group'>
                    {ageingCode.map((item, index) => {
                      return (
                        <div key={index} className='Ageing'>
                          <div className='Ageing_dot' style={{ backgroundColor: item.color }}></div>
                          <div style={{ fontSize: '10px', color: '#484A57' }}>{item.text}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className='display_status'>
                    <div className='display_status_inner_box'>
                      <div style={{fontSize:20, fontWeight:500}}>{getShipmentStatusSummary(allShipment).total}</div>
                      <div style={{fontSize:12, color:'#7C7E8C'}}>Total</div>
                    </div>
                    <div className='display_status_inner_box'>
                      <div style={{fontSize:20, fontWeight:500}}>{getShipmentStatusSummary(allShipment).inPlant}</div>
                      <div style={{fontSize:12, color:'#7C7E8C'}}>In Plant</div>
                    </div>
                    <div className='display_status_inner_box'>
                      <div style={{fontSize:20, fontWeight:500}}>{getShipmentStatusSummary(allShipment).inTransit}</div>
                      <div style={{fontSize:12, color:'#7C7E8C'}}>In Transit</div>
                    </div>
                    <div className='display_status_inner_box'>
                      <div style={{fontSize:20, fontWeight:500}}>{getShipmentStatusSummary(allShipment).delivered}</div>
                      <div style={{fontSize:12, color:'#7C7E8C'}}>Delivered</div>
                    </div>
              </div>
              <div className='table'>
                <TableData 
                  onSkipLimit={handleSkipLimitChange} 
                  allShipments={allShipment} 
                  count={count} 
                  rakeCaptiveList={rakeCaptiveList} 
                  onFnrChange={handleChangeByFnr} 
                  reload={reload} 
                  getAllShipment={getAllShipment} 
                  setTriggerShipments={setTriggerShipments} 
                  triggerShipments={triggerShipments} 
                  remarksList={remarksList} />
              </div>
            </div>

            {selected_bound === 'inbound' ?
              <div className='coming-soon'>COMING SOON !!!</div>
              : <></>
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

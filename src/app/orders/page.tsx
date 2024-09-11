/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useTranslations } from 'next-intl';
import SideDrawer from '../../components/Drawer/Drawer';
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header/header';
import './orders.css'
// import ReplayIcon from '@mui/icons-material/Replay';
import RefreshIcon from '@mui/icons-material/Refresh';
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
import { getShipmentStatusSummary } from '@/utils/hooks'
import { useRouter } from 'next/navigation';


const getStatusCode = (status: string): string => {
  switch (status) {
    case "Available eIndent":
      return "AVE"
    case "Ready for Departure":
      return "RFD"
    case "In Transit":
      return "ITNS"
    case "Delivered At Hub":
      return 'Delivered'
    case "Delivered At Customer":
      return 'Delivered'
    case "In Plant":
      return 'INPL'
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
  const [status, setStatus] = useState(['In Transit', 'Delivered At Hub', 'Delivered At Customer']);

  const [showRefreash, setShowRefreash] = useState(false)
  const route = useRouter();

    //totalCount
    const [totalCountrake, setTotalCountrake] = useState<any>([])

    const[query, setQuery] = useState<any>({
      from:'',
      to:''
    })

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
    const toEpoch = service.getEpoch(new Date(to));
    const fromEpoch = service.getEpoch(new Date(from));

    setShipmentsPayload((prevState: any) => ({
      ...prevState,
      to: toEpoch,
      from: fromEpoch,
    }));

    setQuery({
      from: fromEpoch,
      to: toEpoch
    });
  };

  async function totalCount (fromDate: string, toDate: string) {
    const payload:any = {
      from: fromDate,
      to: toDate,
    }
    console.log("payload", payload);
    
    const response = await httpsGet(`get/status_count?from=${payload.from.ts}&to=${payload.to.ts}`,0,route );
    return response;
  }

  useEffect(() => {
    if (query.from && query.to) {
      totalCount(query.from, query.to).then((res: any) => {
        if (res && res.statusCode == 200) {
          setTotalCountrake(res.data);
        }
      }).catch((err) => {
        console.log(err);
      });
    }
  }, [query]);

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
    setStatus(status);
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
    const response = await httpsPost(GET_SHIPMENTS, ShipmentsPayload,0,false,route );
    if (response.data && response.data.data) {
      setAllShipment(response.data.data)
      setCount(response.data.total)
    } else {
      setAllShipment([])
      setCount(0)
    }
  }

//   useEffect(()=>{
//     totalCount(ShipmentsPayload.from, ShipmentsPayload.to).then((res : any)=>{
//         if(res && res.statusCode == 200){
//             setTotalCountrake(res.data)
//         }

//     }).catch((err)=>{
//         console.log(err)
//     })
// },[])

  async function getCaptiveRake() {
    const list_captive_rake = await httpsGet(CAPTIVE_RAKE,0,route );
    // console.log(list_captive_rake)
    setRakeCaptiveList(list_captive_rake.data)
  }
  async function getRemarksList() {
    const list_remarks = await httpsGet(REMARKS_LIST,0,route );
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

  const getStatusColor = (statuses: string[], div: string) => {
    let backgroundColor = '#FFFFFF';
    let countTextColor = '#42454E';
    let textTextColor = '#7C7E8C';
  
    switch (div) {
      case 'In Plant':
        if (statuses.includes('In Plant')) {
          backgroundColor = '#a3dfe11f';
          countTextColor = '#134d68'; 
          textTextColor = '#134d68'; 
        }
        break;
      case 'In Transit':
        if (statuses.includes('In Transit')) {
          backgroundColor = '#FF98001F';
          countTextColor = '#FF9800'; 
          textTextColor = '#FF9800'; 
        }
        break;
      case 'Delivered':
        if (statuses.includes('Delivered At Hub') || statuses.includes('Delivered At Customer')) {
          backgroundColor = '#18BE8A1F';
          countTextColor = '#18BE8A'; 
          textTextColor = '#18BE8A'; 
        }
        break;
        case 'AVE':
          if (statuses.includes('Available eIndent') ) {
            backgroundColor = '#E6EAFF';
            countTextColor = '#536AFE'; 
            textTextColor = '#536AFE'; 
          }
          break;
      default:
        backgroundColor = '#FFFFFF';
        countTextColor = '#42454E';
        textTextColor = '#7C7E8C';
    }
  
    return { backgroundColor, countTextColor, textTextColor };
  };

  useEffect(() => {
    getCaptiveRake();
    getRemarksList();
  }, [])

  useEffect(() => {
    if (ShipmentsPayload.from && ShipmentsPayload.to) getAllShipment();
  }, [ShipmentsPayload, triggerShipments])

  const fetchTotalCount = totalCountrake[0]?.totalCount || 0;
  const inTransitCount = totalCountrake[0]?.statuses?.find((item: any) => item.status === "ITNS")?.count || 0;
  const deliveredCount = totalCountrake[0]?.statuses?.find((item: any) => item.status === "Delivered")?.count || 0;
  const inPlantCount = totalCountrake[0]?.statuses?.find((item: any) => item.status === "INPL")?.count || 0;
  const availableeIndentCount = totalCountrake[0]?.statuses?.find((item: any) => item.status === "AVE")?.count || 0;

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
                    setTimeout(() => { setReload(false) }, 1500)
                  }}
                    onMouseEnter={() => { setShowRefreash(true) }}
                    onMouseLeave={() => { setShowRefreash(false) }}
                  >
                    <RefreshIcon style={{ color: '#707070' }} />
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
              </div>
              <div className='display_status'>
                    <div className='display_status_inner_box' style={{
                      backgroundColor: (status.includes('Available eIndent') && status.includes('Ready for Departure') && status.includes('In Transit') && status.includes('Delivered At Hub') && status.includes('Delivered At Customer')) ? '#000000' : '#FFFFFF',
                    }}>
                      <div style={{fontSize:20, fontWeight:500, color: (status.includes('Available eIndent') && status.includes('Ready for Departure') && status.includes('In Transit') && status.includes('Delivered At Hub') && status.includes('Delivered At Customer')) ? '#FFFFFF' : '#000000'}}>{fetchTotalCount}</div>
                      <div style={{fontSize:12, color: (status.includes('Available eIndent') && status.includes('Ready for Departure') && status.includes('In Transit') && status.includes('Delivered At Hub') && status.includes('Delivered At Customer')) ? '#FFFFFF' : '#7C7E8C'}}>{t('Total')}</div>
                    </div>
                    <div className='display_status_inner_box' style={{backgroundColor: getStatusColor(status, 'AVE').backgroundColor}}>
                      <div style={{fontSize:20, fontWeight:500, color: getStatusColor(status, 'AVE').countTextColor}}>{availableeIndentCount}</div>
                      <div style={{fontSize:12, color: getStatusColor(status, 'AVE').textTextColor}}>{t('eIndent')}</div>
                    </div>
                    <div className='display_status_inner_box' style={{backgroundColor: getStatusColor(status, 'In Plant').backgroundColor}}>
                      <div style={{fontSize:20, fontWeight:500, color: getStatusColor(status, 'In Plant').countTextColor}}>{inPlantCount}</div>
                      <div style={{fontSize:12, color: getStatusColor(status, 'In Plant').textTextColor}}>{t('In Plant')}</div>
                    </div>
                    <div className='display_status_inner_box' style={{backgroundColor: getStatusColor(status, 'In Transit').backgroundColor}}>
                      <div style={{fontSize:20, fontWeight:500, color: getStatusColor(status, 'In Transit').countTextColor}}>{inTransitCount}</div>
                      <div style={{fontSize:12, color: getStatusColor(status, 'In Transit').textTextColor}}>{t('In Transit')}</div>
                    </div>
                    <div className='display_status_inner_box' style={{backgroundColor: getStatusColor(status, 'Delivered').backgroundColor}}>
                      <div style={{fontSize:20, fontWeight:500, color: getStatusColor(status, 'Delivered').countTextColor}}>{deliveredCount}</div>
                      <div style={{fontSize:12, color: getStatusColor(status, 'Delivered').textTextColor}}>{t('Delivered')}</div>
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

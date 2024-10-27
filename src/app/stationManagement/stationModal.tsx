'use client'
import React, { useEffect, useState, useRef } from 'react';
import './style.css'
import CloseIcon from '@mui/icons-material/Close';
import { httpsGet, httpsPost } from '@/utils/Communication';
import ThreeDotsWave from '@/app/stationManagement/loaderAnimation';
import { useSnackbar } from '@/hooks/snackBar';
import { useRouter } from 'next/navigation';

function StationAdd({ setOpenAddStationModal, getStations, stationPayload, editStationPayload, editFlag }: any) {
    const router = useRouter();
    const { showMessage } = useSnackbar();
    const [allZones, setAllZones] = useState<string[]>([]);
    const [allStates, setAllStates] = useState<string[]>([]);
    const [orginalZones, setOrginalZones] = useState<string[]>([]);
    const [orginalStates, setOrginalStates] = useState<string[]>([]);

    const [openZoneDialogBox, setOpenZoneDialogBox] = useState(false);
    const [openStateDialogBox, setOpenStateDialogBox] = useState(false);

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const [stationCode, setStationCode] = useState('');
    const [loaderForStationCode, setLoaderForStationCode] = useState(false);
    const [stationList, setStationList] = useState<{name: string, _id: string}[]>([])
    const [openStationCode, setOpenStationCode] = useState(true);

    const [latitudeError, setLatitudeError] = useState('');
    const [longitudeError, setLongitudeError] = useState('');

    const [zoneError,setZoneError] = useState('')
    const [stateError,setStateError] = useState('')

    const [stationAddObject, setStationAddObject] = useState({
        stationName: '',
        stationCode: '',
        zone: '',
        state: '',
        latitude: '',
        longitude: '',
        stationCodeId: '',
    })

    useEffect(() => {
        if (editFlag) {
            setStationAddObject({
                stationName: editStationPayload?.stationName,
                stationCode: editStationPayload?.stationCode,
                zone: editStationPayload?.zone,
                state: editStationPayload?.state,
                latitude: editStationPayload?.location[0],
                longitude: editStationPayload?.location[1],
                stationCodeId: '-1',
            });
            setStationCode(editStationPayload?.stationCode);
        }
        if (!editFlag) {
            setStationAddObject({
                stationName: '',
                stationCode: '',
                zone: '',
                state: '',
                latitude: '',
                longitude: '',
                stationCodeId: '',
            });
            setStationCode('');
        }
    }, [editFlag, editStationPayload]); 

    async function getAllZones() {
        await httpsGet('get/zones', 0 , router).then((response) => {
            setAllZones(response.data);
            setOrginalZones(response.data);
        }).catch((error) => {
            console.log(error)
        })
    }

    async function getAllState() {
        await httpsGet('get/states', 0 , router).then((response) => {
            setAllStates(response.data);
            setOrginalStates(response.data);
        }).catch((error) => {
            console.log(error)
        })
    }

    function handleZoneChange(e: any) {
        setStationAddObject({ ...stationAddObject, zone: e.target.value });
        const filteredZones = orginalZones.filter((zone) => zone.toLowerCase().includes(e.target.value.toLowerCase()));
        
        setAllZones(filteredZones);
        const isValidZone = filteredZones.some(zone => 
            zone.toLowerCase() === e.target.value.toLowerCase()
        );
        if ( !filteredZones.length && !isValidZone && e.target.value !== '') {setZoneError('Zone must be from the given list');} 
        else {setZoneError('');}
    }

    function handleStateChange(e: any) {
        setStationAddObject({ ...stationAddObject, state: e.target.value });
        const filteredStates = orginalStates.filter((state) => state.toLowerCase().includes(e.target.value));
        setAllStates(filteredStates);
        const isValidZone = orginalStates.some(zone => 
            zone.toLowerCase() === e.target.value.toLowerCase()
        );
        if ( !filteredStates.length && !isValidZone && e.target.value !== '') {setStateError('State must be from the given list');} 
        else {setStateError('');}
    }

    async function handleStationCodeChange(e: any) {
        setOpenStationCode(true);
        if (e.target.value) { setLoaderForStationCode(true) } else { setLoaderForStationCode(false); setStationList([]); setStationAddObject({...stationAddObject, stationName:''}) }
        const value = e.target.value.toUpperCase();
        setStationCode(value);
        setStationAddObject({...stationAddObject, stationCode:value})
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(async () => {
            try {
                if (!value) {
                    setLoaderForStationCode(false);
                    return;
                }
                await httpsGet(`get/station_code?stationCode=${value}`, 1, router).then((response) => {
                    if(response.data.length > 0){
                        setStationList(response.data);
                        setLoaderForStationCode(false);
                    }else{
                        setStationList([{name:'No Data Found', _id:'0'}]);
                        setLoaderForStationCode(false);
                    }
                    
                }).catch((error) => {
                    console.log(error)
                })
            } catch (error) {
                console.log(error);
              }
        }, 2000);
    }

    const handleLatitudeChange = (e:any) => {
        const value = e.target.value;
        if (value === '' || (value >= -90 && value <= 90)) {
          setStationAddObject({ ...stationAddObject, latitude: value });
          setLatitudeError('');
        } else {
            setLatitudeError('Latitude must be between -90 and 90 degrees');
        }
    };

    const handleLongitudeChange = (e:any) => {
        const value = e.target.value;
        if (value === '' || (value >= -180 && value <= 180)) {
          setStationAddObject({ ...stationAddObject, longitude: value });
          setLongitudeError('');
        } else {
            setLongitudeError('Longitude must be between -180 and 180 degrees');
        }
    };

    async function handleStationAdd() {
        const validationRules = [
          { condition: () => stationAddObject.stationCodeId === '0' || !stationAddObject.stationName || stationAddObject.stationName === 'No Data Found', message: 'Please Enter Valid Details For Station' },
          { condition: () => !stationAddObject.stationCode, message: 'Please Enter Station Code' },
          { condition: () => stationList[0]?.name === 'No Data Found', message: 'Please Enter Valid Details For Station' },
          { condition: () => !stationAddObject.latitude, message: 'Please Enter Latitude' },
          { condition: () => latitudeError !== '', message: 'Please Enter valid Latitude' },
          { condition: () => !stationAddObject.longitude, message: 'Please Enter Longitude' },
          { condition: () => longitudeError !== '', message: 'Please Enter valid Longitude' },
          { condition: () => !stationAddObject.zone, message: 'Please Enter Zone' },
          { condition: () => !stationAddObject.state, message: 'Please Enter State' },
          { condition: () => zoneError !== '', message: 'Please Enter valid Zone' },
          { condition: () => stateError !== '', message: 'Please Enter valid State' },
        ];
        for (const rule of validationRules) {
          if (rule.condition()) {
            showMessage(rule.message, 'error');
            return;
          }
        }
        const payload ={
            name: stationAddObject.stationName,
            code: stationAddObject.stationCode,
            lat: stationAddObject.latitude,
            long: stationAddObject.longitude,
            zone: stationAddObject.zone,
            state: stationAddObject.state
        }
        if(!editFlag){
            try {
                await httpsPost('add/stations', payload, router).then((res) => {
                    if(res.statusCode === 200){
                        getStations({stationPayload});
                        setOpenAddStationModal(false);
                        setLongitudeError('');
                        setLatitudeError('');
                        setOpenAddStationModal(false); 
                        setStationAddObject({stationCodeId:'', stationName:'', stationCode:'', zone:'', state:'', latitude:'', longitude:''}); 
                        setStationCode('') ;
                        showMessage('Station Added Successfully', 'success');
                    }
                }).catch((error) => {
                    console.log(error)
                })
            } catch (error) {
                console.log(error);
              }
        }
        if(editFlag){
            const editPayload = {
                id: editStationPayload._id,
                name: stationAddObject.stationName,
                code: stationAddObject.stationCode,
                lat: stationAddObject.latitude,
                long: stationAddObject.longitude,
                zone: stationAddObject.zone,
                state: stationAddObject.state
            }
            try {
                await httpsPost('edit/stations', editPayload, router).then((res) => {
                    if (res.statusCode === 200) {
                        getStations({stationPayload});
                        setOpenAddStationModal(false);
                        setLongitudeError('');
                        setLatitudeError('');
                        setOpenAddStationModal(false); 
                        setStationAddObject({stationCodeId:'', stationName:'', stationCode:'', zone:'', state:'', latitude:'', longitude:''}); 
                        setStationCode('') ;
                        showMessage('Station Added Successfully', 'success');
                    }
                })
            }catch (error) {
                console.log(error);
              } 

        }
    }

    useEffect(() => {
        getAllZones();
        getAllState();
    }, [])

    return (
        <div className='container_station_modal' onClick={(e) => { e.stopPropagation(); setOpenZoneDialogBox(false); setOpenStateDialogBox(false);}}>
            <div>{editFlag ? 'Edit Station' : 'Add Station'}</div>
            <form>
                <div>
                    <p>Station Code</p>
                    <input type='text' placeholder='search station code' onChange={(e) => { handleStationCodeChange(e) }} value={stationCode}/>
                    <div>{loaderForStationCode ? <ThreeDotsWave /> :
                        <div className='dropDownForZones' >
                            {openStationCode && stationList?.map((item: any, index: number) => {
                                return (<div key={index} className='zoneItem' onClick={()=>{setOpenStationCode(false); setStationAddObject({...stationAddObject, stationCodeId:item._id, stationName:item.name}) }} >{item.name}</div>)
                            })}
                        </div>
                    }</div>
                </div>
                <div>
                    <p>Station Name</p>
                    <input type='text' placeholder='' disabled value={stationAddObject.stationName} />
                </div>
                <div style={{ position: 'relative' }}>
                    <p>Zone</p>
                    <input type='text' placeholder='search zone' onClick={(e) => { setOpenZoneDialogBox(true); e.stopPropagation(); }} onChange={(e) => { handleZoneChange(e) }} value={stationAddObject.zone}/>
                    <div className='dropDownForZones' style={{ display: openZoneDialogBox ? 'block' : 'none', zIndex:"1502 !important" }} >
                        {allZones?.map((item: any, index: number) => {
                            return (
                                <div className='zoneItem' onClick={() => { setOpenZoneDialogBox(false); setStationAddObject({...stationAddObject, zone:item}) }} key={index}>{item}</div>
                            );
                        })}
                    </div>
                    <div style={{position:'absolute', top:55}} >{zoneError}</div>
                </div>
                <div style={{ position: 'relative' }}>
                    <p>State</p>
                    <input type='text' placeholder='search state' onClick={(e) => { setOpenStateDialogBox(true); e.stopPropagation(); }} onChange={(e) => { handleStateChange(e) }} value={stationAddObject.state}/>
                    <div className='dropDownForZones' style={{ display: openStateDialogBox ? 'block' : 'none' }} >
                        {allStates?.map((item: any, index: number) => {
                            return (
                                <div className='zoneItem' onClick={() => { setOpenStateDialogBox(false); setStationAddObject({...stationAddObject, state:item}) }} key={index}>{item}</div>
                            );
                        })}
                    </div>
                    <div style={{position:'absolute', top:55}} className='stateError'>{stateError}</div>
                </div>
                <div>
                    <p>Longitude</p>
                    <input type='number' placeholder='' onChange={(e) => { setStationAddObject({...stationAddObject, latitude:e.target.value}); handleLatitudeChange(e); }} value={stationAddObject.latitude} />
                    <div>{latitudeError}</div>
                </div>
                <div>
                    <p>Latitude</p>
                    <input type='number' placeholder='' onChange={(e) => { handleLongitudeChange(e);setStationAddObject({...stationAddObject, longitude:e.target.value}); }} value={stationAddObject.longitude} />
                    <div>{longitudeError}</div>
                </div>
            </form>
            <div>
                <button onClick={()=> {handleStationAdd()} } >SUBMIT</button>
                <button onClick={(e) => { e.stopPropagation(); setOpenAddStationModal(false);setStationAddObject({stationCodeId:'', stationName:'', stationCode:'', zone:'', state:'', latitude:'', longitude:''});setStationCode('')  }} >CANCEL</button>
            </div>
            <div className='back_icon_containor'><CloseIcon onClick={(e) => { setLongitudeError('');setLatitudeError('');e.stopPropagation(); setOpenAddStationModal(false); setStationAddObject({stationCodeId:'', stationName:'', stationCode:'', zone:'', state:'', latitude:'', longitude:''}); setStationCode('')  }} /></div>
        </div>
    )
}
export default StationAdd;
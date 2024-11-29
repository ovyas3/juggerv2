import en from './../../../messages/en.json'
import fnrIcon from '@/assets/active_fnr_dashboard_icon.svg'
import Image from 'next/image'
import defaultLogo from '@/assets/logo_default_icon.svg';
import ProfileDrop from '@/components/Header/proFileDrop'


export default function MobileHeader() {
    return (
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', paddingRight:'24px',
            border :'1px solid #DFE3EB', height:'56px', backgroundColor:'white',position:'fixed', top:'0', left:'0', zIndex:'1', width:'100%'
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div><Image src={defaultLogo} alt='' /></div>

                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#42454E', }} >{en.HEADER.shipments}</div>
            </div>

            <div className='profile_pic'>
                <ProfileDrop />
            </div>
        </div>
    )
}
import en from './../../../messages/en.json'
import Image from 'next/image'
import defaultLogo from '@/assets/logo_default_icon.svg';
import ProfileDrop from '@/components/Header/proFileDrop'
import { usePathname } from 'next/navigation'

export default function MobileHeader() {
    const pathname = usePathname()
    
    const getTitle = () => {
        switch(pathname) {
            case '/externalParking':
                return 'External Parking'
            case '/plantSchedule':
                return 'Invoicing Day / Shift Wise'
            case '/invoicingDashboard':
                return 'Invoicing Dashboard'
            default:
                return 'Dashboard'
        }
    }

    return (
        <div style={{
            display:'flex', 
            alignItems:'center', 
            justifyContent:'space-between', 
            paddingRight:'24px',
            border:'1px solid #DFE3EB', 
            height:'56px', 
            backgroundColor:'white',
            position:'fixed', 
            top:'0', 
            left:'0', 
            right: '0',
            zIndex:'999', 
            width:'100%'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '16px' }}>
                <div style={{ marginRight: '12px' }}><Image src={defaultLogo} alt='logo' /></div>
                <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#42454E',
                }}>{getTitle()}</div>
            </div>

            <div className='profile_pic'>
                <ProfileDrop />
            </div>
        </div>
    )
}
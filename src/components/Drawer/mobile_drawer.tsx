import en from './../../../messages/en.json'
import TrainIcon from '@mui/icons-material/Train';
import Image from 'next/image';
import contactIcon from '@/assets/inactive_contact_dashboard+icon.svg'




function MobileDrawer (){
    return(
    <div style={{display:'flex',justifyContent:'space-evenly',
    paddingTop:16
    }}>
        
        <div style={{
            
            height:'30px',
            width:'30px',
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            borderRadius:'6px'
        }}>
            <TrainIcon style={{color:'#7C7E8C'}}/>
        </div>

        <div style={{
           
            height:'30px',
            width:'30px',
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            borderRadius:'6px'
        }}>
            <Image src={contactIcon} alt=''/>
        </div>

        <div style={{ 
            height:'30px',
            width:'30px',
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            borderRadius:'6px'
        }}>
            <TrainIcon style={{color:'#7C7E8C'}}/>
        </div>

    </div>
);
}

export default MobileDrawer;
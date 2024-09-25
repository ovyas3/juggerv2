import './style.css';
import CloseIcon from '@mui/icons-material/Close';


function EtaDashboardModal ({providedShipments, setOpenModalDelay}:any){
   
    return(
    <div style={{width:'100vw', height:'100vh', position:'fixed', top:0, left:0 ,zIndex:300, backgroundColor:'rgba(0, 0, 0, 0.5)'}} onClick={(e)=>{e.stopPropagation(); setOpenModalDelay(false);}}>
        <div style={{display:'flex',justifyContent:'center', alignItems:'center', width:'80vw', minWidth:1200, height:650, backgroundColor:'white', position:'relative', top:'50%', left:'50%', transform:'translate(-50%,-50%)', borderRadius:20, padding:25}} onClick={(e)=>{e.stopPropagation()}}>
           <div style={{fontSize:'48px', fontWeight:'bold'}}>COMING SOON !!!</div>
           <div className="closeContaioner"><CloseIcon onClick={(e) => { e.stopPropagation(); setOpenModalDelay(false) }}/></div>
        </div>
    </div>
       
    );
}

export default EtaDashboardModal;
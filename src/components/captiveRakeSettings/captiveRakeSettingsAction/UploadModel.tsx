'use client';
import CloseIcon from '@mui/icons-material/Close';
import './UploadModel.css';
import { useEffect, useState, useRef } from "react";
import React from "react";
import { useTranslations } from 'next-intl';
import Button from '@mui/material/Button';
import { httpsPost, httpsGet } from '@/utils/Communication';
import { useSnackbar } from '@/hooks/snackBar';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useRouter } from "next/navigation";


function UploadModel({setOpenUploadModel}:any){

    const router = useRouter();
    const t = useTranslations('ORDERS');
    const [fileName, setFileName] = useState('Drag and Drop to upload the file here');
    const [uploadFile, setUploadFile] = useState<any>({});
    const { showMessage } = useSnackbar();

    const handleDragOver = (e:any) => {
        e.preventDefault();
        e.stopPropagation();
      };
      const handleDrop = (e :any) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            if(e.dataTransfer.files[0].name.split('.').pop() !== 'csv') {
                showMessage('Please upload only csv file', 'error');
                setUploadFile({});
                setFileName('Drag and Drop to upload the file here');
                return;
            }
            setUploadFile(e.dataTransfer.files[0]);
            setFileName(e.dataTransfer.files[0].name);
            e.dataTransfer.clearData();
        }
      };
      const uploadWagonSheet = async () => {
        if(fileName === 'Drag and Drop to upload the file here') {
            showMessage('Please upload the Daily Rake Handling Sheet', 'error');
            return;
        }

        const payload = {
            file: uploadFile
        }

        await httpsPost('upload/captive_rake', payload, router, 0, true).then((response: any) => {
            if(response.statusCode === 200) {
                setOpenUploadModel(false); 
                setFileName('Drag and Drop to upload the file here');
                setUploadFile({});
                showMessage('File Uploaded Succcessfully', 'success');
            }
            else showMessage(response.message, 'error')
        }).catch((err)=> {
            console.log(err); 
            showMessage('Failed to upload the file', 'error')
        }) 

      }

    return(
        <div style={{width:'100vw', height:'100vh', position:'fixed', top:0, left:0 ,zIndex:300, backgroundColor:'rgba(0, 0, 0, 0.5)', display:'flex', alignItems:'center', justifyContent:'center'}} onClick={(e)=>{e.stopPropagation(); setOpenUploadModel(false);}}>
        <div style={{width:850, height:550, borderRadius:10, backgroundColor:'white',position:'relative', padding:20}} onClick={(e)=>{e.stopPropagation()}}>
            <div id="closeContaioner"><CloseIcon onClick={(e) => { e.stopPropagation(); setOpenUploadModel(false); }}/></div>

            <div style={{display:'flex', justifyContent:'space-between',}}>
                <header style={{fontSize:20, color:'#131722', fontWeight:600}}>Upload File</header>
            </div>

            <div 
                id="fileUploadContainer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <label htmlFor="input-file" className="fileUpload">
                <input type="file" accept=".csv" id="input-file" hidden onChange={(e)=>{  if (e.target.files) {setFileName(e.target.files[0].name); setUploadFile(e.target.files[0]) }}} />
                    <div className="fileUploadContent">
                        <div style={{textAlign:'center'}}><CloudUploadIcon style={{width:30, height:30, color:'#5481FF'}}  /></div>
                        <header style={{color:'#71747A', fontSize:12, marginBottom:10,textAlign:'center'}}>{fileName}</header>
                        <div style={{display:'flex', justifyContent:'center', alignItems:'center', marginBottom:8}}><div style={{width:135, height:36 , borderRadius:4, backgroundColor:'#42454E', color:'white', textAlign:'center', alignContent:'center', fontSize:12}}>Browse and Upload</div></div>
                        <p style={{color:'#71747A', fontSize:12,textAlign:'center'}}>Only <span style={{color:'#131722', fontWeight:600}}>CSV</span> file format will be accepted</p>
                    </div>
                </label>
            </div>

            <div>
               <p className="sampleFile" onClick={(e)=>{e.stopPropagation();  window.open('https://docs.google.com/spreadsheets/d/18sF1ybRgrk-BRhMVZkIFnwT7DX7Ui8yGDW9rPVyv_xw/edit?gid=0#gid=0', '_blank'); } } >Download Sample File</p>
            </div>

            <div id="buttonContaioner">
                <Button className="buttonMarkPlacement" onClick={(e)=>{ e.stopPropagation(); setUploadFile({}); setFileName('Drag and Drop to upload the file here'); }} style={{color:'#2862FF', border:'1px solid #2862FF', width:110, cursor:'pointer', fontWeight:'bold', transition:'all 0.5s ease-in-out'}}>{t('clear')}</Button>
                <Button className="buttonMarkPlacement" onClick={(e)=>{e.stopPropagation(); uploadWagonSheet(); }} style={{color:'white', backgroundColor:'#2862FF',width:110, border:'1px solid #2862FF', cursor:'pointer', fontWeight:'bold',transition:'all 0.5s ease-in-out' }}>{t('upload')}</Button>
            </div> 

        </div>
    </div>
    )
}

export default UploadModel;

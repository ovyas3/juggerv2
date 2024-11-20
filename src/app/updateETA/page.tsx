"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header/header";
import MobileHeader from "@/components/Header/mobileHeader";
import { useWindowSize } from "@/utils/hooks";
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import { useSnackbar } from "@/hooks/snackBar";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { httpsGet, httpsPost } from "@/utils/Communication";
import { useRouter } from "next/navigation";
import { ThreeCircles } from "react-loader-spinner";

function UpdateETA() {
    const router = useRouter();
    const { showMessage } = useSnackbar();
    const mobile = useWindowSize(500);
    const [loading, setLoading] = useState(false);
    const [time, setTime] = useState("");
    useEffect(() => {
        const fetchPreviousTime = async () => {
            try {
                setLoading(true);
                const response = await httpsGet('get/preferred/difference', 0, router);
                if (response?.statusCode === 200 && response?.data?.preferred_difference_eta) {
                    setTime(response.data.preferred_difference_eta);
                    setLoading(false);
                } else {
                    setLoading(false);
                    showMessage('Unable to fetch preferred ETA', 'error');
                }
            } catch (error) {
                setLoading(false);
                console.log('Error fetching preferred ETA:', error);
                showMessage('An error occurred while fetching ETA', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchPreviousTime();
    }, []);
    const handleChange = (event: SelectChangeEvent) => {
        setTime(event.target.value);
    };

    const handleUpdate = async () => {
        const payload = {
            preferred_eta: time,
        };
        
        try {
            setLoading(true);
            const response = await httpsPost(`rake_shipment/preferred_eta`, payload, router);
            if (response?.statusCode === 200) {
                setLoading(false);
                showMessage(' Updated Successfully',"success");
            }
        } catch (error) {
            setLoading(false);
            console.log('Error:', error);
            showMessage('An error occurred, please try again', 'error');
          } finally {
            setLoading(false);
          }
    };

    if (loading) {
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <ThreeCircles
              visible={true}
              height="100"
              width="100"
              color="#20114d"
              ariaLabel="three-circles-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          </div>
        );
      }

    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column',margin:'40px' }}>
                
                <div>
                    <div style={{ color: '#3351FF', fontSize: '14px', fontWeight: 500, marginLeft: '8px', position: 'relative', display: 'inline-block' ,gap:'10px'}}>
                        Update ETA
                    </div>
                </div>

                <div style={{ marginTop: '30px' }}>
                    <div style={{ color: '#42454E', fontSize: '12px', marginBottom: '8px'  }}>
                        Preferred Difference in ETA
                    </div>
                    <FormControl sx={{ minWidth: 210 }} size="small">
                        <Select
                            labelId="demo-select-small-label"
                            id="demo-select-small"
                            value={time}
                            onChange={handleChange}
                            sx={{
                                borderRadius: '4px',
                                height: '36px',
                                width: '200px',
                                backgroundColor: '#ffff',
                                marginTop: '10px',
                                border:'1px solid #E9E9EB'
                            }}
                        >
                            <MenuItem value={60}>1 hr</MenuItem>
                            <MenuItem value={120}>2 hr</MenuItem>
                            <MenuItem value={180}>3 hr</MenuItem>
                            <MenuItem value={240}>4 hr</MenuItem>
                            <MenuItem value={360}>6 hr</MenuItem>
                            <MenuItem value={420}>{">"} 6 hr</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                <div style={{ marginTop: '40px' }}>
                    <button
                        style={{
                            width: '102px',
                            height: '40px',
                            backgroundColor: '#3351FF',
                            color: '#fff',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                        }}
                        onClick={handleUpdate}
                    >
                        UPDATE
                    </button>
                </div>
            </div>

            {/* {mobile ? (
                <SideDrawer />
            ) : (
                <div className="bottom_bar">
                    <MobileDrawer />
                </div>
            )} */}
        </div>
    );
}

export default UpdateETA;

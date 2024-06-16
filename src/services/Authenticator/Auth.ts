'use client'
import { httpsPost } from "@/utils/Communication";
import { setCookies, hasCookie } from "@/utils/storageService";

const authenticate = async (rms_auth: string) => {
  const authenticated = httpsPost('tms_rms/verify', { rms_auth }).then((res) => {
    console.log({data: res.data});
    const {
      access_token_web,
      default_unit,
      shippers,
      name,
    } = res;
    setCookies('access_token', access_token_web);
    setCookies('default_unit', default_unit);
    localStorage.setItem('shippers', JSON.stringify(shippers));
    localStorage.setItem('user_name', name);
    let selectedShipper = shippers.find((shipper: any) => shipper._id === default_unit);
    if (!selectedShipper) selectedShipper = shippers[0] as any;
    setCookies('selected_shipper', selectedShipper._id);
    setCookies('parent_name', selectedShipper.parent_name);
    localStorage.setItem('selected_shipper', selectedShipper._id);
    return true;
  }).catch((err) => {
    console.log(err);
    return false;
  })

  return authenticated;
}

const checkAuth = async (rms_auth: string)=> {
  console.log('in auth', {rms_auth});
  if (hasCookie('access_token')) {
    return true;
  }
  const isAuth = await authenticate(rms_auth);
  return isAuth;
}

export default checkAuth;
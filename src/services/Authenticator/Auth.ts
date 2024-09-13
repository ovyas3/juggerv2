'use client'
import { httpsPost } from "@/utils/Communication";
import { setCookies, getCookie, hasCookie } from "@/utils/storageService";

const authenticate = async (rms_auth: string) => {
  const authenticated = await httpsPost('tms_rms/verify', { rms_auth }).then((res) => {
    const {
      access_token_web,
      default_unit,
      shippers,
      name,
      roles,
      corporate_shippers
    } = res;
    localStorage.setItem('user_name', name);
    localStorage.setItem('roles', JSON.stringify(roles));
    setCookies('default_unit', default_unit);
    setCookies('access_token', access_token_web);
    if (corporate_shippers && corporate_shippers.length > 0 && corporate_shippers[0]?.parent_name) {
      setCookies('is_corporate_user', 'true');
      const corporate_shipper = corporate_shippers.map((shipper: any) => ({
        _id: shipper._id,
        name: shipper.parent_name
      }));
      localStorage.setItem('corporate_shipper', JSON.stringify(corporate_shipper));
      localStorage.setItem('selected_shipper', corporate_shipper[0]?._id);
      setCookies('selected_shipper', corporate_shipper[0]?._id);
    } else {
      setCookies('is_corporate_user', 'false');
      localStorage.setItem('shippers', JSON.stringify(shippers));
      let selectedShipper = shippers.find((shipper: any) => shipper._id === default_unit);
      if (!selectedShipper) selectedShipper = shippers[0] as any;
      setCookies('selected_shipper', selectedShipper._id);
      setCookies('parent_name', selectedShipper.parent_name);
      localStorage.setItem('selected_shipper', selectedShipper._id);
    }
    return true;
  }).catch((err) => {
    console.log(err);
    return false;
  })

  return authenticated;
}

const checkAuth = async (rms_auth: string)=> {
  console.log('in auth', {rms_auth});
  if (!(rms_auth && rms_auth.length) && hasCookie('access_token')) {
    return true;
  }
  const isAuth = await authenticate(rms_auth);
  return isAuth;
}

export const getAuth = () => {
  const token = getCookie('access_token');
  const shipper =  localStorage.getItem('selected_shipper');

  return `bearer ${token} shipper ${shipper}`

}

export default checkAuth;
"use client";
import { httpsPost } from "@/utils/Communication";
import { setCookies, getCookie, hasCookie } from "@/utils/storageService";

const authenticate = async (data: any) => {
  const {
    access_token_web,
    access_token,
    default_unit,
    shippers,
    name,
    roles,
    corporate_shippers,
  } = data;
  localStorage.setItem("user_name", name);
  localStorage.setItem("roles", JSON.stringify(roles));
  setCookies("default_unit", default_unit);
  setCookies("access_token", access_token_web || access_token);
  if (
    corporate_shippers &&
    corporate_shippers.length > 0 &&
    corporate_shippers[0]?.parent_name
  ) {
    setCookies("is_corporate_user", "true");
    const corporate_shipper = corporate_shippers.map((shipper: any) => ({
      _id: shipper._id,
      name: shipper.parent_name,
    }));
    localStorage.setItem(
      "corporate_shipper",
      JSON.stringify(corporate_shipper)
    );
    localStorage.setItem("selected_shipper", corporate_shipper[0]?._id);
    setCookies("selected_shipper", corporate_shipper[0]?._id);
  } else {
    setCookies("is_corporate_user", "false");
    localStorage.setItem("shippers", JSON.stringify(shippers));
    let selectedShipper = shippers.find(
      (shipper: any) => shipper._id === default_unit
    );
    if (!selectedShipper) selectedShipper = shippers[0] as any;
    setCookies("selected_shipper", selectedShipper._id);
    setCookies("parent_name", selectedShipper.parent_name);
    localStorage.setItem("selected_shipper", selectedShipper._id);
  }
};

export const handleAuthentication = async (
  from: string,
  rms_auth: string = "",
  rms_data: any = {}
) => {
  if (from === "tms_rms" && rms_auth) {
    localStorage.removeItem('isRMSLogin')
    const authenticated = await httpsPost("tms_rms/verify", { rms_auth })
      .then((res) => {
        if(res) {
        authenticate(res);
          return true;
        } else {
          return false;
        }
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
    return authenticated;
  } else if (from === "rms_login" && rms_data) {
    try {
      authenticate(rms_data);
      localStorage.setItem("isRmsLogin", "true");
      return true;
    } catch {
      return false;
    }
  }
  return false;
};

const checkAuth = async (from: string, rms_auth: string) => {
  if (!(rms_auth && rms_auth.length) && hasCookie("access_token")) {
    return true;
  }
  const isAuth = await handleAuthentication(from, rms_auth);
  return isAuth;
};

export const getAuth = () => {
  const token = getCookie("access_token");
  const shipper = localStorage.getItem("selected_shipper");

  return `bearer ${token} shipper ${shipper}`;
};

export default checkAuth;

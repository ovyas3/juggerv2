// import { DateTime } from "luxon"; 

// export const INBOUND_API_URL =
//   "https://prod-api.instavans.com/api/fois/v1/dummy/getShipment";
// export const INBOUND_API_BULK =
//   "https://prod-api.instavans.com/api/fois/v1/dummy/bulkUpload";
// export const INBOUND_API_CONTACT_DETAILS =
//   "https://prod-api.instavans.com/api/fois/v1/dummy/contact_details";
// export const INBOUND_API_STATION_LIST =
//   "https://prod-api.instavans.com/api/fois/v1/dummy/station_list";


// export const formatDate = (date : any, format= "dd/MM/yyyy hh:mm a") :any => {
//   return DateTime.fromJSDate(new Date(date)).toFormat(format);
// }

export const GET_SHIPMENTS = 'rake_shipment/getShipment';
export const CAPTIVE_RAKE = 'rake_shipment/get/captive_rakes';
export const UPDATE_RAKE_CAPTIVE_ID = 'rake_shipment/update_rake_captive_id';
export const REMARKS_UPDATE_ID = 'add/remark';
export const REMARKS_LIST = 'get/remark/reasons';

export const STATIONS ='get/stations';
export const ZONES = 'get/zones';
export const STATES = 'get/states';
export const ADDSTATIONS = 'add/stations';
export const EDITSTATIONS = 'edit/stations';

export const FETCH_TRACK_DETAILS = 'fetch/track_details'
export const HANDLING_AGENT_INVITE = 'handling_agent/handling_agent_invite'
export const EXISTING_AGENT_INVITE = 'handling_agent/existing_handling_agent_invite'
export const UPDATE_ELD = 'edit/expected_loading_date'

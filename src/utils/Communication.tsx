import axios from 'axios';
const prefix = [
    'https://prod-api.instavans.com/api/fois/',
    'https://dev-rms-api.instavans.com/api/mysterio/'
]

const httpGet = async (path: string, type: number = 0) => {
  const url = prefix[type] + path;
  const response = await axios.get(url);
  return response.data;
}

const httpPost = async (path: string, data: any, type = 0) => {
  const url = prefix[type] + path;
  const response = await axios.post(url, data);
  return response.data;
}

const callAPI = async (type: string, url: string, body: any) => {
  console.log("type", type, "url", url);
  let response;
  switch (type) {
    case "get":
      response = await axios.get(url, { params: body });
      break;
    case "post":
      response = await axios.post(url, body);
      break;
    default:
      break;
  }
  // console.log("communication", url, " \n", response.data);
  return response ? response.data : null;
};

const apiCall = async (config: object) => await axios(config)

export { httpGet, callAPI, httpPost, apiCall };
export default callAPI;
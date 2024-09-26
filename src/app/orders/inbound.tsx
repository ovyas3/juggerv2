import React, {useState, useEffect} from "react";
import InboundFilters from '@/components/inbound/inboundFilters';
import InboundDashboard from '@/components/inbound/inboundDashboard';
import InboundTable from '@/components/inbound/inboundTable';
import { httpsPost , httpsGet} from "@/utils/Communication";
import TableData from "@/components/Table/table";
import { useRouter } from 'next/navigation';

function Inbound() {


  const [allShipment, setAllShipment] = useState<any>([]);
  const [count, setCount] = useState(0);
  const [rakeCaptiveList, setRakeCaptiveList] = useState([]);
  const route = useRouter();
  const [inBoundPayload, setInBoundPayload] = useState<any>({
    skip:0,
    limit:10,
    is_outbound:false,
    from:'',
    to:'',
    status:['ITNS', 'Delivered']
  });
  const [countInbound, setCountInbound] = useState({
    total:0,
    ITNS:0,
    Delivered:0
  });

  async function getInboundList() {
    const response = await httpsPost('rake_shipment/getShipment',inBoundPayload,0,false);
    if (response.data && response.data) {
      setAllShipment(response.data.data)
      setCount(response.data.total)
    }
  }

  async function getCaptiveRake() {
    const list_captive_rake = await httpsGet('rake_shipment/get/captive_rakes',0,route );
    setRakeCaptiveList(list_captive_rake.data)
  }

  async function getCountInbound() {
    let from = new Date(inBoundPayload.from).getTime();
    let to = new Date(inBoundPayload.to).getTime();
    const response = await httpsGet(`get/status_count?from=${from}&to=${to}&outbound=false`)
    if (response.statusCode === 200) {
      const data = response.data[0]?.statuses || [];
      const totalCount = response.data[0]?.totalCount || data.reduce((sum : any, item : any) => sum + item.count, 0);
      const statusCounts = data.reduce((acc : any, item : any) => {
        acc[item.status] = item.count;
        return acc;
      }, {});

      setCountInbound((prevState) => ({
        ...prevState,
        total: totalCount,
        ITNS: statusCounts.ITNS || 0, 
        Delivered: statusCounts.Delivered || 0, 
      }));
    }
  }
  useEffect(()=>{
    if(inBoundPayload.from && inBoundPayload.to) {
      getInboundList();
      getCountInbound();
    }
  },[inBoundPayload])

  return (
    <div id="inboundContainer">
      <section id="filtersAndDashboard">
        <InboundFilters setInBoundPayload={setInBoundPayload} />
        <InboundDashboard setInBoundPayload={setInBoundPayload} countInbound={countInbound}/>
      </section>
      <section id="inboundTable">
        <InboundTable allShipment={allShipment} count={count} setInBoundPayload={setInBoundPayload} />
      </section>
    </div>
  );
}

export default Inbound;

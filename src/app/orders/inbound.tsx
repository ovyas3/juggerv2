import React from "react";
import InboundFilters from '@/components/inbound/inboundFilters';
import InboundDashboard from '@/components/inbound/inboundDashboard';
import InboundTable from '@/components/inbound/inboundTable';

function Inbound() {
  return (
    <div id="inboundContainer">
      <section id="filtersAndDashboard">
        <InboundFilters />
        <InboundDashboard />
      </section>
      <section id="inboundTable">
        <InboundTable />
      </section>
    </div>
  );
}

export default Inbound;

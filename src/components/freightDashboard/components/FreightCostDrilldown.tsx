import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FreightDashboardCard } from './FreightDashboardCard';
import { FreightDashboardSelect } from './FreightDashboardSelect';

const distanceData = [
  { slab: "0-100km", cost: 1000 },
  { slab: "101-500km", cost: 2500 },
  { slab: "501-1000km", cost: 4000 },
  { slab: "1001-2000km", cost: 6000 },
  { slab: ">2000km", cost: 8000 },
];

const timeData = [
  { period: "Q1", cost: 4000 },
  { period: "Q2", cost: 4500 },
  { period: "Q3", cost: 5000 },
  { period: "Q4", cost: 5500 },
];

export function FreightCostDrilldown() {
  const [drilldownType, setDrilldownType] = useState("distance");

  const data = drilldownType === "distance" ? distanceData : timeData;
  const xKey = drilldownType === "distance" ? "slab" : "period";

  return (
    <FreightDashboardCard
      title="Freight Cost Drill-down"
      subtitle="Analyze costs by distance or time period"
    >
      <FreightDashboardSelect
        options={[
          { value: "distance", label: "Distance Slabs" },
          { value: "time", label: "Time Period" },
        ]}
        value={drilldownType}
        onChange={setDrilldownType}
        placeholder="Select drill-down type"
      />
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="cost" fill="#2A9D8F" />
        </BarChart>
      </ResponsiveContainer>
    </FreightDashboardCard>
  );
}


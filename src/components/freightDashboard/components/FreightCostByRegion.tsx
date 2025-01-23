import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FreightDashboardCard } from './FreightDashboardCard';

const data = [
  { region: "North", road: 4000, rail: 2400, sea: 2400 },
  { region: "South", road: 3000, rail: 1398, sea: 2210 },
  { region: "East", road: 2000, rail: 9800, sea: 2290 },
  { region: "West", road: 2780, rail: 3908, sea: 2000 },
];

export function FreightCostByRegion() {
  return (
    <FreightDashboardCard
      title="Freight Costs by Region"
      subtitle="Breakdown of costs by transportation mode"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="region" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="road" stackId="a" fill="#2A9D8F" />
          <Bar dataKey="rail" stackId="a" fill="#E76F51" />
          <Bar dataKey="sea" stackId="a" fill="#264653" />
        </BarChart>
      </ResponsiveContainer>
    </FreightDashboardCard>
  );
}


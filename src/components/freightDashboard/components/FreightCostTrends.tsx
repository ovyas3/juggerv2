import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FreightDashboardCard } from './FreightDashboardCard';

const data = [
  { month: "Jan", cost: 4000 },
  { month: "Feb", cost: 3000 },
  { month: "Mar", cost: 5000 },
  { month: "Apr", cost: 4500 },
  { month: "May", cost: 4800 },
  { month: "Jun", cost: 5200 },
];

export function FreightCostTrends() {
  return (
    <FreightDashboardCard
      title="Freight Cost Trends"
      subtitle="Monthly freight costs over time"
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="cost"
            stroke="#2A9D8F"
            strokeWidth={2}
            dot={{ fill: '#2A9D8F' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </FreightDashboardCard>
  );
}


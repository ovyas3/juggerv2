// pages/index.tsx

import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box } from '@mui/material';

const data = [
  { month: 'January', section1: 10, section2: 20, section3: 30 },
  { month: 'February', section1: 20, section2: 30, section3: 40 },
  { month: 'March', section1: 30, section2: 40, section3: 50 },
  { month: 'April', section1: 40, section2: 50, section3: 60 },
  { month: 'May', section1: 50, section2: 60, section3: 70 },
  { month: 'June', section1: 60, section2: 70, section3: 80 },
  { month: 'July', section1: 70, section2: 80, section3: 90 },
];

const BarsDataset = () => {
  return (
    <Box sx={{ width: '80%', margin: 'auto', mt: 5 }}>
      <BarChart
         
        xAxis={[{ scaleType:'band',dataKey: 'month', label: 'Month' }]}
        yAxis={[{ label: 'Value' }]}
        dataset={data}
        series={[
          { dataKey: 'section1', label: 'Section 1', color: 'rgba(255, 99, 132, 0.5)' },
          { dataKey: 'section2', label: 'Section 2', color: 'rgba(54, 162, 235, 0.5)' },
          { dataKey: 'section3', label: 'Section 3', color: 'rgba(75, 192, 192, 0.5)' },
        ]}
        width={800}
        height={400}
      />
    </Box>
  );
};

export default BarsDataset;

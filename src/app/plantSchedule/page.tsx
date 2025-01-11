// import PlantSchedule from '@/components/PlantSchedule/PlantSchedule';
// import SideDrawer from '@/components/Drawer/Drawer';

// export default function PlantSchedulePage() {
//   return (
//     <>
//       <SideDrawer />
//       <PlantSchedule />
//     </>
//   );
// }

'use client';

import PlantSchedule from '@/components/PlantSchedule/PlantSchedule';
import SideDrawer from '@/components/Drawer/Drawer';
import MobileDrawer from '@/components/Drawer/mobile_drawer';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function PlantSchedulePage() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      {!mobile ? <SideDrawer /> : <MobileDrawer />}
      <PlantSchedule />
    </>
  );
}

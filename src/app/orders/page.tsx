// write example code

import SideDrawer from '@/components/Drawer/Drawer';
import React from 'react';

import Header from '@/components/Header/header';
import TableData from '@/components/Table/table';



const OrdersPage = () => {
    return (
      <div style={{display:'flex', flexDirection:'row', height: '100vh'}}>

        <SideDrawer/>

        <div style={{width:'100%' }}>
          <div><Header></Header></div>
          <div><TableData></TableData></div>
        </div>

      </div>
    );
};

OrdersPage.displayName = 'OrdersPage';

export default OrdersPage;

// write example code

import SideDrawer from '@/components/drawer/Drawer';
import React from 'react';
// import { OrderList } from '../components/order-list';
// import { Order } from '../types';
import Header from '@/components/Header/header';
import TableData from '@/components/table/table';

const orders: any = [
  {
    id: 1,
    name: 'Order 1',
    description: 'Description 1',
  },
  {
    id: 2,
    name: 'Order 2',
    description: 'Description 2',
  },
  {
    id: 3,
    name: 'Order 3',
    description: 'Description 3',
  },
];

// const Order = ({ orderData }: { orderData: any }) => {
//   return <div key={orderData.id}>
//     <h2>{orderData.name}</h2>
//     <p>{orderData.description}</p>
//   </div>
// }

// Order.displayName = 'order';

const OrdersPage = () => {
    return (
      <div style={{display:'flex', flexDirection:'row',}}>
        <div ><SideDrawer/></div>
        <div style={{backgroundColor:'green', }}>
          <div><Header></Header></div>
          <div>headhjbfjkvjevhjekjvejvhjerker</div>
          <div>content</div>
        </div>
      </div>
    );
};

OrdersPage.displayName = 'OrdersPage';

export default OrdersPage;

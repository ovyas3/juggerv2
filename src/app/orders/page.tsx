// write example code

import React from 'react';
// import { OrderList } from '../components/order-list';
// import { Order } from '../types';

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

const Order = ({ orderData }: { orderData: any }) => {
  return <div key={orderData.id}>
    <h2>{orderData.name}</h2>
    <p>{orderData.description}</p>
  </div>
}

Order.displayName = 'order';

const OrdersPage = () => {
    return (
      <div>
        <h1>Orders</h1>
        {orders && orders.length > 0 ? orders.map((orderData: any) => < Order orderData={orderData} key={orderData.id}  />) : <p>No orders found</p>}
      </div>
    );
};

OrdersPage.displayName = 'OrdersPage';

export default OrdersPage;

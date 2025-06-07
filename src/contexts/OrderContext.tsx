
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem } from './CartContext';

export interface Order {
  id: string;
  items: CartItem[];
  status: 'confirmed' | 'preparing' | 'on_way' | 'delivered';
  total: number;
  deliveryAddress: string;
  paymentMethod: string;
  estimatedTime: number;
  deliveryPerson?: {
    name: string;
    photo: string;
    rating: number;
  };
  createdAt: Date;
}

interface OrderContextType {
  currentOrder: Order | null;
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrder: (orderId: string) => Order | null;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const orderId = Math.random().toString(36).substr(2, 9);
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: new Date(),
      deliveryPerson: {
        name: 'João Silva',
        photo: '/placeholder.svg',
        rating: 4.8
      }
    };
    
    setOrders(prev => [...prev, newOrder]);
    setCurrentOrder(newOrder);
    
    // Simular mudanças de status automaticamente
    setTimeout(() => updateOrderStatus(orderId, 'preparing'), 2000);
    setTimeout(() => updateOrderStatus(orderId, 'on_way'), 10000);
    setTimeout(() => updateOrderStatus(orderId, 'delivered'), 20000);
    
    return orderId;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
    
    if (currentOrder?.id === orderId) {
      setCurrentOrder(prev => prev ? { ...prev, status } : null);
    }
  };

  const getOrder = (orderId: string) => {
    return orders.find(order => order.id === orderId) || null;
  };

  return (
    <OrderContext.Provider value={{
      currentOrder,
      createOrder,
      updateOrderStatus,
      getOrder
    }}>
      {children}
    </OrderContext.Provider>
  );
};

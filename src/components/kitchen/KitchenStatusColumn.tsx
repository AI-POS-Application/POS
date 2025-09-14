'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ChefHat, CheckCircle } from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/types';
import KitchenOrderCard from './KitchenOrderCard';
import { KITCHEN_STATUS_CONFIG } from '@/lib/constants';

interface KitchenStatusColumnProps {
  status: OrderStatus;
  orders: Order[];
  onStatusUpdate: (orderId: number, newStatus: OrderStatus) => void;
  onOrderSelect: (order: Order) => void;
  isUpdating: boolean;
  getCustomerName: (orderId: number) => string;
  getOrderType: (orderId: number) => string;
}

export default function KitchenStatusColumn({
  status,
  orders,
  onStatusUpdate,
  onOrderSelect,
  isUpdating,
  getCustomerName,
  getOrderType
}: KitchenStatusColumnProps) {
  const statusInfo = KITCHEN_STATUS_CONFIG[status];

  const getStatusIcon = () => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Preparing':
        return <ChefHat className="h-4 w-4 text-orange-600" />;
      case 'Ready':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className="rounded-xl shadow-sm border h-fit">
      <CardHeader className="px-3 py-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            {getStatusIcon()}
            {statusInfo.label}
          </span>
          <Badge className={`text-xs ${statusInfo.color}`}>
            {orders.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="space-y-2">
          {orders.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No {statusInfo.label.toLowerCase()} orders
            </p>
          ) : (
            orders.map((order) => (
              <KitchenOrderCard
                key={order.id}
                order={order}
                onStatusUpdate={onStatusUpdate}
                onOrderSelect={onOrderSelect}
                isUpdating={isUpdating}
                getCustomerName={getCustomerName}
                getOrderType={getOrderType}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

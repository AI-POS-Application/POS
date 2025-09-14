'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ChefHat, CheckCircle, AlertCircle } from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/types';
import Image from 'next/image';
import { KITCHEN_STATUS_CONFIG } from '@/lib/constants';
import { formatPriceWithDecimals } from '@/lib/utils';

interface KitchenOrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: number, newStatus: OrderStatus) => void;
  onOrderSelect: (order: Order) => void;
  isUpdating: boolean;
  getCustomerName: (orderId: number) => string;
  getOrderType: (orderId: number) => string;
}

export default function KitchenOrderCard({
  order,
  onStatusUpdate,
  onOrderSelect,
  isUpdating,
  getCustomerName,
  getOrderType
}: KitchenOrderCardProps) {
  const [isNew, setIsNew] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const statusInfo = KITCHEN_STATUS_CONFIG[order.status];
  const customerName = getCustomerName(order.id);
  const orderType = getOrderType(order.id);
  const nextStatus = statusInfo.nextStatus;

  // Mark as not new after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setIsNew(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate time elapsed since order creation
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000);
      setTimeElapsed(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [order.createdAt]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (order.status) {
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Preparing':
        return <ChefHat className="h-4 w-4 text-orange-600" />;
      case 'Ready':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card 
      className={`border rounded-lg p-2 hover:shadow-md transition-all duration-200 cursor-pointer ${
        isNew ? 'ring-2 ring-primary/50 bg-primary/5' : ''
      }`}
      onClick={() => onOrderSelect(order)}
    >
      <div className="space-y-2">
        {/* Order Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold text-xs">
                Order #{order.id.toString().padStart(3, '0')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {orderType} • Table {order.tableNumber}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium">{formatPriceWithDecimals(order.totalAmount)}</p>
            <p className="text-xs text-muted-foreground">
              {formatTime(timeElapsed)}
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-semibold">
            {String.fromCharCode(65 + (order.tableNumber % 26))}
          </div>
          <span className="text-xs font-medium">{customerName}</span>
          {isNew && (
            <Badge variant="default" className="text-xs bg-primary">
              New
            </Badge>
          )}
        </div>

        {/* Order Items Preview */}
        <div className="space-y-1">
          {order.items?.slice(0, 2).map((item: any) => (
            <div key={item.id} className="flex items-center gap-2 text-xs">
              <Image
                src={item.image}
                alt={item.itemName}
                width={20}
                height={20}
                className="rounded aspect-square object-cover"
              />
              <span className="truncate">{item.itemName}</span>
              <span className="text-muted-foreground">x{item.quantity}</span>
            </div>
          ))}
          {order.items && order.items.length > 2 && (
            <p className="text-xs text-muted-foreground">
              +{order.items.length - 2} more items
            </p>
          )}
        </div>

        {/* Action Button */}
        {nextStatus && (
          <Button
            size="sm"
            className="w-full h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onStatusUpdate(order.id, nextStatus);
            }}
            disabled={isUpdating}
          >
            {order.status === 'Pending' && 'Start Preparing'}
            {order.status === 'Preparing' && 'Mark Ready'}
          </Button>
        )}

        {/* Status Badge for Ready orders */}
        {order.status === 'Ready' && (
          <div className="flex justify-center">
            <Badge className={`text-xs ${statusInfo.color}`}>
              {statusInfo.label}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}

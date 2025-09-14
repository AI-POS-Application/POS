'use client';

import { useState, useEffect } from 'react';
import { useApi, useApiMutation } from '@/hooks/use-api';
import type { Order, OrderStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, AlertCircle, ChefHat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatPriceWithDecimals } from '@/lib/utils';
import Image from 'next/image';
import { KITCHEN_ORDER_STATUSES, KITCHEN_STATUS_CONFIG, REFRESH_INTERVALS, UI_CONSTANTS } from '@/lib/constants';
import KitchenStatusColumn from '@/components/kitchen/KitchenStatusColumn';

const KITCHEN_STATUSES = KITCHEN_ORDER_STATUSES.map(status => ({
  value: status,
  ...KITCHEN_STATUS_CONFIG[status]
}));

export default function KitchenDisplayPage() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();
  
  // Fetch orders from API
  const { data: orders, loading, error, refetch } = useApi<Order[]>('/api/orders');
  
  // Mutation for updating order status
  const { mutate: updateOrderStatus, loading: updating } = useApiMutation();

  // Auto-refresh for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastUpdated(new Date());
    }, REFRESH_INTERVALS.KITCHEN_DISPLAY);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        data: { status: newStatus }
      });
      
      toast({
        title: "Status Updated",
        description: `Order #${orderId} status updated to ${newStatus}`,
      });
      
      // Refresh orders list
      refetch();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusInfo = (status: OrderStatus) => {
    return KITCHEN_STATUSES.find(s => s.value === status) || KITCHEN_STATUSES[0];
  };

  const getOrderType = (orderId: number): string => {
    return orderId % 2 === 0 ? 'Dine In' : 'Take Away';
  };

  const getCustomerName = (orderId: number): string => {
    const names = ['Eve', 'Vlona', 'Nielson', 'Alexandra', 'Daniel', 'Sarah', 'Michael', 'Emma'];
    return names[orderId % names.length];
  };

  // Filter orders that are relevant to kitchen
  const kitchenOrders = orders?.filter(order => 
    KITCHEN_ORDER_STATUSES.includes(order.status as any)
  ) || [];

  // Group orders by status
  const ordersByStatus = kitchenOrders.reduce((acc, order) => {
    if (!acc[order.status]) {
      acc[order.status] = [];
    }
    acc[order.status].push(order);
    return acc;
  }, {} as Record<OrderStatus, Order[]>);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-xs text-muted-foreground">Loading kitchen orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="text-center">
          <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
          <p className="text-destructive text-sm">Failed to load kitchen orders</p>
          <Button onClick={() => refetch()} className="mt-2 h-8 text-xs">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-3 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Kitchen Display
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage order preparation • Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={loading}
            className="h-8 text-xs"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Orders by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {KITCHEN_STATUSES.map((statusInfo) => {
          const orders = ordersByStatus[statusInfo.value] || [];
          
          return (
            <KitchenStatusColumn
              key={statusInfo.value}
              status={statusInfo.value}
              orders={orders}
              onStatusUpdate={handleStatusUpdate}
              onOrderSelect={setSelectedOrder}
              isUpdating={updating}
              getCustomerName={getCustomerName}
              getOrderType={getOrderType}
            />
          );
        })}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <CardHeader className="px-3 py-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">Order Details - #{selectedOrder.id}</CardTitle>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedOrder(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Order Type:</span>
                    <p className="font-medium text-sm">{getOrderType(selectedOrder.id)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Table:</span>
                    <p className="font-medium text-sm">{selectedOrder.tableNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium text-sm">{selectedOrder.status}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <p className="font-medium text-sm">{formatPriceWithDecimals(selectedOrder.totalAmount)}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Order Items</h4>
                  <div className="space-y-1">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Image
                            src={item.image}
                            alt={item.itemName}
                            width={32}
                            height={32}
                            className="rounded-md aspect-square object-cover"
                          />
                          <div>
                            <p className="font-medium text-xs">{item.itemName}</p>
                            <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-xs">{formatPriceWithDecimals(item.subtotal)}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update Button */}
                {getStatusInfo(selectedOrder.status).nextStatus && (
                  <div className="pt-3 border-t">
                    <Button
                      className="w-full h-8 text-xs"
                      onClick={() => {
                        const nextStatus = getStatusInfo(selectedOrder.status).nextStatus;
                        if (nextStatus) {
                          handleStatusUpdate(selectedOrder.id, nextStatus);
                          setSelectedOrder(null);
                        }
                      }}
                      disabled={updating}
                    >
                      {selectedOrder.status === 'Pending' && 'Start Preparing'}
                      {selectedOrder.status === 'Preparing' && 'Mark Ready to Serve'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

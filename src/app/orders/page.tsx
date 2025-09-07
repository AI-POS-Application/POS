'use client';

import { useState, useEffect } from 'react';
import { useApi, useApiMutation } from '@/hooks/use-api';
import type { Order, OrderStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, CheckCircle, AlertCircle, Users, DollarSign, Calendar, Search, Plus, Eye, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const ORDER_STATUSES: { value: OrderStatus; label: string; color: string; icon: any }[] = [
  { value: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { value: 'Preparing', label: 'Preparing', color: 'bg-orange-100 text-orange-800', icon: Clock },
  { value: 'Ready', label: 'Ready', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'Served', label: 'Served', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  { value: 'Paid', label: 'Paid', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('Latest Order');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [itemStatuses, setItemStatuses] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  
  // Fetch orders from API
  const { data: orders, loading, error, refetch } = useApi<Order[]>('/api/orders');
  
  // Mutation for updating order status
  const { mutate: updateOrderStatus, loading: updating } = useApiMutation();

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

  const handleItemStatusToggle = (orderId: number, itemId: number) => {
    const key = `${orderId}-${itemId}`;
    setItemStatuses(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getStatusInfo = (status: OrderStatus) => {
    return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
  };

  const getProgressPercentage = (status: OrderStatus): number => {
    switch (status) {
      case 'Pending': return 10;
      case 'Preparing': return 40;
      case 'Ready': return 80;
      case 'Served': return 90;
      case 'Paid': return 100;
      default: return 0;
    }
  };

  const getOrderType = (orderId: number): string => {
    // Simple logic to determine order type based on ID
    return orderId % 2 === 0 ? 'Dine In' : 'Take Away';
  };

  const getCustomerName = (orderId: number): string => {
    const names = ['Eve', 'Vlona', 'Nielson', 'Alexandra', 'Daniel', 'Sarah', 'Michael', 'Emma'];
    return names[orderId % names.length];
  };

  const filteredOrders = orders?.filter(order => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      order.id.toString().includes(searchTerm) || 
      getCustomerName(order.id).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'Latest Order':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'Oldest Order':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'Order Type':
        return getOrderType(a.id).localeCompare(getOrderType(b.id));
      default:
        return 0;
    }
  });

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: OrderStatus[] = ['Pending', 'Preparing', 'Ready', 'Served', 'Paid'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive">Failed to load orders</p>
          <Button onClick={() => refetch()} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-8 w-8" />
            Orders
          </h1>
          <p className="text-muted-foreground">Manage and track all restaurant orders</p>
        </div>
      </div>

      {/* Search and Create Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Order ID or Customer Name"
            className="pl-9 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Order
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'All', count: orders?.length || 0 },
          { label: 'In Progress', count: orders?.filter(o => ['Pending', 'Preparing'].includes(o.status)).length || 0 },
          { label: 'Ready to Served', count: orders?.filter(o => o.status === 'Ready').length || 0 },
          { label: 'Waiting for Payment', count: orders?.filter(o => o.status === 'Served').length || 0 }
        ].map((filter) => (
          <Button
            key={filter.label}
            variant={statusFilter === filter.label ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setStatusFilter(filter.label)}
          >
            {filter.label} {filter.count}
          </Button>
        ))}
      </div>

      {/* Sort Section */}
      <div className="flex justify-end">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Latest Order">Latest Order</SelectItem>
            <SelectItem value="Oldest Order">Oldest Order</SelectItem>
            <SelectItem value="Order Type">Order Type</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedOrders.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                <p className="text-muted-foreground text-center">
                  {statusFilter === 'All' 
                    ? 'No orders have been placed yet.' 
                    : `No orders with status "${statusFilter}" found.`
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          sortedOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const progressPercentage = getProgressPercentage(order.status);
            const orderType = getOrderType(order.id);
            const customerName = getCustomerName(order.id);
            const nextStatus = getNextStatus(order.status);
            
            return (
              <Card key={order.id} className="hover:shadow-lg transition-shadow cursor-pointer" 
                    onClick={() => setSelectedOrder(order)}>
                <CardContent className="p-6">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Order# DI{order.id.toString().padStart(3, '0')} / {orderType}
                      </h3>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm font-semibold">
                      {String.fromCharCode(65 + (order.tableNumber % 26))}{order.tableNumber}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Customer Name</p>
                      <p className="font-medium">{customerName}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        {progressPercentage}% {statusInfo.label}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {order.items?.length || 0} Items →
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          progressPercentage < 30 ? 'bg-yellow-500' :
                          progressPercentage < 70 ? 'bg-orange-500' :
                          progressPercentage < 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 mb-4">
                    <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground border-b pb-1">
                      <span>Items</span>
                      <span className="text-center">Qty</span>
                      <span className="text-right">Price</span>
                    </div>
                    {order.items?.slice(0, 4).map((item: any) => {
                      const itemKey = `${order.id}-${item.id}`;
                      const isCompleted = itemStatuses[itemKey] || false;
                      
                      return (
                        <div key={item.id} className="grid grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={() => handleItemStatusToggle(order.id, item.id)}
                              className="h-4 w-4"
                            />
                            <span className={`truncate ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                              {item.itemName}
                            </span>
                          </div>
                          <span className="text-center">{item.quantity}</span>
                          <span className="text-right font-medium">${item.subtotal.toFixed(2)}</span>
                        </div>
                      );
                    })}
                    {order.items && order.items.length > 4 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{order.items.length - 4} more items
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center mb-4 pt-2 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-bold">${order.totalAmount.toFixed(2)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      See Details
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (nextStatus) {
                          handleStatusUpdate(order.id, nextStatus);
                        }
                      }}
                      disabled={!nextStatus || updating}
                    >
                      <CreditCard className="h-4 w-4" />
                      Pay Bills
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Selected Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Order Details - #{selectedOrder.id}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Order Type:</span>
                    <p className="font-medium">{getOrderType(selectedOrder.id)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Table:</span>
                    <p className="font-medium">{selectedOrder.tableNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium">{selectedOrder.status}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <p className="font-medium">${selectedOrder.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Image
                            src={item.image}
                            alt={item.itemName}
                            width={40}
                            height={40}
                            className="rounded-md aspect-square object-cover"
                          />
                          <div>
                            <p className="font-medium">{item.itemName}</p>
                            <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${item.subtotal.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogOverlay } from '@/components/ui/dialog';
import type { Table, OrderItem, MenuItem, Order } from '@/lib/types';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Minus, Search, ShoppingCart, ChevronDown, ChevronRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from "@/hooks/use-toast"
import { cn } from '@/lib/utils';

interface OrderPopupProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  table: Table;
  onClose: () => void;
}

export default function OrderPopup({ isOpen, onOpenChange, table, onClose }: OrderPopupProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [existingOrders, setExistingOrders] = useState<Order[]>([]);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [showExistingOrders, setShowExistingOrders] = useState(false);
  const { toast } = useToast();
  
  // Fetch menu items from API
  const { data: menuItems, loading: menuLoading, error: menuError } = useApi<MenuItem[]>('/api/menu?available=true');
  
  // Mutation for creating orders
  const { mutate: createOrder, loading: orderLoading } = useApiMutation();

  // Fetch existing orders for the table
  const fetchExistingOrders = async () => {
    if (!isOpen || !table.id) return;
    
    setIsLoadingExisting(true);
    try {
      const response = await fetch(`/api/tables/${table.id}/orders`);
      if (response.ok) {
        const orders = await response.json();
        setExistingOrders(orders);
      }
    } catch (error) {
      console.error('Error fetching existing orders:', error);
    } finally {
      setIsLoadingExisting(false);
    }
  };

  // Fetch existing orders when popup opens
  useEffect(() => {
    if (isOpen) {
      fetchExistingOrders();
      setOrderItems([]);
    } else {
      setOrderItems([]);
      setExistingOrders([]);
      setExpandedOrders(new Set());
      setShowExistingOrders(false);
    }
  }, [isOpen, table.id]);

  // Helper function to toggle order expansion
  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Helper function to get order status icon and color
  const getOrderStatusInfo = (status: string) => {
    switch (status) {
      case 'Pending':
        return { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      case 'Preparing':
        return { icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-100' };
      case 'Ready':
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'Served':
        return { icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'Paid':
        return { icon: CheckCircle, color: 'text-gray-600', bgColor: 'bg-gray-100' };
      default:
        return { icon: AlertCircle, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  // Helper function to check if there are any changes from existing orders
  const checkForChanges = () => {
    // Now we only check if there are new items being added
    return orderItems.length > 0;
  };

  // Helper function to get only new or changed items
  const getNewOrChangedItems = () => {
    // Now we just return all items in the cart as they are all new
    return orderItems.map(item => ({
      id: item.id,
      quantity: item.quantity
    }));
  };

  const handleAddItem = (itemToAdd: MenuItem) => {
    setOrderItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === itemToAdd.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...itemToAdd, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setOrderItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    } else {
      setOrderItems((prevItems) =>
        prevItems.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
      );
    }
  };

  const total = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const filteredMenuItems = menuItems ? menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleConfirmOrder = async () => {
    if (orderItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please add items to the order before confirming.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if there are any new items to add
      const hasChanges = checkForChanges();
      
      if (!hasChanges) {
        toast({
          title: "No items selected",
          description: "Please add items to create a new order.",
          variant: "destructive"
        });
        return;
      }

      // Create a new order with the selected items
      const items = orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity
      }));

      await createOrder('/api/orders', {
        method: 'POST',
        data: {
          tableId: table.id,
          items: items
        }
      });

      toast({
        title: "Order Created!",
        description: `New order for Table ${table.number} has been sent to the kitchen.`,
      });

      // Clear the order items after successful order creation
      setOrderItems([]);
      
      // Refresh existing orders to show updated data
      await fetchExistingOrders();
      
      // Sync table statuses to ensure table overview shows correct status
      try {
        await fetch('/api/tables/sync-status', { method: 'POST' });
      } catch (error) {
        console.error('Error syncing table statuses:', error);
      }
      
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "Failed to create order. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogOverlay className="backdrop-blur-sm" />
        <DialogContent className="max-w-screen-lg w-[95vw] h-[90vh] flex flex-col p-0 gap-0 shadow-2xl rounded-2xl border-0 data-[state=open]:zoom-in-90">
            <DialogHeader className="p-4 sm:p-6 pb-3 flex flex-row items-center justify-between flex-shrink-0">
            <div>
                <DialogTitle className="text-xl font-bold font-headline">Order for Table {table.number}</DialogTitle>
                <DialogDescription className="text-sm">
                  {isLoadingExisting ? (
                    "Loading existing orders..."
                  ) : (
                    "Add items to the order. Click confirm to send to kitchen."
                  )}
                </DialogDescription>
            </div>
            </DialogHeader>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden p-4 sm:p-6 pt-0">
            {/* Left Column - Menu and Existing Orders */}
            <div className="md:col-span-2 flex flex-col gap-3 h-full">
              {/* Existing Orders Section */}
              {existingOrders.length > 0 && (
                <div className="bg-background rounded-xl p-3 sm:p-4 border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-primary"/>
                      Existing Orders ({existingOrders.length})
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExistingOrders(!showExistingOrders)}
                      className="text-xs"
                    >
                      {showExistingOrders ? 'Hide' : 'Show'} Orders
                    </Button>
                  </div>
                  
                  {showExistingOrders && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {existingOrders.map((order) => {
                        const statusInfo = getOrderStatusInfo(order.status);
                        const StatusIcon = statusInfo.icon;
                        const isExpanded = expandedOrders.has(order.id);
                        
                        return (
                          <div key={order.id} className="border rounded-lg p-3 bg-card">
                            <div 
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => toggleOrderExpansion(order.id)}
                            >
                              <div className="flex items-center space-x-3">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                                <div className="flex items-center space-x-2">
                                  <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                                  <span className="font-medium">Order #{order.id}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">${order.totalAmount.toFixed(2)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                            
                            {isExpanded && order.items && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="space-y-2">
                                  {order.items.map((item: any) => (
                                    <div key={`${order.id}-${item.id}`} className="flex items-center justify-between text-sm">
                                      <div className="flex items-center space-x-2">
                                        <Image 
                                          src={item.image} 
                                          alt={item.itemName} 
                                          width={32} 
                                          height={32} 
                                          className="rounded-md aspect-square object-cover"
                                        />
                                        <span className="font-medium">{item.itemName}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-muted-foreground">Qty: {item.quantity}</span>
                                        <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Menu List */}
              <div className="flex-1 flex flex-col gap-3 bg-background rounded-xl p-3 sm:p-4">
                <div className="relative flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search menu items..."
                    className="pl-9 h-10 text-sm rounded-lg bg-card"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
                <Tabs defaultValue="Starters" className="flex flex-col flex-1 overflow-hidden">
                <TabsList className="grid w-full grid-cols-3 bg-card rounded-lg h-10">
                    <TabsTrigger value="Starters" className="text-sm rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">Starters</TabsTrigger>
                    <TabsTrigger value="Mains" className="text-sm rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">Mains</TabsTrigger>
                    <TabsTrigger value="Drinks" className="text-sm rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">Drinks</TabsTrigger>
                </TabsList>
                <ScrollArea className="flex-1 mt-3 -mx-2">
                    <div className="px-2">
                        {menuLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span className="ml-2 text-sm text-muted-foreground">Loading menu...</span>
                          </div>
                        ) : menuError ? (
                          <div className="flex items-center justify-center py-8">
                            <p className="text-sm text-destructive">Failed to load menu items</p>
                          </div>
                        ) : (
                          ['Starters', 'Mains', 'Drinks'].map((category) => (
                        <TabsContent key={category} value={category} className="mt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {filteredMenuItems
                                .filter((item) => item.category === category)
                                .map((item) => (
                                <div key={item.id} className="border rounded-xl p-2 flex flex-col text-center bg-card hover:shadow-md transition-shadow">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        width={150}
                                        height={150}
                                        className="rounded-md mx-auto aspect-square object-cover"
                                        data-ai-hint={`${item.category.toLowerCase()} food`}
                                    />
                                    <h4 className="font-semibold mt-2 flex-1 text-xs">{item.name}</h4>
                                    <p className="text-muted-foreground text-xs">${item.price.toFixed(2)}</p>
                                    <Button size="sm" className="mt-2 w-full rounded-md h-8 text-xs" onClick={() => handleAddItem(item)}>
                                    <Plus className="mr-1 h-4 w-4" /> Add
                                    </Button>
                                </div>
                                ))}
                            </div>
                        </TabsContent>
                        )))}
                    </div>
                </ScrollArea>
                </Tabs>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="md:col-span-1 bg-card rounded-xl flex flex-col h-full border">
                <div className="p-4 border-b flex-shrink-0">
                <h3 className="text-base font-semibold flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5 text-primary"/>
                    Add Order
                </h3>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-3 space-y-3">
                        {isLoadingExisting ? (
                            <div className="flex items-center justify-center py-4">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                <span className="text-sm text-muted-foreground">Loading existing orders...</span>
                            </div>
                        ) : orderItems.length === 0 ? (
                            <p className="text-center text-muted-foreground mt-6 text-sm">No items in order yet.</p>
                        ) : (
                            orderItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-2">
                                <div className='flex items-center gap-2 overflow-hidden'>
                                    <Image src={item.image} alt={item.name} width={40} height={40} className="rounded-md aspect-square object-cover flex-shrink-0" />
                                    <div className="overflow-hidden">
                                        <p className="font-medium text-xs truncate">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-md" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className='font-medium w-4 text-center text-sm'>{item.quantity}</span>
                                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-md" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
                {orderItems.length > 0 && (
                    <div className="p-4 mt-auto border-t flex-shrink-0">
                        <Separator className="my-3"/>
                        <div className="flex justify-between font-bold text-base mb-3">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" className="h-10 rounded-lg text-sm" onClick={onClose} disabled={orderLoading}>
                              Cancel
                            </Button>
                            <Button 
                              className="h-10 rounded-lg text-sm shadow-lg shadow-primary/30" 
                              onClick={handleConfirmOrder}
                              disabled={orderLoading || !checkForChanges()}
                            >
                              {orderLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                  Processing...
                                </>
                              ) : orderItems.length === 0 ? (
                                'No Items Selected'
                              ) : (
                                'Confirm Order'
                              )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            </div>
        </DialogContent>
    </Dialog>
  );
}

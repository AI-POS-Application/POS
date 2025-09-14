'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Search, 
  User, 
  Table, 
  Tag, 
  Download,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ChefHat,
  Coffee,
  IceCream,
  Grid3X3,
  Utensils
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApi } from '@/hooks/use-api';
import { formatPrice } from '@/lib/utils';
import type { MenuItem, MenuCategory } from '@/lib/types';

/**
 * Order item interface for the order taking system
 */
interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

/**
 * Order taking page component with POS interface
 */
export default function OrderTakingPage() {
  const { data: menuItems, loading } = useApi<MenuItem[]>('/api/menu');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'Dine In' | 'Take Away'>('Dine In');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // Category icons mapping
  const CATEGORY_ICONS: Record<string, any> = {
    'All': Grid3X3,
    'Indian Breakfast': ChefHat,
    'Western Breakfast': Utensils,
    'North Indian Main Course': ChefHat,
    'Biryani': ChefHat,
    'Rice': Utensils,
    'Indian Breads': ChefHat,
    'Pasta': Utensils,
    'Western Full Plate': Utensils,
    'Cold Beverages': Coffee,
    'Tea & Coffee': Coffee,
  };

  // Group menu items by category
  const groupedMenuItems = menuItems ? menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<MenuCategory, MenuItem[]>) : {} as Record<MenuCategory, MenuItem[]>;

  // Get all categories
  const categories = menuItems ? Array.from(new Set(menuItems.map(item => item.category))) : [];

  // Filter items based on selected category and search
  const filteredItems = menuItems ? menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }) : [];

  /**
   * Add item to order
   */
  const addToOrder = (item: MenuItem) => {
    setOrderItems(prev => {
      const existingItem = prev.find(orderItem => orderItem.id === item.id);
      if (existingItem) {
        return prev.map(orderItem =>
          orderItem.id === item.id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      } else {
        return [...prev, {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image: item.image,
          category: item.category
        }];
      }
    });
  };

  /**
   * Update item quantity in order
   */
  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(itemId);
      return;
    }
    setOrderItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  /**
   * Remove item from order
   */
  const removeFromOrder = (itemId: number) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  /**
   * Calculate order totals
   */
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% tax
  const total = subtotal + tax;

  /**
   * Process the order
   */
  const processOrder = async () => {
    if (orderItems.length === 0) return;
    
    try {
      const orderData = {
        tableId: selectedTable || 1,
        orderType,
        items: orderItems.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          unitPrice: item.price
        })),
        totalAmount: total
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        // Clear order
        setOrderItems([]);
        setSelectedTable(null);
        // Show success message
        alert('Order placed successfully!');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Categories */}
      <div className="w-64 bg-muted/30 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Menu Categories</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="text-sm font-medium">All Menu</span>
            </button>
            
            {categories.map((category) => {
              const Icon = CATEGORY_ICONS[category] || Utensils;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category as MenuCategory)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{category}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b bg-background flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Order Taking</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Customer
              </Button>
              <Button variant="outline" size="sm">
                <Table className="h-4 w-4 mr-2" />
                Tables
              </Button>
              <Button variant="outline" size="sm">
                <Tag className="h-4 w-4 mr-2" />
                Discount
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Save Bill
              </Button>
            </div>
          </div>
        </header>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="rounded-lg shadow-sm border overflow-hidden group hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => addToOrder(item)}
              >
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold truncate mb-1">{item.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary">{formatPrice(item.price)}</p>
                      <Button
                        size="sm"
                        className="h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToOrder(item);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Order Details */}
      <div className="w-80 bg-muted/30 border-l flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Order Details</h2>
        </div>

        <div className="flex-1 flex flex-col">
          {/* Order Type Selection */}
          <div className="p-4 border-b">
            <Tabs value={orderType} onValueChange={(value) => setOrderType(value as 'Dine In' | 'Take Away')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="Dine In">Dine In</TabsTrigger>
                <TabsTrigger value="Take Away">Take Away</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Order Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {orderItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Tap the product to add into order
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-background rounded-lg">
                    <div className="w-12 h-12 relative rounded overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={() => removeFromOrder(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="p-4 border-t bg-background">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (18%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Voucher</span>
                <span>{formatPrice(0)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            
            <Button 
              className="w-full" 
              onClick={processOrder}
              disabled={orderItems.length === 0}
            >
              Process Transaction
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

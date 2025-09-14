'use client';
import { useState } from 'react';
import Image from 'next/image';
import { PlusCircle, MoreHorizontal, Utensils, Coffee, Droplets, IceCream, Grid3X3 } from 'lucide-react';

import type { MenuItem, MenuCategory } from '@/lib/types';
import { useApi } from '@/hooks/use-api';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const CATEGORIES: MenuCategory[] = [
  'Indian Breakfast', 
  'Western Breakfast', 
  'North Indian Main Course', 
  'Biryani', 
  'Rice', 
  'Indian Breads', 
  'Pasta', 
  'Western Full Plate', 
  'Cold Beverages', 
  'Tea & Coffee'
];

// Category icons mapping
const CATEGORY_ICONS: { [key in MenuCategory]: any } = {
  'Indian Breakfast': Utensils,
  'Western Breakfast': Utensils,
  'North Indian Main Course': Utensils,
  'Biryani': Utensils,
  'Rice': Utensils,
  'Indian Breads': Utensils,
  'Pasta': Utensils,
  'Western Full Plate': Utensils,
  'Cold Beverages': Droplets,
  'Tea & Coffee': Coffee,
};

export default function MenuManagementPage() {
  // Fetch menu items from API
  const { data: menuItems, loading, error, refetch } = useApi<MenuItem[]>('/api/menu');
  
  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'All'>('All');

  const groupedMenuItems = menuItems ? menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<MenuCategory, MenuItem[]>) : {} as Record<MenuCategory, MenuItem[]>;

  // Filter items based on selected category
  const filteredItems = selectedCategory === 'All' 
    ? menuItems || []
    : (groupedMenuItems[selectedCategory as MenuCategory] || []);

  // Show loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-xs text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="text-center">
          <p className="text-destructive mb-2 text-sm">Failed to load menu items</p>
          <button 
            onClick={refetch}
            className="text-primary hover:underline text-xs"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 sm:p-4">
      <header className="flex h-12 items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground font-headline">
            Menu Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Add, edit, or remove menu items.
          </p>
        </div>
        <Button className="rounded-lg shadow-sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-12rem)]">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 bg-muted/30 rounded-lg p-3">
          <div className="flex flex-wrap lg:flex-col gap-1 lg:space-y-1">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`flex items-center gap-2 lg:gap-3 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">All Menu</span>
              <span className="sm:hidden">All</span>
            </button>
            
            {CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICONS[category];
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center gap-2 lg:gap-3 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category}</span>
                  <span className="sm:hidden">{category.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredItems.map((item: MenuItem) => (
              <Card key={item.id} className="rounded-lg shadow-sm border overflow-hidden group hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      data-ai-hint={`${item.category.toLowerCase()} food`}
                    />
                  </div>
                  <div className="p-2">
                    <h3 className="text-xs font-semibold truncate leading-snug mb-1">{item.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-primary">{formatPrice(item.price)}</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Utensils className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-sm text-muted-foreground text-center">
                {selectedCategory === 'All' 
                  ? 'No menu items available.' 
                  : `No items found in ${selectedCategory} category.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

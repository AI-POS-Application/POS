'use client';
import { useState } from 'react';
import Image from 'next/image';
import { PlusCircle, MoreHorizontal } from 'lucide-react';

import type { MenuItem, MenuCategory } from '@/lib/types';
import { menuItems } from '@/data/menu';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const CATEGORIES: MenuCategory[] = ['Starters', 'Mains', 'Drinks'];

export default function MenuManagementPage() {
  const [currentMenuItems, setCurrentMenuItems] = useState<MenuItem[]>(menuItems);

  const groupedMenuItems = currentMenuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<MenuCategory, MenuItem[]>);

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6">
      <header className="flex h-16 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-headline">
            Menu Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Add, edit, or remove menu items.
          </p>
        </div>
        <Button className="rounded-lg shadow-sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </header>

      <div className="space-y-8">
        {CATEGORIES.map((category) => (
          <div key={category}>
            <h2 className="text-lg font-semibold mb-4 font-headline">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {(groupedMenuItems[category] || []).map((item) => (
                <Card key={item.id} className="rounded-xl shadow-sm border overflow-hidden group">
                    <CardContent className="p-0">
                        <div className="flex items-center p-3">
                            <Image
                                src={item.image}
                                alt={item.name}
                                width={56}
                                height={56}
                                className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                                data-ai-hint={`${item.category.toLowerCase()} food`}
                            />
                            <div className="ml-3 overflow-hidden">
                                <h3 className="text-sm font-semibold truncate leading-snug">{item.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">${item.price.toFixed(2)}</p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full ml-auto flex-shrink-0 opacity-50 group-hover:opacity-100">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

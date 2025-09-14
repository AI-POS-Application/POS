
'use client';

import { useState, useEffect } from 'react';
import type { Table, TableStatus } from '@/lib/types';
import TableGrid from '@/components/TableGrid';
import OrderPopup from '@/components/OrderPopup';
import NotificationBell from '@/components/NotificationBell';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { ListFilter, UserCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ALL_STATUSES: TableStatus[] = ['Free', 'Occupied', 'Serving', 'Billing'];

export default function WaiterPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [activeFilter, setActiveFilter] = useState<TableStatus | 'All'>('All');
  
  // Fetch tables from API
  const { data: tables, loading, error, refetch } = useApi<Table[]>('/api/tables');
  
  // Sync table statuses when component mounts
  useEffect(() => {
    const syncTableStatuses = async () => {
      try {
        await fetch('/api/tables/sync-status', { method: 'POST' });
        // Refetch tables after syncing
        refetch();
      } catch (error) {
        console.error('Error syncing table statuses:', error);
      }
    };
    
    syncTableStatuses();
  }, []);

  // Listen for order creation events to refetch tables
  useEffect(() => {
    const handleOrderCreated = () => {
      refetch();
    };

    window.addEventListener('orderCreated', handleOrderCreated);
    
    return () => {
      window.removeEventListener('orderCreated', handleOrderCreated);
    };
  }, [refetch]);

  const handleTableSelect = (table: Table) => {
    if (table.status !== 'Billing') {
      setSelectedTable(table);
      setIsPopupOpen(true);
    }
  };

  const handleClosePopup = async () => {
    setIsPopupOpen(false);
    setTimeout(() => {
      setSelectedTable(null);
    }, 300);
    
    // Sync table statuses and refetch tables to get updated statuses after order
    try {
      await fetch('/api/tables/sync-status', { method: 'POST' });
      refetch();
    } catch (error) {
      console.error('Error syncing table statuses:', error);
      refetch(); // Still refetch even if sync fails
    }
  };

  const filteredTables = tables && activeFilter === 'All'
    ? tables
    : tables?.filter((table) => table.status === activeFilter) || [];

  // Show loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-xs text-muted-foreground">Loading tables...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="text-center">
          <p className="text-destructive mb-2 text-sm">Failed to load tables</p>
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
    <>
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 no-scrollbar">
          <header className="flex flex-col gap-3">
            <div className="flex h-12 items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground font-headline">
                  Tables Overview
                </h1>
                <p className="text-xs text-muted-foreground">Select a table to start an order.</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                      <UserCircle className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9">
                    <ListFilter className="mr-2 h-4 w-4" />
                    <span className="text-sm">{activeFilter}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setActiveFilter('All')}>All</DropdownMenuItem>
                  {ALL_STATUSES.map(status => (
                    <DropdownMenuItem key={status} onSelect={() => setActiveFilter(status)}>
                      {status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <TableGrid tables={filteredTables} onTableSelect={handleTableSelect} />
      </div>
      
      {selectedTable && (
        <OrderPopup
          isOpen={isPopupOpen}
          onOpenChange={setIsPopupOpen}
          table={selectedTable}
          onClose={handleClosePopup}
        />
      )}
    </>
  );
}

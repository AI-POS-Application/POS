import { NextRequest, NextResponse } from 'next/server';
import { getTables, updateTableStatus } from '@/services/tables';
import { getOrdersByTable } from '@/services/orders';

/**
 * POST /api/tables/sync-status - Syncs all table statuses based on their orders
 * @returns Success message
 */
export async function POST() {
  try {
    // Get all tables
    const tables = await getTables();
    
    for (const table of tables) {
      // Get active orders for this table (not paid)
      const activeOrders = await getOrdersByTable(table.id);
      const nonPaidOrders = activeOrders.filter(order => order.status !== 'paid');
      
      let newStatus = 'available';
      
      if (nonPaidOrders.length > 0) {
        // Check for different order statuses
        const hasPending = nonPaidOrders.some(order => order.status === 'pending');
        const hasPreparing = nonPaidOrders.some(order => order.status === 'preparing');
        const hasReady = nonPaidOrders.some(order => order.status === 'ready');
        const hasServed = nonPaidOrders.some(order => order.status === 'served');
        
        if (hasPending || hasPreparing) {
          newStatus = 'occupied';
        } else if (hasReady || hasServed) {
          newStatus = 'serving';
        } else {
          newStatus = 'occupied';
        }
      }
      
      // Update table status
      await updateTableStatus(table.id, newStatus);
    }
    
    return NextResponse.json({ 
      message: 'Table statuses synced successfully',
      tablesUpdated: tables.length 
    });
  } catch (error) {
    console.error('Error syncing table statuses:', error);
    return NextResponse.json(
      { error: 'Failed to sync table statuses' }, 
      { status: 500 }
    );
  }
}

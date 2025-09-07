import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

/**
 * POST /api/tables/sync-status - Syncs all table statuses based on their orders
 * @returns Success message
 */
export async function POST() {
  try {
    const db = getDatabase();
    
    // Get all tables
    const tables = db.prepare('SELECT id, number FROM tables').all() as { id: number; number: number }[];
    
    // Update each table's status based on its orders
    const updateTableStatus = db.prepare(`
      UPDATE tables 
      SET status = ?, customer_count = ?
      WHERE id = ?
    `);
    
    for (const table of tables) {
      // Get active orders for this table (not paid)
      const activeOrders = db.prepare(`
        SELECT status, COUNT(*) as count
        FROM orders 
        WHERE table_id = ? AND status != 'Paid'
        GROUP BY status
      `).all(table.id) as { status: string; count: number }[];
      
      // Get total customer count from all orders for this table
      const customerCount = db.prepare(`
        SELECT SUM(oi.quantity) as totalCustomers
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.table_id = ? AND o.status != 'Paid'
      `).get(table.id) as { totalCustomers: number } | null;
      
      let newStatus = 'Free';
      let customerCountValue = null;
      
      if (activeOrders.length > 0) {
        // Check for different order statuses
        const hasPending = activeOrders.some(order => order.status === 'Pending');
        const hasPreparing = activeOrders.some(order => order.status === 'Preparing');
        const hasReady = activeOrders.some(order => order.status === 'Ready');
        const hasServed = activeOrders.some(order => order.status === 'Served');
        
        if (hasPending || hasPreparing) {
          newStatus = 'Occupied';
        } else if (hasReady || hasServed) {
          newStatus = 'Serving';
        } else {
          newStatus = 'Occupied';
        }
        
        // Set customer count if available
        if (customerCount?.totalCustomers) {
          customerCountValue = customerCount.totalCustomers;
        }
      }
      
      // Update table status
      updateTableStatus.run(newStatus, customerCountValue, table.id);
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

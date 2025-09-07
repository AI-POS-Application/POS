import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    
    const orderId = parseInt(id);
    
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['Pending', 'Preparing', 'Ready', 'Served', 'Paid'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Update order status
    const updateOrder = db.prepare(`
      UPDATE orders 
      SET status = ?, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    const result = updateOrder.run(status, orderId);
    
    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // If order is marked as paid, update table status to free
    if (status === 'Paid') {
      const getTableId = db.prepare('SELECT tableId FROM orders WHERE id = ?');
      const order = getTableId.get(orderId) as { tableId: number };
      
      if (order) {
        // Check if there are any other active orders for this table
        const activeOrdersQuery = db.prepare(`
          SELECT COUNT(*) as count 
          FROM orders 
          WHERE tableId = ? AND status IN ('Pending', 'Preparing', 'Ready', 'Served')
        `);
        const activeOrders = activeOrdersQuery.get(order.tableId) as { count: number };
        
        if (activeOrders.count === 0) {
          // No more active orders, set table to free
          const updateTable = db.prepare('UPDATE tables SET status = ? WHERE id = ?');
          updateTable.run('Free', order.tableId);
        }
      }
    }

    return NextResponse.json({ 
      message: 'Order status updated successfully',
      orderId,
      status 
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}

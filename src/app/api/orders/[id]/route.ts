import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import type { Order, OrderStatus } from '@/lib/types';

/**
 * GET /api/orders/[id] - Retrieves a specific order with all related data
 * @param request - Next request object
 * @param params - Route parameters containing order ID
 * @returns Order object with items or 404 if not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' }, 
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Get order with related data
    const orderStmt = db.prepare(`
      SELECT 
        o.id, o.table_id as tableId, o.total_amount as totalAmount, 
        o.status, o.staff_id as staffId,
        o.created_at as createdAt, o.updated_at as updatedAt,
        t.number as tableNumber,
        s.name as staffName
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN staff s ON o.staff_id = s.id
      WHERE o.id = ?
    `);
    
    const order = orderStmt.get(orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' }, 
        { status: 404 }
      );
    }
    
    // Get order items
    const itemsStmt = db.prepare(`
      SELECT 
        oi.id, oi.order_id as orderId, oi.menu_item_id as menuItemId,
        oi.quantity, oi.unit_price as unitPrice, oi.subtotal,
        oi.created_at as createdAt,
        mi.name as itemName, mi.category, mi.image
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = ?
    `);
    
    const items = itemsStmt.all(orderId);
    
    const orderWithItems = {
      ...order,
      items: items
    };
    
    return NextResponse.json(orderWithItems);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' }, 
      { status: 500 }
    );
  }
}

/**
 * PUT /api/orders/[id] - Updates order status or assigns staff
 * @param request - Contains updated order data in body
 * @param params - Route parameters containing order ID
 * @returns Updated order object
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' }, 
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { status, staffId } = body;
    
    if (status) {
      const validStatuses: OrderStatus[] = ['Pending', 'Preparing', 'Ready', 'Served', 'Paid'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid order status' }, 
          { status: 400 }
        );
      }
    }
    
    const db = getDatabase();
    
    // Check if order exists
    const existingOrder = db.prepare(`
      SELECT id, table_id as tableId, status 
      FROM orders 
      WHERE id = ?
    `).get(orderId);
    
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' }, 
        { status: 404 }
      );
    }
    
    // Update order in transaction
    const result = db.transaction(() => {
      // Update order
      const updateStmt = db.prepare(`
        UPDATE orders 
        SET status = COALESCE(?, status),
            staff_id = COALESCE(?, staff_id)
        WHERE id = ?
      `);
      
      updateStmt.run(status || null, staffId || null, orderId);
      
      // Update table status based on order status
      if (status) {
        let tableStatus = null;
        
        switch (status) {
          case 'Pending':
          case 'Preparing':
            tableStatus = 'Occupied';
            break;
          case 'Ready':
          case 'Served':
            tableStatus = 'Serving';
            break;
          case 'Paid':
            // Check if there are other active orders for this table
            const activeOrdersCount = db.prepare(`
              SELECT COUNT(*) as count 
              FROM orders 
              WHERE table_id = ? AND status NOT IN ('Paid') AND id != ?
            `).get(existingOrder.tableId, orderId) as { count: number };
            
            tableStatus = activeOrdersCount.count > 0 ? 'Occupied' : 'Billing';
            break;
        }
        
        if (tableStatus) {
          db.prepare('UPDATE tables SET status = ? WHERE id = ?')
            .run(tableStatus, existingOrder.tableId);
        }
      }
      
      return { success: true };
    })();
    
    // Fetch updated order
    const updatedOrder = db.prepare(`
      SELECT 
        o.id, o.table_id as tableId, o.total_amount as totalAmount, 
        o.status, o.staff_id as staffId,
        o.created_at as createdAt, o.updated_at as updatedAt,
        t.number as tableNumber,
        s.name as staffName
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN staff s ON o.staff_id = s.id
      WHERE o.id = ?
    `).get(orderId);
    
    const items = db.prepare(`
      SELECT 
        oi.id, oi.order_id as orderId, oi.menu_item_id as menuItemId,
        oi.quantity, oi.unit_price as unitPrice, oi.subtotal,
        oi.created_at as createdAt,
        mi.name as itemName, mi.category, mi.image
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = ?
    `).all(orderId);
    
    const orderWithItems = {
      ...updatedOrder,
      items: items
    };
    
    return NextResponse.json(orderWithItems);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders/[id] - Cancels/deletes an order (only if Pending)
 * @param request - Next request object
 * @param params - Route parameters containing order ID
 * @returns Success message or error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' }, 
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Check if order exists and get its status
    const existingOrder = db.prepare(`
      SELECT id, table_id as tableId, status 
      FROM orders 
      WHERE id = ?
    `).get(orderId);
    
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' }, 
        { status: 404 }
      );
    }
    
    // Only allow deletion of pending orders
    if (existingOrder.status !== 'Pending') {
      return NextResponse.json(
        { error: 'Can only cancel pending orders' }, 
        { status: 400 }
      );
    }
    
    // Delete order and update table status in transaction
    db.transaction(() => {
      // Delete order (cascade will delete order_items)
      db.prepare('DELETE FROM orders WHERE id = ?').run(orderId);
      
      // Check if table has other orders, otherwise mark as Free
      const otherOrdersCount = db.prepare(`
        SELECT COUNT(*) as count 
        FROM orders 
        WHERE table_id = ? AND status NOT IN ('Paid')
      `).get(existingOrder.tableId) as { count: number };
      
      if (otherOrdersCount.count === 0) {
        db.prepare('UPDATE tables SET status = ?, customer_count = NULL WHERE id = ?')
          .run('Free', existingOrder.tableId);
      }
    })();
    
    return NextResponse.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' }, 
      { status: 500 }
    );
  }
}

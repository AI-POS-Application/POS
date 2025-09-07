import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

/**
 * GET /api/tables/[id]/orders - Retrieves all active orders for a specific table
 * @param request - Next request object
 * @param params - Route parameters containing table ID
 * @returns Array of orders with items for the table
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tableId = parseInt(id);
    
    if (isNaN(tableId)) {
      return NextResponse.json(
        { error: 'Invalid table ID' }, 
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Get all active orders for the table (not paid)
    const orders = db.prepare(`
      SELECT 
        o.id, o.table_id as tableId, o.total_amount as totalAmount, 
        o.status, o.staff_id as staffId,
        o.created_at as createdAt, o.updated_at as updatedAt,
        t.number as tableNumber,
        s.name as staffName
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN staff s ON o.staff_id = s.id
      WHERE o.table_id = ? AND o.status != 'Paid'
      ORDER BY o.created_at DESC
    `).all(tableId);
    
    // Get order items for each order
    const orderItemsStmt = db.prepare(`
      SELECT 
        oi.id, oi.order_id as orderId, oi.menu_item_id as menuItemId,
        oi.quantity, oi.unit_price as unitPrice, oi.subtotal,
        oi.created_at as createdAt,
        mi.name as itemName, mi.category, mi.image, mi.price
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = ?
    `);
    
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: orderItemsStmt.all(order.id)
    }));
    
    return NextResponse.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching table orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table orders' }, 
      { status: 500 }
    );
  }
}

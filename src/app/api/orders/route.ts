import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import type { Order, OrderStatus, OrderItem } from '@/lib/types';

/**
 * GET /api/orders - Retrieves all orders with optional filtering
 * @param request - Contains optional query parameters for filtering
 * @returns Array of orders with related data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tableId = searchParams.get('tableId');
    const limit = searchParams.get('limit');
    
    const db = getDatabase();
    
    let query = `
      SELECT 
        o.id, o.table_id as tableId, o.total_amount as totalAmount, 
        o.status, o.staff_id as staffId,
        o.created_at as createdAt, o.updated_at as updatedAt,
        t.number as tableNumber,
        s.name as staffName
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN staff s ON o.staff_id = s.id
    `;
    
    const conditions: string[] = [];
    const params: any[] = [];
    
    if (status) {
      conditions.push('o.status = ?');
      params.push(status);
    }
    
    if (tableId) {
      conditions.push('o.table_id = ?');
      params.push(parseInt(tableId));
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY o.created_at DESC';
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }
    
    const stmt = db.prepare(query);
    const orders = stmt.all(...params) as any[];
    
    // Get order items for each order
    const orderItemsStmt = db.prepare(`
      SELECT 
        oi.id, oi.order_id as orderId, oi.menu_item_id as menuItemId,
        oi.quantity, oi.unit_price as unitPrice, oi.subtotal,
        oi.created_at as createdAt,
        mi.name as itemName, mi.category, mi.image
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
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders - Creates a new order
 * @param request - Contains order data including table ID and order items
 * @returns Created order object with items
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, items, staffId } = body;
    
    if (!tableId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Table ID and items array are required' }, 
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Verify table exists
    const table = db.prepare('SELECT id, status FROM tables WHERE id = ?').get(tableId);
    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' }, 
        { status: 404 }
      );
    }
    
    // Calculate total amount
    let totalAmount = 0;
    const orderItemsData: any[] = [];
    
    for (const item of items) {
      if (!item.id || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Invalid item data' }, 
          { status: 400 }
        );
      }
      
      // Get current menu item price
      const menuItem = db.prepare('SELECT id, price FROM menu_items WHERE id = ?').get(item.id);
      if (!menuItem) {
        return NextResponse.json(
          { error: `Menu item with ID ${item.id} not found` }, 
          { status: 404 }
        );
      }
      
      const subtotal = menuItem.price * item.quantity;
      totalAmount += subtotal;
      
      orderItemsData.push({
        menuItemId: item.id,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        subtotal: subtotal
      });
    }
    
    // Create order and order items in transaction
    const result = db.transaction(() => {
      // Create order
      const orderStmt = db.prepare(`
        INSERT INTO orders (table_id, total_amount, status, staff_id) 
        VALUES (?, ?, 'Pending', ?)
      `);
      
      const orderResult = orderStmt.run(tableId, totalAmount, staffId || null);
      const orderId = orderResult.lastInsertRowid;
      
      // Create order items
      const orderItemStmt = db.prepare(`
        INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal) 
        VALUES (?, ?, ?, ?, ?)
      `);
      
      for (const item of orderItemsData) {
        orderItemStmt.run(orderId, item.menuItemId, item.quantity, item.unitPrice, item.subtotal);
      }
      
      // Update table status to Occupied
      db.prepare('UPDATE tables SET status = ? WHERE id = ?').run('Occupied', tableId);
      
      return { orderId };
    })();
    
    // Fetch the created order with all related data
    const createdOrder = db.prepare(`
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
    `).get(result.orderId);
    
    const orderItems = db.prepare(`
      SELECT 
        oi.id, oi.order_id as orderId, oi.menu_item_id as menuItemId,
        oi.quantity, oi.unit_price as unitPrice, oi.subtotal,
        oi.created_at as createdAt,
        mi.name as itemName, mi.category, mi.image
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = ?
    `).all(result.orderId);
    
    const orderWithItems = {
      ...createdOrder,
      items: orderItems
    };
    
    return NextResponse.json(orderWithItems, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' }, 
      { status: 500 }
    );
  }
}

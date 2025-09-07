import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tableId = searchParams.get('tableId');

    let query = `
      SELECT 
        o.id,
        o.table_id as tableId,
        o.total_amount as totalAmount,
        o.status,
        o.staff_id as staffId,
        o.created_at as createdAt,
        o.updated_at as updatedAt,
        t.number as tableNumber,
        s.name as staffName
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN staff s ON o.staff_id = s.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    
    if (tableId) {
      query += ' AND o.table_id = ?';
      params.push(parseInt(tableId));
    }
    
    query += ' ORDER BY o.created_at DESC';

    const db = getDatabase();
    const orders = db.prepare(query).all(...params);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order: any) => {
        const itemsQuery = `
          SELECT 
            oi.id,
            oi.quantity,
            oi.unit_price as unitPrice,
            oi.subtotal,
            mi.name as itemName,
            mi.image,
            mi.category
          FROM order_items oi
          JOIN menu_items mi ON oi.menu_item_id = mi.id
          WHERE oi.order_id = ?
        `;
        
        const items = db.prepare(itemsQuery).all(order.id);
        
        return {
          ...order,
          items
        };
      })
    );

    return NextResponse.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tableId, items } = await request.json();

    if (!tableId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Table ID and items are required' },
        { status: 400 }
      );
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    const db = getDatabase();
    
    for (const item of items) {
      const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(item.id);
      if (!menuItem) {
        return NextResponse.json(
          { error: `Menu item with ID ${item.id} not found` },
          { status: 400 }
        );
      }

      const subtotal = menuItem.price * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        menuItemId: item.id,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        subtotal: subtotal
      });
    }

    // Create order and order items in a transaction
    const result = db.transaction(() => {
      // Insert order
      const insertOrder = db.prepare(`
        INSERT INTO orders (table_id, total_amount, status, created_at, updated_at)
        VALUES (?, ?, 'Pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      const orderResult = insertOrder.run(tableId, totalAmount);
      const orderId = orderResult.lastInsertRowid;

      // Insert order items
      const insertOrderItem = db.prepare(`
        INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal, created_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      for (const item of orderItems) {
        insertOrderItem.run(orderId, item.menuItemId, item.quantity, item.unitPrice, item.subtotal);
      }

      // Update table status to Occupied
      db.prepare('UPDATE tables SET status = ? WHERE id = ?').run('Occupied', tableId);

      return { orderId };
    })();

    return NextResponse.json({
      message: 'Order created successfully',
      orderId: result.orderId,
      totalAmount
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order, please try again' },
      { status: 500 }
    );
  }
}
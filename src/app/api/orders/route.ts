import { NextRequest, NextResponse } from 'next/server';
import { getOrders, getOrdersByStatus, getOrdersByTable, createOrder } from '@/services/orders';
import { createOrderItem, updateOrderTotal } from '@/services/orderItems';
import { updateTableStatus } from '@/services/tables';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tableId = searchParams.get('tableId');

    let orders;
    
    if (status) {
      orders = await getOrdersByStatus(status);
    } else if (tableId) {
      orders = await getOrdersByTable(parseInt(tableId));
    } else {
      orders = await getOrders();
    }

    return NextResponse.json(orders);
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
    const { tableId, staffId, items, notes } = await request.json();

    if (!tableId || !staffId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Table ID, staff ID, and items are required' },
        { status: 400 }
      );
    }

    // Create the order first
    const order = await createOrder(tableId, staffId, notes);

    // Create order items and calculate total
    let totalAmount = 0;
    for (const item of items) {
      const orderItem = await createOrderItem(
        order.id,
        item.menuItemId || item.id,
        item.quantity,
        item.price,
        item.notes
      );
      totalAmount += orderItem.quantity * orderItem.price;
    }

    // Update order total
    const updatedOrder = await updateOrderTotal(order.id);

    // Update table status to occupied
    await updateTableStatus(tableId, 'occupied');

    return NextResponse.json({
      message: 'Order created successfully',
      order: updatedOrder,
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
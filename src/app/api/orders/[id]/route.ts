import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus, deleteOrder } from '@/services/orders';
import { getOrdersByTable } from '@/services/orders';
import { updateTableStatus } from '@/services/tables';
import type { OrderStatus } from '@/lib/types';

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
    
    // Use service layer to get order with all related data
    const order = await getOrderById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(order);
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
      // Updated to use lowercase status values
      const validStatuses: OrderStatus[] = ['pending', 'preparing', 'ready', 'served', 'paid'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid order status. Valid statuses are: ' + validStatuses.join(', ') }, 
          { status: 400 }
        );
      }
    }
    
    // Check if order exists
    const existingOrder = await getOrderById(orderId);
    
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' }, 
        { status: 404 }
      );
    }
    
    // Update order status if provided
    let updatedOrder = existingOrder;
    if (status) {
      updatedOrder = await updateOrderStatus(orderId, status);
      
      // Update table status based on order status
      let tableStatus = null;
      
      switch (status) {
        case 'pending':
        case 'preparing':
          tableStatus = 'occupied';
          break;
        case 'ready':
        case 'served':
          tableStatus = 'serving';
          break;
        case 'paid':
          // Check if there are other active orders for this table
          const tableOrders = await getOrdersByTable(existingOrder.tableId);
          const activeOrders = tableOrders.filter(order => order.status !== 'paid' && order.id !== orderId);
          
          tableStatus = activeOrders.length > 0 ? 'occupied' : 'available';
          break;
      }
      
      if (tableStatus) {
        await updateTableStatus(existingOrder.tableId, tableStatus);
      }
    }
    
    return NextResponse.json(updatedOrder);
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
    
    // Check if order exists and get its status
    const existingOrder = await getOrderById(orderId);
    
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' }, 
        { status: 404 }
      );
    }
    
    // Only allow deletion of pending orders
    if (existingOrder.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only cancel pending orders' }, 
        { status: 400 }
      );
    }
    
    // Delete order using service layer
    await deleteOrder(orderId);
    
    // Check if table has other orders, otherwise mark as available
    const tableOrders = await getOrdersByTable(existingOrder.tableId);
    const activeOrders = tableOrders.filter(order => order.status !== 'paid');
    
    if (activeOrders.length === 0) {
      await updateTableStatus(existingOrder.tableId, 'available');
    }
    
    return NextResponse.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' }, 
      { status: 500 }
    );
  }
}

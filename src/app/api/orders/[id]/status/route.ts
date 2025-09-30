import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus } from '@/services/orders';
import { getOrdersByTable } from '@/services/orders';
import { updateTableStatus } from '@/services/tables';

/**
 * PATCH /api/orders/[id]/status - Updates an order's status
 * @param request - Contains the new status in the request body
 * @param params - Contains the order ID
 * @returns Success message with updated order information
 */
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

    // Updated to use lowercase status values
    const validStatuses = ['pending', 'preparing', 'ready', 'served', 'paid'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // Update order status using service layer
    const updatedOrder = await updateOrderStatus(orderId, status);
    
    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // If order is marked as paid, check if table should be set to available
    if (status === 'paid') {
      // Get all orders for this table
      const tableOrders = await getOrdersByTable(updatedOrder.tableId);
      
      // Check if there are any other non-paid orders for this table
      const activeOrders = tableOrders.filter(order => order.status !== 'paid');
      
      if (activeOrders.length === 0) {
        // No more active orders, set table to available
        await updateTableStatus(updatedOrder.tableId, 'available');
      }
    }

    return NextResponse.json({ 
      message: 'Order status updated successfully',
      orderId,
      status,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}

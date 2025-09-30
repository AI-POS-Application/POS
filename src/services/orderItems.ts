import { prisma } from "@/lib/prisma";

/**
 * Service layer for order item operations
 * Handles all database interactions related to order items
 */

/**
 * Retrieves all order items from the database
 * @returns Promise<OrderItem[]> Array of all order items with related data
 */
export const getOrderItems = async () => {
  return prisma.orderItem.findMany({
    include: {
      order: {
        include: {
          table: true,
          staff: true
        }
      },
      menuItem: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

/**
 * Retrieves a specific order item by ID
 * @param id - The order item ID
 * @returns Promise<OrderItem | null> The order item or null if not found
 */
export const getOrderItemById = async (id: number) => {
  return prisma.orderItem.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          table: true,
          staff: true
        }
      },
      menuItem: true
    }
  });
};

/**
 * Creates a new order item
 * @param orderId - The order ID
 * @param menuItemId - The menu item ID
 * @param quantity - The quantity
 * @param price - The price at time of order
 * @param notes - Optional item notes
 * @returns Promise<OrderItem> The created order item
 */
export const createOrderItem = async (
  orderId: number, 
  menuItemId: number, 
  quantity: number, 
  price: number,
  notes?: string
) => {
  return prisma.orderItem.create({
    data: { 
      orderId, 
      menuItemId, 
      quantity, 
      price,
      notes
    },
    include: {
      order: {
        include: {
          table: true,
          staff: true
        }
      },
      menuItem: true
    }
  });
};

/**
 * Updates an order item's information
 * @param id - The order item ID
 * @param data - The data to update
 * @returns Promise<OrderItem> The updated order item
 */
export const updateOrderItem = async (id: number, data: {
  quantity?: number;
  price?: number;
  notes?: string;
}) => {
  return prisma.orderItem.update({
    where: { id },
    data,
    include: {
      order: {
        include: {
          table: true,
          staff: true
        }
      },
      menuItem: true
    }
  });
};

/**
 * Deletes an order item
 * @param id - The order item ID
 * @returns Promise<OrderItem> The deleted order item
 */
export const deleteOrderItem = async (id: number) => {
  return prisma.orderItem.delete({
    where: { id },
  });
};

/**
 * Retrieves order items by order ID
 * @param orderId - The order ID
 * @returns Promise<OrderItem[]> Array of order items for the specified order
 */
export const getOrderItemsByOrder = async (orderId: number) => {
  return prisma.orderItem.findMany({
    where: { orderId },
    include: {
      order: {
        include: {
          table: true,
          staff: true
        }
      },
      menuItem: true
    },
    orderBy: { createdAt: 'asc' }
  });
};

/**
 * Retrieves order items by menu item ID
 * @param menuItemId - The menu item ID
 * @returns Promise<OrderItem[]> Array of order items for the specified menu item
 */
export const getOrderItemsByMenuItem = async (menuItemId: number) => {
  return prisma.orderItem.findMany({
    where: { menuItemId },
    include: {
      order: {
        include: {
          table: true,
          staff: true
        }
      },
      menuItem: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

/**
 * Calculates total for an order
 * @param orderId - The order ID
 * @returns Promise<number> The total amount for the order
 */
export const calculateOrderTotal = async (orderId: number) => {
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId },
    select: {
      quantity: true,
      price: true
    }
  });

  return orderItems.reduce((total, item) => total + (item.quantity * item.price), 0);
};

/**
 * Updates order total after order item changes
 * @param orderId - The order ID
 * @returns Promise<Order> The updated order with new total
 */
export const updateOrderTotal = async (orderId: number) => {
  const total = await calculateOrderTotal(orderId);
  
  return prisma.order.update({
    where: { id: orderId },
    data: { total },
    include: {
      items: {
        include: {
          menuItem: true
        }
      },
      table: true,
      staff: true
    }
  });
};

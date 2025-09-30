import { prisma } from "@/lib/prisma";

/**
 * Service layer for order operations
 * Handles all database interactions related to orders
 */

/**
 * Retrieves all orders from the database
 * @returns Promise<Order[]> Array of all orders with related data
 */
export const getOrders = async () => {
  const orders = await prisma.order.findMany({
    include: { 
      items: {
        include: {
          menuItem: true
        }
      }, 
      table: true, 
      staff: true 
    },
    orderBy: { createdAt: 'desc' }
  });

  // Add computed fields for frontend compatibility
  return orders.map(order => ({
    ...order,
    tableNumber: order.table?.number,
    totalAmount: order.total,
    staffName: order.staff?.name,
    items: order.items?.map(item => ({
      ...item,
      unitPrice: item.price,
      subtotal: item.quantity * item.price,
      itemName: item.menuItem?.name,
      category: item.menuItem?.category,
      image: item.menuItem?.image || 'https://placehold.co/100x100.png'
    }))
  }));
};

/**
 * Retrieves a specific order by ID
 * @param id - The order ID
 * @returns Promise<Order | null> The order or null if not found
 */
export const getOrderById = async (id: number) => {
  const order = await prisma.order.findUnique({
    where: { id },
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

  if (!order) return null;

  // Add computed fields for frontend compatibility
  return {
    ...order,
    tableNumber: order.table?.number,
    totalAmount: order.total,
    staffName: order.staff?.name,
    items: order.items?.map(item => ({
      ...item,
      unitPrice: item.price,
      subtotal: item.quantity * item.price,
      itemName: item.menuItem?.name,
      category: item.menuItem?.category,
      image: item.menuItem?.image || 'https://placehold.co/100x100.png'
    }))
  };
};

/**
 * Creates a new order
 * @param tableId - The table ID
 * @param staffId - The staff ID
 * @param notes - Optional order notes
 * @returns Promise<Order> The created order
 */
export const createOrder = async (tableId: number, staffId: number, notes?: string) => {
  return prisma.order.create({
    data: { 
      tableId, 
      staffId,
      notes
    },
    include: {
      table: true,
      staff: true,
      items: true
    }
  });
};

/**
 * Updates an order's information
 * @param id - The order ID
 * @param data - The data to update
 * @returns Promise<Order> The updated order
 */
export const updateOrder = async (id: number, data: {
  status?: string;
  notes?: string;
  total?: number;
}) => {
  return prisma.order.update({
    where: { id },
    data,
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

/**
 * Updates order status
 * @param id - The order ID
 * @param status - The new status
 * @returns Promise<Order> The updated order
 */
export const updateOrderStatus = async (id: number, status: string) => {
  return prisma.order.update({
    where: { id },
    data: { status },
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

/**
 * Deletes an order
 * @param id - The order ID
 * @returns Promise<Order> The deleted order
 */
export const deleteOrder = async (id: number) => {
  return prisma.order.delete({
    where: { id },
  });
};

/**
 * Retrieves orders by table ID
 * @param tableId - The table ID
 * @returns Promise<Order[]> Array of orders for the specified table
 */
export const getOrdersByTable = async (tableId: number) => {
  const orders = await prisma.order.findMany({
    where: { tableId },
    include: {
      items: {
        include: {
          menuItem: true
        }
      },
      table: true,
      staff: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Add computed fields for frontend compatibility
  return orders.map(order => ({
    ...order,
    tableNumber: order.table?.number,
    totalAmount: order.total,
    staffName: order.staff?.name,
    items: order.items?.map(item => ({
      ...item,
      unitPrice: item.price,
      subtotal: item.quantity * item.price,
      itemName: item.menuItem?.name,
      category: item.menuItem?.category,
      image: item.menuItem?.image || 'https://placehold.co/100x100.png'
    }))
  }));
};

/**
 * Retrieves orders by status
 * @param status - The order status
 * @returns Promise<Order[]> Array of orders with the specified status
 */
export const getOrdersByStatus = async (status: string) => {
  const orders = await prisma.order.findMany({
    where: { status },
    include: {
      items: {
        include: {
          menuItem: true
        }
      },
      table: true,
      staff: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Add computed fields for frontend compatibility
  return orders.map(order => ({
    ...order,
    tableNumber: order.table?.number,
    totalAmount: order.total,
    staffName: order.staff?.name,
    items: order.items?.map(item => ({
      ...item,
      unitPrice: item.price,
      subtotal: item.quantity * item.price,
      itemName: item.menuItem?.name,
      category: item.menuItem?.category,
      image: item.menuItem?.image || 'https://placehold.co/100x100.png'
    }))
  }));
};

/**
 * Retrieves orders by staff member
 * @param staffId - The staff ID
 * @returns Promise<Order[]> Array of orders for the specified staff member
 */
export const getOrdersByStaff = async (staffId: number) => {
  const orders = await prisma.order.findMany({
    where: { staffId },
    include: {
      items: {
        include: {
          menuItem: true
        }
      },
      table: true,
      staff: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Add computed fields for frontend compatibility
  return orders.map(order => ({
    ...order,
    tableNumber: order.table?.number,
    totalAmount: order.total,
    staffName: order.staff?.name,
    items: order.items?.map(item => ({
      ...item,
      unitPrice: item.price,
      subtotal: item.quantity * item.price,
      itemName: item.menuItem?.name,
      category: item.menuItem?.category,
      image: item.menuItem?.image || 'https://placehold.co/100x100.png'
    }))
  }));
};

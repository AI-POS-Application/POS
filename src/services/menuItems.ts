import { prisma } from "@/lib/prisma";

/**
 * Service layer for menu item operations
 * Handles all database interactions related to menu items
 */

/**
 * Retrieves all menu items from the database
 * @returns Promise<MenuItem[]> Array of all menu items
 */
export const getMenuItems = async () => {
  return prisma.menuItem.findMany({
    orderBy: { name: 'asc' }
  });
};

/**
 * Retrieves a specific menu item by ID
 * @param id - The menu item ID
 * @returns Promise<MenuItem | null> The menu item or null if not found
 */
export const getMenuItemById = async (id: number) => {
  return prisma.menuItem.findUnique({
    where: { id },
    include: {
      orderItems: {
        include: {
          order: {
            include: {
              table: true,
              staff: true
            }
          }
        }
      }
    }
  });
};

/**
 * Creates a new menu item
 * @param data - The menu item data
 * @returns Promise<MenuItem> The created menu item
 */
export const createMenuItem = async (data: {
  name: string;
  price: number;
  description?: string;
  category?: string;
  isAvailable?: boolean;
}) => {
  return prisma.menuItem.create({
    data,
  });
};

/**
 * Updates a menu item's information
 * @param id - The menu item ID
 * @param data - The data to update
 * @returns Promise<MenuItem> The updated menu item
 */
export const updateMenuItem = async (id: number, data: {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  isAvailable?: boolean;
}) => {
  return prisma.menuItem.update({
    where: { id },
    data,
  });
};

/**
 * Deletes a menu item
 * @param id - The menu item ID
 * @returns Promise<MenuItem> The deleted menu item
 */
export const deleteMenuItem = async (id: number) => {
  return prisma.menuItem.delete({
    where: { id },
  });
};

/**
 * Retrieves menu items by category
 * @param category - The category to filter by
 * @returns Promise<MenuItem[]> Array of menu items in the specified category
 */
export const getMenuItemsByCategory = async (category: string) => {
  return prisma.menuItem.findMany({
    where: { category },
    orderBy: { name: 'asc' }
  });
};

/**
 * Retrieves available menu items only
 * @returns Promise<MenuItem[]> Array of available menu items
 */
export const getAvailableMenuItems = async () => {
  return prisma.menuItem.findMany({
    where: { isAvailable: true },
    orderBy: { name: 'asc' }
  });
};

/**
 * Updates menu item availability
 * @param id - The menu item ID
 * @param isAvailable - The availability status
 * @returns Promise<MenuItem> The updated menu item
 */
export const updateMenuItemAvailability = async (id: number, isAvailable: boolean) => {
  return prisma.menuItem.update({
    where: { id },
    data: { isAvailable },
  });
};

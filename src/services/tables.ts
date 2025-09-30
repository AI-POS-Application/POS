import { prisma } from "@/lib/prisma";

/**
 * Service layer for table operations
 * Handles all database interactions related to tables
 */

/**
 * Retrieves all tables from the database
 * @returns Promise<Table[]> Array of all tables
 */
export const getTables = async () => {
  return prisma.table.findMany({
    orderBy: { number: 'asc' }
  });
};

/**
 * Retrieves a specific table by ID
 * @param id - The table ID
 * @returns Promise<Table | null> The table or null if not found
 */
export const getTableById = async (id: number) => {
  return prisma.table.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          staff: true
        }
      }
    }
  });
};

/**
 * Creates a new table
 * @param number - The table number
 * @param capacity - The table capacity
 * @returns Promise<Table> The created table
 */
export const createTable = async (number: number, capacity: number) => {
  return prisma.table.create({
    data: { 
      number, 
      capacity 
    },
  });
};

/**
 * Updates a table's information
 * @param id - The table ID
 * @param data - The data to update
 * @returns Promise<Table> The updated table
 */
export const updateTable = async (id: number, data: { number?: number; capacity?: number; status?: string }) => {
  return prisma.table.update({
    where: { id },
    data,
  });
};

/**
 * Updates table status
 * @param id - The table ID
 * @param status - The new status
 * @returns Promise<Table> The updated table
 */
export const updateTableStatus = async (id: number, status: string) => {
  return prisma.table.update({
    where: { id },
    data: { status },
  });
};

/**
 * Deletes a table
 * @param id - The table ID
 * @returns Promise<Table> The deleted table
 */
export const deleteTable = async (id: number) => {
  return prisma.table.delete({
    where: { id },
  });
};

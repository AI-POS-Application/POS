import { prisma } from "@/lib/prisma";

/**
 * Service layer for staff operations
 * Handles all database interactions related to staff members
 */

/**
 * Retrieves all staff members from the database
 * @returns Promise<Staff[]> Array of all staff members
 */
export const getStaff = async () => {
  return prisma.staff.findMany({
    orderBy: { name: 'asc' }
  });
};

/**
 * Retrieves a specific staff member by ID
 * @param id - The staff ID
 * @returns Promise<Staff | null> The staff member or null if not found
 */
export const getStaffById = async (id: number) => {
  return prisma.staff.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          table: true,
          items: {
            include: {
              menuItem: true
            }
          }
        }
      }
    }
  });
};

/**
 * Creates a new staff member
 * @param name - The staff member's name
 * @param role - The staff member's role
 * @returns Promise<Staff> The created staff member
 */
export const createStaff = async (name: string, role: string) => {
  return prisma.staff.create({
    data: { 
      name, 
      role 
    },
  });
};

/**
 * Updates a staff member's information
 * @param id - The staff ID
 * @param data - The data to update
 * @returns Promise<Staff> The updated staff member
 */
export const updateStaff = async (id: number, data: { name?: string; role?: string }) => {
  return prisma.staff.update({
    where: { id },
    data,
  });
};

/**
 * Deletes a staff member
 * @param id - The staff ID
 * @returns Promise<Staff> The deleted staff member
 */
export const deleteStaff = async (id: number) => {
  return prisma.staff.delete({
    where: { id },
  });
};

/**
 * Retrieves staff members by role
 * @param role - The role to filter by
 * @returns Promise<Staff[]> Array of staff members with the specified role
 */
export const getStaffByRole = async (role: string) => {
  return prisma.staff.findMany({
    where: { role },
    orderBy: { name: 'asc' }
  });
};

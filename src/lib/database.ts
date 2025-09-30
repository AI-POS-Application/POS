import { prisma } from './prisma';

/**
 * Legacy database functions for backward compatibility
 * These functions now use Prisma instead of direct SQLite
 */

/**
 * @deprecated Use Prisma client directly instead
 * Gets the database connection instance (now returns Prisma client)
 * @returns Prisma client instance
 */
export function getDatabase() {
  return prisma;
}

/**
 * @deprecated Database schema is now managed by Prisma migrations
 * This function is kept for backward compatibility but does nothing
 */
export function initializeDatabase(): void {
  console.log('Database schema is now managed by Prisma migrations');
}

/**
 * @deprecated Use the Prisma seed script instead
 * This function is kept for backward compatibility but does nothing
 */
export function seedDatabase(): void {
  console.log('Please use "npm run seed" to seed the database with Prisma');
}

/**
 * @deprecated Prisma handles connection management automatically
 * This function is kept for backward compatibility but does nothing
 */
export function closeDatabase(): void {
  console.log('Prisma handles connection management automatically');
}

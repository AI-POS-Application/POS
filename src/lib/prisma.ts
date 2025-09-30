// Temporary manual Prisma client due to binary download issues
// This will be replaced with the official Prisma client once network issues are resolved
import { prisma as manualPrisma } from './prisma-manual';

/**
 * Prisma client instance
 * Currently using manual implementation due to Prisma binary download issues
 */
export const prisma = manualPrisma;

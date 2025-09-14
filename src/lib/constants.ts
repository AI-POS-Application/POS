/**
 * Application constants for better maintainability
 */

// Order statuses for kitchen workflow
export const KITCHEN_ORDER_STATUSES = ['Pending', 'Preparing', 'Ready'] as const;

// Order statuses for complete workflow
export const ALL_ORDER_STATUSES = ['Pending', 'Preparing', 'Ready', 'Served', 'Paid'] as const;

// Kitchen status configuration
export const KITCHEN_STATUS_CONFIG = {
  Pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    nextStatus: 'Preparing' as const,
    icon: 'Clock' as const,
  },
  Preparing: {
    label: 'Preparing',
    color: 'bg-orange-100 text-orange-800',
    nextStatus: 'Ready' as const,
    icon: 'ChefHat' as const,
  },
  Ready: {
    label: 'Ready to Serve',
    color: 'bg-green-100 text-green-800',
    nextStatus: 'Served' as const,
    icon: 'CheckCircle' as const,
  },
  Served: {
    label: 'Served',
    color: 'bg-blue-100 text-blue-800',
    nextStatus: 'Paid' as const,
    icon: 'CheckCircle' as const,
  },
  Paid: {
    label: 'Paid',
    color: 'bg-gray-100 text-gray-800',
    nextStatus: null,
    icon: 'CheckCircle' as const,
  },
} as const;

// Auto-refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  KITCHEN_DISPLAY: 10000, // 10 seconds
  DASHBOARD: 30000, // 30 seconds
  ORDERS: 15000, // 15 seconds
} as const;

// UI Constants
export const UI_CONSTANTS = {
  MAX_ITEMS_PREVIEW: 2,
  MAX_ITEMS_DETAILED: 4,
  MODAL_MAX_HEIGHT: '85vh',
  CARD_PADDING: 'p-2',
  COMPACT_SPACING: 'space-y-2',
} as const;

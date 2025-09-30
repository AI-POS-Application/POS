export type TableStatus = 'available' | 'occupied' | 'reserved' | 'serving' | 'billing';

export interface Table {
  id: number;
  number: number;
  capacity: number;
  status: TableStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type MenuCategory = 
  | 'Indian Breakfast' 
  | 'Western Breakfast' 
  | 'North Indian Main Course' 
  | 'Biryani' 
  | 'Rice' 
  | 'Indian Breads' 
  | 'Pasta' 
  | 'Western Full Plate' 
  | 'Cold Beverages' 
  | 'Tea & Coffee';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: MenuCategory;
  image: string;
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem extends MenuItem {
  quantity: number;
}

export type StaffRole = 'Manager' | 'Head Waiter' | 'Waiter' | 'Chef' | 'Sous Chef' | 'Hostess';

export interface StaffMember {
    id: number;
    name: string;
    role: StaffRole;
    shift: string;
    status: 'On Shift' | 'Off Duty';
    avatar: string;
    createdAt?: string;
    updatedAt?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'paid';

/**
 * Order interface representing a complete order in the system
 */
export interface Order {
  id: number;
  tableId: number;
  staffId: number;
  status: OrderStatus;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Computed fields for frontend compatibility
  tableNumber?: number;
  totalAmount?: number;
  staffName?: string;
  // Relations
  table?: Table;
  staff?: StaffMember;
  items?: OrderItemDB[];
}

/**
 * Order item as stored in database (with order relationship)
 */
export interface OrderItemDB {
  id: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  price: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Computed fields for frontend compatibility
  unitPrice?: number;
  subtotal?: number;
  itemName?: string;
  category?: string;
  image?: string;
  // Relations
  menuItem?: MenuItem;
}

/**
 * Dashboard KPI data structure
 */
export interface DashboardKPI {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}

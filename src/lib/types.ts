export type TableStatus = 'Free' | 'Occupied' | 'Serving' | 'Billing';

export interface Table {
  id: number;
  number: number;
  status: TableStatus;
  customerCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type MenuCategory = 'Starters' | 'Mains' | 'Drinks';

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

export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Paid';

/**
 * Order interface representing a complete order in the system
 */
export interface Order {
  id: number;
  tableId: number;
  totalAmount: number;
  status: OrderStatus;
  staffId?: number;
  createdAt: string;
  updatedAt: string;
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
  unitPrice: number;
  subtotal: number;
  createdAt: string;
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

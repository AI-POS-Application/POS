# OrderFry POS System

A modern Point of Sale (POS) system built with Next.js, TypeScript, and SQLite. This application provides complete restaurant management functionality including table management, order processing, menu management, and staff administration.

## Features

### 🏪 **Waiter Interface**
- **Table Overview**: Real-time table status (Free, Occupied, Serving, Billing)
- **Order Management**: Create orders with menu items, quantities, and pricing
- **Interactive UI**: Responsive design for tablets and mobile devices
- **Status Filtering**: Filter tables by status for easy navigation

### 👨‍💼 **Manager Dashboard**
- **Real-time KPIs**: Today's sales, active tables, staff on duty, total orders
- **Sales Analytics**: Historical sales data with trend analysis
- **Staff Overview**: Monitor staff status and shifts
- **Performance Metrics**: Compare current day with previous day

### 📋 **Menu Management**
- **Category Organization**: Manage items by Starters, Mains, and Drinks
- **Item Management**: Add, edit, and remove menu items
- **Pricing Control**: Update prices and availability status
- **Visual Interface**: Image-based menu display

### 👥 **Staff Management**
- **Employee Roster**: Track all staff members and their roles
- **Shift Management**: Monitor who's on duty vs off duty
- **Role-based Access**: Different access levels (Manager, Waiter, Chef, etc.)
- **Status Tracking**: Real-time staff availability

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: SQLite with better-sqlite3
- **UI Components**: Radix UI, Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd POS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database**
   ```bash
   npm run init-db
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:9002`

### Quick Setup

Run everything in one command:
```bash
npm run setup
```

## Database Schema

The application uses SQLite with the following main entities:

### Tables
- `id` (Primary Key)
- `number` (Table number)
- `status` (Free, Occupied, Serving, Billing)
- `customer_count` (Number of customers)

### Menu Items
- `id` (Primary Key)
- `name` (Item name)
- `price` (Item price)
- `category` (Starters, Mains, Drinks)
- `image` (Item image URL)
- `is_available` (Availability status)

### Staff
- `id` (Primary Key)
- `name` (Staff member name)
- `role` (Manager, Waiter, Chef, etc.)
- `shift` (Working hours)
- `status` (On Shift, Off Duty)
- `avatar` (Profile image URL)

### Orders
- `id` (Primary Key)
- `table_id` (Foreign Key to tables)
- `total_amount` (Order total)
- `status` (Pending, Preparing, Ready, Served, Paid)
- `staff_id` (Foreign Key to staff)

### Order Items
- `id` (Primary Key)
- `order_id` (Foreign Key to orders)
- `menu_item_id` (Foreign Key to menu_items)
- `quantity` (Number of items)
- `unit_price` (Price per item)
- `subtotal` (Total for this line item)

## API Endpoints

### Tables
- `GET /api/tables` - Get all tables
- `POST /api/tables` - Create a new table
- `GET /api/tables/[id]` - Get specific table
- `PUT /api/tables/[id]` - Update table status/customer count
- `DELETE /api/tables/[id]` - Delete a table

### Menu Items
- `GET /api/menu` - Get all menu items (with filtering)
- `POST /api/menu` - Create a new menu item
- `GET /api/menu/[id]` - Get specific menu item
- `PUT /api/menu/[id]` - Update menu item
- `DELETE /api/menu/[id]` - Delete menu item

### Staff
- `GET /api/staff` - Get all staff members (with filtering)
- `POST /api/staff` - Create a new staff member
- `GET /api/staff/[id]` - Get specific staff member
- `PUT /api/staff/[id]` - Update staff member
- `DELETE /api/staff/[id]` - Delete staff member

### Orders
- `GET /api/orders` - Get all orders (with filtering)
- `POST /api/orders` - Create a new order
- `GET /api/orders/[id]` - Get specific order
- `PUT /api/orders/[id]` - Update order status
- `DELETE /api/orders/[id]` - Cancel order (Pending only)

### Dashboard
- `GET /api/dashboard` - Get dashboard metrics and KPIs

## Usage Guide

### For Waiters
1. **View Tables**: See all restaurant tables with current status
2. **Take Orders**: Click on a free/occupied table to create an order
3. **Menu Selection**: Browse menu by categories (Starters, Mains, Drinks)
4. **Order Management**: Add items, adjust quantities, and confirm orders
5. **Status Updates**: Tables automatically update status based on orders

### For Managers
1. **Dashboard Overview**: Monitor key metrics and performance
2. **Menu Management**: Add, edit, or remove menu items
3. **Staff Administration**: Manage staff members and their shifts
4. **Analytics**: View sales trends and performance metrics

### Order Workflow
1. **Customer Arrival**: Table status changes from Free to Occupied
2. **Order Taking**: Waiter creates order, table status remains Occupied
3. **Order Preparation**: Order status changes to Preparing
4. **Food Ready**: Order status changes to Ready, table status to Serving
5. **Food Served**: Order status changes to Served
6. **Payment**: Order status changes to Paid, table status to Billing
7. **Customer Leaves**: Table status returns to Free

## Development

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and types
├── data/               # Static data (legacy)
scripts/                # Database and utility scripts
```

### Key Components
- `TableGrid` - Displays restaurant tables
- `OrderPopup` - Order creation interface
- `SalesChart` - Dashboard analytics
- `StaffOnDuty` - Staff status display

### Database Operations
```javascript
// Example: Fetching tables
const { data: tables, loading, error } = useApi<Table[]>('/api/tables');

// Example: Creating an order
const { mutate: createOrder } = useApiMutation();
await createOrder('/api/orders', { method: 'POST', data: orderData });
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run init-db` - Initialize database with sample data
- `npm run setup` - Initialize database and start development
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please create an issue in the repository or contact the development team.

---

**Happy Restaurant Management! 🍽️**
import Database from 'better-sqlite3';
import path from 'path';

/**
 * Path to the SQLite database file
 */
const DB_PATH = path.join(process.cwd(), 'pos_database.sqlite');

let db: Database.Database | null = null;

/**
 * Gets the database connection instance
 * Creates a new connection if one doesn't exist
 * @returns Database instance
 */
export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Initialize database schema
    initializeDatabase(db);
  }
  
  return db;
}

/**
 * Initializes the database schema with all required tables
 * @param database - The database instance
 */
function initializeDatabase(database: Database.Database): void {
  // Create tables table
  database.exec(`
    CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number INTEGER UNIQUE NOT NULL,
      status TEXT CHECK(status IN ('Free', 'Occupied', 'Serving', 'Billing')) NOT NULL DEFAULT 'Free',
      customer_count INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create menu_items table
  database.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      category TEXT CHECK(category IN ('Starters', 'Mains', 'Drinks')) NOT NULL,
      image TEXT NOT NULL,
      is_available BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create staff table
  database.exec(`
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT CHECK(role IN ('Manager', 'Head Waiter', 'Waiter', 'Chef', 'Sous Chef', 'Hostess')) NOT NULL,
      shift TEXT NOT NULL,
      status TEXT CHECK(status IN ('On Shift', 'Off Duty')) NOT NULL DEFAULT 'Off Duty',
      avatar TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create orders table
  database.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_id INTEGER NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
      status TEXT CHECK(status IN ('Pending', 'Preparing', 'Ready', 'Served', 'Paid')) NOT NULL DEFAULT 'Pending',
      staff_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (table_id) REFERENCES tables (id) ON DELETE CASCADE,
      FOREIGN KEY (staff_id) REFERENCES staff (id) ON DELETE SET NULL
    )
  `);

  // Create order_items table
  database.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      menu_item_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price DECIMAL(10, 2) NOT NULL,
      subtotal DECIMAL(10, 2) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
      FOREIGN KEY (menu_item_id) REFERENCES menu_items (id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_tables_status ON tables (status);
    CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items (category);
    CREATE INDEX IF NOT EXISTS idx_staff_status ON staff (status);
    CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders (table_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
  `);

  // Create triggers to update updated_at timestamps
  database.exec(`
    CREATE TRIGGER IF NOT EXISTS update_tables_timestamp 
    AFTER UPDATE ON tables 
    BEGIN 
      UPDATE tables SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_menu_items_timestamp 
    AFTER UPDATE ON menu_items 
    BEGIN 
      UPDATE menu_items SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_staff_timestamp 
    AFTER UPDATE ON staff 
    BEGIN 
      UPDATE staff SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_orders_timestamp 
    AFTER UPDATE ON orders 
    BEGIN 
      UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);

  console.log('Database schema initialized successfully');
}

/**
 * Seeds the database with initial data from the existing static data
 */
export function seedDatabase(): void {
  const database = getDatabase();
  
  try {
    database.transaction(() => {
      // Seed tables
      const tablesData = [
        { number: 1, status: 'Free' },
        { number: 2, status: 'Occupied', customer_count: 4 },
        { number: 3, status: 'Serving' },
        { number: 4, status: 'Free' },
        { number: 5, status: 'Occupied', customer_count: 2 },
        { number: 6, status: 'Billing' },
        { number: 7, status: 'Free' },
        { number: 8, status: 'Free' },
        { number: 9, status: 'Serving' },
        { number: 10, status: 'Occupied', customer_count: 5 },
        { number: 11, status: 'Free' },
        { number: 12, status: 'Occupied', customer_count: 3 }
      ];

      const insertTable = database.prepare(`
        INSERT OR IGNORE INTO tables (number, status, customer_count) 
        VALUES (?, ?, ?)
      `);

      tablesData.forEach(table => {
        insertTable.run(table.number, table.status, table.customer_count || null);
      });

      // Seed menu items
      const menuItemsData = [
        { name: 'Bruschetta', price: 8.50, category: 'Starters', image: 'https://placehold.co/100x100.png' },
        { name: 'Caprese Salad', price: 10.00, category: 'Starters', image: 'https://placehold.co/100x100.png' },
        { name: 'Garlic Bread', price: 6.00, category: 'Starters', image: 'https://placehold.co/100x100.png' },
        { name: 'Fried Calamari', price: 12.50, category: 'Starters', image: 'https://placehold.co/100x100.png' },
        { name: 'Margherita Pizza', price: 15.00, category: 'Mains', image: 'https://placehold.co/100x100.png' },
        { name: 'Spaghetti Carbonara', price: 18.00, category: 'Mains', image: 'https://placehold.co/100x100.png' },
        { name: 'Grilled Salmon', price: 22.50, category: 'Mains', image: 'https://placehold.co/100x100.png' },
        { name: 'Chicken Parmesan', price: 20.00, category: 'Mains', image: 'https://placehold.co/100x100.png' },
        { name: 'Coca-Cola', price: 3.50, category: 'Drinks', image: 'https://placehold.co/100x100.png' },
        { name: 'Fresh Orange Juice', price: 5.00, category: 'Drinks', image: 'https://placehold.co/100x100.png' },
        { name: 'Espresso', price: 3.00, category: 'Drinks', image: 'https://placehold.co/100x100.png' },
        { name: 'House Red Wine', price: 7.00, category: 'Drinks', image: 'https://placehold.co/100x100.png' }
      ];

      const insertMenuItem = database.prepare(`
        INSERT OR IGNORE INTO menu_items (name, price, category, image) 
        VALUES (?, ?, ?, ?)
      `);

      menuItemsData.forEach(item => {
        insertMenuItem.run(item.name, item.price, item.category, item.image);
      });

      // Seed staff
      const staffData = [
        { name: 'James Smith', role: 'Head Waiter', shift: '9am - 5pm', status: 'On Shift', avatar: 'https://placehold.co/96x96.png' },
        { name: 'Maria Garcia', role: 'Waiter', shift: '9am - 5pm', status: 'On Shift', avatar: 'https://placehold.co/96x96.png' },
        { name: 'David Johnson', role: 'Chef', shift: '8am - 4pm', status: 'On Shift', avatar: 'https://placehold.co/96x96.png' },
        { name: 'Emily White', role: 'Waiter', shift: '5pm - 11pm', status: 'On Shift', avatar: 'https://placehold.co/96x96.png' },
        { name: 'Michael Brown', role: 'Sous Chef', shift: '5pm - 11pm', status: 'Off Duty', avatar: 'https://placehold.co/96x96.png' },
        { name: 'Jessica Lee', role: 'Hostess', shift: '5pm - 11pm', status: 'On Shift', avatar: 'https://placehold.co/96x96.png' }
      ];

      const insertStaff = database.prepare(`
        INSERT OR IGNORE INTO staff (name, role, shift, status, avatar) 
        VALUES (?, ?, ?, ?, ?)
      `);

      staffData.forEach(staff => {
        insertStaff.run(staff.name, staff.role, staff.shift, staff.status, staff.avatar);
      });

    })();

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

/**
 * Closes the database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

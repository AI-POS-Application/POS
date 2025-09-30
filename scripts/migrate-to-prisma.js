const Database = require('better-sqlite3');
const path = require('path');

/**
 * Migration script to create SQLite database with Prisma schema
 * This is a workaround for the Prisma binary download issues
 */

const DB_PATH = path.join(process.cwd(), 'dev.db');

console.log('🔄 Creating SQLite database with Prisma schema...');

const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables according to Prisma schema
db.exec(`
  CREATE TABLE IF NOT EXISTS "Table" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" INTEGER NOT NULL UNIQUE,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "Staff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "MenuItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tableId" INTEGER NOT NULL,
    "staffId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "total" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "menuItemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE
  );
`);

// Create indexes
db.exec(`
  CREATE INDEX IF NOT EXISTS "Table_number_key" ON "Table"("number");
  CREATE INDEX IF NOT EXISTS "Order_tableId_fkey" ON "Order"("tableId");
  CREATE INDEX IF NOT EXISTS "Order_staffId_fkey" ON "Order"("staffId");
  CREATE INDEX IF NOT EXISTS "OrderItem_orderId_fkey" ON "OrderItem"("orderId");
  CREATE INDEX IF NOT EXISTS "OrderItem_menuItemId_fkey" ON "OrderItem"("menuItemId");
`);

console.log('✅ Database schema created successfully!');

// Seed with sample data
console.log('🌱 Seeding database with sample data...');

// Create staff
const staff = [
  { name: 'Alice Johnson', role: 'Manager' },
  { name: 'Bob Smith', role: 'Head Waiter' },
  { name: 'Carol Davis', role: 'Waiter' },
  { name: 'David Wilson', role: 'Chef' },
  { name: 'Emma Brown', role: 'Sous Chef' },
  { name: 'Frank Miller', role: 'Hostess' }
];

const insertStaff = db.prepare('INSERT INTO "Staff" (name, role) VALUES (?, ?)');
staff.forEach(s => insertStaff.run(s.name, s.role));

// Create tables
const tables = [
  { number: 1, capacity: 4, status: 'available' },
  { number: 2, capacity: 2, status: 'available' },
  { number: 3, capacity: 6, status: 'available' },
  { number: 4, capacity: 4, status: 'available' },
  { number: 5, capacity: 8, status: 'available' },
  { number: 6, capacity: 2, status: 'occupied' },
  { number: 7, capacity: 4, status: 'available' },
  { number: 8, capacity: 6, status: 'reserved' }
];

const insertTable = db.prepare('INSERT INTO "Table" (number, capacity, status) VALUES (?, ?, ?)');
tables.forEach(t => insertTable.run(t.number, t.capacity, t.status));

// Create menu items
const menuItems = [
  { name: 'Masala Dosa', price: 8.99, description: 'Crispy crepe filled with spiced potatoes', category: 'Indian Breakfast' },
  { name: 'Idli Sambar', price: 6.99, description: 'Steamed rice cakes with lentil curry', category: 'Indian Breakfast' },
  { name: 'Pancakes', price: 7.99, description: 'Fluffy pancakes with maple syrup', category: 'Western Breakfast' },
  { name: 'Butter Chicken', price: 16.99, description: 'Tender chicken in creamy tomato sauce', category: 'North Indian Main Course' },
  { name: 'Chicken Biryani', price: 18.99, description: 'Fragrant basmati rice with spiced chicken', category: 'Biryani' },
  { name: 'Naan', price: 3.99, description: 'Soft leavened bread baked in tandoor', category: 'Indian Breads' },
  { name: 'Spaghetti Carbonara', price: 14.99, description: 'Pasta with eggs, cheese, and pancetta', category: 'Pasta' },
  { name: 'Grilled Salmon', price: 22.99, description: 'Fresh salmon with herbs and lemon', category: 'Western Full Plate' },
  { name: 'Fresh Orange Juice', price: 4.99, description: 'Freshly squeezed orange juice', category: 'Cold Beverages' },
  { name: 'Masala Chai', price: 3.99, description: 'Spiced Indian tea', category: 'Tea & Coffee' }
];

const insertMenuItem = db.prepare('INSERT INTO "MenuItem" (name, price, description, category) VALUES (?, ?, ?, ?)');
menuItems.forEach(m => insertMenuItem.run(m.name, m.price, m.description, m.category));

// Create sample orders
const order1 = db.prepare('INSERT INTO "Order" (tableId, staffId, status, notes) VALUES (?, ?, ?, ?)').run(6, 2, 'pending', 'Customer requested extra spicy');
const order2 = db.prepare('INSERT INTO "Order" (tableId, staffId, status, notes) VALUES (?, ?, ?, ?)').run(1, 3, 'completed', 'Regular order');

// Create order items
const orderItems = [
  { orderId: order1.lastInsertRowid, menuItemId: 1, quantity: 2, price: 8.99, notes: 'Extra spicy' },
  { orderId: order1.lastInsertRowid, menuItemId: 10, quantity: 2, price: 3.99 },
  { orderId: order2.lastInsertRowid, menuItemId: 4, quantity: 1, price: 16.99 },
  { orderId: order2.lastInsertRowid, menuItemId: 6, quantity: 2, price: 3.99 },
  { orderId: order2.lastInsertRowid, menuItemId: 5, quantity: 1, price: 18.99 }
];

const insertOrderItem = db.prepare('INSERT INTO "OrderItem" (orderId, menuItemId, quantity, price, notes) VALUES (?, ?, ?, ?, ?)');
orderItems.forEach(oi => insertOrderItem.run(oi.orderId, oi.menuItemId, oi.quantity, oi.price, oi.notes));

// Update order totals
const orders = db.prepare('SELECT id FROM "Order"').all();
orders.forEach(order => {
  const orderItems = db.prepare('SELECT quantity, price FROM "OrderItem" WHERE orderId = ?').all(order.id);
  const total = orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  db.prepare('UPDATE "Order" SET total = ? WHERE id = ?').run(total, order.id);
});

db.close();

console.log('✅ Database seeded successfully!');
console.log('🎉 Migration to Prisma completed!');
console.log('📝 You can now use the Prisma client in your application.');

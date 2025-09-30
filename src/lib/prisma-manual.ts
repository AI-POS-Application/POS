import Database from 'better-sqlite3';
import path from 'path';

/**
 * Manual Prisma-like client for SQLite
 * This is a temporary workaround until Prisma binary issues are resolved
 */

const DB_PATH = path.join(process.cwd(), 'dev.db');

let db: Database.Database | null = null;

function getDatabase() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export const prisma = {
  table: {
    findMany: async () => {
      const database = getDatabase();
      return database.prepare('SELECT * FROM "Table"').all();
    },
    findUnique: async (args: { where: { id: number } }) => {
      const database = getDatabase();
      return database.prepare('SELECT * FROM "Table" WHERE id = ?').get(args.where.id);
    },
    create: async (args: { data: { number: number; capacity: number; status?: string } }) => {
      const database = getDatabase();
      const { number, capacity, status = 'available' } = args.data;
      const result = database.prepare('INSERT INTO "Table" (number, capacity, status) VALUES (?, ?, ?)').run(number, capacity, status);
      return database.prepare('SELECT * FROM "Table" WHERE id = ?').get(result.lastInsertRowid);
    },
    update: async (args: { where: { id: number }; data: any }) => {
      const database = getDatabase();
      const { id } = args.where;
      const updates = Object.keys(args.data).map(key => `"${key}" = ?`).join(', ');
      const values = Object.values(args.data);
      database.prepare(`UPDATE "Table" SET ${updates} WHERE id = ?`).run(...values, id);
      return database.prepare('SELECT * FROM "Table" WHERE id = ?').get(id);
    },
    delete: async (args: { where: { id: number } }) => {
      const database = getDatabase();
      const table = database.prepare('SELECT * FROM "Table" WHERE id = ?').get(args.where.id);
      database.prepare('DELETE FROM "Table" WHERE id = ?').run(args.where.id);
      return table;
    }
  },
  staff: {
    findMany: async () => {
      const database = getDatabase();
      return database.prepare('SELECT * FROM "Staff"').all();
    },
    findUnique: async (args: { where: { id: number } }) => {
      const database = getDatabase();
      return database.prepare('SELECT * FROM "Staff" WHERE id = ?').get(args.where.id);
    },
    create: async (args: { data: { name: string; role: string } }) => {
      const database = getDatabase();
      const { name, role } = args.data;
      const result = database.prepare('INSERT INTO "Staff" (name, role) VALUES (?, ?)').run(name, role);
      return database.prepare('SELECT * FROM "Staff" WHERE id = ?').get(result.lastInsertRowid);
    },
    update: async (args: { where: { id: number }; data: any }) => {
      const database = getDatabase();
      const { id } = args.where;
      const updates = Object.keys(args.data).map(key => `"${key}" = ?`).join(', ');
      const values = Object.values(args.data);
      database.prepare(`UPDATE "Staff" SET ${updates} WHERE id = ?`).run(...values, id);
      return database.prepare('SELECT * FROM "Staff" WHERE id = ?').get(id);
    },
    delete: async (args: { where: { id: number } }) => {
      const database = getDatabase();
      const staff = database.prepare('SELECT * FROM "Staff" WHERE id = ?').get(args.where.id);
      database.prepare('DELETE FROM "Staff" WHERE id = ?').run(args.where.id);
      return staff;
    }
  },
  menuItem: {
    findMany: async () => {
      const database = getDatabase();
      return database.prepare('SELECT * FROM "MenuItem"').all();
    },
    findUnique: async (args: { where: { id: number } }) => {
      const database = getDatabase();
      return database.prepare('SELECT * FROM "MenuItem" WHERE id = ?').get(args.where.id);
    },
    create: async (args: { data: { name: string; price: number; description?: string; category?: string; isAvailable?: boolean } }) => {
      const database = getDatabase();
      const { name, price, description, category, isAvailable = true } = args.data;
      const result = database.prepare('INSERT INTO "MenuItem" (name, price, description, category, "isAvailable") VALUES (?, ?, ?, ?, ?)').run(name, price, description, category, isAvailable);
      return database.prepare('SELECT * FROM "MenuItem" WHERE id = ?').get(result.lastInsertRowid);
    },
    update: async (args: { where: { id: number }; data: any }) => {
      const database = getDatabase();
      const { id } = args.where;
      const updates = Object.keys(args.data).map(key => `"${key}" = ?`).join(', ');
      const values = Object.values(args.data);
      database.prepare(`UPDATE "MenuItem" SET ${updates} WHERE id = ?`).run(...values, id);
      return database.prepare('SELECT * FROM "MenuItem" WHERE id = ?').get(id);
    },
    delete: async (args: { where: { id: number } }) => {
      const database = getDatabase();
      const menuItem = database.prepare('SELECT * FROM "MenuItem" WHERE id = ?').get(args.where.id);
      database.prepare('DELETE FROM "MenuItem" WHERE id = ?').run(args.where.id);
      return menuItem;
    }
  },
  order: {
    findMany: async (args?: { include?: any }) => {
      const database = getDatabase();
      const orders = database.prepare('SELECT * FROM "Order"').all();
      
      if (args?.include) {
        return orders.map((order: any) => {
          const items = database.prepare('SELECT * FROM "OrderItem" WHERE orderId = ?').all(order.id);
          const table = database.prepare('SELECT * FROM "Table" WHERE id = ?').get(order.tableId);
          const staff = database.prepare('SELECT * FROM "Staff" WHERE id = ?').get(order.staffId);
          
          return {
            ...order,
            items: items.map((item: any) => ({
              ...item,
              menuItem: database.prepare('SELECT * FROM "MenuItem" WHERE id = ?').get(item.menuItemId)
            })),
            table,
            staff
          };
        });
      }
      
      return orders;
    },
    findUnique: async (args: { where: { id: number }; include?: any }) => {
      const database = getDatabase();
      const order = database.prepare('SELECT * FROM "Order" WHERE id = ?').get(args.where.id);
      
      if (args?.include) {
        const items = database.prepare('SELECT * FROM "OrderItem" WHERE orderId = ?').all(order.id);
        const table = database.prepare('SELECT * FROM "Table" WHERE id = ?').get(order.tableId);
        const staff = database.prepare('SELECT * FROM "Staff" WHERE id = ?').get(order.staffId);
        
        return {
          ...order,
          items: items.map((item: any) => ({
            ...item,
            menuItem: database.prepare('SELECT * FROM "MenuItem" WHERE id = ?').get(item.menuItemId)
          })),
          table,
          staff
        };
      }
      
      return order;
    },
    create: async (args: { data: { tableId: number; staffId: number; status?: string; notes?: string } }) => {
      const database = getDatabase();
      const { tableId, staffId, status = 'pending', notes } = args.data;
      const result = database.prepare('INSERT INTO "Order" (tableId, staffId, status, notes) VALUES (?, ?, ?, ?)').run(tableId, staffId, status, notes);
      return database.prepare('SELECT * FROM "Order" WHERE id = ?').get(result.lastInsertRowid);
    },
    update: async (args: { where: { id: number }; data: any }) => {
      const database = getDatabase();
      const { id } = args.where;
      const updates = Object.keys(args.data).map(key => `"${key}" = ?`).join(', ');
      const values = Object.values(args.data);
      database.prepare(`UPDATE "Order" SET ${updates} WHERE id = ?`).run(...values, id);
      return database.prepare('SELECT * FROM "Order" WHERE id = ?').get(id);
    },
    delete: async (args: { where: { id: number } }) => {
      const database = getDatabase();
      const order = database.prepare('SELECT * FROM "Order" WHERE id = ?').get(args.where.id);
      database.prepare('DELETE FROM "Order" WHERE id = ?').run(args.where.id);
      return order;
    }
  },
  orderItem: {
    findMany: async (args?: { include?: any }) => {
      const database = getDatabase();
      const orderItems = database.prepare('SELECT * FROM "OrderItem"').all();
      
      if (args?.include) {
        return orderItems.map((item: any) => ({
          ...item,
          order: database.prepare('SELECT * FROM "Order" WHERE id = ?').get(item.orderId),
          menuItem: database.prepare('SELECT * FROM "MenuItem" WHERE id = ?').get(item.menuItemId)
        }));
      }
      
      return orderItems;
    },
    findUnique: async (args: { where: { id: number }; include?: any }) => {
      const database = getDatabase();
      const orderItem = database.prepare('SELECT * FROM "OrderItem" WHERE id = ?').get(args.where.id);
      
      if (args?.include) {
        return {
          ...orderItem,
          order: database.prepare('SELECT * FROM "Order" WHERE id = ?').get(orderItem.orderId),
          menuItem: database.prepare('SELECT * FROM "MenuItem" WHERE id = ?').get(orderItem.menuItemId)
        };
      }
      
      return orderItem;
    },
    create: async (args: { data: { orderId: number; menuItemId: number; quantity: number; price: number; notes?: string } }) => {
      const database = getDatabase();
      const { orderId, menuItemId, quantity, price, notes } = args.data;
      const result = database.prepare('INSERT INTO "OrderItem" (orderId, menuItemId, quantity, price, notes) VALUES (?, ?, ?, ?, ?)').run(orderId, menuItemId, quantity, price, notes);
      return database.prepare('SELECT * FROM "OrderItem" WHERE id = ?').get(result.lastInsertRowid);
    },
    update: async (args: { where: { id: number }; data: any }) => {
      const database = getDatabase();
      const { id } = args.where;
      const updates = Object.keys(args.data).map(key => `"${key}" = ?`).join(', ');
      const values = Object.values(args.data);
      database.prepare(`UPDATE "OrderItem" SET ${updates} WHERE id = ?`).run(...values, id);
      return database.prepare('SELECT * FROM "OrderItem" WHERE id = ?').get(id);
    },
    delete: async (args: { where: { id: number } }) => {
      const database = getDatabase();
      const orderItem = database.prepare('SELECT * FROM "OrderItem" WHERE id = ?').get(args.where.id);
      database.prepare('DELETE FROM "OrderItem" WHERE id = ?').run(args.where.id);
      return orderItem;
    }
  },
  $disconnect: async () => {
    if (db) {
      db.close();
      db = null;
    }
  }
};

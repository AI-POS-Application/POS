import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed script to populate the database with demo data
 * This script creates sample tables, staff, menu items, and orders
 */
async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.table.deleteMany();

  // Create staff members
  console.log('👥 Creating staff members...');
  const staff = await Promise.all([
    prisma.staff.create({
      data: { name: 'Alice Johnson', role: 'Manager' }
    }),
    prisma.staff.create({
      data: { name: 'Bob Smith', role: 'Head Waiter' }
    }),
    prisma.staff.create({
      data: { name: 'Carol Davis', role: 'Waiter' }
    }),
    prisma.staff.create({
      data: { name: 'David Wilson', role: 'Chef' }
    }),
    prisma.staff.create({
      data: { name: 'Emma Brown', role: 'Sous Chef' }
    }),
    prisma.staff.create({
      data: { name: 'Frank Miller', role: 'Hostess' }
    })
  ]);

  // Create tables
  console.log('🪑 Creating tables...');
  const tables = await Promise.all([
    prisma.table.create({
      data: { number: 1, capacity: 4, status: 'available' }
    }),
    prisma.table.create({
      data: { number: 2, capacity: 2, status: 'available' }
    }),
    prisma.table.create({
      data: { number: 3, capacity: 6, status: 'available' }
    }),
    prisma.table.create({
      data: { number: 4, capacity: 4, status: 'available' }
    }),
    prisma.table.create({
      data: { number: 5, capacity: 8, status: 'available' }
    }),
    prisma.table.create({
      data: { number: 6, capacity: 2, status: 'occupied' }
    }),
    prisma.table.create({
      data: { number: 7, capacity: 4, status: 'available' }
    }),
    prisma.table.create({
      data: { number: 8, capacity: 6, status: 'reserved' }
    })
  ]);

  // Create menu items
  console.log('🍽️ Creating menu items...');
  const menuItems = await Promise.all([
    // Indian Breakfast
    prisma.menuItem.create({
      data: {
        name: 'Masala Dosa',
        price: 8.99,
        description: 'Crispy crepe filled with spiced potatoes',
        category: 'Indian Breakfast',
        isAvailable: true
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Idli Sambar',
        price: 6.99,
        description: 'Steamed rice cakes with lentil curry',
        category: 'Indian Breakfast',
        isAvailable: true
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Poha',
        price: 5.99,
        description: 'Flattened rice with vegetables and spices',
        category: 'Indian Breakfast',
        isAvailable: true
      }
    }),

    // Western Breakfast
    prisma.menuItem.create({
      data: {
        name: 'Pancakes',
        price: 7.99,
        description: 'Fluffy pancakes with maple syrup',
        category: 'Western Breakfast',
        isAvailable: true
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Eggs Benedict',
        price: 12.99,
        description: 'Poached eggs on English muffin with hollandaise',
        category: 'Western Breakfast',
        isAvailable: true
      }
    }),

    // North Indian Main Course
    prisma.menuItem.create({
      data: {
        name: 'Butter Chicken',
        price: 16.99,
        description: 'Tender chicken in creamy tomato sauce',
        category: 'North Indian Main Course',
        isAvailable: true
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Dal Makhani',
        price: 12.99,
        description: 'Creamy black lentils with butter',
        category: 'North Indian Main Course',
        isAvailable: true
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Palak Paneer',
        price: 14.99,
        description: 'Cottage cheese in spinach curry',
        category: 'North Indian Main Course',
        isAvailable: true
      }
    }),

    // Biryani
    prisma.menuItem.create({
      data: {
        name: 'Chicken Biryani',
        price: 18.99,
        description: 'Fragrant basmati rice with spiced chicken',
        category: 'Biryani',
        isAvailable: true
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Vegetable Biryani',
        price: 15.99,
        description: 'Aromatic rice with mixed vegetables',
        category: 'Biryani',
        isAvailable: true
      }
    }),

    // Rice
    prisma.menuItem.create({
      data: {
        name: 'Jeera Rice',
        price: 4.99,
        description: 'Basmati rice tempered with cumin',
        category: 'Rice',
        isAvailable: true
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Fried Rice',
        price: 8.99,
        description: 'Stir-fried rice with vegetables',
        category: 'Rice',
        isAvailable: true
      }
    }),

    // Indian Breads
    prisma.menuItem.create({
      data: {
        name: 'Naan',
        price: 3.99,
        description: 'Soft leavened bread baked in tandoor',
        category: 'Indian Breads',
        isAvailable: true
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Roti',
        price: 2.99,
        description: 'Whole wheat flatbread',
        category: 'Indian Breads',
        isAvailable: true
      }
    }),

    // Pasta
    prisma.menuItem.create({
      data: {
        name: 'Spaghetti Carbonara',
        price: 14.99,
        description: 'Pasta with eggs, cheese, and pancetta',
        category: 'Pasta',
        isAvailable: true
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Penne Arrabbiata',
        price: 12.99,
        description: 'Pasta with spicy tomato sauce',
        category: 'Pasta',
        isAvailable: true
      }
    }),

    // Western Full Plate
    prisma.menuItem.create({
      data: {
        name: 'Grilled Salmon',
        price: 22.99,
        description: 'Fresh salmon with herbs and lemon',
        category: 'Western Full Plate',
        isAvailable: true
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Beef Steak',
        price: 28.99,
        description: 'Tender beef steak with vegetables',
        category: 'Western Full Plate',
        isAvailable: true
      }
    }),

    // Cold Beverages
    prisma.menuItem.create({
      data: {
        name: 'Fresh Orange Juice',
        price: 4.99,
        description: 'Freshly squeezed orange juice',
        category: 'Cold Beverages',
        isAvailable: true
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Mango Lassi',
        price: 5.99,
        description: 'Sweet yogurt drink with mango',
        category: 'Cold Beverages',
        isAvailable: true
      }
    }),

    // Tea & Coffee
    prisma.menuItem.create({
      data: {
        name: 'Masala Chai',
        price: 3.99,
        description: 'Spiced Indian tea',
        category: 'Tea & Coffee',
        isAvailable: true
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Cappuccino',
        price: 4.99,
        description: 'Espresso with steamed milk foam',
        category: 'Tea & Coffee',
        isAvailable: true
      }
    })
  ]);

  // Create sample orders
  console.log('📋 Creating sample orders...');
  
  // Order 1 - Table 6 (occupied)
  const order1 = await prisma.order.create({
    data: {
      tableId: tables[5].id, // Table 6
      staffId: staff[1].id, // Bob Smith
      status: 'pending',
      notes: 'Customer requested extra spicy'
    }
  });

  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: order1.id,
        menuItemId: menuItems[0].id, // Masala Dosa
        quantity: 2,
        price: menuItems[0].price,
        notes: 'Extra spicy'
      }
    }),
    prisma.orderItem.create({
      data: {
        orderId: order1.id,
        menuItemId: menuItems[20].id, // Masala Chai
        quantity: 2,
        price: menuItems[20].price
      }
    })
  ]);

  // Order 2 - Table 1
  const order2 = await prisma.order.create({
    data: {
      tableId: tables[0].id, // Table 1
      staffId: staff[2].id, // Carol Davis
      status: 'completed',
      notes: 'Regular order'
    }
  });

  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: order2.id,
        menuItemId: menuItems[5].id, // Butter Chicken
        quantity: 1,
        price: menuItems[5].price
      }
    }),
    prisma.orderItem.create({
      data: {
        orderId: order2.id,
        menuItemId: menuItems[12].id, // Naan
        quantity: 2,
        price: menuItems[12].price
      }
    }),
    prisma.orderItem.create({
      data: {
        orderId: order2.id,
        menuItemId: menuItems[10].id, // Jeera Rice
        quantity: 1,
        price: menuItems[10].price
      }
    })
  ]);

  // Update order totals
  const orders = await prisma.order.findMany();
  for (const order of orders) {
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id }
    });
    
    const total = orderItems.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
    
    await prisma.order.update({
      where: { id: order.id },
      data: { total }
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log(`Created ${staff.length} staff members`);
  console.log(`Created ${tables.length} tables`);
  console.log(`Created ${menuItems.length} menu items`);
  console.log(`Created ${orders.length} sample orders`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

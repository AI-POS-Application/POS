const { prisma } = require("./prisma-manual");

/**
 * Simple seed script for manual Prisma client
 * Creates basic demo data for development
 */
async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create staff members
    console.log('👥 Creating staff members...');
    const staff1 = await prisma.staff.create({
      data: { name: 'Alice Johnson', role: 'Manager' }
    });
    const staff2 = await prisma.staff.create({
      data: { name: 'Bob Smith', role: 'Head Waiter' }
    });
    const staff3 = await prisma.staff.create({
      data: { name: 'Carol Davis', role: 'Waiter' }
    });

    // Create tables
    console.log('🪑 Creating tables...');
    const table1 = await prisma.table.create({
      data: { number: 1, capacity: 4, status: 'available' }
    });
    const table2 = await prisma.table.create({
      data: { number: 2, capacity: 2, status: 'available' }
    });
    const table3 = await prisma.table.create({
      data: { number: 3, capacity: 6, status: 'occupied' }
    });

    // Create menu items
    console.log('🍽️ Creating menu items...');
    const menuItem1 = await prisma.menuItem.create({
      data: {
        name: 'Masala Dosa',
        price: 8.99,
        description: 'Crispy crepe filled with spiced potatoes',
        category: 'Indian Breakfast',
        isAvailable: true
      }
    });
    const menuItem2 = await prisma.menuItem.create({
      data: {
        name: 'Butter Chicken',
        price: 16.99,
        description: 'Tender chicken in creamy tomato sauce',
        category: 'North Indian Main Course',
        isAvailable: true
      }
    });
    const menuItem3 = await prisma.menuItem.create({
      data: {
        name: 'Naan',
        price: 3.99,
        description: 'Soft leavened bread baked in tandoor',
        category: 'Indian Breads',
        isAvailable: true
      }
    });

    // Create sample orders
    console.log('📋 Creating sample orders...');
    
    // Order 1 - Table 3 (occupied)
    const order1 = await prisma.order.create({
      data: {
        tableId: table3.id,
        staffId: staff2.id,
        status: 'pending',
        notes: 'Customer requested extra spicy'
      }
    });

    await prisma.orderItem.create({
      data: {
        orderId: order1.id,
        menuItemId: menuItem1.id,
        quantity: 2,
        price: menuItem1.price,
        notes: 'Extra spicy'
      }
    });

    // Order 2 - Table 1
    const order2 = await prisma.order.create({
      data: {
        tableId: table1.id,
        staffId: staff3.id,
        status: 'completed',
        notes: 'Regular order'
      }
    });

    await prisma.orderItem.create({
      data: {
        orderId: order2.id,
        menuItemId: menuItem2.id,
        quantity: 1,
        price: menuItem2.price
      }
    });

    await prisma.orderItem.create({
      data: {
        orderId: order2.id,
        menuItemId: menuItem3.id,
        quantity: 2,
        price: menuItem3.price
      }
    });

    console.log('✅ Database seeding completed successfully!');
    console.log('Created 3 staff members, 3 tables, 3 menu items, and 2 sample orders');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

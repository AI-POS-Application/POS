import { NextRequest, NextResponse } from 'next/server';
import { getTables } from '@/services/tables';
import { getStaff } from '@/services/staff';
import { getOrders } from '@/services/orders';

/**
 * GET /api/dashboard - Retrieves dashboard KPI data
 * @returns Dashboard metrics including sales, active tables, staff count, and orders
 */
export async function GET() {
  try {
    // Get today's date range
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    // Get all data using service layer
    const [tables, staff, orders] = await Promise.all([
      getTables(),
      getStaff(),
      getOrders()
    ]);
    
    // Filter today's paid orders
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= todayStart && orderDate < todayEnd && order.status === 'paid';
    });
    
    // Filter yesterday's paid orders
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= yesterdayStart && orderDate < todayStart && order.status === 'paid';
    });
    
    // Calculate sales
    const todaySales = todayOrders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);
    const yesterdaySales = yesterdayOrders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);
    
    // Calculate sales change percentage
    const salesChange = yesterdaySales > 0 
      ? ((todaySales - yesterdaySales) / yesterdaySales * 100)
      : 100;
    
    // Get active tables count (not available)
    const activeTables = tables.filter(table => table.status !== 'available').length;
    const totalTables = tables.length;
    
    // Get staff on duty count (assuming all staff are on duty for now)
    const staffOnDuty = staff.length;
    const totalStaff = staff.length;
    
    // Get today's orders count
    const todayOrdersCount = todayOrders.length;
    const yesterdayOrdersCount = yesterdayOrders.length;
    
    // Calculate orders change percentage
    const ordersChange = yesterdayOrdersCount > 0 
      ? ((todayOrdersCount - yesterdayOrdersCount) / yesterdayOrdersCount * 100)
      : 100;
    
    // Get recent activity (last 5 orders)
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    // Get sales data for the chart (last 7 days)
    const salesChartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dateStart && orderDate < dateEnd && order.status === 'paid';
      });
      
      const daySales = dayOrders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);
      
      salesChartData.push({
        date: dateStart.toISOString().split('T')[0],
        sales: daySales
      });
    }
    
    // Calculate table utilization percentage
    const tableUtilization = totalTables > 0 ? (activeTables / totalTables) * 100 : 0;
    
    // Calculate average order value
    const averageOrderValue = todayOrdersCount > 0 ? todaySales / todayOrdersCount : 0;
    
    const dashboardData = {
      sales: {
        today: todaySales,
        change: Math.round(salesChange * 100) / 100,
        chart: salesChartData
      },
      tables: {
        active: activeTables,
        total: totalTables,
        utilization: Math.round(tableUtilization * 100) / 100
      },
      staff: {
        onDuty: staffOnDuty,
        total: totalStaff
      },
      orders: {
        today: todayOrdersCount,
        change: Math.round(ordersChange * 100) / 100,
        averageValue: Math.round(averageOrderValue * 100) / 100
      },
      recentActivity: recentOrders.map(order => ({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount || order.total || 0,
        tableNumber: order.tableNumber || order.table?.number || 'Unknown',
        createdAt: order.createdAt
      }))
    };
    
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' }, 
      { status: 500 }
    );
  }
}
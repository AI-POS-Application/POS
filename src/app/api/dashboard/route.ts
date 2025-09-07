import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

/**
 * GET /api/dashboard - Retrieves dashboard KPI data
 * @returns Dashboard metrics including sales, active tables, staff count, and orders
 */
export async function GET() {
  try {
    const db = getDatabase();
    
    // Get today's date range
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const todayStartISO = todayStart.toISOString();
    const todayEndISO = todayEnd.toISOString();
    
    // Get today's sales
    const salesData = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as totalSales
      FROM orders 
      WHERE created_at >= ? AND created_at < ? AND status = 'Paid'
    `).get(todayStartISO, todayEndISO) as { totalSales: number };
    
    // Get yesterday's sales for comparison
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayEnd = todayStart;
    
    const yesterdaySales = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as totalSales
      FROM orders 
      WHERE created_at >= ? AND created_at < ? AND status = 'Paid'
    `).get(yesterdayStart.toISOString(), yesterdayEnd.toISOString()) as { totalSales: number };
    
    // Calculate sales change percentage
    const salesChange = yesterdaySales.totalSales > 0 
      ? ((salesData.totalSales - yesterdaySales.totalSales) / yesterdaySales.totalSales * 100)
      : 100;
    
    // Get active tables count (not Free)
    const activeTablesData = db.prepare(`
      SELECT COUNT(*) as count 
      FROM tables 
      WHERE status != 'Free'
    `).get() as { count: number };
    
    // Get total tables for comparison
    const totalTablesData = db.prepare(`
      SELECT COUNT(*) as count 
      FROM tables
    `).get() as { count: number };
    
    // Get staff on duty count
    const staffOnDutyData = db.prepare(`
      SELECT COUNT(*) as count 
      FROM staff 
      WHERE status = 'On Shift'
    `).get() as { count: number };
    
    // Get total staff for comparison
    const totalStaffData = db.prepare(`
      SELECT COUNT(*) as count 
      FROM staff
    `).get() as { count: number };
    
    // Get today's order count
    const todayOrdersData = db.prepare(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE created_at >= ? AND created_at < ?
    `).get(todayStartISO, todayEndISO) as { count: number };
    
    // Get yesterday's order count for comparison
    const yesterdayOrdersData = db.prepare(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE created_at >= ? AND created_at < ?
    `).get(yesterdayStart.toISOString(), yesterdayEnd.toISOString()) as { count: number };
    
    const ordersChange = yesterdayOrdersData.count > 0 
      ? ((todayOrdersData.count - yesterdayOrdersData.count) / yesterdayOrdersData.count * 100)
      : 100;
    
    // Get recent orders for activity feed
    const recentOrders = db.prepare(`
      SELECT 
        o.id, o.status, o.total_amount as totalAmount,
        o.created_at as createdAt,
        t.number as tableNumber
      FROM orders o
      JOIN tables t ON o.table_id = t.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `).all();
    
    // Get sales data for the chart (last 7 days)
    const salesChartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStart = date.toISOString();
      const dateEnd = new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString();
      
      const daySales = db.prepare(`
        SELECT COALESCE(SUM(total_amount), 0) as totalSales
        FROM orders 
        WHERE created_at >= ? AND created_at < ? AND status = 'Paid'
      `).get(dateStart, dateEnd) as { totalSales: number };
      
      salesChartData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sales: daySales.totalSales
      });
    }
    
    const dashboardData = {
      kpis: {
        todaysSales: {
          value: `$${salesData.totalSales.toFixed(2)}`,
          change: `${salesChange >= 0 ? '+' : ''}${salesChange.toFixed(0)}%`,
          isPositive: salesChange >= 0
        },
        activeTables: {
          value: activeTablesData.count.toString(),
          total: totalTablesData.count,
          change: `${activeTablesData.count}/${totalTablesData.count}`
        },
        staffOnDuty: {
          value: staffOnDutyData.count.toString(),
          total: totalStaffData.count,
          change: `${staffOnDutyData.count}/${totalStaffData.count}`
        },
        totalOrders: {
          value: todayOrdersData.count.toString(),
          change: `${ordersChange >= 0 ? '+' : ''}${ordersChange.toFixed(0)}%`,
          isPositive: ordersChange >= 0
        }
      },
      salesChart: salesChartData,
      recentActivity: recentOrders
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

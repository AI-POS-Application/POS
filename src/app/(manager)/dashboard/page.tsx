'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Utensils, Users, ShoppingCart, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import SalesChart from '@/components/manager/SalesChart';
import StaffOnDuty from '@/components/manager/StaffOnDuty';
import { useApi } from '@/hooks/use-api';
import { formatPriceWithDecimals } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function ManagerDashboard() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Fetch dashboard data from API with refetch capability
  const { data: dashboardData, loading, error, refetch } = useApi<any>('/api/dashboard');

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleManualRefresh = () => {
    refetch();
    setLastUpdated(new Date());
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-xs text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="text-center">
          <p className="text-destructive mb-2 text-sm">Failed to load dashboard data</p>
          <p className="text-xs text-muted-foreground">Please try refreshing the page</p>
          <Button onClick={handleManualRefresh} className="mt-3 h-8 text-xs">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const kpiData = [
    { 
      title: "Today's Sales", 
      value: formatPriceWithDecimals(dashboardData.sales.today), 
      icon: <DollarSign className="h-5 w-5 text-muted-foreground" />, 
      change: `${dashboardData.sales.change > 0 ? '+' : ''}${dashboardData.sales.change.toFixed(1)}%`,
      isPositive: dashboardData.sales.change >= 0,
      trend: dashboardData.sales.change >= 0 ? 'up' : 'down'
    },
    { 
      title: "Active Tables", 
      value: `${dashboardData.tables.active}/${dashboardData.tables.total}`, 
      icon: <Utensils className="h-5 w-5 text-muted-foreground" />, 
      change: `${dashboardData.tables.utilization.toFixed(1)}% utilization`,
      isPositive: true,
      trend: 'neutral'
    },
    { 
      title: "Staff on Duty", 
      value: `${dashboardData.staff.onDuty}/${dashboardData.staff.total}`, 
      icon: <Users className="h-5 w-5 text-muted-foreground" />, 
      change: "All staff active",
      isPositive: true,
      trend: 'neutral'
    },
    { 
      title: "Today's Orders", 
      value: dashboardData.orders.today.toString(), 
      icon: <ShoppingCart className="h-5 w-5 text-muted-foreground" />, 
      change: `${dashboardData.orders.change > 0 ? '+' : ''}${dashboardData.orders.change.toFixed(1)}%`,
      isPositive: dashboardData.orders.change >= 0,
      trend: dashboardData.orders.change >= 0 ? 'up' : 'down'
    },
  ];

  return (
    <div className="flex-1 space-y-3 p-3 sm:p-4">
        <header className="flex h-12 items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground font-headline">
                Manager Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                Welcome back, Admin! • Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
        </header>
        
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map(kpi => (
                <Card key={kpi.title} className="rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
                        <CardTitle className="text-xs font-medium">{kpi.title}</CardTitle>
                        {kpi.icon}
                    </CardHeader>
                    <CardContent className="px-3 pb-3">
                        <div className="text-lg font-bold">{kpi.value}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {kpi.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                          {kpi.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-600" />}
                          <p className={`text-xs ${kpi.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {kpi.change}
                            {kpi.title === "Today's Sales" || kpi.title === "Total Orders" ? ' from yesterday' : ''}
                          </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-3 lg:items-stretch">
            <Card className="lg:col-span-2 rounded-xl shadow-sm border flex flex-col">
                <CardHeader className="px-3 py-2 pb-1">
                    <CardTitle className="text-sm">Sales Overview (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 flex-1 flex flex-col">
                    <div className="flex-1">
                        <SalesChart data={dashboardData.sales.chart} />
                    </div>
                </CardContent>
            </Card>
            <Card className="rounded-xl shadow-sm border flex flex-col">
                <CardHeader className="px-3 py-2 pb-1">
                    <CardTitle className="text-sm">Staff on Duty</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 flex-1 flex flex-col">
                    <div className="flex-1">
                        <StaffOnDuty />
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Recent Activity Section */}
        {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 && (
          <div className="grid gap-3 lg:grid-cols-2">
            <Card className="rounded-xl shadow-sm border">
              <CardHeader className="px-3 py-2">
                <CardTitle className="text-sm">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="space-y-2">
                  {dashboardData.recentActivity.slice(0, 3).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div>
                          <p className="text-xs font-medium">Order #{order.id}</p>
                          <p className="text-xs text-muted-foreground">Table {order.tableNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">{formatPriceWithDecimals(order.totalAmount)}</p>
                        <Badge 
                          variant={order.status === 'paid' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Stats Card */}
            <Card className="rounded-xl shadow-sm border">
              <CardHeader className="px-3 py-2">
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Avg Order Value</span>
                    <span className="text-sm font-medium">₹0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Peak Hours</span>
                    <span className="text-sm font-medium">12:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Busiest Table</span>
                    <span className="text-sm font-medium">Table 2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Service Time</span>
                    <span className="text-sm font-medium">25 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
}

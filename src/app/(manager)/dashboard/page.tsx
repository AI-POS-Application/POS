'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Utensils, Users, ShoppingCart, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import SalesChart from '@/components/manager/SalesChart';
import StaffOnDuty from '@/components/manager/StaffOnDuty';
import { useApi } from '@/hooks/use-api';
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
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load dashboard data</p>
          <p className="text-muted-foreground">Please try refreshing the page</p>
          <Button onClick={handleManualRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const kpiData = [
    { 
      title: "Today's Sales", 
      value: dashboardData.kpis.todaysSales.value, 
      icon: <DollarSign className="h-5 w-5 text-muted-foreground" />, 
      change: dashboardData.kpis.todaysSales.change,
      isPositive: dashboardData.kpis.todaysSales.isPositive,
      trend: dashboardData.kpis.todaysSales.isPositive ? 'up' : 'down'
    },
    { 
      title: "Active Tables", 
      value: dashboardData.kpis.activeTables.value, 
      icon: <Utensils className="h-5 w-5 text-muted-foreground" />, 
      change: dashboardData.kpis.activeTables.change,
      isPositive: true,
      trend: 'neutral'
    },
    { 
      title: "Staff on Duty", 
      value: dashboardData.kpis.staffOnDuty.value, 
      icon: <Users className="h-5 w-5 text-muted-foreground" />, 
      change: dashboardData.kpis.staffOnDuty.change,
      isPositive: true,
      trend: 'neutral'
    },
    { 
      title: "Total Orders", 
      value: dashboardData.kpis.totalOrders.value, 
      icon: <ShoppingCart className="h-5 w-5 text-muted-foreground" />, 
      change: dashboardData.kpis.totalOrders.change,
      isPositive: dashboardData.kpis.totalOrders.isPositive,
      trend: dashboardData.kpis.totalOrders.isPositive ? 'up' : 'down'
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6">
        <header className="flex h-16 items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-headline">
                Manager Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, Admin! • Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Live Data
              </Badge>
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
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map(kpi => (
                <Card key={kpi.title} className="rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                        {kpi.icon}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpi.value}</div>
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 rounded-2xl shadow-sm border">
                <CardHeader>
                    <CardTitle>Sales Overview (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <SalesChart data={dashboardData.salesChart} />
                </CardContent>
            </Card>
            <Card className="col-span-4 lg:col-span-3 rounded-2xl shadow-sm border">
                <CardHeader>
                    <CardTitle>Staff on Duty</CardTitle>
                </CardHeader>
                <CardContent>
                    <StaffOnDuty />
                </CardContent>
            </Card>
        </div>

        {/* Recent Activity Section */}
        {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 && (
          <Card className="rounded-2xl shadow-sm border">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentActivity.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Order #{order.id}</p>
                        <p className="text-xs text-muted-foreground">Table {order.tableNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${order.totalAmount.toFixed(2)}</p>
                      <Badge 
                        variant={order.status === 'Paid' ? 'default' : 'secondary'}
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
        )}
    </div>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Utensils, Users, ShoppingCart } from "lucide-react";
import SalesChart from '@/components/manager/SalesChart';
import StaffOnDuty from '@/components/manager/StaffOnDuty';
import { useApi } from '@/hooks/use-api';

export default function ManagerDashboard() {
  // Fetch dashboard data from API
  const { data: dashboardData, loading, error } = useApi<any>('/api/dashboard');

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
        </div>
      </div>
    );
  }

  const kpiData = [
    { 
      title: "Today's Sales", 
      value: dashboardData.kpis.todaysSales.value, 
      icon: <DollarSign className="h-5 w-5 text-muted-foreground" />, 
      change: dashboardData.kpis.todaysSales.change 
    },
    { 
      title: "Active Tables", 
      value: dashboardData.kpis.activeTables.value, 
      icon: <Utensils className="h-5 w-5 text-muted-foreground" />, 
      change: dashboardData.kpis.activeTables.change 
    },
    { 
      title: "Staff on Duty", 
      value: dashboardData.kpis.staffOnDuty.value, 
      icon: <Users className="h-5 w-5 text-muted-foreground" />, 
      change: dashboardData.kpis.staffOnDuty.change 
    },
    { 
      title: "Total Orders", 
      value: dashboardData.kpis.totalOrders.value, 
      icon: <ShoppingCart className="h-5 w-5 text-muted-foreground" />, 
      change: dashboardData.kpis.totalOrders.change 
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6">
        <header className="flex h-16 items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-headline">
                Manager Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">Welcome back, Admin!</p>
            </div>
        </header>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map(kpi => (
                <Card key={kpi.title} className="rounded-2xl shadow-sm border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                        {kpi.icon}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        <p className="text-xs text-muted-foreground">{kpi.change} from yesterday</p>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 rounded-2xl shadow-sm border">
                <CardHeader>
                    <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <SalesChart />
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
    </div>
  );
}

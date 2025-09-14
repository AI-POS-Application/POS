'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Table, TableStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Utensils, Users, BellRing, Receipt } from 'lucide-react';

interface TableCardProps {
  table: Table;
  onClick: () => void;
}

const statusConfig: { [key in TableStatus]: {
  icon: React.ReactNode;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  cardClass: string;
}} = {
  Free: {
    icon: <Utensils className="h-4 w-4 text-green-500" />,
    badgeVariant: 'secondary',
    cardClass: 'bg-green-500/5 hover:border-green-500/50',
  },
  Occupied: {
    icon: <Users className="h-4 w-4 text-orange-500" />,
    badgeVariant: 'outline',
    cardClass: 'bg-orange-500/5 hover:border-orange-500/50',
  },
  Serving: {
    icon: <BellRing className="h-4 w-4 text-blue-500" />,
    badgeVariant: 'default',
    cardClass: 'bg-blue-500/5 hover:border-blue-500/50',
  },
  Billing: {
    icon: <Receipt className="h-4 w-4 text-red-500" />,
    badgeVariant: 'destructive',
    cardClass: 'bg-red-500/5 border-red-500/20 cursor-not-allowed opacity-80',
  },
};

const badgeColors = {
  Free: "bg-green-100 text-green-800 border-green-200",
  Occupied: "bg-orange-100 text-orange-800 border-orange-200",
  Serving: "bg-blue-100 text-blue-800 border-blue-200",
  Billing: "bg-red-100 text-red-800 border-red-200"
}

export default function TableCard({ table, onClick }: TableCardProps) {
  const config = statusConfig[table.status];

  return (
    <Card
      onClick={table.status !== 'Billing' ? onClick : undefined}
      className={cn(
        'cursor-pointer transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 rounded-xl border',
        config.cardClass,
        table.status === 'Billing' && 'cursor-not-allowed hover:transform-none'
      )}
    >
      <CardContent className="p-2 flex flex-col items-start justify-between h-full">
        <div className='flex justify-between w-full items-start'>
            <div className='flex flex-col'>
                <p className="text-xs text-muted-foreground">Table</p>
                <p className="text-lg font-bold font-headline">{table.number}</p>
            </div>
            {config.icon}
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant={config.badgeVariant} className={cn("text-xs font-medium", badgeColors[table.status])}>
            {table.status}
          </Badge>
          {table.status === 'Occupied' && table.customerCount && (
            <Badge variant="outline" className={cn("text-xs font-medium", badgeColors[table.status])}>
              {table.customerCount}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

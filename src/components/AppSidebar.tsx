
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  ClipboardList,
  Users,
  Archive,
  Settings,
  Utensils,
  ChefHat,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { href: '/', label: 'Waiter', icon: Utensils },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/orders', label: 'Orders', icon: ClipboardList, comingSoon: true },
  { href: '/menu', label: 'Menu', icon: ChefHat },
  { href: '/staff', label: 'Staff', icon: Users },
  { href: '/inventory', label: 'Inventory', comingSoon: true, icon: Archive },
  { href: '/settings', label: 'Settings', comingSoon: true, icon: Settings },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-20'
        )}
      >
        <div className={cn(
            'flex items-center justify-center gap-2 p-2 bg-card text-card-foreground rounded-2xl shadow-lg border rounded-b-xl'
        )}>
          {navItems.map((item) => {
            const isActive =
              (item.href === '/' && pathname === '/') ||
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.comingSoon ? '#' : item.href}
                    className={cn(
                      'flex flex-col items-center w-16 h-16 justify-center rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      item.comingSoon && 'cursor-not-allowed opacity-60'
                    )}
                  >
                    <item.icon className="h-6 w-6 flex-shrink-0" />
                     {item.comingSoon && (
                       <span className="absolute bottom-2 text-[8px] bg-muted text-muted-foreground px-1 py-0 rounded-sm">Soon</span>
                     )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" className="mb-2">
                  <p>{item.label}{item.comingSoon && ' (Coming Soon)'}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </aside>
    </TooltipProvider>
  );
}

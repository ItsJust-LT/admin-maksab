"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  TicketCheck, 
  CreditCard, 
  Settings,
  LogOut
} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Users', href: '/users' },
  { icon: Building2, label: 'Organizations', href: '/organizations' },
  { icon: TicketCheck, label: 'Support Tickets', href: '/support-tickets' },
  { icon: CreditCard, label: 'Payments', href: '/payments' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-64 bg-background border-r">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Maksab Admin</h1>
      </div>
      <ScrollArea className="flex-1 px-3">
        <nav className="flex flex-col space-y-1">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start',
                  pathname === item.href && 'bg-muted'
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-6 flex items-center">
        <UserButton afterSignOutUrl="/" />
        <Button variant="ghost" className="ml-auto">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
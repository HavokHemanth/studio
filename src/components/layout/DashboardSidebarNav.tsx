"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, PlusCircle, ListOrdered, User, Settings, LogOut, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useWallet } from '@/contexts/WalletContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DashboardSidebarNav = () => {
  const pathname = usePathname();
  const { artisanProfile, disconnect } = useWallet();

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: Home },
    { href: '/dashboard/products', label: 'My Products', icon: ListOrdered },
    { href: '/dashboard/add-product', label: 'Add New Product', icon: PlusCircle },
    // { href: '/dashboard/profile', label: 'My Profile', icon: User }, // Can be added later
    // { href: '/dashboard/settings', label: 'Settings', icon: Settings }, // Can be added later
  ];
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <aside className="w-64 bg-card border-r border-border p-4 flex flex-col h-full shadow-sm">
      {artisanProfile && (
        <div className="mb-6 p-3 rounded-lg border border-border bg-background">
            <div className="flex items-center space-x-3">
                 <Avatar className="h-12 w-12">
                    {artisanProfile.profileImage && <AvatarImage src={artisanProfile.profileImage} alt={artisanProfile.name} />}
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                        {getInitials(artisanProfile.name)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-semibold text-foreground">{artisanProfile.name}</p>
                    <p className="text-xs text-muted-foreground">Artisan Account</p>
                </div>
            </div>
        </div>
      )}
      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Button
                variant={pathname === item.href ? 'default' : 'ghost'}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-muted/50"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon size={18} className="mr-3" />
                  {item.label}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      <Separator className="my-4" />
      <Button variant="outline" className="w-full justify-start" onClick={disconnect}>
        <LogOut size={18} className="mr-3" />
        Disconnect Wallet
      </Button>
       <Button variant="ghost" className="w-full justify-start mt-2" asChild>
         <Link href="/">
            <ShoppingBag size={18} className="mr-3" />
            Back to Marketplace
        </Link>
      </Button>
    </aside>
  );
};

export default DashboardSidebarNav;

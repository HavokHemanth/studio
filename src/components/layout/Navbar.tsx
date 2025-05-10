"use client";

import Link from 'next/link';
import { Palette, Home, ShieldCheck, UserCircle, Gem, ShoppingBag, UserPlus } from 'lucide-react';
import ConnectWalletButton from '@/components/shared/ConnectWalletButton';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const { account, isArtisan, disconnect, artisanProfile } = useWallet();

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 text-primary hover:opacity-80 transition-opacity">
          <Palette size={32} />
          <h1 className="text-2xl font-bold">ChennaiArtisanConnect</h1>
        </Link>
        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center space-x-1">
              <Home size={18} /> <span>Home</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/verify" className="flex items-center space-x-1">
              <ShieldCheck size={18} /> <span>Verify</span>
            </Link>
          </Button>
          {account && (
            <Button variant="ghost" asChild>
              <Link href="/my-nfts" className="flex items-center space-x-1">
                <Gem size={18} /> <span>My NFTs</span>
              </Link>
            </Button>
          )}
          {isArtisan && account && (
            <Button variant="ghost" asChild>
              <Link href="/dashboard" className="flex items-center space-x-1">
                <UserCircle size={18} /> <span>Artisan Dashboard</span>
              </Link>
            </Button>
          )}
          {!isArtisan && account && (
            <Button variant="ghost" asChild>
              <Link href="/artisans/register" className="flex items-center space-x-1">
                <UserPlus size={18} /> <span>Become an Artisan</span>
              </Link>
            </Button>
          )}
        </nav>
        <div className="flex items-center space-x-3">
          <ConnectWalletButton />
          {account && (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    {artisanProfile?.profileImage && <AvatarImage src={artisanProfile.profileImage} alt={artisanProfile.name} />}
                    <AvatarFallback>
                      {isArtisan && artisanProfile ? getInitials(artisanProfile.name) : account.substring(2,4).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {isArtisan && artisanProfile ? artisanProfile.name : "Connected User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {account.substring(0, 6)}...{account.substring(account.length - 4)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <div className="md:hidden"> {/* Mobile specific links */}
                  <DropdownMenuItem asChild>
                     <Link href="/" className="flex items-center"><Home size={16} className="mr-2"/>Home</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/verify" className="flex items-center"><ShieldCheck size={16} className="mr-2"/>Verify Product</Link>
                  </DropdownMenuItem>
                  {account && (
                    <DropdownMenuItem asChild>
                      <Link href="/my-nfts" className="flex items-center"><Gem size={16} className="mr-2"/>My NFTs</Link>
                    </DropdownMenuItem>
                  )}
                  {isArtisan && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center"><UserCircle size={16} className="mr-2"/>Artisan Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {!isArtisan && account && (
                     <DropdownMenuItem asChild>
                      <Link href="/artisans/register" className="flex items-center"><UserPlus size={16} className="mr-2"/>Become an Artisan</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                </div>
                <DropdownMenuItem onClick={disconnect}>
                  <ShoppingBag size={16} className="mr-2" /> {/* Using ShoppingBag as a generic icon for logout/disconnect */}
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

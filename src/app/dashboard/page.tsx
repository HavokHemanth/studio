"use client";
// This will be the main landing page for the dashboard.
// For now, it can redirect to /dashboard/products or show some summary.
// Let's make it redirect to the products list or show a welcome message.

import { useWallet } from "@/contexts/WalletContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListOrdered, PlusCircle, ShoppingBag } from "lucide-react";

export default function DashboardOverviewPage() {
  const { artisanProfile } = useWallet();

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">
            Welcome, {artisanProfile?.name || "Artisan"}!
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            This is your Artisan Dashboard. Manage your products, view your sales, and showcase your unique creations to the world.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DashboardActionCard
            href="/dashboard/products"
            icon={<ListOrdered className="h-10 w-10 text-primary" />}
            title="Manage My Products"
            description="View, edit, or remove your listed artisanal items."
          />
          <DashboardActionCard
            href="/dashboard/add-product"
            icon={<PlusCircle className="h-10 w-10 text-primary" />}
            title="Add New Product"
            description="List a new unique creation and mint it as an NFT (simulated)."
          />
           <DashboardActionCard
            href="/"
            icon={<ShoppingBag className="h-10 w-10 text-primary" />}
            title="View Marketplace"
            description="See how your products look to customers on the main marketplace."
          />
        </CardContent>
      </Card>

      {/* Placeholder for future analytics or summary cards */}
      {/* <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview (Simulated)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total Items Sold: X</p>
            <p>Total Earnings: Y ETH</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity (Simulated)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>- Product Z listed.</p>
            <p>- Product A sold.</p>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}

interface DashboardActionCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const DashboardActionCard: React.FC<DashboardActionCardProps> = ({ href, icon, title, description }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center gap-4 pb-2">
      {icon}
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button asChild variant="outline" className="w-full">
        <Link href={href}>Go to {title.split(' ')[0]}</Link>
      </Button>
    </CardContent>
  </Card>
);

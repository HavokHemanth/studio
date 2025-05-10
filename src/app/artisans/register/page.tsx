"use client";

import ArtisanRegistrationForm from "@/components/artisan/ArtisanRegistrationForm";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, UserCheck, AlertCircle, WalletCards } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";

export default function RegisterArtisanPage() {
  const { account, isArtisan, isLoading, connect } = useWallet();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading your information...</p>
      </div>
    );
  }

  if (!account) {
    return (
      <Card className="max-w-md mx-auto mt-10 text-center shadow-lg">
        <CardHeader>
          <WalletCards className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
          <CardDescription className="text-muted-foreground">
            To register as an artisan, please connect your Ethereum wallet first. This wallet will be associated with your artisan profile and products.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connect} size="lg" className="w-full">
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isArtisan) {
    return (
      <Card className="max-w-md mx-auto mt-10 text-center shadow-lg">
        <CardHeader>
          <UserCheck className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <CardTitle className="text-2xl">Already Registered!</CardTitle>
          <CardDescription className="text-muted-foreground">
            Your wallet is already associated with an artisan profile. You can manage your products and profile from your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg" className="w-full">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="py-8">
      <ArtisanRegistrationForm />
    </div>
  );
}

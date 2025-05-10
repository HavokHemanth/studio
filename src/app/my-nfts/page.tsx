"use client";

import { useWallet } from '@/contexts/WalletContext';
import type { NFT } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { watchAssetInWallet } from '@/lib/blockchainService';
import { Gem, ExternalLink, Info, ImageOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge'; // Ensure Badge is imported

export default function MyNftsPage() {
  const { account, userNfts, isLoading, connect } = useWallet();

  const handleAddToWallet = async (nft: NFT) => {
    await watchAssetInWallet(nft);
  };
  
  if (isLoading && !account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your NFT collection...</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
         <Gem size={64} className="text-primary opacity-50 mb-6" />
        <h1 className="text-2xl font-semibold mb-3">View Your NFTs</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Connect your wallet to see the unique artisanal NFTs you've collected.
          Each NFT represents an authentic piece from Chennai's finest artisans.
        </p>
        <Button onClick={connect} size="lg">
          Connect Wallet
        </Button>
      </div>
    );
  }
  
  if (userNfts.length === 0) {
    return (
      <div className="text-center min-h-[60vh] flex flex-col items-center justify-center">
         <Gem size={64} className="text-primary opacity-50 mb-6" />
        <h1 className="text-2xl font-semibold mb-3">Your NFT Collection is Empty</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          You haven't acquired any artisanal NFTs yet. Explore our marketplace to find unique, verifiable items.
        </p>
        <Button asChild size="lg">
          <Link href="/">Explore Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <Gem size={30} className="mr-3" /> My NFT Collection
        </h1>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {userNfts.length} Item{userNfts.length === 1 ? '' : 's'}
        </Badge>
      </div>
      
      <Alert className="mb-6 bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle>Simulated NFTs</AlertTitle>
        <AlertDescription>
          This page displays your simulated NFT collection. The "Add to Metamask" feature will attempt to use `wallet_watchAsset` which may or may not be fully supported for all test networks or token types by your wallet.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userNfts.map((nft) => (
          <Card key={nft.tokenId} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="p-0 relative aspect-video">
              {nft.imageUrl ? (
                <Image
                  src={nft.imageUrl}
                  alt={nft.name}
                  fill
                  className="object-cover"
                  data-ai-hint="nft image"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <ImageOff size={48} className="text-muted-foreground" />
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg font-semibold mb-1 truncate" title={nft.name}>{nft.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground mb-1">Artisan: {nft.artisanName}</CardDescription>
              <p className="text-xs text-muted-foreground truncate mb-3" title={nft.description}>{nft.description}</p>
              <p className="text-xs text-muted-foreground">Token ID: <span className="font-mono break-all">{nft.tokenId}</span></p>
              <p className="text-xs text-muted-foreground">Contract: <span className="font-mono break-all">{nft.contractAddress.substring(0,6)}...{nft.contractAddress.substring(nft.contractAddress.length-4)}</span></p>
            </CardContent>
            <div className="p-4 border-t">
              <Button onClick={() => handleAddToWallet(nft)} className="w-full" variant="outline">
                <ExternalLink size={16} className="mr-2" /> Add to Metamask (Simulated)
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

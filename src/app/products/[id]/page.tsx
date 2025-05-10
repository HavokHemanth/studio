"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Product, Artisan } from '@/types';
import { getProductById, purchaseProduct, getArtisanDetails } from '@/lib/blockchainService';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CalendarDays, Layers, Palette, ShoppingCart, Sparkles, Tag, User, CheckCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { account, refreshNfts } = useWallet();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof id === 'string') {
      const fetchProductDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedProduct = await getProductById(id);
          if (fetchedProduct) {
            setProduct(fetchedProduct);
            const fetchedArtisan = await getArtisanDetails(fetchedProduct.artisanId);
            setArtisan(fetchedArtisan || null);
          } else {
            setError("Product not found.");
          }
        } catch (e) {
          console.error(e);
          setError("Failed to load product details.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProductDetails();
    }
  }, [id]);

  const handlePurchase = async () => {
    if (!account) {
      toast({ title: "Connect Wallet", description: "Please connect your wallet to purchase.", variant: "destructive" });
      return;
    }
    if (!product || product.isSold) {
      toast({ title: "Not Available", description: "This product is not available for purchase.", variant: "destructive" });
      return;
    }

    setIsPurchasing(true);
    const success = await purchaseProduct(product.id, account);
    setIsPurchasing(false);

    if (success) {
      toast({
        title: "Purchase Successful!",
        description: `${product.name} is now yours. Check "My NFTs".`,
        action: <Button variant="outline" size="sm" onClick={() => router.push('/my-nfts')}>Go to My NFTs</Button>,
      });
      // Refresh product data to show as sold
      const updatedProduct = await getProductById(product.id);
      setProduct(updatedProduct || null);
      await refreshNfts(); // Refresh user's NFT list
    } else {
      toast({ title: "Purchase Failed", description: "The transaction could not be completed (simulated).", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Skeleton className="w-full h-96 rounded-lg mb-6" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-6" />
        <Skeleton className="h-12 w-1/3" />
      </div>
    );
  }

  if (error) {
    return (
       <Alert variant="destructive" className="max-w-lg mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error} <Link href="/" className="underline">Go back to homepage.</Link></AlertDescription>
      </Alert>
    );
  }

  if (!product) {
    return (
      <Alert className="max-w-lg mx-auto">
        <Info className="h-4 w-4" />
        <AlertTitle>Product Not Found</AlertTitle>
        <AlertDescription>The product you are looking for does not exist or may have been removed. <Link href="/" className="underline">Return to shop</Link>.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="overflow-hidden shadow-xl">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative aspect-square md:aspect-auto">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              data-ai-hint="detailed product image"
              priority
            />
            {product.isVerified && (
              <Badge variant="secondary" className="absolute top-4 left-4 bg-accent text-accent-foreground shadow-md">
                <Sparkles size={16} className="mr-1.5" /> Verified Authentic
              </Badge>
            )}
          </div>
          <div className="p-6 md:p-8 flex flex-col">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-3xl font-bold text-primary mb-2">{product.name}</CardTitle>
              {artisan && (
                <Link href={`/artisans/${artisan.id}`} passHref> {/* Assuming an artisan profile page might exist */}
                  <CardDescription className="text-md text-muted-foreground hover:text-primary transition-colors flex items-center">
                    <User size={18} className="mr-2" /> By {artisan.name}
                  </CardDescription>
                </Link>
              )}
            </CardHeader>

            <CardContent className="p-0 flex-grow space-y-4">
              <p className="text-foreground leading-relaxed">{product.description}</p>
              
              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <Palette size={16} className="mr-3 text-primary" />
                  <strong>Materials:</strong> <span className="ml-1 text-muted-foreground">{product.materials.join(', ')}</span>
                </div>
                <div className="flex items-center">
                  <CalendarDays size={16} className="mr-3 text-primary" />
                  <strong>Created:</strong> <span className="ml-1 text-muted-foreground">{new Date(product.creationDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Layers size={16} className="mr-3 text-primary" />
                  <strong>Product ID:</strong> <span className="ml-1 text-muted-foreground break-all">{product.id}</span>
                </div>
              </div>
              
              <Separator />

              <div className="flex items-baseline justify-between">
                 <p className="text-3xl font-bold text-primary flex items-center">
                  <Tag size={28} className="mr-2" />
                  {product.price} ETH
                </p>
                {product.isSold && product.ownerAddress && (
                    <Badge variant="outline" className="text-sm py-1 px-3 border-green-500 text-green-600">
                        <CheckCircle size={16} className="mr-2" /> Sold (Owner: {product.ownerAddress.substring(0,6)}...{product.ownerAddress.substring(product.ownerAddress.length-4)})
                    </Badge>
                )}
              </div>
            </CardContent>

            <div className="mt-8">
              <Button
                size="lg"
                className="w-full text-lg py-3"
                onClick={handlePurchase}
                disabled={isPurchasing || product.isSold || !account}
              >
                <ShoppingCart size={20} className="mr-2" />
                {isPurchasing ? 'Processing...' : (product.isSold ? 'Sold Out' : (account ? 'Buy Now' : 'Connect Wallet to Buy'))}
              </Button>
              {!account && !product.isSold && <p className="text-xs text-center mt-2 text-muted-foreground">Connect your wallet to enable purchase.</p>}
              <Button variant="outline" className="w-full mt-3" onClick={() => router.push(`/verify?productId=${product.id}`)}>
                Verify Provenance
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

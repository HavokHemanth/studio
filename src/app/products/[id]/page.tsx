
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
import { AlertCircle, CalendarDays, Layers, Palette, ShoppingCart, Sparkles, Tag, User, CheckCircle, Info, Loader2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { account, refreshNfts, connect: connectWalletFromContext } = useWallet();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<'idle' | 'confirm_transaction' | 'processing' | 'success' | 'error'>('idle');
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
      // Optionally trigger wallet connection here
      // await connectWalletFromContext(); // if connectWalletFromContext is available and appropriate
      return;
    }
    if (!product || product.isSold) {
      toast({ title: "Not Available", description: "This product is not available for purchase.", variant: "destructive" });
      return;
    }

    setIsPurchasing(true);
    setPurchaseStep('confirm_transaction');

    const purchaseResult = await purchaseProduct(product.id, account, product.price);
    
    if (purchaseResult.success) {
      setPurchaseStep('processing');
      toast({
        title: "Purchase Processing",
        description: `Transaction submitted (Hash: ${purchaseResult.transactionHash?.substring(0,10)}...). Waiting for confirmation.`,
      });
      
      // Simulate backend processing after transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      setPurchaseStep('success');
      toast({
        title: "Purchase Successful!",
        description: `${product.name} is now yours. Tx: ${purchaseResult.transactionHash?.substring(0,10)}... Check "My NFTs".`,
        action: <Button variant="outline" size="sm" onClick={() => router.push('/my-nfts')}><ExternalLink className="mr-2 h-4 w-4" />Go to My NFTs</Button>,
      });
      // Refresh product data to show as sold
      const updatedProduct = await getProductById(product.id);
      setProduct(updatedProduct || null);
      await refreshNfts(); // Refresh user's NFT list
    } else {
      setPurchaseStep('error');
      // Toast is already handled in blockchainService for failed Metamask transaction
    }
    setIsPurchasing(false);
    // Keep purchaseStep in 'success' or 'error' to reflect final state, or reset to 'idle' after a delay
    // setTimeout(() => setPurchaseStep('idle'), 5000); // Optional: reset after a while
  };

  const getButtonText = () => {
    if (product?.isSold) return 'Sold Out';
    if (!account) return 'Connect Wallet to Buy';
    if (isPurchasing) {
      if (purchaseStep === 'confirm_transaction') return 'Confirm in Wallet...';
      if (purchaseStep === 'processing') return 'Processing Purchase...';
      return 'Purchasing...';
    }
    return 'Buy Now';
  };


  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 animate-pulse">
        <Skeleton className="w-full h-96 rounded-lg mb-6" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-2" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-5/6 mb-6" />
        </div>
        <Skeleton className="h-12 w-1/3" />
      </div>
    );
  }

  if (error) {
    return (
       <Alert variant="destructive" className="max-w-lg mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error} <Link href="/" className="underline hover:text-destructive-foreground">Go back to homepage.</Link></AlertDescription>
      </Alert>
    );
  }

  if (!product) {
    return (
      <Alert className="max-w-lg mx-auto">
        <Info className="h-4 w-4" />
        <AlertTitle>Product Not Found</AlertTitle>
        <AlertDescription>The product you are looking for does not exist or may have been removed. <Link href="/" className="underline hover:text-foreground/80">Return to shop</Link>.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative aspect-square md:aspect-auto min-h-[300px] md:min-h-[400px]">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              data-ai-hint="detailed product art"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {product.isVerified && (
              <Badge variant="secondary" className="absolute top-4 left-4 bg-accent text-accent-foreground shadow-md text-sm py-1 px-3">
                <Sparkles size={16} className="mr-1.5" /> Verified Authentic
              </Badge>
            )}
          </div>
          <div className="p-6 md:p-8 flex flex-col bg-card">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-3xl lg:text-4xl font-bold text-primary mb-2">{product.name}</CardTitle>
              {artisan && (
                <Link href={`/artisans/${artisan.id}`} passHref> {/* Assuming an artisan profile page route */}
                  <CardDescription className="text-md text-muted-foreground hover:text-primary transition-colors flex items-center group">
                    <User size={18} className="mr-2 group-hover:text-primary transition-colors" /> By {artisan.name} <ExternalLink size={14} className="ml-1.5 opacity-0 group-hover:opacity-70 transition-opacity" />
                  </CardDescription>
                </Link>
              )}
            </CardHeader>

            <CardContent className="p-0 flex-grow space-y-4">
              <p className="text-foreground leading-relaxed text-base">{product.description}</p>
              
              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <Palette size={16} className="mr-3 text-primary flex-shrink-0" />
                  <strong>Materials:</strong> <span className="ml-1 text-muted-foreground">{product.materials.join(', ')}</span>
                </div>
                <div className="flex items-center">
                  <CalendarDays size={16} className="mr-3 text-primary flex-shrink-0" />
                  <strong>Created:</strong> <span className="ml-1 text-muted-foreground">{new Date(product.creationDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Layers size={16} className="mr-3 text-primary flex-shrink-0" />
                  <strong>Product ID:</strong> <span className="ml-1 text-muted-foreground break-all font-mono text-xs">{product.id}</span>
                </div>
              </div>
              
              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                 <p className="text-3xl font-bold text-primary flex items-center">
                  <Tag size={28} className="mr-2" />
                  {product.price} ETH
                </p>
                {product.isSold && product.ownerAddress && (
                    <Badge variant="outline" className="text-sm py-1.5 px-3 border-green-500 text-green-600 bg-green-500/10">
                        <CheckCircle size={16} className="mr-2" /> Sold
                    </Badge>
                )}
              </div>
               {product.isSold && product.ownerAddress && (
                  <p className="text-xs text-muted-foreground">Owned by: <span className="font-mono">{product.ownerAddress.substring(0,6)}...{product.ownerAddress.substring(product.ownerAddress.length-4)}</span></p>
              )}
            </CardContent>

            <div className="mt-8 pt-6 border-t border-border">
              <Button
                size="lg"
                className="w-full text-lg py-3 h-14"
                onClick={handlePurchase}
                disabled={isPurchasing || product.isSold || !account || purchaseStep === 'success'}
              >
                {isPurchasing && <Loader2 size={20} className="mr-2 animate-spin" />}
                <ShoppingCart size={20} className={isPurchasing ? "hidden": "mr-2"} />
                {getButtonText()}
              </Button>
              {!account && !product.isSold && 
                <Button variant="outline" className="w-full mt-3" onClick={connectWalletFromContext}>
                    Connect Wallet to Buy
                </Button>
              }
              {purchaseStep === 'success' && (
                <Alert variant="default" className="mt-4 bg-green-500/10 border-green-500/30 text-green-700">
                  <CheckCircle className="h-4 w-4 !text-green-700" />
                  <AlertTitle>Purchase Complete!</AlertTitle>
                  <AlertDescription>
                    This item is now in your NFT collection.
                     <Button variant="link" size="sm" className="p-0 h-auto ml-1 text-green-700 hover:text-green-800" asChild>
                        <Link href="/my-nfts">View My NFTs</Link>
                     </Button>
                  </AlertDescription>
                </Alert>
              )}
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


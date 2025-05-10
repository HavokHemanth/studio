"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Product } from '@/types';
import { getProductById } from '@/lib/blockchainService';
import ProductForm from '@/components/artisan/ProductForm';
import { useWallet } from '@/contexts/WalletContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { artisanProfile } = useWallet(); // To verify ownership

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof id === 'string') {
      const fetchProduct = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedProduct = await getProductById(id);
          if (fetchedProduct) {
            // Verify if the current artisan owns this product
            if (artisanProfile && fetchedProduct.artisanId === artisanProfile.id) {
              setProduct(fetchedProduct);
            } else {
              setError("You are not authorized to edit this product or product artisan mismatch.");
              // Optionally redirect
              // router.push('/dashboard/products'); 
            }
          } else {
            setError("Product not found.");
          }
        } catch (e) {
          console.error(e);
          setError("Failed to load product data for editing.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, artisanProfile, router]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-1/3" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-lg mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!product) {
     return (
      <Alert className="max-w-lg mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Product Not Found</AlertTitle>
        <AlertDescription>The product you are trying to edit could not be found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <ProductForm product={product} />
    </div>
  );
}

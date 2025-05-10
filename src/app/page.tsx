"use client";

import { useEffect, useState } from 'react';
import type { Product } from '@/types';
import { getAllProducts } from '@/lib/blockchainService';
import ProductCard from '@/components/products/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedProducts = await getAllProducts();
        setProducts(fetchedProducts);
      } catch (e) {
        setError('Failed to load products. Please try again later.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8 text-center text-primary">Discover Authentic Artisanal Goods</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-[220px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
     return (
      <Alert variant="destructive" className="max-w-lg mx-auto">
        <Info className="h-4 w-4" />
        <AlertTitle>Error Loading Products</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-10 text-center text-primary drop-shadow-sm">Discover Authentic Artisanal Goods</h1>
      {products.length === 0 ? (
        <Alert className="max-w-lg mx-auto">
          <Info className="h-4 w-4" />
          <AlertTitle>No Products Yet</AlertTitle>
          <AlertDescription>There are currently no products listed. Please check back later or encourage artisans to add their creations!</AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

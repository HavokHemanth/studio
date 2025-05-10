
"use client";

import { useEffect, useState } from 'react';
import type { Product } from '@/types';
import { getAllProducts } from '@/lib/blockchainService';
import ProductCard from '@/components/products/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, ShoppingBag } from "lucide-react"; // Added ShoppingBag

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
        // Filter for unsold products to display on homepage
        setProducts(fetchedProducts.filter(p => !p.isSold));
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
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary drop-shadow-md">
              Discover Authentic Artisanal Goods
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore unique, blockchain-verified crafts from the heart of Chennai. Each piece tells a story.
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="rounded-xl border bg-card text-card-foreground shadow-md overflow-hidden">
              <Skeleton className="h-56 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
     return (
      <Alert variant="destructive" className="max-w-lg mx-auto my-10">
        <Info className="h-4 w-4" />
        <AlertTitle>Error Loading Products</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary drop-shadow-md animate-fade-in-down">
              Discover Authentic Artisanal Goods
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animation-delay-300">
              Explore unique, blockchain-verified crafts from the heart of Chennai. Each piece tells a story, connecting you directly to the artisan.
            </p>
        </div>

      {products.length === 0 ? (
        <Alert className="max-w-md mx-auto text-center py-10">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <AlertTitle className="text-2xl">Marketplace Awaits!</AlertTitle>
          <AlertDescription className="text-md text-muted-foreground">
            No products are currently listed for sale. Artisans, showcase your creations! Buyers, check back soon for unique items.
          </AlertDescription>
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

// Add to globals.css if you want these animations:
/*
@keyframes fade-in-down {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-down {
  animation: fade-in-down 0.5s ease-out forwards;
}
.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}
.animation-delay-300 {
  animation-delay: 0.3s;
}
*/


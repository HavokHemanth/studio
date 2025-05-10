"use client";

import { useEffect, useState } from 'react';
import type { Product } from '@/types';
import { useWallet } from '@/contexts/WalletContext';
import { getProductsByArtisan, removeProduct as blockchainRemoveProduct } from '@/lib/blockchainService';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit3, Trash2, PlusCircle, PackageSearch, Loader2, AlertCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert'; // Use AlertTitle from ui/alert


export default function ArtisanProductsPage() {
  const { account, artisanProfile, isLoading: walletLoading } = useWallet();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const fetchArtisanProducts = async () => {
    if (account && artisanProfile) {
      setIsLoadingProducts(true);
      setError(null);
      try {
        const fetchedProducts = await getProductsByArtisan(account);
        setProducts(fetchedProducts);
      } catch (e) {
        console.error(e);
        setError("Failed to load your products.");
      } finally {
        setIsLoadingProducts(false);
      }
    }
  };

  useEffect(() => {
    if (!walletLoading && account && artisanProfile) {
      fetchArtisanProducts();
    } else if (!walletLoading && (!account || !artisanProfile)) {
      setIsLoadingProducts(false);
      // setError("Artisan profile not found or wallet not connected."); // Or handle silently
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, artisanProfile, walletLoading]);

  const handleRemoveProduct = async (productId: string) => {
    if (!account) return;
    const originalProducts = [...products];
    setProducts(products.filter(p => p.id !== productId)); // Optimistic update

    const success = await blockchainRemoveProduct(productId, account);
    if (success) {
      toast({ title: "Product Removed", description: "The product has been successfully removed (simulated)." });
      fetchArtisanProducts(); // Re-fetch to confirm
    } else {
      toast({ title: "Error", description: "Failed to remove product (simulated).", variant: "destructive" });
      setProducts(originalProducts); // Revert optimistic update
    }
  };

  if (walletLoading || isLoadingProducts) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Products</h1>
          <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</Button>
        </div>
        <Card><CardContent className="p-6"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></CardContent></Card>
      </div>
    );
  }
  
  if (error) {
     return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-primary">My Products</h1>
            <p className="text-muted-foreground">Manage your listed artisanal items.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/add-product">
            <PlusCircle size={18} className="mr-2" /> Add New Product
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="text-center py-12 shadow-sm">
          <CardHeader>
            <PackageSearch size={48} className="mx-auto text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">No Products Listed Yet</CardTitle>
            <CardDescription className="text-muted-foreground">
              Start by adding your unique creations to the marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/dashboard/add-product">
                <PlusCircle size={20} className="mr-2" /> Add Your First Product
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] hidden sm:table-cell">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Price (ETH)</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/20">
                    <TableCell className="hidden sm:table-cell p-2">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={60}
                        height={40}
                        className="rounded-md object-cover aspect-[3/2]"
                        data-ai-hint="product thumbnail"
                      />
                    </TableCell>
                    <TableCell className="font-medium py-3 px-4">
                        <Link href={`/products/${product.id}`} className="hover:underline" title={product.name}>
                            {product.name.length > 40 ? product.name.substring(0,37) + '...' : product.name}
                        </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-3 px-4">{product.price}</TableCell>
                    <TableCell className="hidden lg:table-cell py-3 px-4">
                      {product.isSold ? (
                        <Badge variant="outline" className="border-green-500 text-green-600">Sold</Badge>
                      ) : (
                        <Badge variant="secondary">Listed</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2 py-3 px-4">
                      <Button variant="ghost" size="icon" asChild title="Edit Product">
                        <Link href={`/dashboard/edit-product/${product.id}`}>
                          <Edit3 size={18} />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Remove Product">
                            <Trash2 size={18} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently remove the product
                              listing (simulated).
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveProduct(product.id)}
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { Product } from '@/types';
import { useWallet } from "@/contexts/WalletContext";
import { addProduct, updateProduct as blockchainUpdateProduct } from "@/lib/blockchainService"; // Aliased to avoid name clash
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlusCircle, Save } from "lucide-react";
import { useState } from "react";

const productFormSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters." }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(1000),
  materials: z.string().min(3, { message: "Materials must be at least 3 characters." }).transform(val => val.split(',').map(s => s.trim()).filter(s => s.length > 0)),
  imageUrl: z.string().url({ message: "Please enter a valid image URL (e.g., picsum.photos)." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }).min(0.00001, {message: "Price must be greater than 0."}),
  isVerified: z.boolean().default(false).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product; // For editing
}

export default function ProductForm({ product }: ProductFormProps) {
  const { account } = useWallet();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<'idle' | 'confirm_transaction' | 'processing' | 'success' | 'error'>('idle');

  const defaultValues: Partial<ProductFormValues> = product
    ? {
        name: product.name,
        description: product.description,
        materials: product.materials.join(', '),
        imageUrl: product.imageUrl,
        price: product.price,
        isVerified: product.isVerified,
      }
    : {
        name: "",
        description: "",
        materials: "",
        imageUrl: `https://picsum.photos/seed/${Date.now()}/600/400`, // Default placeholder
        price: 0.01,
        isVerified: false,
      };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: ProductFormValues) {
    if (!account) {
      toast({ title: "Error", description: "Wallet not connected or artisan not identified.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      if (product) { // Editing existing product
        setSubmitStep('processing');
        const updatedProductData: Partial<Product> = {
            ...data,
            materials: data.materials, 
        };
        const result = await blockchainUpdateProduct(product.id, updatedProductData, account); // This does not involve Metamask tx in current simulation
        if (result) {
          setSubmitStep('success');
          toast({ title: "Success", description: "Product updated successfully (simulated)." });
          router.push("/dashboard/products");
          router.refresh();
        } else {
          setSubmitStep('error');
          toast({ title: "Error", description: "Failed to update product (simulated).", variant: "destructive" });
        }
      } else { // Adding new product - involves Metamask tx
        setSubmitStep('confirm_transaction');
        const newProductData = {
            name: data.name,
            description: data.description,
            materials: data.materials, 
            imageUrl: data.imageUrl,
            price: data.price,
            isVerified: data.isVerified,
        };
        
        const result = await addProduct(newProductData as Omit<Product, 'id' | 'creationDate' | 'isSold' | 'ownerAddress' | 'artisanId'>, account);
        
        if (result.success && result.product) {
          setSubmitStep('processing'); // After Metamask, now "processing" the addition
           toast({ title: "Minting Product", description: `Transaction submitted (Hash: ${result.transactionHash?.substring(0,10)}...). Adding to marketplace.` });
           await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate backend
          
          setSubmitStep('success');
          toast({ title: "Success", description: `Product "${result.product.name}" added and minted successfully. Tx: ${result.transactionHash?.substring(0,10)}...` });
          router.push("/dashboard/products");
          router.refresh();
        } else {
          setSubmitStep('error');
          // Toast for Metamask failure is handled in addProduct service
        }
      }
    } catch (error) {
      setSubmitStep('error');
      console.error("Form submission error:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      // Optionally reset submitStep to 'idle' after a delay if it's 'success' or 'error'
      // setTimeout(() => setSubmitStep('idle'), 5000);
    }
  }

  const getButtonText = () => {
    if (product) { // Editing
      if (isSubmitting) return 'Saving...';
      return 'Save Changes';
    }
    // Adding new product
    if (isSubmitting) {
      if (submitStep === 'confirm_transaction') return 'Confirm in Wallet...';
      if (submitStep === 'processing') return 'Minting Product...';
      return 'Adding...';
    }
    return 'Add Product & Mint NFT';
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">
          {product ? "Edit Product Details" : "List New Artisanal Product"}
        </CardTitle>
        <CardDescription>
            {product ? "Update the information for your existing product." : "Describe your unique creation and mint it as an NFT on the marketplace (simulated Sepolia transaction)."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Handcrafted Terracotta Vase" {...field} />
                  </FormControl>
                  <FormDescription>The official name of your artisanal product.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your product in detail, its story, inspiration, and uniqueness."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="materials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Materials Used</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Terracotta Clay, Natural Dyes, Silk Thread" {...field} />
                  </FormControl>
                  <FormDescription>Comma-separated list of primary materials.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://picsum.photos/seed/youritem/600/400" {...field} />
                  </FormControl>
                  <FormDescription>A direct link to an image of your product. Use picsum.photos for placeholders (e.g., https://picsum.photos/seed/myvase/600/400).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (in ETH)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.00001" placeholder="0.05" {...field} />
                  </FormControl>
                  <FormDescription>Set the price for your product in ETH. This will be used for the Sepolia testnet transaction.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isVerified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-background/50">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="isVerified"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="isVerified">
                      Mark as Verified Authentic
                    </FormLabel>
                    <FormDescription>
                      Check this if the product has undergone a special verification process (simulated). Verified items may gain more trust.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <Button 
                type="submit" 
                className="w-full h-12 text-md" 
                disabled={isSubmitting || submitStep === 'success'}
            >
              {(isSubmitting) && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {product ? <Save className="mr-2 h-5 w-5" /> : <PlusCircle className="mr-2 h-5 w-5" />}
              {getButtonText()}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


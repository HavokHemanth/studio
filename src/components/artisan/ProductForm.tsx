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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const productFormSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters." }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(1000),
  materials: z.string().min(3, { message: "Materials must be at least 3 characters." }).transform(val => val.split(',').map(s => s.trim()).filter(s => s.length > 0)),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
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
        imageUrl: "",
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
        const updatedProductData: Partial<Product> = {
            ...data,
            materials: data.materials, // Zod transform handles this
        };
        const result = await blockchainUpdateProduct(product.id, updatedProductData, account);
        if (result) {
          toast({ title: "Success", description: "Product updated successfully (simulated)." });
          router.push("/dashboard/products");
          router.refresh(); // to reflect changes if list is on same page or navigated back
        } else {
          toast({ title: "Error", description: "Failed to update product (simulated).", variant: "destructive" });
        }
      } else { // Adding new product
        const newProductData = {
            name: data.name,
            description: data.description,
            materials: data.materials, // Zod transform handles this
            imageUrl: data.imageUrl,
            price: data.price,
            isVerified: data.isVerified,
            // artisanId will be set by addProduct based on connected account
        };
        // Type assertion needed if Omit type in addProduct is very strict
        const result = await addProduct(newProductData as Omit<Product, 'id' | 'creationDate' | 'isSold' | 'ownerAddress' | 'artisanId'>, account);
        if (result) {
          toast({ title: "Success", description: "Product added successfully (simulated)." });
          router.push("/dashboard/products");
           router.refresh();
        } else {
          toast({ title: "Error", description: "Failed to add product (simulated).", variant: "destructive" });
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">
          {product ? "Edit Product" : "Add New Product"}
        </CardTitle>
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
                    <Input type="url" placeholder="https://example.com/image.jpg (use picsum.photos for placeholders)" {...field} />
                  </FormControl>
                  <FormDescription>A direct link to an image of your product. For mock-up, use placeholder services like picsum.photos.</FormDescription>
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
                    <Input type="number" step="0.001" placeholder="0.05" {...field} />
                  </FormControl>
                  <FormDescription>Set the price for your product in ETH.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isVerified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Mark as Verified
                    </FormLabel>
                    <FormDescription>
                      Check this if the product has undergone a special verification process (simulated).
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? "Update Product" : "Add Product"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

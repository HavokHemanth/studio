
import type { Product } from '@/types'; // Removed Artisan type, not directly used
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Tag, User, ShoppingCart, Eye } from 'lucide-react'; // Added Eye
import { getArtisanDetails } from '@/lib/blockchainService'; 
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [artisanName, setArtisanName] = useState<string>('Loading...');

  useEffect(() => {
    const fetchArtisan = async () => {
      if (product.artisanId) {
        const artisan = await getArtisanDetails(product.artisanId);
        setArtisanName(artisan?.name || 'Unknown Artisan');
      } else {
        setArtisanName('Unknown Artisan');
      }
    };
    fetchArtisan();
  }, [product.artisanId]);

  return (
    <Card className={cn(
        "overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full group",
        product.isSold ? "opacity-70" : ""
        )}>
      <CardHeader className="p-0 relative aspect-[4/3] overflow-hidden"> {/* Standard aspect ratio */}
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          data-ai-hint="artisanal product"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end">
            {product.isVerified && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground shadow-md">
                <Sparkles size={14} className="mr-1" /> Verified
            </Badge>
            )}
        </div>
         {product.isSold && (
          <Badge variant="destructive" className="absolute top-2 left-2 text-xs py-1 px-2 shadow-md">
            Sold Out
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold mb-1 truncate group-hover:text-primary transition-colors" title={product.name}>{product.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-2 flex items-center">
          <User size={14} className="mr-1.5 flex-shrink-0" /> {artisanName}
        </CardDescription>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 h-8">{product.description}</p> {/* Fixed height for description */}
        <div className="flex items-center text-primary font-semibold text-lg">
          <Tag size={18} className="mr-1.5" /> 
          <span>{product.price} ETH</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t bg-muted/30">
        <Button asChild variant={product.isSold ? "outline" : "default"} className="w-full transition-all group-hover:scale-[1.02]">
          <Link href={`/products/${product.id}`} className="flex items-center justify-center">
            {product.isSold ? <Eye size={16} className="mr-2" /> : <ShoppingCart size={16} className="mr-2" />}
            {product.isSold ? 'View Details' : 'View & Buy'}
            {!product.isSold && <ArrowRight size={16} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;


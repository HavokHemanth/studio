import type { Product, Artisan } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Tag, User } from 'lucide-react';
import { getArtisanDetails } from '@/lib/blockchainService'; // To fetch artisan name
import { useEffect, useState } from 'react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [artisanName, setArtisanName] = useState<string>('Loading...');

  useEffect(() => {
    const fetchArtisan = async () => {
      const artisan = await getArtisanDetails(product.artisanId);
      setArtisanName(artisan?.name || 'Unknown Artisan');
    };
    fetchArtisan();
  }, [product.artisanId]);

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-0 relative">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={600}
          height={400}
          className="object-cover w-full h-48 md:h-56"
          data-ai-hint="artisanal product"
        />
        {product.isVerified && (
          <Badge variant="secondary" className="absolute top-2 right-2 bg-accent text-accent-foreground">
            <Sparkles size={14} className="mr-1" /> Verified
          </Badge>
        )}
         {product.isSold && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            Sold Out
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold mb-1 truncate" title={product.name}>{product.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-2 flex items-center">
          <User size={14} className="mr-1.5 flex-shrink-0" /> {artisanName}
        </CardDescription>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
        <div className="flex items-center text-primary font-semibold">
          <Tag size={16} className="mr-1.5" /> {/* Using Tag for price */}
          <span>{product.price} ETH</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button asChild variant="default" className="w-full" disabled={product.isSold}>
          <Link href={`/products/${product.id}`} className="flex items-center justify-center">
            {product.isSold ? 'View Details' : 'View & Buy'}
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;

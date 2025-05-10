"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ProductProvenance, ProvenanceEvent } from '@/types';
import { getProductProvenance } from '@/lib/blockchainService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, FileClock, Info, Loader2, Search, ShieldCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const initialProductId = searchParams.get('productId') || '';

  const [productId, setProductId] = useState<string>(initialProductId);
  const [provenance, setProvenance] = useState<ProductProvenance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialProductId) {
      handleVerify(initialProductId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProductId]);


  const handleVerify = async (idToVerify: string) => {
    if (!idToVerify.trim()) {
      setError("Please enter a Product ID.");
      setProvenance(null);
      setSearched(true);
      return;
    }
    setIsLoading(true);
    setError(null);
    setProvenance(null);
    setSearched(true);
    try {
      const fetchedProvenance = await getProductProvenance(idToVerify);
      if (fetchedProvenance && fetchedProvenance.history.length > 0) {
        setProvenance(fetchedProvenance);
      } else {
        setError(`No provenance data found for Product ID: ${idToVerify}. Ensure the ID is correct.`);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to fetch provenance data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleVerify(productId);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <ShieldCheck size={32} />
          </div>
          <CardTitle className="text-3xl font-bold">Verify Product Authenticity</CardTitle>
          <CardDescription className="text-md text-muted-foreground">
            Enter the unique Product ID to view its provenance and verify its journey on the blockchain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex space-x-2 mb-6">
            <Input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Enter Product ID (e.g., product-1)"
              className="flex-grow"
              aria-label="Product ID"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search size={18} className="mr-2" />}
              Verify
            </Button>
          </form>

          {isLoading && (
            <div className="text-center py-4">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Fetching provenance data...</p>
            </div>
          )}

          {error && !isLoading && (
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertTitle>Verification Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && provenance && (
            <Card className="mt-4 bg-background/50">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-green-600">
                  <CheckCircle size={24} className="mr-2" /> Provenance Verified
                </CardTitle>
                <CardDescription>
                  Displaying history for Product ID: <strong>{provenance.productId}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <ul className="space-y-4">
                    {provenance.history.map((event, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <FileClock size={16} />
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{event.event}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            By: {event.actorAddress.substring(0, 6)}...{event.actorAddress.substring(event.actorAddress.length - 4)}
                          </p>
                          {event.details && <p className="text-xs mt-0.5 text-foreground/80">{event.details}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
          
          {!isLoading && !error && !provenance && searched && (
             <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No Results</AlertTitle>
              <AlertDescription>No provenance data to display for the entered Product ID. This could mean the ID is incorrect or the item is not yet tracked.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

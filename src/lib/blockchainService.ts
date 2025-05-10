// This service simulates blockchain interactions.
// In a real DApp, this would use ethers.js or web3.js to interact with a smart contract.
"use client";

import type { Product, Artisan, ProductProvenance, NFT } from '@/types';
import { mockArtisans, mockProducts, mockProductProvenance, mockUserNfts } from './data';
import { toast } from '@/hooks/use-toast';

// Simulate a delay for blockchain operations
const simulateDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory state for products and NFTs to simulate changes
let currentProducts: Product[] = JSON.parse(JSON.stringify(mockProducts));
let currentUserNfts: Record<string, NFT[]> = JSON.parse(JSON.stringify(mockUserNfts));
let currentProductProvenance: Record<string, ProductProvenance> = JSON.parse(JSON.stringify(mockProductProvenance));


export const isArtisanRegistered = async (walletAddress: string): Promise<boolean> => {
  await simulateDelay(100);
  return mockArtisans.some(artisan => artisan.walletAddress.toLowerCase() === walletAddress.toLowerCase());
};

export const getArtisanByWalletAddress = async (walletAddress: string): Promise<Artisan | undefined> => {
  await simulateDelay(100);
  return mockArtisans.find(artisan => artisan.walletAddress.toLowerCase() === walletAddress.toLowerCase());
}

export const connectWallet = async (): Promise<string | null> => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      if (accounts.length > 0) {
        return accounts[0];
      }
      return null;
    } catch (error: any) {
      console.error("Error connecting to MetaMask:", error);
      toast({ title: "Connection Error", description: error.message || "Failed to connect wallet.", variant: "destructive" });
      return null;
    }
  } else {
    toast({ title: "MetaMask Not Found", description: "Please install MetaMask to use this DApp.", variant: "destructive" });
    return null;
  }
};

export const getCurrentWallet = async (): Promise<string | null> => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error("Error getting current wallet:", error);
      return null;
    }
  }
  return null;
};

export const addProduct = async (productData: Omit<Product, 'id' | 'creationDate' | 'isSold' | 'ownerAddress'>, artisanWallet: string): Promise<Product | null> => {
  await simulateDelay();
  const artisan = mockArtisans.find(a => a.walletAddress === artisanWallet);
  if (!artisan) {
    toast({ title: "Error", description: "Invalid artisan.", variant: "destructive" });
    return null;
  }

  const newProduct: Product = {
    ...productData,
    id: `product-${Date.now()}-${Math.random().toString(16).slice(2)}`, // Simulate unique ID
    creationDate: new Date().toISOString(),
    artisanId: artisan.id, // Ensure artisanId is set correctly
    isSold: false,
  };
  currentProducts.push(newProduct);
  
  // Simulate adding to provenance
  currentProductProvenance[newProduct.id] = {
    productId: newProduct.id,
    history: [
      { event: 'Created by Artisan', timestamp: newProduct.creationDate, actorAddress: artisanWallet, details: `Initial minting of ${newProduct.name}` },
      { event: 'Listed for Sale', timestamp: new Date().toISOString(), actorAddress: artisanWallet, details: `Price set at ${newProduct.price} ETH` },
    ]
  }
  toast({ title: "Product Added", description: `${newProduct.name} has been successfully listed (simulated).` });
  return newProduct;
};

export const updateProduct = async (productId: string, productData: Partial<Product>, artisanWallet: string): Promise<Product | null> => {
  await simulateDelay();
  const productIndex = currentProducts.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    toast({ title: "Error", description: "Product not found.", variant: "destructive" });
    return null;
  }
  const artisan = mockArtisans.find(a => a.walletAddress === artisanWallet);
  if (!artisan || currentProducts[productIndex].artisanId !== artisan.id) {
     toast({ title: "Error", description: "Unauthorized to edit this product.", variant: "destructive" });
    return null;
  }

  currentProducts[productIndex] = { ...currentProducts[productIndex], ...productData };
  
  // Simulate adding to provenance
  if (currentProductProvenance[productId]) {
    currentProductProvenance[productId].history.push(
      { event: 'Product Updated', timestamp: new Date().toISOString(), actorAddress: artisanWallet, details: `Details of ${currentProducts[productIndex].name} updated.` }
    );
  }

  toast({ title: "Product Updated", description: `${currentProducts[productIndex].name} has been successfully updated (simulated).` });
  return currentProducts[productIndex];
};

export const removeProduct = async (productId: string, artisanWallet: string): Promise<boolean> => {
  await simulateDelay();
  const productIndex = currentProducts.findIndex(p => p.id === productId);
   if (productIndex === -1) {
    toast({ title: "Error", description: "Product not found.", variant: "destructive" });
    return false;
  }
  const artisan = mockArtisans.find(a => a.walletAddress === artisanWallet);
  if (!artisan || currentProducts[productIndex].artisanId !== artisan.id) {
     toast({ title: "Error", description: "Unauthorized to remove this product.", variant: "destructive" });
    return false;
  }

  currentProducts.splice(productIndex, 1);
  // Also remove provenance if it exists
  delete currentProductProvenance[productId];
  
  toast({ title: "Product Removed", description: `Product has been successfully removed (simulated).` });
  return true;
};

export const purchaseProduct = async (productId: string, buyerAddress: string): Promise<boolean> => {
  await simulateDelay(2000); // Simulate longer transaction time
  const productIndex = currentProducts.findIndex(p => p.id === productId);
  if (productIndex === -1 || currentProducts[productIndex].isSold) {
    toast({ title: "Purchase Failed", description: "Product not available or already sold.", variant: "destructive" });
    return false;
  }

  const product = currentProducts[productIndex];
  const artisan = mockArtisans.find(a => a.id === product.artisanId);

  // Simulate NFT creation and transfer
  const newNft: NFT = {
    tokenId: product.id,
    contractAddress: '0xMockNFTContractAddress', // Simulated contract address
    name: product.name,
    imageUrl: product.imageUrl,
    description: product.description,
    artisanName: artisan?.name || 'Unknown Artisan',
  };

  if (!currentUserNfts[buyerAddress]) {
    currentUserNfts[buyerAddress] = [];
  }
  currentUserNfts[buyerAddress].push(newNft);

  // Update product status
  currentProducts[productIndex].isSold = true;
  currentProducts[productIndex].ownerAddress = buyerAddress;

  // Update provenance
   if (currentProductProvenance[productId]) {
    currentProductProvenance[productId].history.push(
      { event: 'Sold', timestamp: new Date().toISOString(), actorAddress: buyerAddress, details: `Purchased by ${buyerAddress}` }
    );
  } else { // Create if doesn't exist (should normally exist)
    currentProductProvenance[productId] = {
      productId: productId,
      history: [
        { event: 'Sold', timestamp: new Date().toISOString(), actorAddress: buyerAddress, details: `Purchased by ${buyerAddress}` }
      ]
    }
  }

  toast({ title: "Purchase Successful!", description: `You now own ${product.name}. It has been added to "My NFTs" (simulated).` });
  return true;
};

export const getProductById = async (productId: string): Promise<Product | undefined> => {
  await simulateDelay(200);
  return currentProducts.find(p => p.id === productId);
};

export const getAllProducts = async (): Promise<Product[]> => {
  await simulateDelay(300);
  return [...currentProducts];
};

export const getProductsByArtisan = async (artisanWallet: string): Promise<Product[]> => {
  await simulateDelay(300);
  const artisan = mockArtisans.find(a => a.walletAddress === artisanWallet);
  if (!artisan) return [];
  return currentProducts.filter(p => p.artisanId === artisan.id);
}

export const getProductProvenance = async (productId: string): Promise<ProductProvenance | null> => {
  await simulateDelay(500);
  return currentProductProvenance[productId] || null;
};

export const getUserNfts = async (userAddress: string): Promise<NFT[]> => {
  await simulateDelay(300);
  return currentUserNfts[userAddress] || [];
};

export const watchAssetInWallet = async (nft: NFT): Promise<boolean> => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await simulateDelay(500); // Simulate interaction
      // In a real scenario, this would prompt MetaMask
      // For simulation, we just log it and return success
      console.log('Attempting to add NFT to wallet:', nft);
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC721', // or 'ERC1155'
          options: {
            address: nft.contractAddress,
            tokenId: nft.tokenId,
          },
        },
      });

      if (wasAdded) {
        toast({ title: "NFT Added", description: `${nft.name} should now be visible in your MetaMask wallet.` });
        return true;
      } else {
        toast({ title: "NFT Not Added", description: "You chose not to add the NFT to your wallet, or an error occurred.", variant: "default" });
        return false;
      }
    } catch (error: any) {
      console.error('Error watching asset:', error);
      toast({ title: "Error", description: error.message || "Could not add NFT to wallet.", variant: "destructive" });
      return false;
    }
  } else {
     toast({ title: "MetaMask Not Found", description: "Please install MetaMask.", variant: "destructive" });
    return false;
  }
};

// Function to get artisan details for display
export const getArtisanDetails = async (artisanId: string): Promise<Artisan | undefined> => {
  await simulateDelay(100);
  return mockArtisans.find(a => a.id === artisanId);
};

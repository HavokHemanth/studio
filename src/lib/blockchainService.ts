// This service simulates blockchain interactions.
// In a real DApp, this would use ethers.js or web3.js to interact with a smart contract.
"use client";

import type { Product, Artisan, ProductProvenance, NFT } from '@/types';
import { mockArtisans, mockProducts, mockProductProvenance, mockUserNfts } from './data';
import { toast } from '@/hooks/use-toast';

// Simulate a delay for blockchain operations
const simulateDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

const ETH_TO_WEI = BigInt("1000000000000000000"); // 10^18

// In-memory state for products, artisans, and NFTs to simulate changes
let currentProducts: Product[] = JSON.parse(JSON.stringify(mockProducts));
let currentArtisans: Artisan[] = JSON.parse(JSON.stringify(mockArtisans));
let currentUserNfts: Record<string, NFT[]> = JSON.parse(JSON.stringify(mockUserNfts));
let currentProductProvenance: Record<string, ProductProvenance> = JSON.parse(JSON.stringify(mockProductProvenance));

const MOCK_PRODUCT_REGISTRY_CONTRACT_ADDRESS = '0xMockProductRegistryContract0123456789';
const MOCK_NFT_MARKETPLACE_CONTRACT_ADDRESS = '0xMockMarketplaceContract0123456789abc';


export const isArtisanRegistered = async (walletAddress: string): Promise<boolean> => {
  await simulateDelay(100);
  return currentArtisans.some(artisan => artisan.walletAddress.toLowerCase() === walletAddress.toLowerCase());
};

export const getArtisanByWalletAddress = async (walletAddress: string): Promise<Artisan | undefined> => {
  await simulateDelay(100);
  return currentArtisans.find(artisan => artisan.walletAddress.toLowerCase() === walletAddress.toLowerCase());
}

export const registerArtisan = async (artisanData: Omit<Artisan, 'id' | 'walletAddress'>, walletAddress: string): Promise<Artisan | null> => {
  await simulateDelay();
  const existingArtisan = currentArtisans.find(a => a.walletAddress.toLowerCase() === walletAddress.toLowerCase());
  if (existingArtisan) {
    toast({ title: "Registration Failed", description: "This wallet address is already registered as an artisan.", variant: "destructive" });
    return null;
  }

  const newArtisan: Artisan = {
    ...artisanData,
    id: `artisan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    walletAddress: walletAddress,
  };
  currentArtisans.push(newArtisan);
  toast({ title: "Registration Successful", description: `Welcome, ${newArtisan.name}! You are now registered as an artisan.` });
  return newArtisan;
};

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

export const addProduct = async (
  productData: Omit<Product, 'id' | 'creationDate' | 'isSold' | 'ownerAddress' | 'artisanId'>,
  artisanWallet: string
): Promise<{ success: boolean; product?: Product; transactionHash?: string }> => {
  const artisan = currentArtisans.find(a => a.walletAddress.toLowerCase() === artisanWallet.toLowerCase());
  if (!artisan) {
    toast({ title: "Error", description: "Invalid artisan account.", variant: "destructive" });
    return { success: false };
  }

  if (typeof window.ethereum === 'undefined') {
    toast({ title: "MetaMask Not Found", description: "Please install MetaMask to perform this action.", variant: "destructive" });
    return { success: false };
  }

  const transactionParameters = {
    to: MOCK_PRODUCT_REGISTRY_CONTRACT_ADDRESS, // Mock contract address for product registry/minting
    from: artisanWallet,
    data: `0xSIMULATED_MINT_DATA_FOR_${productData.name.replace(/\s/g, '_')}`, // Mock data
    // value: '0x0', // Typically no ETH value for minting, unless for gas or specific contract logic
  };

  try {
    toast({ title: "Transaction Pending", description: "Please confirm the transaction in MetaMask to mint your product." });
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    }) as string;

    // Simulate transaction mining delay
    await simulateDelay(2000); 

    const newProduct: Product = {
      ...productData,
      id: `product-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      creationDate: new Date().toISOString(),
      artisanId: artisan.id,
      isSold: false,
    };
    currentProducts.push(newProduct);

    currentProductProvenance[newProduct.id] = {
      productId: newProduct.id,
      history: [
        { event: 'Created & Minted by Artisan', timestamp: newProduct.creationDate, actorAddress: artisanWallet, details: `Initial minting of ${newProduct.name}. Tx: ${txHash.substring(0,10)}...` },
        { event: 'Listed for Sale', timestamp: new Date().toISOString(), actorAddress: artisanWallet, details: `Price set at ${newProduct.price} ETH` },
      ]
    };
    toast({ title: "Product Added & Minted", description: `${newProduct.name} has been listed. Tx: ${txHash.substring(0,10)}...` });
    return { success: true, product: newProduct, transactionHash: txHash };

  } catch (error: any) {
    console.error("Error during simulated product minting transaction:", error);
    if (error.code === 4001) { // User rejected the transaction
      toast({ title: "Transaction Cancelled", description: "You cancelled the product minting transaction.", variant: "destructive" });
    } else {
      toast({ title: "Minting Failed", description: error.message || "Could not mint the product.", variant: "destructive" });
    }
    return { success: false };
  }
};


export const updateProduct = async (productId: string, productData: Partial<Product>, artisanWallet: string): Promise<Product | null> => {
  await simulateDelay();
  const productIndex = currentProducts.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    toast({ title: "Error", description: "Product not found.", variant: "destructive" });
    return null;
  }
  const artisan = currentArtisans.find(a => a.walletAddress.toLowerCase() === artisanWallet.toLowerCase());
  if (!artisan || currentProducts[productIndex].artisanId !== artisan.id) {
     toast({ title: "Error", description: "Unauthorized to edit this product.", variant: "destructive" });
    return null;
  }

  currentProducts[productIndex] = { ...currentProducts[productIndex], ...productData };
  
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
  const artisan = currentArtisans.find(a => a.walletAddress.toLowerCase() === artisanWallet.toLowerCase());
  if (!artisan || currentProducts[productIndex].artisanId !== artisan.id) {
     toast({ title: "Error", description: "Unauthorized to remove this product.", variant: "destructive" });
    return false;
  }

  currentProducts.splice(productIndex, 1);
  delete currentProductProvenance[productId];
  
  toast({ title: "Product Removed", description: `Product has been successfully removed (simulated).` });
  return true;
};

export const purchaseProduct = async (
  productId: string,
  buyerAddress: string,
  priceInEth: number
): Promise<{ success: boolean; transactionHash?: string }> => {
  const productIndex = currentProducts.findIndex(p => p.id === productId);
  if (productIndex === -1 || currentProducts[productIndex].isSold) {
    toast({ title: "Purchase Failed", description: "Product not available or already sold.", variant: "destructive" });
    return { success: false };
  }

  if (typeof window.ethereum === 'undefined') {
    toast({ title: "MetaMask Not Found", description: "Please install MetaMask to perform this action.", variant: "destructive" });
    return { success: false };
  }

  const product = currentProducts[productIndex];
  const artisan = currentArtisans.find(a => a.id === product.artisanId);

  const priceInWei = BigInt(Math.round(priceInEth * 1e18)); // More robust conversion

  const transactionParameters = {
    to: MOCK_NFT_MARKETPLACE_CONTRACT_ADDRESS, // Mock contract address
    from: buyerAddress,
    value: '0x' + priceInWei.toString(16),
    data: `0xSIMULATED_PURCHASE_DATA_FOR_${product.id}`, // Mock data representing function call
  };
  
  try {
    toast({ title: "Transaction Pending", description: "Please confirm the transaction in MetaMask to purchase." });
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    }) as string;

    // Simulate transaction mining delay
    await simulateDelay(2000);

    const newNft: NFT = {
      tokenId: product.id, // Use product ID as Token ID for simulation
      contractAddress: MOCK_PRODUCT_REGISTRY_CONTRACT_ADDRESS, // The NFT contract address
      name: product.name,
      imageUrl: product.imageUrl,
      description: product.description,
      artisanName: artisan?.name || 'Unknown Artisan',
    };

    if (!currentUserNfts[buyerAddress.toLowerCase()]) {
      currentUserNfts[buyerAddress.toLowerCase()] = [];
    }
    currentUserNfts[buyerAddress.toLowerCase()].push(newNft);

    currentProducts[productIndex].isSold = true;
    currentProducts[productIndex].ownerAddress = buyerAddress;

    if (currentProductProvenance[productId]) {
      currentProductProvenance[productId].history.push(
        { event: 'Sold', timestamp: new Date().toISOString(), actorAddress: buyerAddress, details: `Purchased by ${buyerAddress.substring(0,6)}... Tx: ${txHash.substring(0,10)}...` }
      );
    } else {
      currentProductProvenance[productId] = {
        productId: productId,
        history: [
          { event: 'Sold', timestamp: new Date().toISOString(), actorAddress: buyerAddress, details: `Purchased by ${buyerAddress.substring(0,6)}... Tx: ${txHash.substring(0,10)}...` }
        ]
      };
    }

    toast({ title: "Purchase Successful!", description: `You now own ${product.name}. Tx: ${txHash.substring(0,10)}...` });
    return { success: true, transactionHash: txHash };

  } catch (error: any) {
    console.error("Error during simulated purchase transaction:", error);
    if (error.code === 4001) { // User rejected the transaction
      toast({ title: "Transaction Cancelled", description: "You cancelled the purchase transaction.", variant: "destructive" });
    } else {
      toast({ title: "Purchase Failed", description: error.message || "Could not complete the purchase.", variant: "destructive" });
    }
    return { success: false };
  }
};


export const getProductById = async (productId: string): Promise<Product | undefined> => {
  await simulateDelay(200);
  return currentProducts.find(p => p.id === productId);
};

export const getAllProducts = async (): Promise<Product[]> => {
  await simulateDelay(300);
  // Return a mix of sold and unsold for demo purposes, or filter as needed
  return [...currentProducts].sort((a,b) => (a.isSold ? 1 : 0) - (b.isSold ? 1 : 0) || new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
};

export const getProductsByArtisan = async (artisanWallet: string): Promise<Product[]> => {
  await simulateDelay(300);
  const artisan = currentArtisans.find(a => a.walletAddress.toLowerCase() === artisanWallet.toLowerCase());
  if (!artisan) return [];
  return currentProducts.filter(p => p.artisanId === artisan.id).sort((a,b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
}

export const getProductProvenance = async (productId: string): Promise<ProductProvenance | null> => {
  await simulateDelay(500);
  return currentProductProvenance[productId] || null;
};

export const getUserNfts = async (userAddress: string): Promise<NFT[]> => {
  await simulateDelay(300);
  const nfts = currentUserNfts[userAddress.toLowerCase()] || [];
  return JSON.parse(JSON.stringify(nfts)); // Return a copy
};

export const watchAssetInWallet = async (nft: NFT): Promise<boolean> => {
  if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
    try {
      await simulateDelay(500); // Keep a small delay
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC721', 
          options: {
            address: nft.contractAddress, // This should be the NFT contract address
            tokenId: nft.tokenId, // This is the ID of the token
          },
        },
      });

      if (wasAdded) {
        toast({ title: "NFT Added to Wallet", description: `${nft.name} should now be visible in your MetaMask wallet.` });
        return true;
      } else {
        // This else block might not always be hit if the user cancels, as it might throw an error instead.
        toast({ title: "NFT Not Added", description: "Could not add the NFT to your wallet. The request may have been cancelled or failed.", variant: "default" });
        return false;
      }
    } catch (error: any) {
      console.error('Error watching asset (raw):', error); 

      let toastTitle = "Failed to Add NFT";
      let toastDescription = "An unknown error occurred while trying to add the NFT to your wallet.";

      if (error && typeof error === 'object') {
        if (error.code === 4001) { // User rejected the request
          toastTitle = "Request Cancelled";
          toastDescription = "You cancelled the request to add the NFT to your wallet.";
        } else if (error.message && typeof error.message === 'string' && error.message.trim() !== '') {
          // Use the error message if available and not empty
          toastDescription = error.message;
        } else if (Object.keys(error).length === 0 && error.constructor === Object) {
          // Handle cases where error is an empty object {}
          toastDescription = "The wallet provider returned an unspecified error. This can happen if the token ID format is not supported or if the asset is already being watched.";
        } else {
          // Try to stringify other object errors, but be cautious
          try {
            const errStr = JSON.stringify(error);
            if (errStr !== '{}') { // Avoid just "{}"
                 toastDescription = `An unexpected error occurred: ${errStr.substring(0, 100)}${errStr.length > 100 ? '...' : ''}`;
            } else {
                 toastDescription = "The wallet provider returned an unspecified error object. Please try again.";
            }
          } catch (e) {
            // Fallback if stringification fails
            toastDescription = "A non-descript error object was returned by the wallet provider. Please try again.";
          }
        }
      } else if (typeof error === 'string' && error.trim() !== '') {
        // Handle plain string errors
        toastDescription = error;
      }
      
      toast({ 
        title: toastTitle, 
        description: toastDescription, 
        variant: "destructive" 
      });
      return false;
    }
  } else {
     toast({ title: "MetaMask Not Found", description: "Please install and activate MetaMask to use this feature.", variant: "destructive" });
    return false;
  }
};


export const getArtisanDetails = async (artisanId: string): Promise<Artisan | undefined> => {
  await simulateDelay(100);
  return currentArtisans.find(a => a.id === artisanId);
};

export interface Artisan {
  id: string;
  name: string;
  bio: string;
  walletAddress: string; // Ethereum wallet address
  profileImage?: string;
}

export interface Product {
  id: string; // Unique identifier, could be NFT token ID
  name: string;
  description: string;
  materials: string[];
  artisanId: string; // Link to Artisan
  creationDate: string; // ISO date string
  imageUrl: string;
  price: number; // Price in ETH or a stablecoin
  isVerified?: boolean; // Highlight premium/verified items
  isSold?: boolean;
  ownerAddress?: string; // Current owner's wallet address if sold
}

export interface NFT {
  tokenId: string;
  contractAddress: string;
  name: string;
  imageUrl: string;
  description: string;
  artisanName: string;
}

export interface ProvenanceEvent {
  timestamp: string; // ISO date string
  event: string; // e.g., "Created", "Listed", "Sold", "Transferred"
  actorAddress: string; // Wallet address of the actor
  details?: string;
}

export interface ProductProvenance {
  productId: string;
  history: ProvenanceEvent[];
}

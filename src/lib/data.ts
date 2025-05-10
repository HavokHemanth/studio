import type { Artisan, Product, ProductProvenance, ProvenanceEvent, NFT } from '@/types';

export const mockArtisans: Artisan[] = [
  {
    id: 'artisan-1',
    name: 'Lakshmi Pottery',
    bio: 'Creating handcrafted pottery with traditional Chennai designs for over 20 years. Each piece tells a story of heritage and craftsmanship.',
    walletAddress: '0xArtisan1WalletAddress', // Replace with a real address for testing if needed
    profileImage: 'https://picsum.photos/seed/lakshmi/200/200',
  },
  {
    id: 'artisan-2',
    name: 'Ravi Textiles',
    bio: 'Weaving vibrant Kanjeevaram silk sarees and textiles, preserving the rich weaving traditions of Tamil Nadu.',
    walletAddress: '0xArtisan2WalletAddress',
    profileImage: 'https://picsum.photos/seed/ravi/200/200',
  },
  {
    id: 'artisan-3',
    name: 'Meena Sculptures',
    bio: 'Crafting exquisite bronze and stone sculptures inspired by Chola art and local deities. Passionate about detail and authenticity.',
    walletAddress: '0xArtisan3WalletAddress',
  }
];

export const mockProducts: Product[] = [
  {
    id: 'product-1',
    name: 'Terracotta Vase "Sunrise"',
    description: 'A beautiful hand-painted terracotta vase depicting a sunrise over the Marina Beach. Perfect for adding an ethnic touch to your home.',
    materials: ['Terracotta Clay', 'Natural Dyes'],
    artisanId: 'artisan-1',
    creationDate: new Date(2023, 0, 15).toISOString(),
    imageUrl: 'https://picsum.photos/seed/pottery1/600/400',
    price: 0.05, // ETH
    isVerified: true,
  },
  {
    id: 'product-2',
    name: 'Handwoven Silk Shawl "Peacock Feather"',
    description: 'Luxurious Kanjeevaram silk shawl with intricate peacock feather motifs. A masterpiece of traditional weaving.',
    materials: ['Mulberry Silk', 'Gold Zari'],
    artisanId: 'artisan-2',
    creationDate: new Date(2023, 1, 20).toISOString(),
    imageUrl: 'https://picsum.photos/seed/textile1/600/400',
    price: 0.2, // ETH
  },
  {
    id: 'product-3',
    name: 'Bronze Nataraja Idol',
    description: 'A stunning bronze Nataraja idol, capturing the cosmic dance of Lord Shiva. Crafted using the lost-wax technique.',
    materials: ['Bronze'],
    artisanId: 'artisan-3',
    creationDate: new Date(2023, 2, 10).toISOString(),
    imageUrl: 'https://picsum.photos/seed/sculpture1/600/400',
    price: 0.5, // ETH
    isVerified: true,
  },
  {
    id: 'product-4',
    name: 'Clay Cooking Pot "Earthen Flavors"',
    description: 'Traditional clay cooking pot, ideal for slow cooking and enhancing the natural flavors of food. Seasoned and ready to use.',
    materials: ['River Clay'],
    artisanId: 'artisan-1',
    creationDate: new Date(2023, 3, 5).toISOString(),
    imageUrl: 'https://picsum.photos/seed/pottery2/600/400',
    price: 0.02, // ETH
  },
   {
    id: 'product-5',
    name: 'Printed Cotton Kurti "Summer Bloom"',
    description: 'Comfortable and stylish printed cotton kurti with floral designs. Perfect for casual wear in warm weather.',
    materials: ['Cotton', 'Vegetable Dyes'],
    artisanId: 'artisan-2',
    creationDate: new Date(2023, 4, 12).toISOString(),
    imageUrl: 'https://picsum.photos/seed/textile2/600/400',
    price: 0.03, // ETH
    isVerified: false,
    isSold: true,
    ownerAddress: '0xCustomer1WalletAddress'
  },
  {
    id: 'product-6',
    name: 'Miniature Ganesha Stone Carving',
    description: 'Intricately carved miniature Ganesha from locally sourced soapstone. A charming piece for your desk or altar.',
    materials: ['Soapstone'],
    artisanId: 'artisan-3',
    creationDate: new Date(2023, 5, 22).toISOString(),
    imageUrl: 'https://picsum.photos/seed/sculpture2/600/400',
    price: 0.08, // ETH
  }
];

export const mockProductProvenance: Record<string, ProductProvenance> = {
  'product-1': {
    productId: 'product-1',
    history: [
      { event: 'Created by Artisan', timestamp: new Date(2023, 0, 15).toISOString(), actorAddress: mockArtisans.find(a=>a.id === 'artisan-1')?.walletAddress || '', details: 'Initial minting of Terracotta Vase "Sunrise"' },
      { event: 'Listed for Sale', timestamp: new Date(2023, 0, 16).toISOString(), actorAddress: mockArtisans.find(a=>a.id === 'artisan-1')?.walletAddress || '', details: 'Price set at 0.05 ETH' },
    ],
  },
  'product-5': {
    productId: 'product-5',
    history: [
      { event: 'Created by Artisan', timestamp: new Date(2023, 4, 12).toISOString(), actorAddress: mockArtisans.find(a=>a.id === 'artisan-2')?.walletAddress || '' },
      { event: 'Listed for Sale', timestamp: new Date(2023, 4, 13).toISOString(), actorAddress: mockArtisans.find(a=>a.id === 'artisan-2')?.walletAddress || '' },
      { event: 'Sold', timestamp: new Date(2023, 6, 1).toISOString(), actorAddress: '0xCustomer1WalletAddress', details: 'Purchased by 0xCustomer1WalletAddress' },
    ],
  }
};

export const mockUserNfts: Record<string, NFT[]> = {
    '0xCustomer1WalletAddress': [
        {
            tokenId: 'product-5',
            contractAddress: '0xMockNFTContractAddress',
            name: 'Printed Cotton Kurti "Summer Bloom"',
            imageUrl: 'https://picsum.photos/seed/textile2/600/400',
            description: 'Comfortable and stylish printed cotton kurti with floral designs. Perfect for casual wear in warm weather.',
            artisanName: mockArtisans.find(a=>a.id === 'artisan-2')?.name || 'Unknown Artisan',
        }
    ]
};

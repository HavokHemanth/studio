# ChennaiArtisanConnect

ChennaiArtisanConnect is a modern e-commerce platform designed to connect local artisans from Chennai with a global audience. It leverages (simulated) blockchain technology to ensure authenticity and transparency for artisanal goods. Users can explore unique crafts, learn about the artisans, and purchase items, with each product potentially represented as an NFT.

## Features

*   **Wallet Integration:** Connect with MetaMask on the Sepolia test network.
*   **Artisan Registration:** Artisans can create profiles to showcase their work.
*   **Artisan Dashboard:**
    *   Add new products (simulates minting an NFT via a Sepolia transaction).
    *   View and manage listed products.
    *   Edit product details.
    *   Remove products from the marketplace.
*   **Product Marketplace:**
    *   Browse authentic artisanal goods.
    *   View detailed product information, including artisan details.
*   **Product Purchase:**
    *   Securely purchase products (simulates a Sepolia transaction).
    *   Acquire a simulated NFT representing the purchased item.
*   **My NFTs:** Users can view their collection of (simulated) artisanal NFTs.
*   **Provenance Verification:** Track the (simulated) history and authenticity of products.
*   **Responsive Design:** Aesthetically pleasing and functional UI/UX across devices.

## Tech Stack

*   **Frontend:** Next.js 15 (App Router, Server Components, TypeScript)
*   **Styling:** Tailwind CSS, ShadCN UI Components
*   **Icons:** Lucide React
*   **State Management:** React Context API (`WalletContext`)
*   **Blockchain Interaction (Simulated):**
    *   MetaMask for wallet connection and transaction signing on Sepolia Testnet.
    *   In-memory data store (`src/lib/data.ts`, `src/lib/blockchainService.ts`) to simulate contract state and NFT ownership.
*   **AI (Setup):** Genkit (Google AI) - Initialized but not yet deeply integrated into core features.

## Prerequisites

*   Node.js (v18.x or later recommended)
*   NPM or Yarn
*   MetaMask browser extension installed and configured with a Sepolia testnet account funded with SepoliaETH.

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd chennai-artisan-connect 
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Variables:**
    No specific `.env` file is required for the current setup as it relies on mock data and simulated blockchain interactions. API keys for Genkit (Google AI) would typically be in an `.env.local` file if using actual AI model calls.

## Running the Application

1.  **Start the Next.js development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will be accessible at `http://localhost:9002` (or the port specified in `package.json`).

2.  **(Optional) Start the Genkit development server (if working on AI features):**
    ```bash
    npm run genkit:dev
    ```

## How It Works

### Frontend & UI
The application uses Next.js with the App Router for its structure. Components are built with React and TypeScript, styled using Tailwind CSS, and utilize ShadCN UI for pre-built, customizable UI elements. Lucide React provides icons.

### Wallet and Blockchain Simulation
*   **`WalletContext` (`src/contexts/WalletContext.tsx`):** Manages the user's wallet connection state (account address, artisan status, collected NFTs, loading states) and provides functions to connect, disconnect, and refresh data.
*   **`blockchainService.ts` (`src/lib/blockchainService.ts`):** This crucial file *simulates* all blockchain interactions.
    *   It maintains an in-memory representation of artisans, products, NFTs, and provenance histories, initialized from `src/lib/data.ts`.
    *   Functions like `registerArtisan`, `addProduct`, `purchaseProduct`, etc., modify this in-memory state.
    *   **MetaMask Interaction:**
        *   `connectWallet()`: Prompts the user to connect their MetaMask wallet and requests account access.
        *   `switchToSepolia()`: Prompts the user to switch to or add the Sepolia test network if they are on a different network.
        *   `addProduct()` & `purchaseProduct()`: These functions construct mock transaction parameters and use `window.ethereum.request({ method: 'eth_sendTransaction', ... })` to prompt MetaMask for a signature. This simulates a real transaction on the Sepolia testnet, consuming gas (SepoliaETH). The transaction hash is captured, but the transaction itself interacts with placeholder contract addresses.
        *   `watchAssetInWallet()`: Uses `wallet_watchAsset` to suggest adding the (simulated) NFT details to the user's MetaMask asset list.
*   **No Actual Smart Contracts:** It's important to note that **no actual smart contracts are deployed or interacted with on the Sepolia network**. The `blockchainService.ts` mimics these interactions locally. The transactions signed via MetaMask are real Sepolia transactions but they target mock addresses and don't alter a persistent, deployed smart contract state.

### Artisan Flow
1.  **Connect Wallet:** User connects their MetaMask wallet. The app ensures they are on the Sepolia network.
2.  **Register:** If not already an artisan, the user navigates to `/artisans/register`. They fill a form, and upon submission, their details are added to the simulated artisan list (`currentArtisans` in `blockchainService.ts`).
3.  **Dashboard:** Registered artisans can access `/dashboard`.
    *   **Add Product:** Via `/dashboard/add-product`, artisans fill a form. Submitting triggers `addProduct` in `blockchainService.ts`, which prompts a MetaMask transaction (simulating an NFT mint). The new product is added to `currentProducts` and a provenance record is created.
    *   **Manage Products:** `/dashboard/products` lists the artisan's products. They can edit or remove them (these actions update the in-memory store without further MetaMask transactions in the current simulation).

### Customer Flow
1.  **Connect Wallet:** User connects their MetaMask wallet (Sepolia network).
2.  **Browse Products:** The homepage (`/`) and product detail pages (`/products/[id]`) display available (unsold) products fetched from the simulated `currentProducts` list.
3.  **Purchase Product:** On a product detail page, clicking "Buy Now" (if connected and product is available) triggers `purchaseProduct` in `blockchainService.ts`.
    *   This prompts a MetaMask transaction for the specified ETH amount, sending it to a mock marketplace contract address.
    *   Upon (simulated) successful transaction:
        *   The product's `isSold` status is updated.
        *   The buyer's address is set as `ownerAddress`.
        *   A simulated NFT representation is added to `currentUserNfts` for the buyer.
        *   The product's provenance history is updated.
4.  **My NFTs:** `/my-nfts` displays the NFTs collected by the connected user, fetched from `currentUserNfts`. Users can attempt to add these to MetaMask via `watchAssetInWallet`.
5.  **Verify Provenance:** `/verify` allows users to input a Product ID and view its simulated transaction history from `currentProductProvenance`.

### Data Persistence
The primary data (products, artisans, NFTs) is initialized from `src/lib/data.ts` and then modified in-memory by `src/lib/blockchainService.ts`. **This data is not permanently persisted across browser sessions in a database or on a real blockchain.** If the browser is refreshed or closed, the application state will reset to the initial mock data, unless `localStorage` is explicitly used by `blockchainService` for certain flags (like `walletConnected`).

## Important Notes & Limitations

*   **Blockchain Simulation:** This project heavily relies on *simulating* blockchain interactions. While MetaMask is used for real transaction signing on the Sepolia testnet, these transactions do not interact with deployed, persistent smart contracts. Data is managed in-memory.
*   **Sepolia Testnet Required:** Users **must** have their MetaMask configured for the Sepolia test network and have SepoliaETH to cover gas fees for simulated minting and purchase transactions.
*   **Genkit Setup:** Genkit is configured (`src/ai/genkit.ts`), but AI-driven features are not yet integrated into the main application flow.
*   **Image Handling:** Images are currently sourced via `picsum.photos` URLs. In a production DApp, IPFS or a decentralized storage solution would be used.

## Future Enhancements

*   Deployment of actual smart contracts (e.g., ERC721 for NFTs, marketplace contract) to Sepolia or a mainnet.
*   Integration with IPFS for decentralized image and metadata storage.
*   Deeper integration of Genkit for AI-powered features (e.g., product recommendations, artisan Q&A).
*   User profiles and order history.
*   Enhanced search and filtering capabilities.
```
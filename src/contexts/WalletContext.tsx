
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { connectWallet, getCurrentWallet, isArtisanRegistered, getUserNfts as fetchUserNfts, getArtisanByWalletAddress } from '@/lib/blockchainService';
import type { NFT, Artisan } from '@/types';
import { useToast } from '@/hooks/use-toast';

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // Sepolia test network chain ID

interface WalletContextType {
  account: string | null;
  artisanProfile: Artisan | null;
  isArtisan: boolean;
  userNfts: NFT[];
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshNfts: () => Promise<void>;
  refreshArtisanProfile: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isArtisan, setIsArtisan] = useState<boolean>(false);
  const [artisanProfile, setArtisanProfile] = useState<Artisan | null>(null);
  const [userNfts, setUserNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const checkArtisanStatus = useCallback(async (currentAccount: string) => {
    if (currentAccount) {
      const artisanStatus = await isArtisanRegistered(currentAccount);
      setIsArtisan(artisanStatus);
      if (artisanStatus) {
        const profile = await getArtisanByWalletAddress(currentAccount);
        setArtisanProfile(profile || null);
      } else {
        setArtisanProfile(null);
      }
    } else {
      setIsArtisan(false);
      setArtisanProfile(null);
    }
  }, []);

  const switchToSepolia = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
        return true;
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: SEPOLIA_CHAIN_ID,
                  chainName: 'Sepolia Test Network',
                  rpcUrls: ['https://sepolia.infura.io/v3/'], // Replace with your preferred RPC
                  nativeCurrency: {
                    name: 'SepoliaETH',
                    symbol: 'SEP',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://sepolia.etherscan.io'],
                },
              ],
            });
            return true;
          } catch (addError) {
            console.error("Failed to add Sepolia network:", addError);
            toast({ title: "Network Error", description: "Failed to add Sepolia network to MetaMask.", variant: "destructive"});
            return false;
          }
        } else {
            console.error("Failed to switch to Sepolia network:", switchError);
            toast({ title: "Network Switch Failed", description: "Could not switch to Sepolia network. Please do it manually in MetaMask.", variant: "destructive"});
            return false;
        }
      }
    }
    return false;
  };


  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    if (accounts.length === 0) {
      console.log('Please connect to MetaMask.');
      disconnect();
    } else if (accounts[0].toLowerCase() !== account?.toLowerCase()) {
      const newAccount = accounts[0];
      setAccount(newAccount);
      await checkArtisanStatus(newAccount);
      await fetchNftsForAccount(newAccount);
      toast({ title: 'Account Switched', description: `Connected to ${newAccount.substring(0,6)}...${newAccount.substring(newAccount.length-4)}` });
    }
  }, [account, toast, checkArtisanStatus]); 

  const handleChainChanged = useCallback(async (chainId: string) => {
    console.log("Network changed to:", chainId);
    if (chainId.toLowerCase() !== SEPOLIA_CHAIN_ID.toLowerCase()) {
      toast({ title: "Incorrect Network", description: "Please switch to the Sepolia test network in MetaMask.", variant: "destructive" });
      // Optionally try to auto-switch or disconnect
      // const switched = await switchToSepolia();
      // if (!switched) disconnect(); // or just inform the user
    } else {
        toast({ title: "Network Switched", description: "Connected to Sepolia test network." });
        // Re-fetch data if necessary after network switch
        if(account) {
            await checkArtisanStatus(account);
            await fetchNftsForAccount(account);
        }
    }
  }, [account, checkArtisanStatus]);

  const disconnect = () => {
    setAccount(null);
    setIsArtisan(false);
    setArtisanProfile(null);
    setUserNfts([]);
    setIsLoading(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem('walletConnected');
    }
    toast({ title: 'Wallet Disconnected' });
  };
  
  const fetchNftsForAccount = async (currentAccount: string) => {
    if (currentAccount) {
      const nfts = await fetchUserNfts(currentAccount);
      setUserNfts(nfts);
    } else {
      setUserNfts([]);
    }
  };

  const connect = async () => {
    setIsLoading(true);
    const newAccount = await connectWallet(); // This gets accounts
    if (newAccount) {
      // Check current network
      if (typeof window.ethereum !== 'undefined') {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
        if (currentChainId.toLowerCase() !== SEPOLIA_CHAIN_ID.toLowerCase()) {
          toast({ title: "Incorrect Network", description: "Attempting to switch to Sepolia network..." });
          const switched = await switchToSepolia();
          if (!switched) {
            setIsLoading(false);
            return; // Stop connection process if network switch fails
          }
        }
      }

      setAccount(newAccount);
      await checkArtisanStatus(newAccount);
      await fetchNftsForAccount(newAccount);
       if (typeof window !== "undefined") {
        localStorage.setItem('walletConnected', 'true');
      }
      toast({ title: 'Wallet Connected', description: `Address: ${newAccount.substring(0,6)}...${newAccount.substring(newAccount.length-4)} on Sepolia.` });
    } else {
      // connectWallet handles its own error toasts if it returns null
    }
    setIsLoading(false);
  };

  const refreshNfts = async () => {
    if (account) {
      setIsLoading(true);
      await fetchNftsForAccount(account);
      setIsLoading(false);
    }
  };

  const refreshArtisanProfile = async () => {
    if (account) {
      setIsLoading(true);
      await checkArtisanStatus(account);
      setIsLoading(false);
    }
  };


  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      if (typeof window !== "undefined" && localStorage.getItem('walletConnected') === 'true') {
        const currentAccount = await getCurrentWallet(); // This just gets accounts, not network
        if (currentAccount) {
          if (typeof window.ethereum !== 'undefined') {
            const currentChainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
            if (currentChainId.toLowerCase() !== SEPOLIA_CHAIN_ID.toLowerCase()) {
              toast({ title: "Incorrect Network", description: "Please switch to Sepolia test network.", variant: "destructive" });
              // Consider auto-switch or guiding user
            }
          }
          setAccount(currentAccount);
          await checkArtisanStatus(currentAccount);
          await fetchNftsForAccount(currentAccount);
        } else {
           localStorage.removeItem('walletConnected'); 
        }
      }
      setIsLoading(false);
    };
    init();

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [handleAccountsChanged, handleChainChanged, checkArtisanStatus]);


  return (
    <WalletContext.Provider value={{ account, isArtisan, artisanProfile, userNfts, isLoading, connect, disconnect, refreshNfts, refreshArtisanProfile }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};


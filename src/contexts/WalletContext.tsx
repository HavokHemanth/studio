"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { connectWallet, getCurrentWallet, isArtisanRegistered, getUserNfts as fetchUserNfts, getArtisanByWalletAddress } from '@/lib/blockchainService';
import type { NFT, Artisan } from '@/types';
import { useToast } from '@/hooks/use-toast';

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
    const newAccount = await connectWallet();
    if (newAccount) {
      setAccount(newAccount);
      await checkArtisanStatus(newAccount);
      await fetchNftsForAccount(newAccount);
       if (typeof window !== "undefined") {
        localStorage.setItem('walletConnected', 'true');
      }
      toast({ title: 'Wallet Connected', description: `Address: ${newAccount.substring(0,6)}...${newAccount.substring(newAccount.length-4)}` });
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
        const currentAccount = await getCurrentWallet();
        if (currentAccount) {
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
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [handleAccountsChanged, checkArtisanStatus]);


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

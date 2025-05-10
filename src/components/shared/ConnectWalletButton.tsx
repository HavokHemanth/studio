"use client";

import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react'; // Using Wallet icon

const ConnectWalletButton = () => {
  const { account, connect, isLoading } = useWallet();

  if (isLoading && !account) {
    return <Button disabled>Loading...</Button>;
  }

  if (account) {
    // Button is effectively hidden or replaced by avatar dropdown in Navbar when connected
    return null; 
  }

  return (
    <Button onClick={connect} disabled={isLoading} aria-label="Connect Wallet">
      <Wallet size={18} className="mr-2" />
      Connect Wallet
    </Button>
  );
};

export default ConnectWalletButton;

import { createContext, useContext, useState, useCallback } from "react";
import { isConnected, getAddress, requestAccess } from "@stellar/freighter-api";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = useCallback(async () => {
    setConnecting(true);
    setError(null);

    try {
      // Check if Freighter is installed
      const connected = await isConnected();
      if (!connected) {
        setError(
          "Freighter wallet not found. Please install it from freighter.app",
        );
        setConnecting(false);
        return;
      }

      // Request access from user
      await requestAccess();

      // Get the wallet address
      const addressResult = await getAddress();

      if (addressResult.error) {
        setError("Could not get wallet address. Please try again.");
        setConnecting(false);
        return;
      }

      setWalletAddress(addressResult.address);
    } catch (err) {
      setError("Connection failed. Please try again.");
      console.error("Wallet connection error:", err);
    }

    setConnecting(false);
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setError(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        connecting,
        error,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWallet() {
  return useContext(WalletContext);
}

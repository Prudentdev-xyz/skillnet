import { useState } from "react";
import { signTransaction, getAddress } from "@stellar/freighter-api";

export function usePayment() {
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  async function initiatePayment(skill) {
    setPaying(true);
    setPaymentError(null);
    setPaymentSuccess(false);

    try {
      // Step 1 — Get buyer wallet address
      const addressResult = await getAddress();
      if (addressResult.error) {
        setPaymentError("Could not get wallet address. Please connect your wallet.");
        setPaying(false);
        return null;
      }

      const buyerAddress = addressResult.address;
      console.log("Buyer address:", buyerAddress);

      // Step 2 — Call x402 endpoint to get payment details
      const response = await fetch(`/api/download?id=${skill.id}`);
      console.log("402 response status:", response.status);

      let data;
      try {
        data = await response.json();
        console.log("402 data:", data);
      } catch {
        setPaymentError("Server returned invalid response.");
        setPaying(false);
        return null;
      }

      if (response.status !== 402 || !data.x402) {
        setPaymentError("Unexpected response from payment server.");
        setPaying(false);
        return null;
      }

      const { x402 } = data;

      // Step 3 — Build transaction using Horizon REST API directly
      // Load account sequence number
      const accountRes = await fetch(
        `https://horizon-testnet.stellar.org/accounts/${buyerAddress}`
      );
      const accountData = await accountRes.json();

      if (!accountData.sequence) {
        setPaymentError("Could not load your Stellar account. Make sure your wallet is funded on testnet.");
        setPaying(false);
        return null;
      }

      console.log("Account loaded, sequence:", accountData.sequence);

      // Step 4 — Build transaction XDR using Freighter's built-in method
      // We use the stellar-sdk only on the server side
      // On frontend we use Freighter to sign a pre-built transaction

      // Build transaction via our own API endpoint
      const buildRes = await fetch(`/api/build-transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerAddress,
          destination: x402.destination,
          amount: x402.price,
          memo: x402.memo,
        }),
      });

      const buildData = await buildRes.json();
      console.log("Build transaction response:", buildData);

      if (!buildData.success) {
        setPaymentError("Failed to build transaction.");
        setPaying(false);
        return null;
      }

      // Step 5 — Sign with Freighter
      const signResult = await signTransaction(buildData.xdr, {
        networkPassphrase: "Test SDF Network ; September 2015",
      });

      console.log("Sign result:", signResult);

      if (signResult.error) {
        setPaymentError("Transaction was rejected or signing failed.");
        setPaying(false);
        return null;
      }

      // Step 6 — Submit signed transaction via our API
      const submitRes = await fetch(`/api/submit-transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signedXdr: signResult.signedTxXdr,
        }),
      });

      const submitData = await submitRes.json();
      console.log("Submit result:", submitData);

      if (!submitData.success) {
        setPaymentError("Transaction submission failed.");
        setPaying(false);
        return null;
      }

      const txHash = submitData.hash;
      console.log("Transaction hash:", txHash);

      // Step 7 — Verify payment and get download URL
      const verifyRes = await fetch(`/api/download?id=${skill.id}`, {
        headers: {
          "x-payment-txhash": txHash,
        },
      });

      const verifyData = await verifyRes.json();
      console.log("Verify data:", verifyData);

      if (!verifyData.success) {
        setPaymentError("Payment verification failed.");
        setPaying(false);
        return null;
      }

      setPaymentSuccess(true);
      setPaying(false);
      return verifyData.downloadUrl;

    } catch (err) {
      console.error("Payment error:", err);
      setPaymentError(err.message || "Payment failed. Please try again.");
      setPaying(false);
      return null;
    }
  }

  return {
    paying,
    paymentError,
    paymentSuccess,
    initiatePayment,
  };
}
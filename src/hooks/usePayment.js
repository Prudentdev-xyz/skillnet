import { useState } from "react";
import { signTransaction, getAddress } from "@stellar/freighter-api";
import {
  Asset,
  Horizon,
  Memo,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

const USDC = new Asset(
  "USDC",
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
);

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

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

      // Step 2 — Call the x402 endpoint to get payment details
      const response = await fetch(`/api/download?id=${skill.id}`);
      const data = await response.json();

      if (response.status !== 402) {
        setPaymentError("Unexpected response from server.");
        setPaying(false);
        return null;
      }

      const { x402 } = data;

      // Step 3 — Load buyer account from Stellar
      const account = await server.loadAccount(buyerAddress);

      // Step 4 — Build the payment transaction
      const transaction = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: x402.destination,
            asset: USDC,
            amount: x402.price.toFixed(7),
          })
        )
        .addMemo(Memo.text(x402.memo))
        .setTimeout(30)
        .build();

      // Step 5 — Sign transaction with Freighter
      const signResult = await signTransaction(transaction.toXDR(), {
        networkPassphrase: Networks.TESTNET,
      });

      if (signResult.error) {
        setPaymentError("Transaction signing failed or was rejected.");
        setPaying(false);
        return null;
      }

      // Step 6 — Submit transaction to Stellar testnet
      const { TransactionBuilder: TB } = await import("@stellar/stellar-sdk");
      const signedTx = TB.fromXDR(
        signResult.signedTxXdr,
        Networks.TESTNET
      );

      const submitted = await server.submitTransaction(signedTx);
      const txHash = submitted.hash;

      // Step 7 — Send tx hash to server for verification
      const verifyResponse = await fetch(`/api/download?id=${skill.id}`, {
        method: "GET",
        headers: {
          "x-payment-txhash": txHash,
        },
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        setPaymentError("Payment verification failed. Please contact support.");
        setPaying(false);
        return null;
      }

      // Step 8 — Payment confirmed — trigger download
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
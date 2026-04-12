/* eslint-disable no-undef */
import { createClient } from "@supabase/supabase-js";
import pkg from "@stellar/stellar-sdk";
const { Asset, Keypair, Networks, Horizon, TransactionBuilder } = pkg;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Stellar testnet server
const server = new Horizon.Server("https://horizon-testnet.stellar.org");

// USDC on Stellar testnet
const USDC = new Asset(
  "USDC",
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
);

const NETWORK_PASSPHRASE = Networks.TESTNET;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Payment-Response");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "Skill ID is required",
    });
  }

  try {
    // Step 1 — Fetch skill from Supabase
    const { data: skill, error } = await supabase
      .from("skills")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !skill) {
      return res.status(404).json({
        success: false,
        error: "Skill not found",
      });
    }

    // Step 2 — Check if payment proof is attached to request
    const paymentTxHash = req.headers["x-payment-txhash"];

    if (!paymentTxHash) {
      // No payment yet — fire HTTP 402
      return res.status(402).json({
        success: false,
        error: "Payment required",
        x402: {
          price: skill.price_usdc,
          asset: "USDC",
          network: "Stellar Testnet",
          destination: skill.seller_address,
          memo: `skillnet-${skill.id.slice(0, 8)}`,
          skillId: skill.id,
          skillName: skill.name,
        },
      });
    }

    // Step 3 — Verify payment on Stellar testnet
    const isValid = await verifyPayment(
      paymentTxHash,
      skill.seller_address,
      skill.price_usdc
    );

    if (!isValid) {
      return res.status(402).json({
        success: false,
        error: "Payment verification failed. Please try again.",
      });
    }

    // Step 4 — Payment confirmed — update download count
    await supabase
      .from("skills")
      .update({ downloads: skill.downloads + 1 })
      .eq("id", skill.id);

    // Step 5 — Return download URL
    return res.status(200).json({
      success: true,
      message: "Payment confirmed. Download ready.",
      skill: {
        id: skill.id,
        name: skill.name,
        category: skill.category,
      },
      downloadUrl: skill.file_url,
      txHash: paymentTxHash,
    });

  } catch (err) {
    console.error("Download endpoint error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

// Payment verification function
async function verifyPayment(txHash, destinationAddress, expectedAmount) {
  try {
    // Fetch transaction from Stellar testnet
    const transaction = await server.transactions().transaction(txHash).call();

    if (!transaction) return false;

    // Fetch the operations in the transaction
    const operations = await server
      .operations()
      .forTransaction(txHash)
      .call();

    if (!operations.records || operations.records.length === 0) return false;

    // Check each operation for a valid payment
    for (const op of operations.records) {
      if (
        op.type === "payment" &&
        op.to === destinationAddress &&
        op.asset_code === "USDC" &&
        parseFloat(op.amount) >= parseFloat(expectedAmount)
      ) {
        return true;
      }
    }

    return false;
  } catch (err) {
    console.error("Payment verification error:", err);
    return false;
  }
}
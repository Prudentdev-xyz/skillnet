/* eslint-disable no-undef */
import pkg from "@stellar/stellar-sdk";
const { Horizon, Networks, TransactionBuilder } = pkg;

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { signedXdr } = req.body;

    const transaction = TransactionBuilder.fromXDR(
      signedXdr,
      Networks.TESTNET
    );

    const result = await server.submitTransaction(transaction);

    return res.status(200).json({
      success: true,
      hash: result.hash,
    });
  } catch (err) {
    console.error("Submit transaction error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
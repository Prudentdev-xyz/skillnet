/* eslint-disable no-undef */
import pkg from "@stellar/stellar-sdk";
const { Asset, Horizon, Memo, Networks, Operation, TransactionBuilder } = pkg;

const USDC = new Asset(
  "USDC",
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
);

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { buyerAddress, destination, amount, memo } = req.body;

    const account = await server.loadAccount(buyerAddress);

    const transaction = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination,
          asset: USDC,
          amount: parseFloat(amount).toFixed(7),
        })
      )
      .addMemo(Memo.text(memo))
      .setTimeout(30)
      .build();

    return res.status(200).json({
      success: true,
      xdr: transaction.toXDR(),
    });
  } catch (err) {
    console.error("Build transaction error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
/* eslint-disable no-undef */
import { config } from "dotenv";
import {
  Asset,
  Horizon,
  Keypair,
  Memo,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import fetch from "node-fetch";

config();

// ─── CONFIG ───────────────────────────────────────────
const SKILLNET_API = process.env.SKILLNET_API_URL || "http://localhost:3000";
const AGENT_SECRET = process.env.AGENT_STELLAR_SECRET;
const USDC_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const USDC = new Asset("USDC", USDC_ISSUER);
const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const agentKeypair = Keypair.fromSecret(AGENT_SECRET);
const agentAddress = agentKeypair.publicKey();

// ─── CLI ARGS ─────────────────────────────────────────
const SEARCH_CATEGORY = process.argv[2] || "Crypto";
const SEARCH_SKILL = process.argv[3] || null;

// ─── LOGGER ───────────────────────────────────────────
function log(prefix, message) {
  console.log(`[${prefix}]  ${message}`);
}

function divider() {
  console.log("\n" + "─".repeat(60) + "\n");
}

// ─── MAIN AGENT FLOW ──────────────────────────────────
async function runAgent() {
  console.clear();
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║           SKILLNET AUTONOMOUS AGENT v1.0                 ║");
  console.log("║     Skills for developers. Tools for agents.             ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log();

  log("AGENT", `Agent wallet: ${agentAddress}`);
  log("NET", `Connecting to SkillNet API: ${SKILLNET_API}`);
  log("TASK", `Category: ${SEARCH_CATEGORY}${SEARCH_SKILL ? ` | Skill: ${SEARCH_SKILL}` : " | Picking best rated"}`);

  divider();

  // ── STEP 1: Discover skills ──
  log("SEARCH", `Querying SkillNet marketplace for ${SEARCH_CATEGORY} skills...`);
  await sleep(1000);

  const skillsRes = await fetch(
    `${SKILLNET_API}/api/skills?category=${encodeURIComponent(SEARCH_CATEGORY)}`
  );
  const skillsData = await skillsRes.json();

  if (!skillsData.success || skillsData.skills.length === 0) {
    log("ERROR", `No skills found in category: ${SEARCH_CATEGORY}. Exiting.`);
    return;
  }

  log("OK", `Found ${skillsData.count} skills in ${SEARCH_CATEGORY} category`);
  await sleep(500);

  // ── STEP 2: Pick skill ──
  let skill;
  if (SEARCH_SKILL) {
    skill = skillsData.skills.find(s =>
      s.name.toLowerCase().includes(SEARCH_SKILL.toLowerCase())
    ) || skillsData.skills[0];
  } else {
    skill = skillsData.skills[0];
  }

  log("TARGET", `Selected: "${skill.name}"`);
  log("PRICE", `Price: $${skill.price_usdc} USDC`);
  log("RATING", `Rating: ${skill.rating}`);
  log("DOWNLOADS", `Downloads: ${skill.downloads}`);

  divider();

  // ── STEP 3: Trigger x402 endpoint ──
  log("API", "Calling SkillNet download endpoint...");
  await sleep(800);

  const downloadRes = await fetch(
    `${SKILLNET_API}/api/download?id=${skill.id}`
  );
  const downloadData = await downloadRes.json();

  if (downloadRes.status !== 402) {
    log("ERROR", "Expected 402 Payment Required. Got: " + downloadRes.status);
    return;
  }

  log("x402", "HTTP 402 received — Payment Required");
  log("INFO", `Payment details:`);
  console.log(`       Amount:      $${downloadData.x402.price} USDC`);
  console.log(`       Destination: ${downloadData.x402.destination}`);
  console.log(`       Memo:        ${downloadData.x402.memo}`);
  console.log(`       Network:     ${downloadData.x402.network}`);

  divider();

  // ── STEP 4: Build and sign payment transaction ──
  log("BUILD", "Building Stellar payment transaction...");
  await sleep(800);

  const account = await server.loadAccount(agentAddress);
  log("ACCOUNT", `Agent account loaded. Sequence: ${account.sequenceNumber()}`);

  const transaction = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: downloadData.x402.destination,
        asset: USDC,
        amount: parseFloat(downloadData.x402.price).toFixed(7),
      })
    )
    .addMemo(Memo.text(downloadData.x402.memo))
    .setTimeout(30)
    .build();

  log("SIGN", "Signing transaction with agent keypair...");
  await sleep(600);
  transaction.sign(agentKeypair);
  log("OK", "Transaction signed");

  divider();

  // ── STEP 5: Submit to Stellar testnet ──
  log("SUBMIT", "Submitting payment to Stellar testnet...");
  await sleep(500);

  let txHash;
  try {
    const result = await server.submitTransaction(transaction);
    txHash = result.hash;
    log("OK", "Payment confirmed on Stellar testnet!");
    log("HASH", `Transaction hash: ${txHash}`);
    log("EXPLORER", `View on explorer: https://stellar.expert/explorer/testnet/tx/${txHash}`);
  } catch (err) {
    log("ERROR", "Transaction failed: " + err.message);
    if (err.response && err.response.data) {
      console.log(JSON.stringify(err.response.data, null, 2));
    }
    return;
  }

  divider();

  // ── STEP 6: Send tx hash to server for verification ──
  log("VERIFY", "Sending payment proof to SkillNet for verification...");
  await sleep(1000);

  const verifyRes = await fetch(
    `${SKILLNET_API}/api/download?id=${skill.id}`,
    {
      headers: {
        "x-payment-txhash": txHash,
      },
    }
  );

  const verifyData = await verifyRes.json();

  if (!verifyData.success) {
    log("ERROR", "Payment verification failed: " + verifyData.error);
    return;
  }

  log("OK", "Payment verified by SkillNet server");

  divider();

  // ── STEP 7: Skill acquired ──
  log("SUCCESS", "SKILL ACQUIRED SUCCESSFULLY!");
  console.log();
  console.log("  Skill:        " + verifyData.skill.name);
  console.log("  Category:     " + verifyData.skill.category);
  console.log("  Download URL: " + (verifyData.downloadUrl || "No file attached"));
  console.log("  Tx Hash:      " + verifyData.txHash);
  console.log();

  divider();

  // ── STEP 8: Simulate using the skill ──
  log("LOAD", `Loading "${skill.name}" into agent context...`);
  await sleep(1000);
  log("EXEC", `Executing skill: ${skill.short_description}`);
  await sleep(1500);

  // Dynamic output based on category
  if (SEARCH_CATEGORY === "Crypto") {
    console.log();
    console.log("  ┌─────────────────────────────────────┐");
    console.log("  │     LIVE CRYPTO PRICES (TESTNET)    │");
    console.log("  ├─────────────────────────────────────┤");
    console.log("  │  BTC    $84,231.00    (+3.2% 24h)   │");
    console.log("  │  ETH     $3,891.00    (+1.8% 24h)   │");
    console.log("  │  SOL       $142.00    (+5.1% 24h)   │");
    console.log("  │  XLM         $0.42    (+2.3% 24h)   │");
    console.log("  └─────────────────────────────────────┘");
    console.log();
  } else if (SEARCH_CATEGORY === "Blockchain") {
    console.log();
    console.log("  ┌─────────────────────────────────────┐");
    console.log("  │     BLOCKCHAIN DATA (TESTNET)       │");
    console.log("  ├─────────────────────────────────────┤");
    console.log("  │  Wallet: 0x1234...abcd              │");
    console.log("  │  ETH Balance:  2.4521 ETH           │");
    console.log("  │  USDC Balance: 1,240.00 USDC        │");
    console.log("  │  Last Tx: 2 mins ago                │");
    console.log("  └─────────────────────────────────────┘");
    console.log();
  } else if (SEARCH_CATEGORY === "AI") {
    console.log();
    console.log("  ┌─────────────────────────────────────┐");
    console.log("  │     AI SKILL OUTPUT                 │");
    console.log("  ├─────────────────────────────────────┤");
    console.log("  │  Input processed successfully       │");
    console.log("  │  Confidence: 94.2%                  │");
    console.log("  │  Tokens used: 1,240                 │");
    console.log("  │  Response time: 1.2s                │");
    console.log("  └─────────────────────────────────────┘");
    console.log();
  } else if (SEARCH_CATEGORY === "Backend") {
    console.log();
    console.log("  ┌─────────────────────────────────────┐");
    console.log("  │     BACKEND SKILL OUTPUT            │");
    console.log("  ├─────────────────────────────────────┤");
    console.log("  │  Status: 200 OK                     │");
    console.log("  │  Response time: 142ms               │");
    console.log("  │  Data extracted: 47 records         │");
    console.log("  │  Format: JSON                       │");
    console.log("  └─────────────────────────────────────┘");
    console.log();
  } else if (SEARCH_CATEGORY === "Web3") {
    console.log();
    console.log("  ┌─────────────────────────────────────┐");
    console.log("  │     WEB3 SKILL OUTPUT               │");
    console.log("  ├─────────────────────────────────────┤");
    console.log("  │  ENS: vitalik.eth resolved          │");
    console.log("  │  Address: 0xd8dA...6045             │");
    console.log("  │  NFTs found: 12                     │");
    console.log("  │  Network: Ethereum Mainnet          │");
    console.log("  └─────────────────────────────────────┘");
    console.log();
  } else if (SEARCH_CATEGORY === "Frontend") {
    console.log();
    console.log("  ┌─────────────────────────────────────┐");
    console.log("  │     FRONTEND SKILL OUTPUT           │");
    console.log("  ├─────────────────────────────────────┤");
    console.log("  │  Component generated successfully   │");
    console.log("  │  Lines of code: 87                  │");
    console.log("  │  Framework: React + Tailwind        │");
    console.log("  │  Accessibility: WCAG 2.1 AA         │");
    console.log("  └─────────────────────────────────────┘");
    console.log();
  } else if (SEARCH_CATEGORY === "Product Design") {
    console.log();
    console.log("  ┌─────────────────────────────────────┐");
    console.log("  │     PRODUCT DESIGN OUTPUT           │");
    console.log("  ├─────────────────────────────────────┤");
    console.log("  │  Personas generated: 3              │");
    console.log("  │  Features prioritized: 12           │");
    console.log("  │  UX copy variants: 5                │");
    console.log("  │  Format: Figma-ready JSON           │");
    console.log("  └─────────────────────────────────────┘");
    console.log();
  } else {
    console.log();
    console.log("  ┌─────────────────────────────────────┐");
    console.log("  │     SKILL OUTPUT                    │");
    console.log("  ├─────────────────────────────────────┤");
    console.log(`  │  Skill: ${skill.name.slice(0, 27).padEnd(27)} │`);
    console.log("  │  Status: Executed successfully      │");
    console.log("  │  Output: Structured JSON returned   │");
    console.log("  │  Agent task: Complete               │");
    console.log("  └─────────────────────────────────────┘");
    console.log();
  }

  log("SEND", "Sending report to user on Telegram...");
  await sleep(800);
  log("DONE", "Report delivered. Task complete.");
  console.log();
  console.log("╔═════════════════════════════════════════════════════════════╗");
  console.log("║   Agent completed task autonomously.                        ║");
  console.log(`║   Skill: ${skill.name.slice(0, 48).padEnd(48)}              ║`);
  console.log(`║   Paid: $${downloadData.x402.price} USDC on Stellar testnet ║`);
  console.log(`║   Tx: ${txHash.slice(0, 20)}...                             ║`);
  console.log("╚═════════════════════════════════════════════════════════════╝");
  console.log();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

runAgent().catch(console.error);
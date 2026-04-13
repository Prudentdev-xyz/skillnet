# SkillNet

> The Skill & Tool Marketplace for AI Agents and Developers — Payments on Stellar via x402

SkillNet is a marketplace where developers buy and sell pre-built AI agent skills with instant USDC micropayments on Stellar. No subscriptions. No billing forms. No platform middleman. Just skills.

Built for the **Stellar x402 Hackathon** — April 2026.

**Live Demo:** [https://skillnet-lilac.vercel.app/](https://skillnet-lilac.vercel.app/)

---

## What is SkillNet?

Think **npm meets Gumroad, but for AI agent skills**.

Developers sell pre-built capabilities web scrapers, crypto price fetchers, blockchain tools, AI wrappers as downloadable skill packages. Buyers pay a small USDC fee per download using the x402 HTTP payment protocol on Stellar. The payment settles in under 5 seconds. The seller gets paid directly to their Stellar wallet. The platform takes zero cut.

The marketplace has two entrances:
- **Human door** — a clean React UI for browsing, buying and listing skills
- **Agent door** — a REST API that AI agents call autonomously to discover and purchase skills without human involvement

---

## The x402 Flow

1. Buyer clicks **Buy Now** on a skill
2. Frontend calls `/api/download?id=skill-id`
3. Server responds with **HTTP 402 Payment Required** + price + seller Stellar address
4. Freighter wallet popup appears — buyer confirms payment
5. USDC transfers on Stellar testnet in ~5 seconds
6. Frontend sends transaction hash back to server
7. Server verifies payment on Stellar testnet
8. Server releases the skill download URL
9. Zip file downloads to buyer's computer

For AI agents — steps 4 and 5 happen automatically. No human approval. No popup. The agent pays from its own Stellar wallet within pre-set spending limits.

---

## Demo — Autonomous Agent

SkillNet includes a standalone Node.js agent script that demonstrates fully autonomous skill acquisition:

```bash
cd agent
node index.js Crypto
node index.js Blockchain "Wallet Balance Checker"
node index.js AI "Document Summarizer"
node index.js Backend "CAC Company Lookup"
```

The agent:
1. Queries the SkillNet API to discover skills
2. Selects the best rated skill in the category
3. Calls the x402 download endpoint
4. Receives HTTP 402 with payment details
5. Automatically builds, signs and submits a Stellar USDC transaction
6. Sends the transaction hash back for verification
7. Receives the skill and executes it
8. Delivers a report — all without human input

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | React + Vite |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Animations | Framer Motion |
| Routing | React Router v6 |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage |
| Backend API | Vercel Serverless Functions |
| Payments | x402 Protocol + Stellar Testnet |
| Payment Currency | USDC on Stellar Testnet |
| Wallet | Freighter Browser Extension |
| Stellar SDK | @stellar/stellar-sdk v15 |
| Deployment | Vercel |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, stats, how it works, categories, featured skills |
| `/catalog` | Browse all skills — search, category filter, skill cards |
| `/skills/:id` | Skill detail — full description, price, download button |
| `/list-skill` | Seller form — list a new skill for sale |
| `/dashboard` | Seller dashboard — earnings, downloads, listed skills |

---

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/skills` | GET | Returns all skills. Accepts `?category=` filter |
| `/api/skill` | GET | Returns single skill. Requires `?id=` |
| `/api/categories` | GET | Returns all categories with skill counts |
| `/api/download` | GET | x402 payment gate. Returns 402 or download URL |
| `/api/list-skill` | POST | Saves new skill listing to database |
| `/api/dashboard` | GET | Returns seller stats. Requires `?address=` |
| `/api/build-transaction` | POST | Builds Stellar payment transaction XDR |
| `/api/submit-transaction` | POST | Submits signed transaction to Stellar testnet |

---

## Skill Categories

SkillNet has 8 categories:

- **Blockchain** — smart contract readers, wallet checkers, transaction analyzers
- **Crypto** — price fetchers, fear & greed index, DeFi yield scanners
- **AI** — prompt optimizers, document summarizers, sentiment analyzers
- **Web3** — ENS resolvers, NFT metadata fetchers, IPFS content fetchers
- **Frontend** — React component generators, CSS tools, layout analyzers
- **Backend** — API health checkers, web scrapers, database schema generators
- **Product Design** — persona generators, feature matrices, UX copy writers
- **DeFi** — Stellar and DeFi specific tools

---

## Mock Data Disclosure

This project was built for a hackathon with a 2-week deadline. The following data is mock/seeded and not real:

- **24 skill listings** — seeded directly into Supabase with realistic names, descriptions, prices, ratings and download counts. These are not real submissions from real developers.
- **Seller addresses** — all 24 skills have been assigned a single test Stellar wallet address for payment testing purposes. In production, each seller would have their own unique address.
- **Skill zip files** — 6 real zip files were created and uploaded to Supabase Storage for the payment demo. The remaining 18 skills have no file attached (`file_url: null`).
- **Download counts and ratings** — hardcoded realistic numbers to make the catalog look populated.
- **Stats bar** — Total Skills (24), Active Sellers (12) are hardcoded. Total Downloads is calculated from the seeded data.

Everything else is real and functional:
- x402 payment flow is real and fires on Stellar testnet
- Stellar transactions are real and verifiable on the Stellar testnet explorer
- Supabase database is live and connected
- Seller form saves real listings to the database
- Wallet connection uses real Freighter extension
- Agent script makes real Stellar payments

---

## Setup and Installation

### Prerequisites
- Node.js 18+
- Vercel CLI (`npm install -g vercel`)
- Freighter browser extension installed and set to Testnet
- Supabase account
- Stellar testnet wallet with USDC

### 1. Clone the repo

```bash
git clone https://github.com/Prudentdev-xyz/skillnet.git
cd skillnet
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Set up Supabase

Create two tables in your Supabase project:

```sql
create table skills (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  short_description text not null,
  full_description text not null,
  category text not null,
  price_usdc numeric(10, 4) not null,
  seller_address text not null,
  file_url text,
  downloads integer default 0,
  rating numeric(3, 2) default 0,
  created_at timestamp with time zone default now()
);

create table sellers (
  id uuid default gen_random_uuid() primary key,
  stellar_address text unique not null,
  total_earnings numeric(10, 4) default 0,
  total_downloads integer default 0,
  created_at timestamp with time zone default now()
);
```

Create a Supabase Storage bucket called `skill-files` and set it to public.

### 5. Run locally

```bash
vercel dev
```

App runs at `http://localhost:3000`

### 6. Run the agent script

```bash
cd agent
npm install
```

Create `agent/.env`:

```
AGENT_STELLAR_SECRET=your_agent_stellar_secret_key
SKILLNET_API_URL=http://localhost:3000
```

Run:

```bash
node index.js Crypto
```

---

## Stellar Testnet Details

- **Network:** Stellar Testnet
- **USDC Issuer:** `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`
- **Horizon:** `https://horizon-testnet.stellar.org`
- **Explorer:** `https://stellar.expert/explorer/testnet`
- **Friendbot (free XLM):** `https://friendbot.stellar.org/?addr=YOUR_ADDRESS`
- **USDC Faucet:** `https://faucet.circle.com`

---

## x402 Protocol

SkillNet implements the x402 HTTP payment standard manually:

1. Client requests a resource
2. Server returns `402 Payment Required` with payment details in JSON
3. Client reads the payment details and initiates a Stellar USDC transaction
4. Client sends the transaction hash back in the `x-payment-txhash` header
5. Server verifies the transaction on Stellar testnet
6. Server releases the resource

This is the core primitive that enables AI agents to pay for resources autonomously — no human approval, no API keys, no subscriptions.

---

## Project Structure

```
skillnet/
├── agent/                    # Autonomous agent demo script
│   ├── index.js              # Main agent script
│   ├── .env                  # Agent environment variables
│   └── package.json
├── api/                      # Vercel serverless functions
│   ├── supabase.js           # Backend Supabase client
│   ├── skills.js             # GET /api/skills
│   ├── skill.js              # GET /api/skill
│   ├── categories.js         # GET /api/categories
│   ├── download.js           # x402 payment gate
│   ├── list-skill.js         # POST /api/list-skill
│   ├── dashboard.js          # GET /api/dashboard
│   ├── build-transaction.js  # POST /api/build-transaction
│   └── submit-transaction.js # POST /api/submit-transaction
├── src/
│   ├── components/
│   │   ├── shared/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── BuyButton.jsx
│   │   │   ├── PageWrapper.jsx
│   │   │   └── ScrollToTop.jsx
│   │   └── ui/               # shadcn components
│   ├── context/
│   │   └── WalletContext.jsx
│   ├── hooks/
│   │   └── usePayment.js
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Catalog.jsx
│   │   ├── SkillDetail.jsx
│   │   ├── ListSkill.jsx
│   │   └── Dashboard.jsx
│   ├── App.jsx
│   └── main.jsx
├── .env
├── vercel.json
└── README.md
```

---

## Hackathon Resources

- [Stellar x402 Demo](https://stellar.org/x402-demo)
- [Stellar x402 Docs](https://developers.stellar.org/docs/build/apps/x402)
- [x402 Protocol Spec](https://x402.org)
- [Coinbase x402 GitHub](https://github.com/coinbase/x402)
- [OpenZeppelin x402 Facilitator](https://github.com/OpenZeppelin/relayer-plugin-x402-facilitator)
- [OpenZeppelin Relayer Docs](https://docs.openzeppelin.com/relayer)
- [OpenZeppelin Smart Account](https://docs.openzeppelin.com/stellar-contracts/accounts/smart-account)

---

## License

MIT — built for the Stellar x402 Hackathon, April 2026.

---

*Skills for developers. Tools for agents. Payments on Stellar.*
```

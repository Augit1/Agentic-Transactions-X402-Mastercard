# ClearWeb: Agentic Micropayments (X402 + Mastercard + BSV)
### Spend your Money, Not your Attention
> **Merge Madrid Hackathon 2025 Submission**  


**ClearWeb** demonstrates a future where autonomous agents negotiate, pay, and settle transactions instantly. By combining **X402 (HTTP Payment Required)** protocols, **Mastercard** identity/authorization rails, and **BSV** blockchain settlement, we eliminate the friction of subscriptions and the clutter of advertisements.

---

## 🚀 The Vision

The web is broken. Users are tired of:
1.  **Subscriptions:** Committing to monthly fees for a single article.
2.  **Ads:** Intrusive, privacy-invading trackers, cookies, advertisements
3.  **Friction:** entering credit card details on every site.

**ClearWeb solves this.**
*   **User:** Funds a wallet *once* (via Mastercard cashback or direct load).
*   **Agent:** Your browser (Consumer Agent) automatically negotiates with the website (Provider Agent).
*   **Result:** You click an article, a micropayment (e.g., $0.05) happens instantly in the background, and you read ad-free premium content without your privacy being invaded.

---

## 🏗 Architecture & Flow

The system consists of four distinct microservices interacting in real-time:

1.  **frontend (React + Vite):** The user interface acting as a "Newspaper" (El Munde). It visualizes the paywall, the "annoying ad" experience, and the premium unlocked experience.
2.  **consumer-agent:** Represents the user. It holds policy settings (max spend per day) and communicates with the provider.
3.  **provider-agent:** Represents the publisher. It hosts content behind an **X402** paywall, generates quotes, and validates payment receipts and once validates provides urls for ad-free content.
4.  **payment-orchestrator:** The bridge. It mocks a **Mastercard** authorization check and settles the actual value transfer on the **BSV Blockchain**


---

## 📦 Project Structure

```bash
/
├── consumer-agent/       # Node.js service acting as the buyer
├── provider-agent/       # Node.js service acting as the seller (hosts articles)
├── payment-orchestrator/ # Node.js service handling Mastercard Mock + BSV SDK
├── frontend/             # React 19 + Vite + Tailwind + shadcn/ui application
```

---

## 🛠 Tech Stack

*   **Frontend:** React, Vite, TypeScript, TailwindCSS v4, Framer Motion, Lucide Icons.
*   **Backend:** Node.js (Express).
*   **Blockchain:** `@bsv/sdk` for transaction building, Whatsonchain API for broadcasting.
*   **Protocol:** Custom X402 implementation (Payment Request/Receipt headers).
*   **Cryptography:** HMAC-SHA256 for receipt signing, ECDSA for blockchain signatures.

---

## ⚡ Quick Start

### 1. Prerequisites
*   Node.js (v18+)
*   NPM

### 2. Installation
Install dependencies for all microservices and the frontend.

```bash
# In the root directory
npm install

# Install frontend specific dependencies
cd frontend
npm install
cd ..
# Install agent-specific dependencies
cd consumer-agent
npm install
cd ..
cd provider-agent
npm install
cd ..
cd payment-orchestrator
npm install
cd ..
```

### 3. Configuration
The **Payment Orchestrator** needs a BSV Private Key (WIF) to send transactions.
1.  Navigate to `payment-orchestrator/`.
2.  Create a `.wif` file containing a BSV Mainnet private key with a small balance (~$0.01 is enough for testing).
    *   *Note: If no file is found, the system will generate a random key on startup, but you will need to fund the address shown in the console.
	If you would like us to fund your address or send a pre-funded address, send a message on telegram.*


### 4. Run the System
You can start all services (Consumer, Provider, Orchestrator, Frontend) with a single command:

```bash
npm run start:all
```

*   **Frontend:** [http://localhost:5173](http://localhost:5173) (or the port Vite assigns)
*   **Consumer API:** http://localhost:4001
*   **Provider API:** http://localhost:4002
*   **Orchestrator API:** http://localhost:4003

---

## 🧪 Demo Guide

1.  **Open the Frontend.** You will see the landing page.
2. **Press "Call Provider Service"** to watch the logs of a live x402 interaction in the console.
2.  **Scroll to "Use Case" (Journalism).** You are presented with a mocked newspaper, "El Munde".
3.  **The Unfunded Experience:**
    *   Click an article.
    *   Since your wallet is empty, a **Paywall Modal** appears.
    *   You can choose "View with Ads" (simulates an annoying experience) or "Unlock".
4.  **Fund Your Wallet:**
    *   Open the **Settings** (Gear icon in the browser bar).
    *   "Link Mastercard": Enter mock details to simulate funding your wallet via cashback.
5.  **The Agentic Experience:**
    *   Go back to the newspaper.
    *   Click a locked article.
    *   **Magic:** The Consumer Agent detects funds, negotiates with the Provider, pays via BSV, and unlocks the content **instantly**. No popups, no ads.
6.  **Dashboard View:**
    *   Click "Dashboard" in the nav to see the "Under the Hood" visualization.
    *   Click "Call Provider Service" to watch the raw JSON logs and step-by-step X402 flow between agents.

---

## 🧩 Key Components

### X402 Message Format

**Payment Request (from Provider):**
```json
{
  "request_id": "quote-173298123",
  "price": 0.001,
  "currency": "BSV",
  "x402_payment_request": {
    "pay_to": "1Address...",
    "amount_sats": 1000,
    "facilitator": { "pay_endpoint": "http://orchestrator..." }
  }
}
```

**Payment Receipt (from Orchestrator):**
```json
{
  "request_id": "quote-173298123",
  "txid": "7832049...bsv_tx_hash",
  "amount": 0.001,
  "signature": "hmac_signature_verifying_authenticity"
}
```

---

## 👥 The Team

*   **Augustin Bethery de La Brosse** - Fullstack Developer
*   **Alex Michael Espinosa Males** - Fullstack Developer
*   **Fabricio López Reyes** - Fullstack Developer & Business
*   **Sam Cowan** - Fullstack Developer & Data Scientist

---

## 📜 License

MIT License. Built for the 2025 Hackathon.

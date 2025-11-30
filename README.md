# Agentic Micropayments Using X402 + Mastercard (Mock) + BSV

This project demonstrates **autonomous agent-to-agent micropayments** using:

- **X402-style payment requests & receipts**
- **Mastercard rails (simulated auth service)**
- **BSV (testnet) micropayment settlement**
- **Two autonomous agents** exchanging services end-to-end

Built in < 20 hours for a hackathon.  
The goal: show how devices, bots, or AI services can **negotiate, pay, and deliver services automatically**.

---

## 🧠 High-level Flow

[ Consumer Agent ] –(service request)–> [ Provider Agent ]
[ Provider Agent ] –(price + X402 req)–> [ Consumer Agent ]
[ Consumer Agent ] –(pay())———––> [ Payment Orchestrator ]
|—––> [ Mastercard Auth Mock ]
|—––> [ BSV Adapter (testnet) ]
[ Consumer Agent ] <––(receipt)——— [ Payment Orchestrator ]
[ Consumer Agent ] –(execute + receipt)-> [ Provider Agent ]
[ Provider Agent ] –(result)————> [ Consumer Agent ]

---

## 🎯 Key Components

### 1. Consumer Agent (Service A)
- Initiates service requests.
- Requests quote from Provider Agent.
- Triggers payment through the Payment Orchestrator.
- Calls Provider again with the payment receipt to get the final service output.

### 2. Provider Agent (Service B)
- Offers a service (e.g., compute, data, API response).
- Issues a **price** + **X402 payment request**.
- Waits for a valid X402-style receipt before executing the service.

### 3. Payment Orchestrator
Handles the full payment pipeline:
1. Calls Mastercard mock to “authorize”.
2. Sends micropayment through BSV Adapter.
3. Returns an **X402 payment receipt** to Consumer Agent.

### 4. Mastercard Mock Service
Simulates:
- Card authorization
- Amount validation
- Replying with a simple `{ status: "APPROVED" }`

### 5. BSV Adapter (testnet)
Wraps minimal blockchain actions:
- `sendPayment(to, amount) → txid`
- `checkPayment(txid) → confirmed/not`

---

## 📦 Project Structure

/consumer-agent/
index.js
routes/

/provider-agent/
index.js
routes/

/payment-orchestrator/
orchestrator.js
mastercard-mock.js
bsv-adapter.js

/ui/
index.html (or React app)

README.md

---

## 🧪 Demo Steps

1. **Start all services**
   ```bash
   npm install
   npm run start:all

(Or run each service in its own terminal.)
	2.	Open the demo UI

http://localhost:3000


	3.	Click “Call Provider Service”.
	4.	Watch logs appear:
	•	Request created
	•	Provider returned price
	•	Mastercard mock AUTH APPROVED
	•	BSV payment sent (txid shown)
	•	X402 receipt generated
	•	Provider executed service
	•	Final result shown

This simulates a complete autonomous micro-transaction loop.

⸻

🧩 X402 Message Formats

Payment Request (from Provider)

{
  "request_id": "abc123",
  "price": 0.001,
  "currency": "BSV",
  "x402_payment_request": "x402://provider/abc123"
}

Payment Receipt (from Orchestrator)

{
  "request_id": "abc123",
  "txid": "bsv-testnet-txid",
  "amount": 0.001,
  "payer_agent_id": "consumer-1",
  "payee_agent_id": "provider-1",
  "signature": "mock-signature"
}


⸻

🚀 Why This Matters

The world is moving toward agentic economies where:
	•	AI models
	•	IoT devices
	•	Bots
	•	Smart services

…autonomously buy and sell services.

This prototype shows:
	•	Smart conditions
	•	Verified digital identity
	•	Micropayments at machine scale
	•	Trusted rails combined with blockchain settlement

⸻

🛠 Tech Stack
	•	Node.js (Express)
	•	HTML/JS frontend (or React)
	•	BSV testnet SDK
	•	Lightweight crypto signing
	•	Docker (optional)

⸻

🏆 Hackathon Talking Points
	1.	“Autonomous agents can now trustlessly transact.”
	2.	“Mastercard’s rails provide validation + identity, while BSV provides micropayment scalability.”
	3.	“X402 is the glue between negotiation, payment, and proof.”
	4.	“This demo can scale to millions of machine-to-machine payments per second.”

⸻

📜 License

MIT.

⸻

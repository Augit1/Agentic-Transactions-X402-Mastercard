// payment-orchestrator/orchestrator.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const crypto = require("crypto");
const mastercard = require("./mastercard-mock");
const bsv = require("./bsv-adapter");

// In-memory event log for traceability
const events = [];

// Article hash mapping: ads hash -> premium hash
// This resolves ad-supported article hashes to their premium counterparts after payment
const ARTICLE_HASH_MAP = {
  'x4k9m2p7q3w1': 'a7f3e2b1c9d8', // Article 1: ads -> premium
  'y5l0n3r8s4v2': 'b8c4d5e6f7a2', // Article 2: ads -> premium
  'z6m1o4t9u5w3': 'c9d5e6f7g8b3', // Article 3: ads -> premium
  'a7n2p5v0x6y4': 'd0e6f7g8h9c4', // Article 4: ads -> premium
};

// Shared secret for signing receipts
const SIGNING_SECRET = process.env.ORCH_SIGNING_SECRET || "dev-signing-secret";

// Helper: compute HMAC over core receipt fields
function signReceipt(payload) {
  const base = [
    payload.txid,
    payload.amount,
    payload.currency,
    payload.payer_agent_id,
    payload.payee_agent_id
  ].join("|");

  return crypto
    .createHmac("sha256", SIGNING_SECRET)
    .update(base)
    .digest("hex");
}

// POST /pay
async function pay(req, res) {
  try {
    const {
      amount,
      currency = "BSV",
      pay_to,
      x402_payment_request,
      payer_agent_id = "consumer-1",
      payee_agent_id = "provider-1",
      article_hash // Optional: ads hash to resolve to premium hash
    } = req.body;

    console.log("Received payment request:", x402_payment_request);
    console.log("Paying to BSV address:", pay_to);
    if (article_hash) {
      console.log("Article hash received:", article_hash);
    }

    // Get destination address from pay_to or fall back to x402_payment_request.pay_to
    const destinationAddress = pay_to || (x402_payment_request && x402_payment_request.pay_to);
    
    if (!destinationAddress) {
      return res.status(400).json({ error: "Missing pay_to address" });
    }
    
    console.log("Using destination address:", destinationAddress);

    // 1. Mastercard (mock) authorization
    const auth = mastercard.authorize(amount);
    if (auth.status !== "APPROVED") {
      const error = { error: "Authorization failed" };

      events.push({
        type: "AUTH_FAIL",
        request: x402_payment_request,
        amount,
        timestamp: new Date().toISOString(),
        details: error
      });

      return res.status(403).json(error);
    }

    // 2. BSV micropayment via SDK (async)
    const payment = await bsv.sendPayment(destinationAddress, amount);
    // payment: { txid }

    // 3. Build X402 receipt and SIGN it
    const receipt = {
      txid: payment.txid,
      amount,
      currency,
      payer_agent_id,
      payee_agent_id,
      status: "PAID"
    };

    // If an article hash was provided, resolve it to the premium hash
    if (article_hash && ARTICLE_HASH_MAP[article_hash]) {
      receipt.premium_hash = ARTICLE_HASH_MAP[article_hash];
      console.log("Resolved premium hash:", receipt.premium_hash);
    }

    receipt.signature = signReceipt(receipt);

    // 4. Traceability
    events.push({
      type: "PAYMENT",
      request: x402_payment_request,
      receipt,
      timestamp: new Date().toISOString()
    });

    return res.json(receipt);
  } catch (e) {
    console.error("Error in /pay:", e);
    return res.status(500).json({ error: "Payment failed", details: e.message });
  }
}

// POST /verify
async function verify(req, res) {
  const {
    txid,
    requireConfirmed = false,
    expected_address,
    min_satoshis
  } = req.body;

  try {
    const valid = await bsv.checkPayment(txid, {
      requireConfirmed: !!requireConfirmed,
      expectedAddress: expected_address,
      minSatoshis: typeof min_satoshis === "number" ? min_satoshis : undefined
    });

    return res.json({ valid });
  } catch (err) {
    console.error("Error verifying payment:", err);
    return res.status(500).json({
      error: "Could not verify payment"
    });
  }
}

// GET /log
function log(req, res) {
  return res.json(events);
}

module.exports = {
  pay,
  verify,
  log
};

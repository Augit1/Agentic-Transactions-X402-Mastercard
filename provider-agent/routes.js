// provider-agent/routes.js
const express = require("express");
const axios = require("axios");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const runService = require("./serviceLogic");
const providerConfig = require(path.join(__dirname, "config/provider.json"));

const router = express.Router();
const ORCH_URL = "http://localhost:4003";

const REQUIRE_CONFIRMED = process.env.REQUIRE_CONFIRMED === "true";
const SIGNING_SECRET = process.env.ORCH_SIGNING_SECRET || "dev-signing-secret";

// Recompute HMAC and compare
function verifyReceiptSignature(receipt) {
  const base = [
    receipt.txid,
    receipt.amount,
    receipt.currency,
    receipt.payer_agent_id,
    receipt.payee_agent_id
  ].join("|");

  const expected = crypto
    .createHmac("sha256", SIGNING_SECRET)
    .update(base)
    .digest("hex");

  return receipt.signature === expected;
}

// POST /quote - Get a price quote for an article
router.post("/quote", (req, res) => {
  try {
    const { articleId } = req.body;
    const request_id = `quote-${Date.now()}-${articleId || 'unknown'}`;
    const priceSats = providerConfig.default_price_sats;
    
    const quote = {
      request_id,
      articleId,
      price: priceSats / 1e8, // Convert sats to BSV for display
      price_sats: priceSats,
      currency: providerConfig.currency,
      pay_to: providerConfig.pay_to_address,
      expiry: Date.now() + 5 * 60 * 1000, // 5 minutes
      x402_payment_request: {
        version: "x402-1.0",
        request_id,
        amount_sats: priceSats,
        amount_bsv: priceSats / 1e8,
        currency: providerConfig.currency,
        network: providerConfig.network,
        pay_to: providerConfig.pay_to_address,
        facilitator: {
          pay_endpoint: `${ORCH_URL}/pay`,
          verify_endpoint: `${ORCH_URL}/verify`
        }
      }
    };

    console.log("Quote generated:", quote);
    return res.json(quote);
  } catch (e) {
    console.error("Error in /quote:", e);
    return res.status(500).json({ error: "Could not generate quote" });
  }
});

// POST /execute (X402-style)
router.post("/execute", async (req, res) => {
  try {
    const paymentHeader = req.headers["x-payment"];
    const { payment_receipt } = req.body || {};
    const request_id = (req.body && req.body.request_id) || Date.now().toString();

    // 1) If no payment → return 402 with PaymentRequirements
    if (!paymentHeader && !payment_receipt) {
      const priceSats = providerConfig.default_price_sats;

      const paymentRequirements = {
        version: "x402-1.0",
        request_id,
        amount_sats: priceSats,
        amount_bsv: priceSats / 1e8,
        currency: providerConfig.currency,
        network: providerConfig.network,
        pay_to: providerConfig.pay_to_address,
        expiry: Date.now() + 5 * 60 * 1000,
        facilitator: {
          pay_endpoint: `${ORCH_URL}/pay`,
          verify_endpoint: `${ORCH_URL}/verify`
        }
      };

      return res.status(402).json(paymentRequirements);
    }

    // 2) Parse payment (from header or body)
    let parsedPayment = payment_receipt;
    if (paymentHeader && typeof paymentHeader === "string") {
      try {
        parsedPayment = JSON.parse(paymentHeader);
      } catch (e) {
        console.error("Could not parse X-PAYMENT header as JSON:", e);
      }
    }

    if (!parsedPayment || !parsedPayment.txid) {
      return res.status(400).json({ error: "Invalid or missing payment receipt" });
    }

    // 3) Verify cryptographic signature from orchestrator
    if (!verifyReceiptSignature(parsedPayment)) {
      return res.status(403).json({ error: "Invalid payment receipt signature" });
    }

    // 4) Verify on-chain via orchestrator:
    //    - tx exists
    //    - (optional) confirmed
    //    - pays providerConfig.pay_to_address with >= default_price_sats
    const verifyRes = await axios.post(`${ORCH_URL}/verify`, {
      txid: parsedPayment.txid,
      requireConfirmed: REQUIRE_CONFIRMED,
      expected_address: providerConfig.pay_to_address,
      min_satoshis: providerConfig.default_price_sats
    });

    if (!verifyRes.data || verifyRes.data.valid !== true) {
      return res.status(403).json({ error: "Payment not valid or not confirmed" });
    }

    // 5) All checks passed → run the paid service
    const result = runService(request_id, parsedPayment);
    return res.json(result);
  } catch (e) {
    console.error("Error in /execute:", e);
    return res.status(500).json({ error: "Could not verify payment" });
  }
});

module.exports = router;

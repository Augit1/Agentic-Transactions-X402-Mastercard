// provider-agent/routes.js
const express = require("express");
const axios = require("axios");
const runService = require("./serviceLogic");

const router = express.Router();
const ORCH_URL = "http://localhost:4003";

// You can also put this in .env for flexibility
const SERVICE_PRICE_BSV = 0.000001; // 100 sats
const PROVIDER_BSV_ADDRESS =
  process.env.PROVIDER_BSV_ADDRESS || "12294K3WwhespS9V2HAPCJUMTLppgjg3Mu";

// ---------- POST /quote (helper, not strictly required by x402) ----------
router.post("/quote", (req, res) => {
  const request_id = Date.now().toString();

  res.json({
    request_id,
    price: SERVICE_PRICE_BSV,
    currency: "BSV",
    x402_payment_request: `x402://provider/${request_id}`,
    payment_terms: {
      unit: "per_request",
      network: "bsv-mainnet",
      settlement: "onchain",
      pay_to: PROVIDER_BSV_ADDRESS,
      expiry: Date.now() + 5 * 60 * 1000, // 5 minutes
    },
  });
});

// ---------- POST /execute (x402-style protected resource) ----------
router.post("/execute", async (req, res) => {
  try {
    let { request_id, payment_receipt } = req.body;

    // Allow provider to generate a request_id if missing
    if (!request_id) {
      request_id = Date.now().toString();
    }

    // Try to parse X-PAYMENT header (base64-encoded JSON)
    let headerPayment = null;
    const xPaymentHeader =
      req.header("X-PAYMENT") || req.header("x-payment") || null;

    if (xPaymentHeader) {
      try {
        const decoded = Buffer.from(xPaymentHeader, "base64").toString("utf8");
        headerPayment = JSON.parse(decoded);
        // If body payment_receipt is missing, derive from header
        if (!payment_receipt && headerPayment.txid) {
          payment_receipt = {
            txid: headerPayment.txid,
            amount: headerPayment.amount,
            payer_agent_id: headerPayment.from || "consumer-1",
            payee_agent_id: headerPayment.to || "provider-1",
            signature: headerPayment.signature || "header-signature",
            status: "PAID",
          };
        }
      } catch (e) {
        console.warn("Could not parse X-PAYMENT header:", e.message);
      }
    }

    // ---------- CASE 1: No payment yet → respond with 402 + PaymentRequirements ----------
    if (!payment_receipt || !payment_receipt.txid) {
      const satoshisRequired = Math.round(SERVICE_PRICE_BSV * 1e8);

      const paymentRequirements = {
        version: "x402-1.0",
        request_id,
        amount_sats: satoshisRequired,
        amount_bsv: SERVICE_PRICE_BSV,
        currency: "BSV",
        network: "bsv-mainnet",
        pay_to: PROVIDER_BSV_ADDRESS,
        expiry: Date.now() + 5 * 60 * 1000,
        // In this architecture, the orchestrator is effectively the "facilitator"
        facilitator: {
          pay_endpoint: `${ORCH_URL}/pay`,
          verify_endpoint: `${ORCH_URL}/verify`,
        },
      };

      // Real HTTP 402 Payment Required + PaymentRequirements body
      res.status(402);
      return res.json({
        error: "ERR_PAYMENT_REQUIRED",
        paymentRequirements,
      });
    }

    // ---------- CASE 2: We have a payment receipt → verify it ----------
    const verifyRes = await axios.post(`${ORCH_URL}/verify`, {
      txid: payment_receipt.txid,
      requireConfirmed: false, // or true if you want confirmed-only
    });

    if (!verifyRes.data || verifyRes.data.valid !== true) {
      return res
        .status(403)
        .json({ error: "Payment not valid or not confirmed" });
    }

    // ---------- Payment verified → run the service ----------
    const result = runService(request_id, payment_receipt);

    return res.json(result);
  } catch (e) {
    console.error("Error in /execute:", e);
    return res.status(500).json({ error: "Could not verify payment" });
  }
});

module.exports = router;

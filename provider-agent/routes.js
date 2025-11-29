// provider-agent/routes.js
const express = require("express");
const axios = require("axios");
const runService = require("./serviceLogic");

const router = express.Router();
const ORCH_URL = "http://localhost:4003";

// POST /quote
router.post("/quote", (req, res) => {
  const request_id = Date.now().toString();

  res.json({
    request_id,
    price: 0.000001,
    currency: "BSV",
    x402_payment_request: `x402://provider/${request_id}`,
    payment_terms: {
      unit: "per_request",
      network: "bsv-mainnet",
      settlement: "onchain",
      expiry: Date.now() + 5 * 60 * 1000 // quote valid 5 minutes
    }
  });
});

// POST /execute
router.post("/execute", async (req, res) => {
  try {
    const { request_id, payment_receipt } = req.body;

    if (!payment_receipt || !payment_receipt.txid) {
      return res.status(400).json({ error: "Invalid or missing payment receipt" });
    }

    // Call orchestrator to verify
    const verifyRes = await axios.post(`${ORCH_URL}/verify`, {
      txid: payment_receipt.txid,
      requireConfirmed: false // or true if you want to require confirmations
    });

    if (!verifyRes.data || verifyRes.data.valid !== true) {
      return res.status(403).json({ error: "Payment not valid or not confirmed" });
    }

    const result = runService(request_id, payment_receipt);
    return res.json(result);
  } catch (e) {
    console.error("Error in /execute:", e);
    return res.status(500).json({ error: "Could not verify payment" });
  }
});

module.exports = router;

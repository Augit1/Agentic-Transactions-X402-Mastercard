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
    price: 0.000001, // 100 sats
    currency: "BSV",
    x402_payment_request: `x402://provider/${request_id}`
  });
});

// POST /execute
router.post("/execute", async (req, res) => {
  try {
    const { request_id, payment_receipt } = req.body;

    if (!payment_receipt || !payment_receipt.txid) {
      return res.status(400).json({ error: "Invalid or missing payment receipt" });
    }

    // Ask the orchestrator to verify the tx (on-chain verification placeholder)
    const verifyRes = await axios.post(`${ORCH_URL}/verify`, {
      txid: payment_receipt.txid
    });

    if (!verifyRes.data || verifyRes.data.valid !== true) {
      return res.status(403).json({ error: "Payment not valid or not confirmed" });
    }

    // Now call the actual service logic
    const result = runService(request_id, payment_receipt);
    return res.json(result);
  } catch (e) {
    console.error("Error in /execute:", e);
    return res.status(500).json({ error: "Could not verify payment" });
  }
});

module.exports = router;

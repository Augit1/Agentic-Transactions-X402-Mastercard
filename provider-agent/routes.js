// provider-agent/routes.js
const express = require("express");
const axios = require("axios");
const path = require("path");
const runService = require("./serviceLogic");

// Load provider config from JSON
const providerConfig = require(path.join(__dirname, "config/provider.json"));

const router = express.Router();
const ORCH_URL = "http://localhost:4003";
const REQUIRE_CONFIRMED = process.env.REQUIRE_CONFIRMED === "true";

// POST /execute (X402-style)
router.post("/execute", async (req, res) => {
  try {
    const paymentHeader = req.headers["x-payment"];
    const { payment_receipt } = req.body || {};
    const request_id = (req.body && req.body.request_id) || Date.now().toString();

    // 1) If no payment header or receipt → send 402 with PaymentRequirements
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

      // X402: respond with 402 + PaymentRequirements
      return res.status(402).json(paymentRequirements);
    }

    // 2) If payment header is present, parse it
    let parsedPayment = payment_receipt;
    if (paymentHeader && typeof paymentHeader === "string") {
      try {
        parsedPayment = JSON.parse(paymentHeader);
      } catch (e) {
        console.error("Could not parse X-PAYMENT header as JSON:", e);
      }
    }

    if (!parsedPayment || !parsedPayment.txid) {
      return res.status(400).json({
        error: "Invalid or missing payment receipt"
      });
    }

    // 3) Verify on-chain via orchestrator
    const verifyRes = await axios.post(`${ORCH_URL}/verify`, {
      txid: parsedPayment.txid,
      requireConfirmed: REQUIRE_CONFIRMED
    });

    if (!verifyRes.data || verifyRes.data.valid !== true) {
      return res.status(403).json({ error: "Payment not valid or not confirmed" });
    }

    // 4) Payment valid → run service
    const result = runService(request_id, parsedPayment);
    return res.json(result);
  } catch (e) {
    console.error("Error in /execute:", e);
    return res.status(500).json({ error: "Could not verify payment" });
  }
});

module.exports = router;

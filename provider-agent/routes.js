const express = require("express");
const router = express.Router();
const service = require("./serviceLogic");

// Quote endpoint
router.post("/quote", (req, res) => {
  const request_id = Date.now().toString();

  res.json({
    request_id,
    price: 0.001,
    currency: "BSV",
    x402_payment_request: `x402://provider/${request_id}`
  });
});

// Execute endpoint
router.post("/execute", (req, res) => {
  const { payment_receipt } = req.body;

  if (!payment_receipt || !payment_receipt.txid) {
    return res.status(400).json({ error: "Invalid or missing receipt" });
  }

  const result = service.runService();
  res.json(result);
});

module.exports = router;

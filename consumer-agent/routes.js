// consumer-agent/routes.js
const express = require("express");
const router = express.Router();
const serviceClient = require("./serviceClient");

router.post("/call-service", async (req, res) => {
  try {
    const session = await serviceClient.callService();
    res.json(session); // { quote, payment, result }
  } catch (e) {
    console.error("Error in /call-service:", e);
    res.status(500).json({ error: "Service call failed", details: e.message });
  }
});

module.exports = router;

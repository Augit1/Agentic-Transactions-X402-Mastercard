const express = require("express");
const router = express.Router();
const client = require("./serviceClient");

router.post("/call-service", async (req, res) => {
  try {
    const result = await client.callService();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Service failed" });
  }
});

module.exports = router;

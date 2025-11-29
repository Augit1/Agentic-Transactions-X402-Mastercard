const mastercard = require("./mastercard-mock");
const bsv = require("./bsv-adapter");

module.exports = {
  pay: async (req, res) => {
    const { amount, x402_payment_request } = req.body;

    console.log("Received payment request:", x402_payment_request);

    // 1. Mastercard mock authorization
    const auth = mastercard.authorize(amount);
    if (auth.status !== "APPROVED") {
      return res.status(403).json({ error: "Authorization failed" });
    }

    // 2. BSV payment (mock or real testnet transaction)
    const payment = bsv.sendPayment("provider-address", amount);

    // 3. Build X402-style receipt
    const receipt = {
      txid: payment.txid,
      amount,
      signature: "mock-signature",
      status: "PAID"
    };

    res.json(receipt);
  },

  verify: (req, res) => {
    const { txid } = req.body;
    const valid = bsv.checkPayment(txid);

    res.json({ valid });
  }
};

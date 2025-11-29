const mastercard = require("./mastercard-mock");
const bsv = require("./bsv-adapter");

// In-memory event log for traceability 
const events = [];

// POST /pay
async function pay(req, res) {
  const {
    amount,
    x402_payment_request,
    payer_agent_id = "consumer-1",
    payee_agent_id = "provider-1"
  } = req.body;

  console.log("Received payment request:", x402_payment_request);

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

  // 2. BSV (mock) micropayment
  const payment = bsv.sendPayment("provider-address", amount);

  // 3. X402-style payment receipt
  const receipt = {
    txid: payment.txid,
    amount,
    payer_agent_id,
    payee_agent_id,
    signature: "mock-signature",
    status: "PAID"
  };

  // 4. Traceability: store the event
  events.push({
    type: "PAYMENT",
    request: x402_payment_request,
    receipt,
    timestamp: new Date().toISOString()
  });

  return res.json(receipt);
}

// POST /verify
function verify(req, res) {
  const { txid } = req.body;
  const valid = bsv.checkPayment(txid);

  return res.json({ valid });
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

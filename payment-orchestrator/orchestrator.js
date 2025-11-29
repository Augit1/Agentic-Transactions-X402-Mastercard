// payment-orchestrator/orchestrator.js
const mastercard = require("./mastercard-mock");
const bsv = require("./bsv-adapter");

// In-memory event log for traceability 
const events = [];

// POST /pay
async function pay(req, res) {
  try {
    const {
      amount,
      currency = "BSV",
      pay_to,
      x402_payment_request,
      payer_agent_id = "consumer-1",
      payee_agent_id = "provider-1",
    } = req.body;

    console.log("Received payment request:", x402_payment_request);

    // 0. Sanity checks on x402 info
    if (currency !== "BSV") {
      return res.status(400).json({
        error: "Unsupported currency",
        details: `Only BSV is supported by this orchestrator (received: ${currency})`,
      });
    }

    const destinationAddress =
      pay_to || "12294K3WwhespS9V2HAPCJUMTLppgjg3Mu"; // fallback for safety / demo

    console.log("Paying to BSV address:", destinationAddress);

    // 1. Mastercard (mock) authorization
    const auth = mastercard.authorize(amount);
    if (auth.status !== "APPROVED") {
      const error = { error: "Authorization failed" };

      events.push({
        type: "AUTH_FAIL",
        request: x402_payment_request,
        amount,
        timestamp: new Date().toISOString(),
        details: error,
      });

      return res.status(403).json(error);
    }

    // 2. BSV micropayment via SDK (async)
    const payment = await bsv.sendPayment(destinationAddress, amount);
    // payment should be { txid }

    // 3. X402-style receipt
    const receipt = {
      txid: payment.txid,
      amount,
      currency,
      payer_agent_id,
      payee_agent_id,
      signature: "mock-signature",
      status: "PAID",
    };

    // 4. Traceability
    events.push({
      type: "PAYMENT",
      request: x402_payment_request,
      receipt,
      timestamp: new Date().toISOString(),
    });

    return res.json(receipt);
  } catch (e) {
    console.error("Error in /pay:", e);
    return res
      .status(500)
      .json({ error: "Payment failed", details: e.message });
  }
}

// POST /verify
async function verify(req, res) {
  const { txid, requireConfirmed = false } = req.body;

  try {
    const valid = await bsv.checkPayment(txid, !!requireConfirmed);
    return res.json({ valid });
  } catch (err) {
    console.error("Error verifying payment:", err);
    return res.status(500).json({
      error: "Could not verify payment",
    });
  }
}

// GET /log
function log(req, res) {
  return res.json(events);
}

module.exports = {
  pay,
  verify,
  log,
};

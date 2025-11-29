// provider-agent/serviceLogic.js

// Simple "service" that returns a nice payload for the demo
function runService(request_id, payment_receipt) {
  return {
    message: "Service executed successfully ✅",
    purchased_resource: "premium_agentic_service",
    request_id,
    payment_txid: payment_receipt.txid,
    paid_amount_bsv: payment_receipt.amount,
    timestamp: new Date().toISOString(),
    data: {
      description: "This response is unlocked only after a successful on-chain BSV payment.",
      joke: "Why did the agent call the orchestrator? To make a micro-transaction for a macro-impact. 🤖💳"
    }
  };
}

module.exports = runService;

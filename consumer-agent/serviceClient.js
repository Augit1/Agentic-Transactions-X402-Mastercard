const axios = require("axios");

const PROVIDER_URL = "http://localhost:4002";
const ORCH_URL = "http://localhost:4003";

// Simple "policy" for the consumer agent
const MAX_PRICE = 0.002;

module.exports = {
  callService: async () => {
    // 1. Ask Provider for quote
    const quoteRes = await axios.post(`${PROVIDER_URL}/quote`);
    const quote = quoteRes.data;

    // 2. Smart condition: refuse if too expensive
    if (quote.price > MAX_PRICE) {
      return {
        quote,
        error: `Price too high for this agent (max: ${MAX_PRICE} BSV)`
      };
    }

    // 3. Pay through Orchestrator
    const payRes = await axios.post(`${ORCH_URL}/pay`, {
      x402_payment_request: quote.x402_payment_request,
      amount: quote.price,
      payer_agent_id: "consumer-1",
      payee_agent_id: "provider-1"
    });

    const payment = payRes.data;

    if (payment.error) {
      // e.g. authorization failed
      return {
        quote,
        payment
      };
    }

    // 4. Call Provider execute using receipt
    const execRes = await axios.post(`${PROVIDER_URL}/execute`, {
      request_id: quote.request_id,
      payment_receipt: payment
    });

    const result = execRes.data;

    // 5. Return the full story to the UI
    return {
      quote,
      payment,
      result
    };
  }
};

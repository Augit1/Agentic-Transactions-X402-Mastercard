const axios = require("axios");

const PROVIDER_URL = "http://localhost:4002";
const ORCH_URL = "http://localhost:4003";

module.exports = {
  callService: async () => {
    // 1. Ask Provider for quote
    const quoteRes = await axios.post(`${PROVIDER_URL}/quote`);
    const quote = quoteRes.data;

    // 2. Pay through Orchestrator
    const payRes = await axios.post(`${ORCH_URL}/pay`, {
      x402_payment_request: quote.x402_payment_request,
      amount: quote.price
    });

    const receipt = payRes.data;

    // 3. Call Provider execute using receipt
    const execRes = await axios.post(`${PROVIDER_URL}/execute`, {
      request_id: quote.request_id,
      payment_receipt: receipt
    });

    return {
      quote,
      payment: receipt,
      result: execRes.data
    };
  }
};

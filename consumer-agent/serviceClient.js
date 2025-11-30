// consumer-agent/serviceClient.js
const axios = require("axios");
const path = require("path");

// Load consumer policy/config
const consumerConfig = require(path.join(__dirname, "config/consumer.json"));

const PROVIDER_URL = "http://localhost:4002";
const ORCH_URL = "http://localhost:4003";

// IDs from env or JSON
const CONSUMER_ID = process.env.CONSUMER_ID || consumerConfig.id;
const PROVIDER_ID = process.env.PROVIDER_ID || "provider-1";

async function callService() {
  console.log("\nINFO: Calling service...");

  // 1) First attempt: call /execute without payment → expect 402
  let quoteRes;
  try {
    quoteRes = await axios.post(`${PROVIDER_URL}/execute`, {});
  } catch (e) {
    if (e.response && e.response.status === 402) {
      quoteRes = e.response;
    } else {
      console.error("Error calling provider /execute:", e.message || e);
      throw e;
    }
  }

  const paymentRequirements = quoteRes.data;
  console.log("\nQUOTE (PaymentRequirements from 402):");
  console.log(JSON.stringify(paymentRequirements, null, 2));

  const {
    request_id,
    amount_sats,
    amount_bsv,
    currency,
    network,
    pay_to
  } = paymentRequirements;

  const priceSats = amount_sats;

  // 2) Apply consumer policy from consumer.json
  if (!consumerConfig.allowed_currencies.includes(currency)) {
    throw new Error(`Currency ${currency} is not allowed by consumer policy`);
  }

  if (!consumerConfig.allowed_networks.includes(network)) {
    throw new Error(`Network ${network} is not allowed by consumer policy`);
  }

  if (priceSats > consumerConfig.max_price_sats) {
    throw new Error(
      `Price ${priceSats} sats exceeds consumer max limit of ${consumerConfig.max_price_sats} sats`
    );
  }

  if (!consumerConfig.auto_pay) {
    throw new Error(
      "auto_pay is disabled in consumer config – manual approval flow not implemented in this MVP"
    );
  }

  // 3) Pay using orchestrator
  const x402_payment_request = `x402://provider/${request_id}`;
  console.log("\nINFO: Paying through orchestrator...");
  console.log(
    `Paying ${amount_bsv} BSV (${priceSats} sats) for request_id=${request_id}`
  );

  const payResponse = await axios.post(`${ORCH_URL}/pay`, {
    x402_payment_request,
    amount: amount_bsv,
    currency,
    pay_to,
    payer_agent_id: CONSUMER_ID,
    payee_agent_id: PROVIDER_ID
  });

  const payment_receipt = payResponse.data;

  console.log("\nPAYMENT RECEIPT:");
  console.log(JSON.stringify(payment_receipt, null, 2));

  // 4) Retry /execute with X-PAYMENT + receipt in body
  console.log("\nINFO: Retrying /execute with X-PAYMENT header...");

  const paymentHeaderValue = JSON.stringify(payment_receipt);

  const execRes = await axios.post(
    `${PROVIDER_URL}/execute`,
    {
      request_id,
      payment_receipt
    },
    {
      headers: {
        "X-PAYMENT": paymentHeaderValue
      }
    }
  );

  const result = execRes.data;

  console.log("\nRESULT (unlocked service):");
  console.log(JSON.stringify(result, null, 2));

  // This is what your UI returns to the browser
  return {
    quote: paymentRequirements,
    payment: payment_receipt,
    result
  };
}

module.exports = {
  callService
};

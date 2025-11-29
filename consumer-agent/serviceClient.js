// consumer-agent/serviceClient.js
const axios = require("axios");

const PROVIDER_URL = "http://localhost:4002";
const ORCH_URL = "http://localhost:4003";

async function callService() {
  console.log("\nINFO: Calling service...");

  let request_id = Date.now().toString();
  let paymentRequirements = null;
  let payment_receipt = null;
  let finalResult = null;

  // ---------- 1) First call to the protected resource WITHOUT payment ----------
  try {
    const res = await axios.post(`${PROVIDER_URL}/execute`, {
      request_id,
      // no payment_receipt on purpose → we expect 402
    });

    // If we got 200 here, service is free (no payment required)
    console.log("Service returned 200 without payment (free resource):");
    console.log(JSON.stringify(res.data, null, 2));

    finalResult = res.data;

    return {
      quote: null,
      payment: null,
      result: finalResult,
    };
  } catch (err) {
    if (err.response && err.response.status === 402) {
      const body = err.response.data || {};
      paymentRequirements =
        body.paymentRequirements || body.payment_requirements || null;

      console.log("QUOTE (PaymentRequirements from 402):");
      console.log(JSON.stringify(paymentRequirements, null, 2));
    } else {
      console.error("Unexpected error on first /execute call:", err.message);
      throw err;
    }
  }

  if (!paymentRequirements) {
    throw new Error("Missing paymentRequirements in 402 response");
  }

  // Ensure we keep same request_id as provider
  request_id = paymentRequirements.request_id || request_id;

  // ---------- 2) Pay via orchestrator using the price from PaymentRequirements ----------
  const priceSats = paymentRequirements.amount_sats;
  const amountBsv =
    typeof paymentRequirements.amount_bsv === "number"
      ? paymentRequirements.amount_bsv
      : priceSats / 1e8;

  const x402_payment_request = `x402://provider/${request_id}`;

  console.log("\nINFO: Paying through orchestrator...");
  console.log(
    `Paying ${amountBsv} BSV (${priceSats} sats) for request_id=${request_id}`
  );

  const payResponse = await axios.post(`${ORCH_URL}/pay`, {
    x402_payment_request,
    amount: amountBsv,
	currency: paymentRequirements.currency || "BSV",
	pay_to: paymentRequirements.pay_to,
    payer_agent_id: "consumer-1",
    payee_agent_id: "provider-1",
  });

  payment_receipt = payResponse.data;

  console.log("\nPAYMENT RECEIPT:");
  console.log(JSON.stringify(payment_receipt, null, 2));

  // ---------- 3) Build X-PAYMENT header ----------
  const paymentHeaderPayload = {
    txid: payment_receipt.txid,
    amount: payment_receipt.amount,
    currency: "BSV",
    network: paymentRequirements.network || "bsv-mainnet",
    request_id,
    to: paymentRequirements.pay_to,
    from: payment_receipt.payer_agent_id || "consumer-1",
    signature: payment_receipt.signature || "mock-signature",
    status: payment_receipt.status || "PAID",
  };

  const xPaymentValue = Buffer.from(
    JSON.stringify(paymentHeaderPayload),
    "utf8"
  ).toString("base64");

  // ---------- 4) Retry /execute with payment_receipt + X-PAYMENT ----------
  console.log("\nINFO: Retrying /execute with X-PAYMENT header...");

  const execResponse = await axios.post(
    `${PROVIDER_URL}/execute`,
    {
      request_id,
      payment_receipt,
    },
    {
      headers: {
        "X-PAYMENT": xPaymentValue,
      },
    }
  );

  finalResult = execResponse.data;

  console.log("\nRESULT (unlocked service):");
  console.log(JSON.stringify(finalResult, null, 2));

  return {
    quote: paymentRequirements,
    payment: payment_receipt,
    result: finalResult,
  };
}

module.exports = {
  callService,
};

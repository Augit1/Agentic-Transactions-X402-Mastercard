// provider-agent/serviceLogic.js
const path = require("path");
const providerConfig = require(path.join(__dirname, "config/provider.json"));

function runService(request_id, payment_receipt) {
  return {
    message: "Service unlocked",
    request_id,
    payment_txid: payment_receipt.txid,
    paid_amount_bsv: payment_receipt.amount,
    timestamp: new Date().toISOString(),
    access_url: providerConfig.service_url
  };
}

module.exports = runService;

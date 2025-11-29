// payment-orchestrator/bsv-adapter.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { PrivateKey, P2PKH, Transaction } = require("@bsv/sdk");
const crypto = require("crypto");
const fs = require("fs");
const axios = require("axios");

// Polyfill required by @bsv/sdk when running in Node (CJS)
if (!global.self) {
  global.self = { crypto };
}

// 1) Load WIF
let WIF;
try {
  WIF = fs.readFileSync(path.join(__dirname, ".wif"), "utf8").trim();
} catch (e) {
  console.error("ERROR: .wif file not found in payment-orchestrator/. Add it manually.");
  throw e;
}

// 2) Network / WOC config
const BSV_NETWORK = "main";
const WOC_API_KEY = process.env.WOC_API_KEY || null;
const WOC_BASE = `https://api.whatsonchain.com/v1/bsv/${BSV_NETWORK}`;

function bsvToSats(amountBsv) {
  return Math.round(amountBsv * 1e8);
}

// ------------ helper: HTTP GET to WOC -----------------
async function wocGet(path) {
  const headers = {};
  if (WOC_API_KEY) {
    headers["woc-api-key"] = WOC_API_KEY;
  }

  const url = `${WOC_BASE}${path}`;
  const resp = await axios.get(url, { headers });
  return resp.data;
}

// ------------ helper: fetch UTXOs for our address ------
async function getUtxos(address) {
  const data = await wocGet(`/address/${address}/unspent/all`);
  const all = data.result || [];

  // Only keep UTXOs that are not currently being spent by some mempool tx
  const spendable = all.filter(u => !u.isSpentInMempoolTx);

  return spendable;
}

// ------------ helper: fetch raw tx hex -----------------
async function getTxHex(txid) {
  // GET /tx/<txid>/hex
  const data = await wocGet(`/tx/${txid}/hex`);

  // New WOC returns plain string; some libs expect { hex: "..." }
  if (typeof data === "string") return data;
  if (data && data.hex) return data.hex;

  throw new Error("Unexpected tx hex format from WOC");
}

// ------------------- PUBLIC FUNCTIONS -------------------

// Build + broadcast a BSV tx using latest UTXO(s)
async function sendPayment(toAddress, amountBsv) {
  const privKey = PrivateKey.fromWif(WIF);
  const fromAddress = privKey.toAddress().toString();
  console.log(`BSV SDK: preparing payment of ${amountBsv} BSV from ${fromAddress} to ${toAddress}`);

  const satsToSend = bsvToSats(amountBsv);
  const FEE_BUFFER_SATS = 1000;

  // 1) Load current UTXOs from WOC
  const utxos = await getUtxos(fromAddress);

  if (!utxos || utxos.length === 0) {
    throw new Error(`No UTXOs available for address ${fromAddress}`);
  }

  // sort by biggest value
  const sorted = utxos.sort((a, b) => b.value - a.value);
  const needed = satsToSend + FEE_BUFFER_SATS;

  // WOC returns "value" in satoshis, "tx_hash" as txid, "tx_pos" as vout index
  const utxo = sorted.find(u => u.value >= needed);

  if (!utxo) {
    throw new Error(
      `Not enough balance. Need at least ${needed} sats, but no single UTXO is big enough.`
    );
  }

  console.log("Using UTXO:", utxo);

  const sourceTxHex = await getTxHex(utxo.tx_hash);
  const sourceTransaction = Transaction.fromHex(sourceTxHex);

  const input = {
    sourceTransaction,
    sourceOutputIndex: utxo.tx_pos,
    sequence: 0xffffffff,
    unlockingScriptTemplate: new P2PKH().unlock(privKey)
  };

  // 3) Outputs: provider + change
  const outputs = [
    {
      lockingScript: new P2PKH().lock(toAddress),
      satoshis: satsToSend
    },
    {
      lockingScript: new P2PKH().lock(fromAddress),
      change: true
    }
  ];

  const version = 1;
  const tx = new Transaction(version, [input], outputs);

  // 4) Fee calculation & signing
  await tx.fee();
  await tx.sign();

  const txhex = tx.toHex();

  // 5) Broadcast
  try {
    const headers = {};
    if (WOC_API_KEY) {
      headers["woc-api-key"] = WOC_API_KEY;
    }

    const resp = await axios.post(
      `${WOC_BASE}/tx/raw`,
      { txhex },
      { headers }
    );

    console.log("Broadcast via WOC:", resp.data);
  } catch (err) {
    console.error(
      "Broadcast via WOC FAILED:",
      err.response?.data || err.message
    );
  }

  const txid = tx.id("hex");
  console.log(`BSV SDK: built tx with id=${txid}`);

  return { txid };
}

// Verify a tx actually exists on-chain (very simple version)
async function checkPayment(txid) {
  console.log("BSV SDK: checkPayment called for txid:", txid);
  try {
    await getTxHex(txid); // will throw if tx not found
    // If we get here, WOC knows this tx (mempool or confirmed)
    return true;
  } catch (e) {
    console.error("Error in checkPayment:", e.response?.data || e.message);
    return false;
  }
}

module.exports = {
  sendPayment,
  checkPayment
};

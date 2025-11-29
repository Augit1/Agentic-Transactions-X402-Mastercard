module.exports = {
  sendPayment: (to, amount) => {
    console.log(`Sending mock BSV payment of ${amount} to ${to}`);
    return { txid: "mock-txid-" + Date.now() };
  },

  checkPayment: (txid) => {
    console.log("Checking mock payment for txid:", txid);
    return true; // always valid for demo
  }
};

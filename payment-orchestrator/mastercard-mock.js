let BALANCE = 0.01; // 0.01 BSV budget for demo

module.exports = {
  authorize: (amount) => {
    console.log("Mastercard mock AUTH for amount:", amount);

    if (amount > BALANCE) {
      console.log("Mastercard mock: INSUFFICIENT FUNDS");
      return {
        status: "DECLINED",
        reason: "INSUFFICIENT_FUNDS",
        authorized_amount: 0
      };
    }

    BALANCE -= amount;

    return {
      status: "APPROVED",
      authorized_amount: amount,
      remaining_balance: BALANCE
    };
  }
};

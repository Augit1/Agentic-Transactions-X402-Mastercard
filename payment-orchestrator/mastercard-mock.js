module.exports = {
  authorize: (amount) => {
    console.log("Mastercard mock AUTH for amount:", amount);

    return {
      status: "APPROVED",
      authorized_amount: amount
    };
  }
};

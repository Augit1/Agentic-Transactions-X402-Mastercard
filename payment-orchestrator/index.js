const express = require("express");
const orchestrator = require("./orchestrator");

const app = express();
app.use(express.json());

app.post("/pay", orchestrator.pay);
app.post("/verify", orchestrator.verify);

const PORT = 4003;
app.listen(PORT, () => console.log(`Payment Orchestrator running on port ${PORT}`));

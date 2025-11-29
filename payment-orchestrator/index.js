const express = require("express");
const orchestrator = require("./orchestrator");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = express();
app.use(express.json());

app.post("/pay", orchestrator.pay);
app.post("/verify", orchestrator.verify);

// Show traceability log
app.get("/log", orchestrator.log);

const PORT = 4003;
app.listen(PORT, () => console.log(`Payment Orchestrator running on port ${PORT}`));

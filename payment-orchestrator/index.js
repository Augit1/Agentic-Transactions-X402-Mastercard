const express = require("express");
const cors = require("cors");
const orchestrator = require("./orchestrator");
const path = require("path");
const { createKey2 } = require("./createKey");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = express();
app.use(cors());
app.use(express.json());

app.post("/pay", orchestrator.pay);
app.post("/verify", orchestrator.verify);

// Show traceability log
app.get("/log", orchestrator.log);

app.get("/mastercard", async (req, res) => {
  await createKey2();
  res.send("Mastercard endpoint hit");
});

const PORT = 4003;
app.listen(PORT, () => console.log(`Payment Orchestrator running on port ${PORT}`));

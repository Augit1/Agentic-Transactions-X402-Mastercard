const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", routes);

const PORT = 4002;
app.listen(PORT, () => console.log(`Provider Agent running on port ${PORT}`));
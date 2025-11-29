const express = require("express");
const routes = require("./routes");

const app = express();
app.use(express.json());
app.use("/", routes);

const PORT = 4001;
app.listen(PORT, () => console.log(`Consumer Agent running on port ${PORT}`));

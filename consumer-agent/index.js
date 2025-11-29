const express = require("express");
const path = require("path");
const routes = require("./routes");

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "ui")));

app.use("/", routes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "ui", "index.html"));
})

const PORT = 4001;
app.listen(PORT, () => console.log(`Consumer Agent running on port ${PORT}`));

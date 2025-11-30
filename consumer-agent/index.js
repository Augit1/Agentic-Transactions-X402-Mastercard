const express = require("express");
const path = require("path");
const routes = require("./routes");
const cors = require("cors"); // Instalé Cors porque el navegador no me dejaba acceder 

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", // por el frontend de vite
  methods: ["POST", "GET", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.static(path.join(__dirname, "..", "ui")));

app.use("/", routes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "ui", "index.html"));
})

const PORT = 4001;
app.listen(PORT, () => console.log(`Consumer Agent running on port ${PORT}`));
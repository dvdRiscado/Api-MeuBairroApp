const express = require("express");
const sql = require("mssql");
require("dotenv").config();
const cors = require("cors");

const app = express();

// ✅ CORS habilitado apenas para o front-end local do Expo
app.use(
  cors({
    origin: [
      "http://localhost:19006", // Expo Web
      "http://localhost:8081", // App Web ou outro ambiente local
      "http://192.168.15.48:19006", // se acessar pelo IP
    ],
  })
);

app.use(express.json());

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
  },
};

app.get("/dados", async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query("SELECT * FROM USUARIO");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("API rodando na porta 3000"));

app.use((req, res, next) => {
  console.log("Origem da requisição:", req.headers.origin);
  next();
});

const express = require("express");
const sql = require("mssql");
require("dotenv").config();
const cors = require("cors");

const app = express();

// ✅ CORS habilitado apenas para o front-end local do Expo
app.use(
  cors({
    origin: "*",
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
    trustServerCertificate: true,
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

app.post("/adduser", async (req, res) => {
  const {
    apelido,
    datanasc,
    nome,
    sobrenome,
    descricao,
    email,
    cpf,
    senha,
    fotoperfil,
  } = req.body;

  try {
    await sql.connect(config);

    const lastuser =
      await sql.query`SELECT TOP 1 IdUsuario FROM Usuarios ORDER BY IdUsuario DESC`;

    const result = await sql.query`
      INSERT INTO Usuarios (IdUsuario, Apelido, DataNasc, Nome, Sobrenome, Descricao, Email, CPF, Senha, FotoPerfil)
      VALUES (${
        lastuser.recordset[0].IdUsuario + 1
      }, ${apelido}, ${datanasc}, ${nome}, ${sobrenome}, ${descricao}, ${email}, ${cpf}, ${senha}, ${fotoperfil})`;

    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (err) {
    console.error("Erro ao cadastrar:", err);
    res.status(500).json({ error: "Erro ao cadastrar usuário." });
  }
});

app.listen(3000, () => console.log("API rodando na porta 3000"));

app.use((req, res, next) => {
  console.log("Origem da requisição:", req.headers.origin);
  next();
});

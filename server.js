const express = require("express");
const sql = require("mssql");
require("dotenv").config();
const cors = require("cors");

const app = express();

// Middleware para log de origem da requisição
app.use((req, res, next) => {
  console.log("Origem da requisição:", req.headers.origin);
  next();
});

// Middleware para CORS
app.use(
  cors({
    origin: "*", // Em produção, defina origem específica
  })
);

// Middleware para tratar JSON no corpo da requisição
app.use(express.json());

// Configuração de conexão com SQL Server
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

// Rota GET para listar todos os usuários
app.get("/dados", async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query("SELECT * FROM USUARIO");
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar dados:", err);
    res.status(500).json({ error: err.message });
  }
});

// Rota POST para adicionar um usuário
app.post("/users", async (req, res) => {
  const {
    apelido,
    datanasc,
    nome,
    sobrenome,
    descricao,
    email,
    cpf,
    senha,
    fotoperfil, // base64 ou null
  } = req.body;

  console.log("Recebido /adduser:", req.body);

  try {
    await sql.connect(config);

    // Converter base64 para binário (se não for nulo)
    let bufferImagem = null;
    if (fotoperfil && fotoperfil.startsWith("data:image")) {
      const base64Data = fotoperfil.split(",")[1];
      bufferImagem = Buffer.from(base64Data, "base64");
    }

    await sql.query`
      INSERT INTO USUARIO (
        Apelido, DataNasc, Nome, Sobrenome, Descricao,
        Email, CPF, Senha, FotoPerfil
      )
      VALUES (
        ${apelido}, ${datanasc}, ${nome}, ${sobrenome}, ${descricao},
        ${email}, ${cpf}, ${senha}, ${bufferImagem}
      )
    `;

    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (err) {
    console.error("Erro ao cadastrar:", err);
    res.status(500).json({ error: "Erro ao cadastrar usuário." });
  }
});

// Inicializa o servidor
app.listen(3000, () => console.log("API rodando na porta 3000"));

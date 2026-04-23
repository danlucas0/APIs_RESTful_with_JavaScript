const pool = require("../services/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = "segredo_super_secreto";

const register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Nome, email e senha são obrigatórios",
      });
    }

    const [usuarioExistente] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (usuarioExistente.length > 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Este email já está cadastrado",
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const [resultado] = await pool.query(
      `
      INSERT INTO usuarios (nome, email, senha, role)
      VALUES (?, ?, ?, ?)
      `,
      [nome, email, senhaHash, "cliente"]
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: "Usuário cadastrado com sucesso",
      dados: {
        id: resultado.insertId,
        nome,
        email,
        role: "cliente",
      },
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao cadastrar usuário",
      erro: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Email e senha são obrigatórios",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT id, nome, email, senha, role
      FROM usuarios
      WHERE email = ?
      `,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Usuário não encontrado",
      });
    }

    const usuario = rows[0];

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Senha inválida",
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: "Login realizado com sucesso",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao fazer login",
      erro: error.message,
    });
  }
};

module.exports = {
  register,
  login,
};
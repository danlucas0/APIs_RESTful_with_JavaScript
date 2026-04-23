const jwt = require("jsonwebtoken");

// 🔐 usa variável de ambiente (NUNCA deixar fixo)
const SECRET = process.env.JWT_SECRET;

const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Token não informado",
      });
    }

    // formato esperado: Bearer token
    const [tipo, token] = authHeader.split(" ");

    if (tipo !== "Bearer" || !token) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Token inválido",
      });
    }

    const decoded = jwt.verify(token, SECRET);

    req.usuario = {
      id: decoded.id,
      nome: decoded.nome,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Token expirado ou inválido",
    });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Usuário não autenticado",
    });
  }

  if (req.usuario.role !== "admin") {
    return res.status(403).json({
      sucesso: false,
      mensagem: "Acesso permitido apenas para administrador",
    });
  }

  next();
};

module.exports = {
  verificarToken,
  adminOnly,
};
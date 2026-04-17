const jwt = require("jsonwebtoken");

const SECRET = "segredo_super_secreto";

const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Token não enviado",
      });
    }

    const [, token] = authHeader.split(" ");

    if (!token) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Token inválido",
      });
    }

    const decoded = jwt.verify(token, SECRET);

    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Token inválido ou expirado",
    });
  }
};

const adminOnly = (req, res, next) => {
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
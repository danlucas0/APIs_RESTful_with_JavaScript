function adminMiddleware(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Usuário não autenticado.",
    });
  }

  if (req.usuario.role !== "admin") {
    return res.status(403).json({
      sucesso: false,
      mensagem: "Acesso negado. Apenas administradores.",
    });
  }

  next();
}

module.exports = adminMiddleware;
const express = require("express");
const router = express.Router();

const cardapioController = require("../controllers/cardapio.controller");
const comandasController = require("../controllers/comandas.controller");
const mesasController = require("../controllers/mesas.controller");
const authController = require("../controllers/auth.controller");

const {
  verificarToken,
  adminOnly
} = require("../middlewares/auth.middleware");


// =====================
// 📌 CARDÁPIO (público)
// =====================
router.get("/cardapio", cardapioController.listarCardapio);
router.get("/cardapio/:id", cardapioController.getCardapioItem);


// =====================
// 🔐 AUTENTICAÇÃO
// =====================
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);


// =====================
// 🪑 MESAS
// =====================
router.get("/mesas", mesasController.getMesasDisponiveis);


// =====================
// 📦 COMANDAS (PEDIDOS)
// =====================

// 👑 ADMIN vê todos
router.get("/comandas", verificarToken, adminOnly, comandasController.getComandas);

// 👤 CLIENTE cria pedido
router.post("/comandas", verificarToken, comandasController.createComanda);

// 👑 ADMIN muda status
router.patch("/comandas/:id", verificarToken, adminOnly, comandasController.updateComandaStatus);

// 👑 ADMIN pode deletar
router.delete("/comandas/:id", verificarToken, adminOnly, comandasController.deleteComanda);


// =====================
// 👤 CLIENTE - MEUS PEDIDOS
// =====================
router.get("/comandas/minhas", verificarToken, comandasController.getMinhasComandas);


module.exports = router;
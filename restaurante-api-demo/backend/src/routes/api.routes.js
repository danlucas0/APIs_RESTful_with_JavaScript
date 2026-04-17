const express = require("express");
const router = express.Router();

const cardapioController = require("../controllers/cardapio.controller");
const comandasController = require("../controllers/comandas.controller");

router.get("/cardapio", cardapioController.listarCardapio);
router.get("/cardapio/:id", cardapioController.getCardapioItem);

router.get("/comandas", comandasController.getComandas);
router.post("/comandas", comandasController.createComanda);
router.patch("/comandas/:id", comandasController.updateComandaStatus);
router.delete("/comandas/:id", comandasController.deleteComanda);

module.exports = router;
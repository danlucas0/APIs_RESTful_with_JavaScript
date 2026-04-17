const db = require("../services/database");

const listarCardapio = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM cardapio");

    return res.status(200).json({
      sucesso: true,
      mensagem: "Cardápio recuperado com sucesso",
      dados: rows,
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao acessar banco",
      erro: erro.message,
    });
  }
};

const getCardapioItem = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id || id <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "ID inválido",
      });
    }

    const [rows] = await db.query("SELECT * FROM cardapio WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Item não encontrado",
      });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: "Item do cardápio recuperado com sucesso",
      dados: rows[0],
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar item do cardápio",
      erro: erro.message,
    });
  }
};

module.exports = {
  listarCardapio,
  getCardapioItem,
};
const pool = require("../services/database");

const getComandas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, mesa, status, itens, total, criado_em, atualizado_em
      FROM comandas
      ORDER BY id DESC
    `);

    const comandasFormatadas = rows.map((comanda) => ({
      ...comanda,
      itens:
        typeof comanda.itens === "string"
          ? JSON.parse(comanda.itens)
          : comanda.itens,
    }));

    return res.status(200).json({
      sucesso: true,
      mensagem: "Comandas recuperadas com sucesso",
      quantidade: comandasFormatadas.length,
      dados: comandasFormatadas,
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar comandas",
      erro: error.message,
    });
  }
};

const createComanda = async (req, res) => {
  try {
    const { mesa, itens, total } = req.body;

    if (!mesa || Number(mesa) <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Não foi possível criar comanda, mesa não informada ou inválida",
      });
    }

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Não foi possível criar comanda, itens inválidos",
      });
    }

    if (total == null || Number(total) < 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Não foi possível criar comanda, valor total inválido",
      });
    }

    const [resultado] = await pool.query(
      `
      INSERT INTO comandas (mesa, status, itens, total)
      VALUES (?, ?, ?, ?)
      `,
      [mesa, "pendente", JSON.stringify(itens), total]
    );

    const [rows] = await pool.query(
      `
      SELECT id, mesa, status, itens, total, criado_em, atualizado_em
      FROM comandas
      WHERE id = ?
      `,
      [resultado.insertId]
    );

    const novaComanda = rows[0]
      ? {
          ...rows[0],
          itens:
            typeof rows[0].itens === "string"
              ? JSON.parse(rows[0].itens)
              : rows[0].itens,
        }
      : null;

    return res.status(201).json({
      sucesso: true,
      mensagem: "Comanda criada com sucesso",
      dados: novaComanda,
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao criar comanda",
      erro: error.message,
    });
  }
};

const updateComandaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Status é obrigatório para atualizar a comanda",
      });
    }

    const statusValidos = [
      "pendente",
      "em_preparo",
      "pronto",
      "entregue",
      "cancelado",
    ];

    if (!statusValidos.includes(status)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Status inválido",
      });
    }

    const [resultado] = await pool.query(
      `
      UPDATE comandas
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Comanda não encontrada.",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT id, mesa, status, itens, total, criado_em, atualizado_em
      FROM comandas
      WHERE id = ?
      `,
      [id]
    );

    const comandaAtualizada = {
      ...rows[0],
      itens:
        typeof rows[0].itens === "string"
          ? JSON.parse(rows[0].itens)
          : rows[0].itens,
    };

    return res.status(200).json({
      sucesso: true,
      mensagem: "Status da comanda atualizado com sucesso",
      dados: comandaAtualizada,
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao atualizar comanda",
      erro: error.message,
    });
  }
};

const deleteComanda = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      `
      DELETE FROM comandas
      WHERE id = ?
      `,
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Comanda não encontrada.",
      });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: "Comanda deletada com sucesso",
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao deletar comanda",
      erro: error.message,
    });
  }
};

module.exports = {
  getComandas,
  createComanda,
  updateComandaStatus,
  deleteComanda,
};
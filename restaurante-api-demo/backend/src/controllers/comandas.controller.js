const pool = require("../services/database");

const parseItens = (itens) => {
  if (typeof itens === "string") {
    try {
      return JSON.parse(itens);
    } catch {
      return [];
    }
  }

  return Array.isArray(itens) ? itens : [];
};

const getComandas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        c.id,
        c.usuario_id,
        c.mesa,
        c.mesa_id,
        c.tipo_pedido,
        c.endereco,
        c.forma_pagamento,
        c.status,
        c.itens,
        c.total,
        c.criado_em,
        c.atualizado_em
      FROM comandas c
      ORDER BY c.id DESC
      `
    );

    const comandasFormatadas = rows.map((comanda) => ({
      ...comanda,
      itens: parseItens(comanda.itens),
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

const getMinhasComandas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const [rows] = await pool.query(
      `
      SELECT 
        c.id,
        c.usuario_id,
        c.mesa,
        c.mesa_id,
        c.tipo_pedido,
        c.endereco,
        c.forma_pagamento,
        c.status,
        c.itens,
        c.total,
        c.criado_em,
        c.atualizado_em
      FROM comandas c
      WHERE c.usuario_id = ?
      ORDER BY c.id DESC
      `,
      [usuarioId]
    );

    const comandasFormatadas = rows.map((comanda) => ({
      ...comanda,
      itens: parseItens(comanda.itens),
    }));

    return res.status(200).json({
      sucesso: true,
      mensagem: "Minhas comandas recuperadas com sucesso",
      quantidade: comandasFormatadas.length,
      dados: comandasFormatadas,
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar minhas comandas",
      erro: error.message,
    });
  }
};

const createComanda = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const {
      tipo_pedido,
      mesa_id,
      endereco,
      forma_pagamento,
      itens,
      total,
    } = req.body;

    const tiposValidos = ["local", "retirada", "entrega"];
    const formasValidas = ["pix", "cartao", "dinheiro"];

    if (!tipo_pedido || !tiposValidos.includes(tipo_pedido)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Tipo de pedido inválido",
      });
    }

    if (!forma_pagamento || !formasValidas.includes(forma_pagamento)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Forma de pagamento inválida",
      });
    }

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Itens inválidos",
      });
    }

    if (total == null || Number(total) < 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Valor total inválido",
      });
    }

    let mesaNumero = null;
    let mesaIdFinal = null;

    if (tipo_pedido === "local") {
      if (!mesa_id || Number(mesa_id) <= 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Mesa é obrigatória para consumo no local",
        });
      }

      const [mesaRows] = await pool.query(
        `
        SELECT id, numero, status
        FROM mesas
        WHERE id = ?
        `,
        [mesa_id]
      );

      if (mesaRows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Mesa não encontrada",
        });
      }

      const mesa = mesaRows[0];

      if (mesa.status !== "disponivel") {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Mesa já está ocupada",
        });
      }

      await pool.query(
        `
        UPDATE mesas
        SET status = 'ocupada'
        WHERE id = ?
        `,
        [mesa_id]
      );

      mesaNumero = mesa.numero;
      mesaIdFinal = mesa.id;
    }

    if (tipo_pedido === "entrega" && (!endereco || !endereco.trim())) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Endereço é obrigatório para entrega",
      });
    }

    const [resultado] = await pool.query(
      `
      INSERT INTO comandas (
        usuario_id,
        mesa,
        mesa_id,
        tipo_pedido,
        endereco,
        forma_pagamento,
        status,
        itens,
        total
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        usuario_id,
        mesaNumero,
        mesaIdFinal,
        tipo_pedido,
        tipo_pedido === "entrega" ? endereco.trim() : null,
        forma_pagamento,
        "pendente",
        JSON.stringify(itens),
        total,
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT 
        id,
        usuario_id,
        mesa,
        mesa_id,
        tipo_pedido,
        endereco,
        forma_pagamento,
        status,
        itens,
        total,
        criado_em,
        atualizado_em
      FROM comandas
      WHERE id = ?
      `,
      [resultado.insertId]
    );

    const novaComanda = rows[0]
      ? {
          ...rows[0],
          itens: parseItens(rows[0].itens),
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
      "saiu_entrega",
      "entregue",
      "cancelado",
    ];

    if (!statusValidos.includes(status)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Status inválido",
      });
    }

    const [comandaRows] = await pool.query(
      `
      SELECT id, mesa_id, tipo_pedido
      FROM comandas
      WHERE id = ?
      `,
      [id]
    );

    if (comandaRows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Comanda não encontrada.",
      });
    }

    const comandaAtual = comandaRows[0];

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

    if (
      (status === "entregue" || status === "cancelado") &&
      comandaAtual.mesa_id
    ) {
      await pool.query(
        `
        UPDATE mesas
        SET status = 'disponivel'
        WHERE id = ?
        `,
        [comandaAtual.mesa_id]
      );
    }

    const [rows] = await pool.query(
      `
      SELECT 
        id,
        usuario_id,
        mesa,
        mesa_id,
        tipo_pedido,
        endereco,
        forma_pagamento,
        status,
        itens,
        total,
        criado_em,
        atualizado_em
      FROM comandas
      WHERE id = ?
      `,
      [id]
    );

    const comandaAtualizada = {
      ...rows[0],
      itens: parseItens(rows[0].itens),
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

    const [comandaRows] = await pool.query(
      `
      SELECT mesa_id
      FROM comandas
      WHERE id = ?
      `,
      [id]
    );

    if (comandaRows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Comanda não encontrada.",
      });
    }

    const mesaId = comandaRows[0].mesa_id;

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

    if (mesaId) {
      await pool.query(
        `
        UPDATE mesas
        SET status = 'disponivel'
        WHERE id = ?
        `,
        [mesaId]
      );
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
  getMinhasComandas,
  createComanda,
  updateComandaStatus,
  deleteComanda,
};
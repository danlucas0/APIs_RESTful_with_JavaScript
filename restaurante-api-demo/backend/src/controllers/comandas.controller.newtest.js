const db = require('../config/db');

/**
 * GET - Listar todas as comandas
 */
const getComandas = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM comandas ORDER BY id DESC');

    res.status(200).json({
      sucesso: true,
      quantidade: rows.length,
      dados: rows
    });

  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar comandas',
      erro: error.message
    });
  }
};


/**
 * POST - Criar nova comanda
 */
const createComanda = async (req, res) => {
  try {
    const { mesa, itens } = req.body;

    // Validações
    if (!mesa) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Mesa é obrigatória'
      });
    }

    if (!itens || itens.length === 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Itens são obrigatórios'
      });
    }

    let total = 0;
    let itensDetalhados = [];

    // Buscar cada item no cardápio
    for (let itemId of itens) {
      const [produto] = await db.execute(
        'SELECT id, nome, preco FROM cardapio WHERE id = ?',
        [itemId]
      );

      if (produto.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: `Item com ID ${itemId} não encontrado no cardápio`
        });
      }

      total += Number(produto[0].preco);

      itensDetalhados.push({
        id: produto[0].id,
        nome: produto[0].nome,
        preco: produto[0].preco
      });
    }

    // Inserir no banco
    const [result] = await db.execute(
      `INSERT INTO comandas 
      (mesa, status, itens, total, criado_em, atualizado_em)
      VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [mesa, 'pendente', JSON.stringify(itensDetalhados), total]
    );

    res.status(201).json({
      sucesso: true,
      mensagem: 'Comanda criada com sucesso',
      id: result.insertId,
      total
    });

  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao criar comanda',
      erro: error.message
    });
  }
};


/**
 * PATCH - Atualizar status da comanda
 */
const updateComandaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Status é obrigatório'
      });
    }

    const [result] = await db.execute(
      'UPDATE comandas SET status = ?, atualizado_em = NOW() WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Comanda não encontrada'
      });
    }

    res.status(200).json({
      sucesso: true,
      mensagem: 'Status atualizado com sucesso'
    });

  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar comanda',
      erro: error.message
    });
  }
};


/**
 * DELETE - Remover comanda
 */
const deleteComanda = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      'DELETE FROM comandas WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Comanda não encontrada'
      });
    }

    res.status(200).json({
      sucesso: true,
      mensagem: 'Comanda deletada com sucesso'
    });

  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao deletar comanda',
      erro: error.message
    });
  }
};


module.exports = {
  getComandas,
  createComanda,
  updateComandaStatus,
  deleteComanda
};

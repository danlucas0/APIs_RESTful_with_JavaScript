const pool = require("../services/database");

const getMesasDisponiveis = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, numero, status
      FROM mesas
      WHERE status = 'disponivel'
      ORDER BY numero ASC
    `);

    return res.status(200).json({
      sucesso: true,
      dados: rows,
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar mesas disponíveis",
      erro: error.message,
    });
  }
};

module.exports = {
  getMesasDisponiveis,
};
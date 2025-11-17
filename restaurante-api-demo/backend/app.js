// Configuração da Aplicação Express
// Este arquivo configura o Express, mas NÃO inicia o servidor
// Isso permite que os testes importem o app sem subir o servidor

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes/api.routes');

// Cria a aplicação Express
const app = express();

// ========== MIDDLEWARES ==========
// CORS: Permite que o front-end (que rodará em outra porta) acesse nossa API
app.use(cors());

// express.json(): Permite que o servidor "entenda" JSON enviado nas requisições
// Sem isso, o req.body estaria sempre vazio!
app.use(express.json());

// ========== ROTA RAIZ (Teste) ==========
app.get('/', (req, res) => {
  res.json({
    mensagem: '🍽️ Bem-vindo à API do Restaurante!',
    versao: '1.0.0',
    endpoints: {
      cardapio: 'GET /api/cardapio',
      listarComandas: 'GET /api/comandas',
      criarComanda: 'POST /api/comandas'
    }
  });
});

// ========== ROTAS DA API ==========
// Todas as rotas começarão com /api
app.use('/api', apiRoutes);

// Exporta o app para ser usado pelo server.js e pelos testes
module.exports = app;

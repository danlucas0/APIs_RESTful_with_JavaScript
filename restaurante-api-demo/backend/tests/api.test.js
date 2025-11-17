// Testes da API do Restaurante
// Testando os endpoints existentes (testes de regressão)

const request = require('supertest');
const app = require('../app');
const { resetComandas } = require('../src/services/database');

// Hook que roda ANTES de cada teste
// Garante que cada teste comece com um estado limpo
beforeEach(() => {
  resetComandas(); // Limpa o array de comandas
});

// ========== TESTES DO CARDÁPIO ==========
describe('GET /api/cardapio', () => {
  it('deve retornar status 200 e o cardápio completo', async () => {
    const response = await request(app).get('/api/cardapio');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('sucesso', true);
    expect(response.body).toHaveProperty('dados');
    expect(Array.isArray(response.body.dados)).toBe(true);
    expect(response.body.dados.length).toBeGreaterThan(0);
  });

  it('deve retornar itens com as propriedades corretas', async () => {
    const response = await request(app).get('/api/cardapio');
    
    const primeiroItem = response.body.dados[0];
    expect(primeiroItem).toHaveProperty('id');
    expect(primeiroItem).toHaveProperty('nome');
    expect(primeiroItem).toHaveProperty('preco');
    expect(primeiroItem).toHaveProperty('descricao');
  });
});

// ========== TESTES DO CARDÁPIO POR ID (TDD - Novo Endpoint) ==========
describe('GET /api/cardapio/:id', () => {
  it('deve retornar um item específico do cardápio', async () => {
    const response = await request(app).get('/api/cardapio/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('nome', 'Prato Feito');
    expect(response.body).toHaveProperty('preco', 25.00);
  });

  it('deve retornar 404 se o item não existir', async () => {
    const response = await request(app).get('/api/cardapio/999');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });
});

// ========== TESTES DAS COMANDAS ==========
describe('GET /api/comandas', () => {
  it('deve retornar status 200 e um array de comandas', async () => {
    const response = await request(app).get('/api/comandas');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('sucesso', true);
    expect(response.body).toHaveProperty('dados');
    expect(Array.isArray(response.body.dados)).toBe(true);
  });
});

describe('POST /api/comandas', () => {
  it('deve criar uma nova comanda e retornar status 201', async () => {
    const novaComanda = {
      mesa: 'Mesa 5',
      itens: [1, 2],
      total: 33.00
    };

    const response = await request(app)
      .post('/api/comandas')
      .send(novaComanda);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('sucesso', true);
    expect(response.body).toHaveProperty('dados');
    expect(response.body.dados).toHaveProperty('id');
    expect(response.body.dados).toHaveProperty('mesa', 'Mesa 5');
    expect(response.body.dados).toHaveProperty('total', 33.00);
    expect(response.body.dados).toHaveProperty('status', 'pendente');
  });

  it('deve retornar erro 400 se faltar dados obrigatórios', async () => {
    const comandaIncompleta = {
      mesa: 'Mesa 3'
      // Faltam 'itens' e 'total'
    };

    const response = await request(app)
      .post('/api/comandas')
      .send(comandaIncompleta);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('sucesso', false);
  });
});

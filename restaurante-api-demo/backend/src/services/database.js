// Simulação de Banco de Dados em Memória
// Este arquivo funciona como nossa "cozinha" onde guardamos os dados

// Array que representa o cardápio do restaurante
const cardapio = [
  { id: 1, nome: 'Prato Feito', preco: 25.00, descricao: 'Arroz, feijão, bife e salada' },
  { id: 2, nome: 'Suco de Laranja', preco: 8.00, descricao: 'Suco natural 500ml' },
  { id: 3, nome: 'Hambúrguer Artesanal', preco: 35.00, descricao: 'Pão, carne 180g, queijo e batata' },
  { id: 4, nome: 'Pizza Margherita', preco: 45.00, descricao: 'Pizza tradicional italiana' },
  { id: 5, nome: 'Refrigerante', preco: 6.00, descricao: 'Lata 350ml' }
];

// Array que armazenará as comandas (pedidos) dos clientes
// Inicialmente vazio, será preenchido quando clientes fizerem pedidos
const comandas = [];

// Função para resetar o array de comandas (útil para testes)
// Remove todas as comandas e reseta o array para vazio
const resetComandas = () => {
  comandas.length = 0; // Limpa o array sem criar uma nova referência
};

// Exportamos os arrays e a função de reset para serem usados em outros arquivos
module.exports = {
  cardapio,
  comandas,
  resetComandas
};

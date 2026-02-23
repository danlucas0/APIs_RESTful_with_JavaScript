const comandasData = [
  {
    mesa: 5,
    status: 'pendente',
    itens: [
      {
        id: 1,
        nome: 'Prato Feito',
        quantidade: 2,
        preco_unitario: 13.00,
        subtotal: 26.00
      },
      {
        id: 2,
        nome: 'Suco de Laranja',
        quantidade: 2,
        preco_unitario: 8.00,
        subtotal: 16.00
      }
    ],
    total: 42.00
  },
  {
    mesa: 8,
    status: 'em_preparo',
    itens: [
      {
        id: 3,
        nome: 'Hambúrguer Artesanal',
        quantidade: 1,
        preco_unitario: 35.00,
        subtotal: 35.00
      },
      {
        id: 5,
        nome: 'Refrigerante',
        quantidade: 1,
        preco_unitario: 7.00,
        subtotal: 7.00
      }
    ],
    total: 42.00
  },
  {
    mesa: 12,
    status: 'pronto',
    itens: [
      {
        id: 4,
        nome: 'Pizza Margherita',
        quantidade: 1,
        preco_unitario: 40.00,
        subtotal: 40.00
      },
      {
        id: 2,
        nome: 'Suco de Laranja',
        quantidade: 3,
        preco_unitario: 8.00,
        subtotal: 24.00
      },
      {
        id: 6,
        nome: 'Doce',
        quantidade: 2,
        preco_unitario: 7.00,
        subtotal: 14.00
      }
    ],
    total: 78.00
  }
];

module.exports = comandasData;
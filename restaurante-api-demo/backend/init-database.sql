CREATE TABLE IF NOT EXISTS cardapio (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10, 2) NOT NULL CHECK (preco > 0),
  descricao TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comandas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  mesa INTEGER NOT NULL CHECK (mesa > 0),
  status ENUM("pendente", "em_preparo", "pronto", "entregue", "cancelado") DEFAULT 'pendente',
  itens JSON NOT NULL,
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)


CREATE INDEX idx_comandas_status ON comandas(status);
CREATE INDEX idx_comandas_mesa ON comandas(mesa);
CREATE INDEX idx_comandas_mesa_status ON comandas(mesa, status);
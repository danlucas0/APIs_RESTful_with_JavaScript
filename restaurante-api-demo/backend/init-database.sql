-- =========================
-- CRIAR BANCO
-- =========================
CREATE DATABASE IF NOT EXISTS restaurante_db;
USE restaurante_db;

-- =========================
-- TABELA USUÁRIOS
-- =========================
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  role ENUM('admin', 'cliente') DEFAULT 'cliente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABELA CARDÁPIO
-- =========================
CREATE TABLE IF NOT EXISTS cardapio (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10, 2) NOT NULL,
  descricao TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- TABELA MESAS
-- =========================
CREATE TABLE IF NOT EXISTS mesas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  numero INT NOT NULL UNIQUE,
  status ENUM('disponivel', 'ocupada') DEFAULT 'disponivel'
);

-- =========================
-- TABELA COMANDAS
-- =========================
CREATE TABLE IF NOT EXISTS comandas (
  id INT PRIMARY KEY AUTO_INCREMENT,

  usuario_id INT,
  mesa INT NULL,
  mesa_id INT NULL,

  tipo_pedido ENUM('local','retirada','entrega') DEFAULT 'local',
  endereco VARCHAR(255) NULL,
  forma_pagamento ENUM('pix','cartao','dinheiro') NULL,

  status ENUM(
    'pendente',
    'em_preparo',
    'pronto',
    'saiu_entrega',
    'entregue',
    'cancelado'
  ) DEFAULT 'pendente',

  itens JSON NOT NULL,
  total DECIMAL(10, 2) NOT NULL,

  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_mesa FOREIGN KEY (mesa_id) REFERENCES mesas(id)
);

-- =========================
-- INDEXES (PERFORMANCE)
-- =========================
CREATE INDEX idx_comandas_status ON comandas(status);
CREATE INDEX idx_comandas_mesa ON comandas(mesa);
CREATE INDEX idx_comandas_mesa_status ON comandas(mesa, status);
CREATE INDEX idx_comandas_usuario ON comandas(usuario_id);

-- =========================
-- DADOS INICIAIS
-- =========================

-- MESAS (não duplica)
INSERT INTO mesas (numero) VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10)
ON DUPLICATE KEY UPDATE numero = VALUES(numero);

-- ADMIN PADRÃO (não duplica)
INSERT INTO usuarios (nome, email, senha, role)
VALUES (
  'Administrador',
  'admin@restaurante.com',
  '$2b$10$hashaqui',
  'admin'
)
ON DUPLICATE KEY UPDATE
nome = VALUES(nome),
role = VALUES(role);
-- saep_db.sql
-- Script de criação e população do banco de dados SAEP_DB
-- Use: sqlite3 saep_db.db < saep_db.sql

PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS usuarios (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nome        TEXT    NOT NULL,
  email       TEXT    NOT NULL UNIQUE,
  senha       TEXT    NOT NULL,
  perfil      TEXT    NOT NULL DEFAULT 'Atendente',
  ativo       INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clientes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nome        TEXT    NOT NULL,
  telefone    TEXT    NOT NULL,
  endereco    TEXT    NOT NULL DEFAULT '{}',
  observacoes TEXT    NOT NULL DEFAULT '',
  ativo       INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pecas (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nome        TEXT    NOT NULL,
  categoria   TEXT    NOT NULL DEFAULT '',
  precos      TEXT    NOT NULL,
  disponivel  INTEGER NOT NULL DEFAULT 1,
  quantidade  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pedidos (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_pedido     INTEGER,
  cliente_id        INTEGER NOT NULL REFERENCES clientes(id),
  subtotal          REAL    NOT NULL DEFAULT 0,
  taxa_entrega      REAL    NOT NULL DEFAULT 0,
  total             REAL    NOT NULL DEFAULT 0,
  forma_pagamento   TEXT    NOT NULL,
  troco             REAL    NOT NULL DEFAULT 0,
  status            TEXT    NOT NULL DEFAULT 'recebido',
  observacoes       TEXT    NOT NULL DEFAULT '',
  setor             INTEGER,
  origem            TEXT    NOT NULL DEFAULT 'balcao',
  gestor_id         INTEGER REFERENCES usuarios(id),
  created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  update_at         TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS itens_pedidos (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id         INTEGER NOT NULL REFERENCES pedidos(id),
  peca_id           INTEGER NOT NULL REFERENCES pecas(id),
  nome_peca         TEXT    NOT NULL,
  quantidade        INTEGER NOT NULL DEFAULT 1,
  preco_unitario    REAL    NOT NULL DEFAULT 0,
  subtotal          REAL    NOT NULL DEFAULT 0
);

INSERT INTO usuarios (nome, email, senha, perfil, ativo) VALUES
('Administrador', 'admin@email.com', '$2b$10$n0AtUioi1BrnlQ6j8L8rLOno4/mBLfwPV8BOq/lIDFFJvATFoH9F6', 'Administrador', 1),
('Funcionário', 'funcionario@email.com', '$2b$10$n0AtUioi1BrnlQ6j8L8rLOno4/mBLfwPV8BOq/lIDFFJvATFoH9F6', 'Funcionário', 1),
('Gestor', 'gestor@email.com', '$2b$10$n0AtUioi1BrnlQ6j8L8rLOno4/mBLfwPV8BOq/lIDFFJvATFoH9F6', 'Gestor', 1);

INSERT INTO clientes (nome, telefone, endereco, observacoes, ativo) VALUES
('João da Silva', '(11) 99999-0000', '{"rua":"Rua das Flores","numero":"123","bairro":"Centro"}', 'Preferência por entrega após as 18h.', 1),
('Maria Souza', '(21) 98888-7777', '{"rua":"Av. Paulista","numero":"456","bairro":"Bela Vista"}', 'Cliente com orçamento mensal limitado.', 1),
('Empresa Alfa', '(11) 33333-4444', '{"rua":"Rua dos Empresários","numero":"10","bairro":"Distrito Industrial"}', 'Contrato de manutenção trimestral.', 1);

INSERT INTO pecas (nome, categoria, precos, disponivel, quantidade) VALUES
('Correia de Timing', 'Motor', '{"P":1500,"M":1650,"G":1800}', 1, 10),
('Filtro de Óleo', 'Motor', '{"P":250,"M":280,"G":320}', 1, 30),
('Pastilha de Freio', 'Freios', '{"P":100,"M":120,"G":140}', 1, 50);

INSERT INTO pedidos (numero_pedido, cliente_id, subtotal, taxa_entrega, total, forma_pagamento, troco, status, observacoes, setor, origem, gestor_id) VALUES
(1, 1, 1500, 20, 1520, 'pix', 0, 'recebido', 'Entrega urgente.', 1, 'balcao', 3),
(2, 2, 550, 15, 565, 'dinheiro', 600, 'em_producao', 'Instalar no veículo ainda hoje.', 2, 'balcao', 3),
(3, 3, 320, 0, 320, 'cartao_debito', 0, 'saiu_entrega', 'Pedido para empresa.', 1, 'balcao', 3);

INSERT INTO itens_pedidos (pedido_id, peca_id, nome_peca, quantidade, preco_unitario, subtotal) VALUES
(1, 1, 'Correia de Timing', 1, 1500, 1500),
(2, 2, 'Filtro de Óleo', 2, 250, 500),
(2, 3, 'Pastilha de Freio', 1, 50, 50),
(3, 3, 'Pastilha de Freio', 2, 160, 320);

-- Define quantidades iniciais para as peças
UPDATE pecas SET quantidade = 10 WHERE nome = 'Correia de Timing';
UPDATE pecas SET quantidade = 30 WHERE nome = 'Filtro de Óleo';
UPDATE pecas SET quantidade = 50 WHERE nome = 'Pastilha de Freio';

COMMIT;

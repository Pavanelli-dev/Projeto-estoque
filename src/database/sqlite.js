const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'almoxarifado.db');
const state = { db: null };

const ready = (async () => {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) state.db = new SQL.Database(fs.readFileSync(DB_PATH));
  else state.db = new SQL.Database();

  state.db.run('PRAGMA foreign_keys = ON');
  state.db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      perfil TEXT NOT NULL DEFAULT 'Funcionario',
      ativo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      categoria TEXT NOT NULL,
      codigo TEXT NOT NULL UNIQUE,
      unidade TEXT NOT NULL DEFAULT 'un',
      quantidade INTEGER NOT NULL DEFAULT 0,
      estoque_minimo INTEGER NOT NULL DEFAULT 0,
      localizacao TEXT NOT NULL DEFAULT '',
      ativo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS movimentacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produto_id INTEGER NOT NULL REFERENCES produtos(id),
      tipo TEXT NOT NULL CHECK(tipo IN ('entrada','saida')),
      quantidade INTEGER NOT NULL CHECK(quantidade > 0),
      observacao TEXT NOT NULL DEFAULT '',
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_mov_produto ON movimentacoes(produto_id);
    CREATE INDEX IF NOT EXISTS idx_mov_usuario ON movimentacoes(usuario_id);
  `);
  salvar();
  return state.db;
})();

function salvar(){ if(state.db) fs.writeFileSync(DB_PATH, Buffer.from(state.db.export())); }
function query(sql, params=[]){ const stmt=state.db.prepare(sql); const out=[]; stmt.bind(params); while(stmt.step()) out.push(stmt.getAsObject()); stmt.free(); return out; }
function run(sql, params=[]){ state.db.run(sql, params); const m=query('SELECT last_insert_rowid() id, changes() changes')[0]; salvar(); return {lastInsertRowid:m?.id,changes:m?.changes}; }
function get(sql, params=[]){ return query(sql,params)[0] || null; }
module.exports={ready,query,run,get,salvar};

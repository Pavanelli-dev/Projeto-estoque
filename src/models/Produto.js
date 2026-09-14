const {ready,query,run,get}=require('../database/sqlite');
function formatar(r){if(!r)return null;return {...r,ativo:r.ativo===1};}
const Produto={
 async findAll(busca=''){await ready;const b=`%${busca}%`;return query(`SELECT * FROM produtos WHERE ativo=1 AND (nome LIKE ? OR categoria LIKE ? OR codigo LIKE ?) ORDER BY nome`,[b,b,b]).map(formatar)},
 async findById(id){await ready;return formatar(get('SELECT * FROM produtos WHERE id=?',[id]))},
 async create(d){await ready;const i=run(`INSERT INTO produtos(nome,categoria,codigo,unidade,quantidade,estoque_minimo,localizacao) VALUES(?,?,?,?,?,?,?)`,[d.nome.trim(),d.categoria.trim(),d.codigo.trim(),d.unidade||'un',Number(d.quantidade)||0,Number(d.estoque_minimo)||0,(d.localizacao||'').trim()]);return this.findById(i.lastInsertRowid)},
 async update(id,d){await ready;const a=get('SELECT * FROM produtos WHERE id=?',[id]);if(!a)return null;run(`UPDATE produtos SET nome=?,categoria=?,codigo=?,unidade=?,quantidade=?,estoque_minimo=?,localizacao=?,updated_at=datetime('now') WHERE id=?`,[d.nome??a.nome,d.categoria??a.categoria,d.codigo??a.codigo,d.unidade??a.unidade,d.quantidade!==undefined?Number(d.quantidade):a.quantidade,d.estoque_minimo!==undefined?Number(d.estoque_minimo):a.estoque_minimo,d.localizacao??a.localizacao,id]);return this.findById(id)},
 async delete(id){await ready;const mov=get('SELECT id FROM movimentacoes WHERE produto_id=? LIMIT 1',[id]);if(mov)throw new Error('Produto possui histórico de movimentações e não pode ser excluído.');return run('DELETE FROM produtos WHERE id=?',[id]).changes>0}
};module.exports=Produto;

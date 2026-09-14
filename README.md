# Sistema de Almoxarifado

Projeto adaptado para funcionar como **sistema de almoxarifado**, mantendo a base HTML, CSS, JavaScript e SQLite/sql.js do projeto original.

## O que foi alterado
- Peças -> Produtos/Materiais
- Pedidos -> Movimentações de estoque
- Clientes -> removidos da operação principal
- Dashboard agora mostra produtos, itens em estoque e estoque baixo
- Cadastro de produto com código, categoria, unidade, quantidade, estoque mínimo e localização
- Entrada e saída de estoque
- Histórico de movimentações com data e usuário
- Bloqueio de saída maior que o estoque disponível
- Bloqueio de exclusão quando o produto possui histórico
- Usuários e perfis mantidos para autenticação

## Tecnologias
HTML, CSS, JavaScript, Node.js/Express e SQLite via sql.js.

## Executar
```bash
npm install
node seed.js
node index.js
```
Abra http://localhost:3001

Login: admin@email.com / 123456

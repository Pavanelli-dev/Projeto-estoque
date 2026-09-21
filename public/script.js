
const API = '/api';

let TOKEN = localStorage.getItem('almox_token') || '';
let USUARIO = JSON.parse(localStorage.getItem('almox_usuario') || 'null');
let produtos = [];


function toast(m, erro = false) {
    const e = document.getElementById('toast');

    e.textContent = m;
    e.className = erro ? 'show erro' : 'show';

    setTimeout(() => e.className = '', 3000);
}


function abrir(id) {
    document.getElementById(id).classList.add('open');
}


function fechar(id) {
    document.getElementById(id).classList.remove('open');
}


async function api(method, url, body) {
    const o = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
        }
    };

    if (body) {
        o.body = JSON.stringify(body);
    }

    const r = await fetch(API + url, o);
    const d = await r.json();

    if (r.status === 401) {
        sair();
        throw Error('Sessão expirada');
    }

    if (!r.ok) {
        throw Error(d.erro || 'Erro');
    }

    return d;
}


async function fazerLogin() {
    const email = document.getElementById('l-email').value.trim();
    const senha = document.getElementById('l-senha').value;
    const erro = document.getElementById('login-erro');
    const btn = document.getElementById('btn-login');

    if (!email || !senha) {
        erro.textContent = 'Preencha e-mail e senha.';
        erro.style.display = 'block';
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Entrando...';

    try {
        const d = await apiLogin(email, senha);

        TOKEN = d.token;
        USUARIO = d.usuario;

        localStorage.setItem('almox_token', TOKEN);
        localStorage.setItem('almox_usuario', JSON.stringify(USUARIO));

        entrar();
    } catch (e) {
        erro.textContent = e.message;
        erro.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Entrar';
    }
}


async function apiLogin(email, senha) {
    const r = await fetch(API + '/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            senha
        })
    });

    const d = await r.json();

    if (!r.ok) {
        throw Error(d.erro || 'Credenciais inválidas');
    }

    return d;
}


function entrar() {
    document.body.classList.add('logado');

    document.getElementById('sb-nome').textContent = USUARIO.nome;
    document.getElementById('sb-perfil').textContent = USUARIO.perfil;

    document.getElementById('btn-usuarios').style.display =
        USUARIO.perfil === 'Administrador' ? 'flex' : 'none';

    carregarDashboard();
    carregarProdutos();
    carregarEstoque();
    carregarMovimentacoes();
}


function sair() {
    TOKEN = '';
    USUARIO = null;

    localStorage.removeItem('almox_token');
    localStorage.removeItem('almox_usuario');

    document.body.classList.remove('logado');
}


function ir(sec, btn) {
    document
        .querySelectorAll('.secao')
        .forEach(x => x.classList.remove('ativa'));

    document.getElementById('pg-' + sec).classList.add('ativa');

    document
        .querySelectorAll('.nav-btn')
        .forEach(x => x.classList.remove('ativo'));

    btn.classList.add('ativo');

    if (sec === 'usuarios') carregarUsuarios();
    if (sec === 'estoque') carregarEstoque();
    if (sec === 'movimentacoes') carregarMovimentacoes();
}


async function carregarDashboard() {
    try {
        const d = await api('GET', '/dashboard');

        document.getElementById('s-produtos').textContent = d.totalProdutos;
        document.getElementById('s-itens').textContent = d.totalItens;
        document.getElementById('s-baixo').textContent = d.estoqueBaixo;

        const ps = await api('GET', '/produtos');
        const baixos = ps.filter(
            p => p.quantidade <= p.estoque_minimo
        );

        document.getElementById('dash-alertas').innerHTML =
            baixos.length
                ? baixos
                    .map(
                        p =>
                            `<div class="alerta">⚠️ <b>${p.nome}</b> está com ${p.quantidade} ${p.unidade}. Mínimo: ${p.estoque_minimo}.</div>`
                    )
                    .join('')
                : '<div class="vazio">✅ Nenhum produto abaixo do estoque mínimo.</div>';
    } catch (e) {
        toast(e.message, true);
    }
}


async function carregarProdutos() {
    try {
        const b = document.getElementById('busca-produto').value;

        produtos = await api(
            'GET',
            '/produtos?busca=' + encodeURIComponent(b)
        );

        document.getElementById('tbl-produtos').innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Código</th>
                        <th>Categoria</th>
                        <th>Qtd.</th>
                        <th>Mínimo</th>
                        <th>Localização</th>
                        <th>Ações</th>
                    </tr>
                </thead>

                <tbody>
                    ${produtos
                        .map(
                            p => `
                                <tr>
                                    <td><b>${p.nome}</b></td>
                                    <td>${p.codigo}</td>
                                    <td>${p.categoria}</td>
                                    <td>${p.quantidade} ${p.unidade}</td>
                                    <td>${p.estoque_minimo}</td>
                                    <td>${p.localizacao || '—'}</td>
                                    <td>
                                        <button
                                            class="mini"
                                            onclick="editarProduto(${p.id})"
                                        >
                                            Editar
                                        </button>

                                        <button
                                            class="mini danger"
                                            onclick="excluirProduto(${p.id})"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            `
                        )
                        .join('')}
                </tbody>
            </table>
        `;
    } catch (e) {
        toast(e.message, true);
    }
}


async function carregarEstoque() {
    try {
        const ps = await api('GET', '/produtos');

        document.getElementById('tbl-estoque').innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Quantidade</th>
                        <th>Mínimo</th>
                        <th>Status</th>
                        <th>Localização</th>
                    </tr>
                </thead>

                <tbody>
                    ${ps
                        .map(p => {
                            const baixo =
                                p.quantidade <= p.estoque_minimo;

                            return `
                                <tr>
                                    <td>${p.nome}</td>
                                    <td>${p.categoria}</td>
                                    <td>
                                        <b>${p.quantidade}</b> ${p.unidade}
                                    </td>
                                    <td>${p.estoque_minimo}</td>
                                    <td>
                                        <span class="badge ${baixo ? 'baixo' : 'normal'}">
                                            ${baixo ? 'Estoque baixo' : 'Normal'}
                                        </span>
                                    </td>
                                    <td>${p.localizacao || '—'}</td>
                                </tr>
                            `;
                        })
                        .join('')}
                </tbody>
            </table>
        `;
    } catch (e) {
        toast(e.message, true);
    }
}


async function carregarMovimentacoes() {
    try {
        const ms = await api('GET', '/movimentacoes');

        document.getElementById('tbl-movimentacoes').innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Produto</th>
                        <th>Tipo</th>
                        <th>Quantidade</th>
                        <th>Usuário</th>
                        <th>Observação</th>
                    </tr>
                </thead>

                <tbody>
                    ${ms
                        .map(
                            m => `
                                <tr>
                                    <td>
                                        ${new Date(m.created_at + 'Z').toLocaleString('pt-BR')}
                                    </td>
                                    <td>${m.produto}</td>
                                    <td>
                                        <span class="badge ${m.tipo === 'entrada' ? 'normal' : 'saida'}">
                                            ${m.tipo}
                                        </span>
                                    </td>
                                    <td>${m.quantidade}</td>
                                    <td>${m.usuario}</td>
                                    <td>${m.observacao || '—'}</td>
                                </tr>
                            `
                        )
                        .join('')}
                </tbody>
            </table>
        `;
    } catch (e) {
        toast(e.message, true);
    }
}


function abrirProduto(p = null) {
    document.getElementById('produto-titulo').textContent =
        p ? 'Editar produto' : 'Novo produto';

    document.getElementById('produto-id').value = p?.id || '';
    document.getElementById('produto-nome').value = p?.nome || '';
    document.getElementById('produto-categoria').value = p?.categoria || '';
    document.getElementById('produto-codigo').value = p?.codigo || '';
    document.getElementById('produto-unidade').value = p?.unidade || 'un';
    document.getElementById('produto-quantidade').value = p?.quantidade || 0;
    document.getElementById('produto-minimo').value = p?.estoque_minimo || 0;
    document.getElementById('produto-localizacao').value = p?.localizacao || '';

    abrir('m-produto');
}


async function editarProduto(id) {
    abrirProduto(
        produtos.find(p => p.id === id) ||
        await api('GET', '/produtos/' + id)
    );
}


async function salvarProduto() {
    const id = document.getElementById('produto-id').value;

    const d = {
        nome: document.getElementById('produto-nome').value,
        categoria: document.getElementById('produto-categoria').value,
        codigo: document.getElementById('produto-codigo').value,
        unidade: document.getElementById('produto-unidade').value,
        quantidade: +document.getElementById('produto-quantidade').value,
        estoque_minimo: +document.getElementById('produto-minimo').value,
        localizacao: document.getElementById('produto-localizacao').value
    };

    try {
        await api(
            id ? 'PUT' : 'POST',
            id ? '/produtos/' + id : '/produtos',
            d
        );

        fechar('m-produto');
        toast('Produto salvo com sucesso');

        carregarProdutos();
        carregarEstoque();
        carregarDashboard();
    } catch (e) {
        toast(e.message, true);
    }
}


async function excluirProduto(id) {
    if (!confirm('Excluir este produto?')) return;

    try {
        await api('DELETE', '/produtos/' + id);

        toast('Produto excluído');

        carregarProdutos();
        carregarEstoque();
        carregarDashboard();
    } catch (e) {
        toast(e.message, true);
    }
}


async function abrirMovimentacao() {
    const ps = await api('GET', '/produtos');

    document.getElementById('mov-produto').innerHTML =
        ps
            .map(
                p =>
                    `<option value="${p.id}">${p.nome} — ${p.quantidade} ${p.unidade}</option>`
            )
            .join('');

    document.getElementById('mov-qtd').value = '';
    document.getElementById('mov-obs').value = '';

    abrir('m-mov');
}


async function salvarMovimentacao() {
    try {
        await api('POST', '/movimentacoes', {
            produtoId: +document.getElementById('mov-produto').value,
            tipo: document.getElementById('mov-tipo').value,
            quantidade: +document.getElementById('mov-qtd').value,
            observacao: document.getElementById('mov-obs').value
        });

        fechar('m-mov');
        toast('Movimentação registrada');

        carregarProdutos();
        carregarEstoque();
        carregarMovimentacoes();
        carregarDashboard();
    } catch (e) {
        toast(e.message, true);
    }
}


async function carregarUsuarios() {
    try {
        const us = await api('GET', '/usuarios');

        document.getElementById('tbl-usuarios').innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Perfil</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    ${us
                        .map(
                            u => `
                                <tr>
                                    <td>${u.nome}</td>
                                    <td>${u.email}</td>
                                    <td>${u.perfil}</td>
                                    <td>${u.ativo ? 'Ativo' : 'Inativo'}</td>
                                </tr>
                            `
                        )
                        .join('')}
                </tbody>
            </table>
        `;
    } catch (e) {
        toast(e.message, true);
    }
}


document
    .querySelectorAll('.modal-bg')
    .forEach(m =>
        m.addEventListener('click', e => {
            if (e.target === m) {
                m.classList.remove('open');
            }
        })
    );


if (TOKEN && USUARIO) {
    entrar();
}

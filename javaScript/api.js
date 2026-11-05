/* ==================================================
   CONFIGURAÇÃO DA API (um lugar só para trocar a URL)
   Depois do deploy, troque pela URL pública do backend.
================================================== */

const API_URL = 'http://localhost:8080';

const GOOGLE_CLIENT_ID =
    '72671285332-knhpone20v8jbflb5fnfjnnp0efcmfun.apps.googleusercontent.com';


/* ==================================================
   SESSÃO (token JWT + dados do usuário)
================================================== */

function salvarSessao(dados) {
    localStorage.setItem('token', dados.token);
    localStorage.setItem('usuario', JSON.stringify(dados.usuario));
}

function obterToken() {
    return localStorage.getItem('token');
}

function obterUsuario() {
    try {
        return JSON.parse(localStorage.getItem('usuario'));
    } catch (e) {
        return null;
    }
}

function sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'Login.html';
}


/* ==================================================
   CHAMADAS AO BACKEND
   - envia o token automaticamente (Authorization: Bearer ...)
   - lança Error com a mensagem do backend quando dá erro
   - se vier 401 numa rota protegida, volta para o login
================================================== */

async function api(caminho, opcoes = {}) {
    const headers = { 'Content-Type': 'application/json', ...(opcoes.headers || {}) };
    const token = obterToken();
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    let resposta;
    try {
        resposta = await fetch(API_URL + caminho, { ...opcoes, headers });
    } catch (e) {
        throw new Error('Não foi possível conectar ao servidor. Tente novamente em instantes.');
    }

    let dados = null;
    try {
        dados = await resposta.json();
    } catch (e) { /* resposta sem corpo (ex.: 204) */ }

    if (!resposta.ok) {
        if (resposta.status === 401 && token && !caminho.startsWith('/auth/')) {
            sair();
        }
        throw new Error((dados && dados.message) || 'Erro ' + resposta.status);
    }
    return dados;
}


/* ==================================================
   UTILITÁRIOS DE TELA
================================================== */

function mostrarErro(texto) {
    const el = document.getElementById('mensagem-erro');
    if (!el) { alert(texto); return; }
    el.textContent = texto;
    el.hidden = !texto;
}

function configurarBotaoGoogle(aoReceberToken) {
    function iniciar() {
        if (!window.google || !google.accounts) {
            // o script do Google ainda não carregou: tenta de novo
            setTimeout(iniciar, 200);
            return;
        }
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (resp) => aoReceberToken(resp.credential)
        });
        google.accounts.id.renderButton(document.getElementById('googleButton'), {
            theme: 'outline',
            size: 'large',
            width: 300,
            text: 'continue_with',
            shape: 'pill'
        });
    }
    iniciar();
}

function configurarOlhoSenha() {
    const campo = document.getElementById('senha');
    const botao = document.getElementById('toggle-senha');
    const icone = document.getElementById('icone-olho');

    botao.addEventListener('click', function () {
        const estavaOculta = campo.type === 'password';
        campo.type = estavaOculta ? 'text' : 'password';
        icone.src = estavaOculta ? 'assets/olho-aberto.png' : 'assets/olho-fechado.png';
        botao.setAttribute('aria-label', estavaOculta ? 'Ocultar senha' : 'Mostrar senha');
    });
}
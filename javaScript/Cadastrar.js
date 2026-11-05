/* ==================================================
   CADASTRO (e-mail/senha e Google)
   Depende de api.js
================================================== */

const botoesTipo = document.querySelectorAll('.tipo-conta');
const rotuloNome = document.getElementById('rotulo-nome');
const campoNome = document.getElementById('nome');
const campoEmail = document.getElementById('email');
const campoSenha = document.getElementById('senha');
const notaAgencia = document.getElementById('nota-agencia');
const botaoCadastrar = document.getElementById('btn-cadastrar');

let tipoSelecionado = 'viajante';

const tipos = {
    viajante: {
        rotulo: 'Nome',
        placeholder: 'Digite o seu nome completo',
        mostrarNota: false
    },
    agencia: {
        rotulo: 'Nome da Empresa',
        placeholder: 'Digite o nome da sua empresa',
        mostrarNota: true
    }
};

function selecionarTipo(tipo) {
    const config = tipos[tipo];
    tipoSelecionado = tipo;

    botoesTipo.forEach(function (botao) {
        const ativo = botao.dataset.tipo === tipo;
        botao.classList.toggle('active', ativo);
        botao.setAttribute('aria-checked', ativo);
    });

    rotuloNome.textContent = config.rotulo;
    campoNome.placeholder = config.placeholder;
    notaAgencia.hidden = !config.mostrarNota;
}

botoesTipo.forEach(function (botao) {
    botao.addEventListener('click', function () {
        selecionarTipo(botao.dataset.tipo);
    });
});

selecionarTipo('viajante');
configurarOlhoSenha();


/* ==================================================
   CRIAR CONTA
================================================== */

async function cadastrar() {
    mostrarErro('');

    const nome = campoNome.value.trim();
    const email = campoEmail.value.trim();
    const senha = campoSenha.value;

    if (!nome || !email || !senha) {
        mostrarErro('Preencha todos os campos.');
        return;
    }
    if (senha.length < 6) {
        mostrarErro('A senha deve ter no mínimo 6 caracteres.');
        return;
    }

    botaoCadastrar.disabled = true;
    try {
        const dados = await api('/auth/cadastro', {
            method: 'POST',
            body: JSON.stringify({
                nome,
                email,
                senha,
                tipoUsuario: tipoSelecionado.toUpperCase()   // VIAJANTE ou AGENCIA
            })
        });
        salvarSessao(dados);
        window.location.href = 'Home.html';
    } catch (erro) {
        mostrarErro(erro.message);
    } finally {
        botaoCadastrar.disabled = false;
    }
}

botaoCadastrar.addEventListener('click', cadastrar);
[campoNome, campoEmail, campoSenha].forEach(function (campo) {
    campo.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') cadastrar();
    });
});


/* ==================================================
   CADASTRO COM GOOGLE (usa o tipo de conta escolhido)
================================================== */

configurarBotaoGoogle(async function (idToken) {
    mostrarErro('');
    try {
        const dados = await api('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ idToken, tipoUsuario: tipoSelecionado.toUpperCase() })
        });
        salvarSessao(dados);
        window.location.href = 'Home.html';
    } catch (erro) {
        mostrarErro(erro.message);
    }
});
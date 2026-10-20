/* ==================================================
   TIPO DE CONTA (Viajante / Agência)
================================================== */

const botoesTipo = document.querySelectorAll('.tipo-conta');
const rotuloNome = document.getElementById('rotulo-nome');
const campoNome = document.getElementById('nome');
const notaAgencia = document.getElementById('nota-agencia');

// O que muda em cada tipo de conta
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

    // marca o botão escolhido e desmarca o outro
    botoesTipo.forEach(function (botao) {
        const ativo = botao.dataset.tipo === tipo;
        botao.classList.toggle('active', ativo);
        botao.setAttribute('aria-checked', ativo);
    });

    // atualiza o campo de nome e o textinho
    rotuloNome.textContent = config.rotulo;
    campoNome.placeholder = config.placeholder;
    notaAgencia.hidden = !config.mostrarNota;
}

botoesTipo.forEach(function (botao) {
    botao.addEventListener('click', function () {
        selecionarTipo(botao.dataset.tipo);
    });
});

// Começa com "Viajante" selecionado
selecionarTipo('viajante');


/* ==================================================
   MOSTRAR / ESCONDER SENHA
================================================== */

const campoSenha = document.getElementById('senha');
const botaoOlho = document.getElementById('toggle-senha');
const iconeOlho = document.getElementById('icone-olho');

// Ajuste aqui se o nome da imagem do olho aberto for outro
const ICONE_FECHADO = 'assets/olho-fechado.png';
const ICONE_ABERTO = 'assets/olho-aberto.png';

botaoOlho.addEventListener('click', function () {
    const mostrando = campoSenha.type === 'text';

    campoSenha.type = mostrando ? 'password' : 'text';
    iconeOlho.src = mostrando ? ICONE_FECHADO : ICONE_ABERTO;
    botaoOlho.setAttribute('aria-label', mostrando ? 'Mostrar senha' : 'Esconder senha');
});
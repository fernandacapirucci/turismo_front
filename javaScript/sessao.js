/* Troca "Entrar ou cadastrar" por "Olá, Nome" + botão Sair quando está logado.
   Depende de api.js (carregue api.js antes). */
(function () {
    const botao = document.querySelector('.btn-login');
    const usuario = obterUsuario();

    if (!botao || !obterToken() || !usuario) return;

    const primeiroNome = (usuario.nome || '').split(' ')[0];

    // "Olá, Nome" (mantém o ícone de perfil)
    const icone = botao.querySelector('img');
    botao.textContent = '';
    if (icone) botao.appendChild(icone);
    botao.appendChild(document.createTextNode(' Olá, ' + primeiroNome));
    botao.removeAttribute('href');

    // Botão Sair ao lado
    const sairLink = document.createElement('a');
    sairLink.href = '#';
    sairLink.className = 'btn-login';
    sairLink.textContent = 'Sair';
    sairLink.addEventListener('click', function (e) {
        e.preventDefault();
        sair();
    });

    // Coloca os dois lado a lado
    const grupo = document.createElement('div');
    grupo.style.display = 'flex';
    grupo.style.gap = '10px';
    botao.parentNode.insertBefore(grupo, botao);
    grupo.appendChild(botao);
    grupo.appendChild(sairLink);
})();
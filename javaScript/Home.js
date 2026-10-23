document.addEventListener("DOMContentLoaded", function () {

    /* ==================================================
       ELEMENTOS DA PÁGINA
    ================================================== */

    const campoDestino = document.getElementById("destino");
    const campoData = document.getElementById("data");

    const selects = document.querySelectorAll(".input-box select");

    // selects[0] é o destino, por isso os outros começam do 1
    const campoViajantes = selects[1];
    const campoNecessidade = selects[2];

    const botaoBuscar = document.querySelector(".search");

    const cardsDestinos = document.querySelectorAll(".destinos-grid .card");

    const botaoChat = document.querySelector(".but-touch");


    /* ==================================================
       BUSCA PRINCIPAL
    ================================================== */

    if (botaoBuscar) {

        botaoBuscar.addEventListener("click", function () {

            const destino = campoDestino ? campoDestino.value.trim() : "";
            const data = campoData ? campoData.value : "";
            const viajantes = campoViajantes ? campoViajantes.value : "";
            const necessidade = campoNecessidade ? campoNecessidade.value : "";

            /* Verifica se o destino foi escolhido */

            if (destino === "") {

                mostrarMensagem("Escolha um destino para realizar a busca.");

                if (campoDestino) {
                    campoDestino.focus();
                }

                return;
            }

            /* Verifica a data */

            if (campoData && campoData.value !== "") {

                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);

                const dataEscolhida = new Date(campoData.value + "T00:00:00");

                if (dataEscolhida < hoje) {

                    mostrarMensagem("Escolha uma data igual ou posterior a hoje.");

                    campoData.focus();

                    return;
                }
            }

            /* Guarda os dados da busca para a página de Pacotes */

            const pesquisa = {
                destino: destino,
                data: data,
                viajantes: viajantes,
                necessidade: necessidade
            };

            sessionStorage.setItem("pesquisaTurismo", JSON.stringify(pesquisa));

            window.location.href = "Pacotes.html";
        });
    }


    /* ==================================================
       BOTÕES "VER PACOTES"
    ================================================== */

    cardsDestinos.forEach(function (card) {

        const botao = card.querySelector("button");

        if (!botao) {
            return;
        }

        botao.addEventListener("click", function () {

            const titulo = card.querySelector("h3");

            if (!titulo) {
                window.location.href = "Pacotes.html";
                return;
            }

            let destino = titulo.textContent.trim();

            // o card se chama "Gramado & Canela", mas o destino é "Gramado"
            if (destino === "Gramado & Canela") {
                destino = "Gramado";
            }

            const pesquisa = {
                destino: destino,
                data: "",
                viajantes: "",
                necessidade: ""
            };

            sessionStorage.setItem("pesquisaTurismo", JSON.stringify(pesquisa));

            window.location.href = "Pacotes.html";
        });

    });


    /* ==================================================
       MENU
    ================================================== */

    const linksMenu = document.querySelectorAll("#menu a");

    linksMenu.forEach(function (link) {

        link.addEventListener("click", function () {

            linksMenu.forEach(function (item) {
                item.classList.remove("active");
            });

            link.classList.add("active");

        });

    });


    /* ==================================================
       ROLAGEM SUAVE
    ================================================== */

    const linksInternos = document.querySelectorAll('a[href^="#"]');

    linksInternos.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const destino = link.getAttribute("href");

            if (!destino || destino === "#") {
                return;
            }

            const elemento = document.querySelector(destino);

            if (elemento) {

                event.preventDefault();

                elemento.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    /* ==================================================
       CHAT
    ================================================== */

    if (botaoChat) {

        botaoChat.addEventListener("click", function () {
            abrirChat();
        });

    }


    function abrirChat() {

        /* Se o chat já estiver aberto, fecha */

        const chatExistente = document.querySelector(".janela-chat");

        if (chatExistente) {
            chatExistente.remove();
            return;
        }

        const janela = document.createElement("div");

        janela.className = "janela-chat";
        janela.setAttribute("role", "dialog");
        janela.setAttribute("aria-label", "Atendimento Turismo sem Barreiras");

        janela.innerHTML = `

            <div class="chat-cabecalho">

                <strong>Turismo sem Barreiras</strong>

                <button class="fechar-chat" aria-label="Fechar atendimento">
                    ×
                </button>

            </div>

            <div class="chat-corpo">

                <p>Olá! 👋</p>

                <p>Como podemos ajudar?</p>

                <button class="opcao-chat">Encontrar um pacote</button>

                <button class="opcao-chat">Dúvidas sobre acessibilidade</button>

                <button class="opcao-chat">Falar com atendimento</button>

            </div>

        `;

        document.body.appendChild(janela);

        /* Botão fechar */

        const fechar = janela.querySelector(".fechar-chat");

        fechar.addEventListener("click", function () {

            janela.remove();

            if (botaoChat) {
                botaoChat.focus();
            }

        });

        /* Opções do chat */

        const opcoes = janela.querySelectorAll(".opcao-chat");

        opcoes.forEach(function (opcao) {

            opcao.addEventListener("click", function () {
                mostrarMensagem("Em breve um atendente poderá ajudar você.");
            });

        });

        /* Fecha com ESC */

        function fecharComEsc(event) {

            if (event.key === "Escape") {

                janela.remove();

                document.removeEventListener("keydown", fecharComEsc);

                if (botaoChat) {
                    botaoChat.focus();
                }

            }

        }

        document.addEventListener("keydown", fecharComEsc);

    }


    /* ==================================================
       MENSAGEM NA TELA
    ================================================== */

    function mostrarMensagem(texto) {

        const anterior = document.querySelector(".mensagem-site");

        if (anterior) {
            anterior.remove();
        }

        const mensagem = document.createElement("div");

        mensagem.className = "mensagem-site";
        mensagem.setAttribute("role", "alert");
        mensagem.textContent = texto;

        document.body.appendChild(mensagem);

        setTimeout(function () {
            mensagem.remove();
        }, 4000);

    }


    /* ==================================================
       ACESSIBILIDADE DOS CARDS
    ================================================== */

    cardsDestinos.forEach(function (card) {

        card.setAttribute("tabindex", "0");

        card.addEventListener("keydown", function (event) {

            // só age se o foco estiver no card, não no botão dentro dele
            if (event.target !== card) {
                return;
            }

            if (event.key === "Enter" || event.key === " ") {

                event.preventDefault();

                const botao = card.querySelector("button");

                if (botao) {
                    botao.click();
                }

            }

        });

    });


    /* ==================================================
       DATA MÍNIMA
    ================================================== */

    if (campoData) {

        const hoje = new Date();

        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, "0");
        const dia = String(hoje.getDate()).padStart(2, "0");

        campoData.min = `${ano}-${mes}-${dia}`;

    }



    /* ==================================================
       ANIMAÇÃO DOS ELEMENTOS AO ENTRAR NA TELA
    ================================================== */

    const elementosAnimados = document.querySelectorAll(
        ".card, .passos-grid > div, .agencia-section"
    );

    const observador = new IntersectionObserver(
        function (entradas) {

            entradas.forEach(function (entrada) {

                if (entrada.isIntersecting) {

                    entrada.target.classList.add("aparecer");

                    observador.unobserve(entrada.target);

                }

            });

        },
        { threshold: 0.15 }
    );

    elementosAnimados.forEach(function (elemento) {
        observador.observe(elemento);
    });

});
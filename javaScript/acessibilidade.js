(function () {

    var CHAVE = "modoTecladoTurismo";

    function lerEstado() {
        try {
            return localStorage.getItem(CHAVE) === "sim";
        } catch (e) {
            return false;
        }
    }

    function gravarEstado(ativo) {
        try {
            localStorage.setItem(CHAVE, ativo ? "sim" : "nao");
        } catch (e) {}
    }

    function iniciar() {

        /* ---------- Link "Pular para o conteúdo principal" ---------- */

        var alvo = document.querySelector("main, section");

        if (alvo) {

            if (!alvo.id) {
                alvo.id = "conteudo-principal";
            }

            alvo.setAttribute("tabindex", "-1");

            var pular = document.createElement("a");
            pular.className = "pular-conteudo";
            pular.href = "#" + alvo.id;
            pular.textContent = "Pular para o conteúdo principal";

            document.body.insertBefore(pular, document.body.firstChild);
        }

        /* ---------- Botão de acessibilidade ---------- */

        var botao = document.createElement("button");

        botao.type = "button";
        botao.id = "btn-acessibilidade";

        botao.innerHTML =
            '<svg viewBox="0 0 24 24" aria-hidden="true">' +
            '<circle cx="12" cy="12" r="10"/>' +
            '<circle cx="12" cy="7.2" r="1.4" fill="currentColor" stroke="none"/>' +
            '<path d="M6.8 10.2 12 11l5.2-.8M12 11v3.2M12 14.2l-2.6 4.2M12 14.2l2.6 4.2"/>' +
            '</svg>';

        document.body.appendChild(botao);

        /* ---------- Aviso de ajuda ---------- */

        var aviso = document.createElement("div");

        aviso.className = "aviso-teclado";
        aviso.setAttribute("role", "status");
        aviso.setAttribute("aria-live", "polite");
        aviso.hidden = true;

        document.body.appendChild(aviso);

        var temporizador = null;

        function mostrarAviso(texto) {

            aviso.textContent = texto;
            aviso.hidden = false;

            clearTimeout(temporizador);

            temporizador = setTimeout(function () {
                aviso.hidden = true;
            }, 7000);
        }

        /* ---------- Liga e desliga o modo ---------- */

        function aplicar(ativo, comAviso) {

            document.body.classList.toggle("modo-teclado", ativo);

            botao.setAttribute("aria-pressed", ativo ? "true" : "false");

            botao.setAttribute(
                "aria-label",
                ativo
                    ? "Desativar destaque de navegação por teclado"
                    : "Ativar destaque de navegação por teclado"
            );

            botao.title = botao.getAttribute("aria-label");

            if (comAviso) {
                mostrarAviso(
                    ativo
                        ? "Navegação por teclado ativada. Tab avança, Shift + Tab volta, Enter abre."
                        : "Navegação por teclado desativada."
                );
            }
        }

        aplicar(lerEstado(), false);

        botao.addEventListener("click", function () {

            var ativo = !document.body.classList.contains("modo-teclado");

            aplicar(ativo, true);
            gravarEstado(ativo);
        });

        /* ---------- Espaço também ativa links que funcionam como botão ---------- */

        document.addEventListener("keydown", function (evento) {

            if (
                evento.key === " " &&
                evento.target.matches &&
                evento.target.matches('a[role="button"]')
            ) {
                evento.preventDefault();
                evento.target.click();
            }
        });
    }

    if (document.body) {
        iniciar();
    } else {
        document.addEventListener("DOMContentLoaded", iniciar);
    }

})();
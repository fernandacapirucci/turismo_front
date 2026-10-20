document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // ELEMENTOS DA PÁGINA
    // ==========================================

    // Preço por pessoa de Fernando de Noronha (R$ 4.890,00)
    const PRECO_POR_PESSOA = 4890;

    const formulario = document.getElementById("form-pagamento");

    const campoViajantes = document.getElementById("viajantes");
    const campoData = document.getElementById("data-viagem");

    const resumoViajantes = document.getElementById("resumo-viajantes");
    const resumoData = document.getElementById("resumo-data");
    const resumoTotal = document.getElementById("valor-total");

    const infoMetodo = document.getElementById("info-metodo");
    const mensagemResultado = document.getElementById("mensagem-resultado");

    const opcoesPagamento = document.querySelectorAll(
        'input[name="metodo"]'
    );

    // ==========================================
    // RECEBER DATA ENVIADA PELO FN.HTML
    // ==========================================

    const parametrosURL = new URLSearchParams(
        window.location.search
    );

    const dataRecebida = parametrosURL.get("data");

    if (dataRecebida) {

        const opcaoEncontrada = Array.from(
            campoData.options
        ).find(function (opcao) {

            return opcao.value === dataRecebida;

        });

        if (opcaoEncontrada) {

            campoData.value = dataRecebida;

        }

    }

    // ==========================================
    // FORMATAR VALOR EM REAIS
    // ==========================================

    function formatarPreco(valor) {

        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    }

    // ==========================================
    // ATUALIZAR RESUMO DA VIAGEM
    // ==========================================

    function atualizarResumo() {

        const quantidade = Number(campoViajantes.value);

        const valorTotal = PRECO_POR_PESSOA * quantidade;

        resumoViajantes.textContent =
            quantidade === 1
                ? "1 pessoa"
                : `${quantidade} pessoas`;

        // Mostra o texto legível da opção (ex.: "12 a 15 de setembro"),
        // e não o value (ex.: "12-15-set")
        resumoData.textContent =
            campoData.options[campoData.selectedIndex].text;

        resumoTotal.textContent = formatarPreco(valorTotal);

    }

    // ==========================================
    // ATUALIZAR FORMA DE PAGAMENTO
    // ==========================================

    function atualizarFormaPagamento() {

        const metodoSelecionado = document.querySelector(
            'input[name="metodo"]:checked'
        );

        if (!metodoSelecionado) {
            return;
        }

        const metodo = metodoSelecionado.value;

        if (metodo === "pix") {

            infoMetodo.textContent =
                "Pix: quando o sistema de pagamentos estiver " +
                "integrado, você poderá pagar utilizando " +
                "um QR Code ou código Pix.";

        } else if (metodo === "cartao") {

            infoMetodo.textContent =
                "Cartão de crédito: o pagamento será realizado " +
                "por meio de um ambiente seguro do provedor. " +
                "Não solicitamos dados do cartão nesta página.";

        } else if (metodo === "boleto") {

            infoMetodo.textContent =
                "Boleto bancário: após a integração, " +
                "o sistema poderá disponibilizar um boleto " +
                "com valor e vencimento definidos.";

        }

    }

    // ==========================================
    // CONTINUAR PARA PAGAMENTO
    // ==========================================

    formulario.addEventListener("submit", function (evento) {

        evento.preventDefault();

        if (!formulario.reportValidity()) {
            return;
        }

        mensagemResultado.hidden = false;

        mensagemResultado.textContent =
            "O pagamento ainda não está disponível. " +
            "A tela está preparada para a integração " +
            "com o backend e com um provedor de pagamentos. " +
            "Nenhuma reserva foi registrada e nenhuma " +
            "cobrança foi realizada.";

        mensagemResultado.focus();

    });

    // ==========================================
    // EVENTOS
    // ==========================================

    campoViajantes.addEventListener(
        "change",
        atualizarResumo
    );

    campoData.addEventListener(
        "change",
        atualizarResumo
    );

    opcoesPagamento.forEach(function (opcao) {

        opcao.addEventListener(
            "change",
            atualizarFormaPagamento
        );

    });

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    atualizarResumo();
    atualizarFormaPagamento();

});

document.addEventListener("DOMContentLoaded", function () {

    const PRECO_POR_PESSOA = 1590;

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

    // RECEBER DATA DA PÁGINA DO DESTINO

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

    // FORMATAR PREÇO

    function formatarPreco(valor) {

        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    }

    // ATUALIZAR RESUMO

    function atualizarResumo() {

        const quantidade = Number(campoViajantes.value);

        const valorTotal = PRECO_POR_PESSOA * quantidade;

        resumoViajantes.textContent =
            quantidade === 1
                ? "1 pessoa"
                : `${quantidade} pessoas`;

        resumoData.textContent = campoData.value;

        resumoTotal.textContent = formatarPreco(valorTotal);

    }

    // ATUALIZAR FORMA DE PAGAMENTO

    function atualizarFormaPagamento() {

        const metodoSelecionado = document.querySelector(
            'input[name="metodo"]:checked'
        );

        if (!metodoSelecionado) {
            return;
        }

        if (metodoSelecionado.value === "pix") {

            infoMetodo.textContent =
                "Pix: quando o sistema estiver integrado, " +
                "será possível realizar o pagamento " +
                "por QR Code ou código Pix.";

        } else if (metodoSelecionado.value === "cartao") {

            infoMetodo.textContent =
                "Cartão de crédito: os dados serão " +
                "informados diretamente no ambiente " +
                "do provedor de pagamentos.";

        } else if (metodoSelecionado.value === "boleto") {

            infoMetodo.textContent =
                "Boleto: quando a integração estiver " +
                "disponível, o sistema poderá gerar " +
                "um boleto com valor e vencimento.";

        }

    }

    // ENVIAR FORMULÁRIO

    formulario.addEventListener("submit", function (evento) {

        evento.preventDefault();

        if (!formulario.reportValidity()) {
            return;
        }

        mensagemResultado.hidden = false;

        mensagemResultado.textContent =
            "O pagamento ainda não está disponível. " +
            "Nenhuma reserva foi registrada e " +
            "nenhuma cobrança foi realizada.";

        mensagemResultado.focus();

    });

    // EVENTOS

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

    // INICIALIZAÇÃO

    atualizarResumo();
    atualizarFormaPagamento();

});

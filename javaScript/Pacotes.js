/*
====================================================
TURISMO SEM BARREIRAS
JavaScript da página de Pacotes
====================================================
*/

document.addEventListener("DOMContentLoaded", function () {

    /* ================= ELEMENTOS ================= */

    const cards = Array.from(document.querySelectorAll(".pacote-card"));
    const grid = document.querySelector(".pacotes-grid");
    const filtros = document.querySelectorAll(".filtros select");
    const checkboxes = document.querySelectorAll(".check input[type='checkbox']");
    const ordenacao = document.querySelector(".ordenacao select");
    const contador = document.querySelector(".titulo-pagina p");

    /* ================= ACESSIBILIDADE INICIAL ================= */

    // Leitor de tela anuncia a mudança do contador
    if (contador) {
        contador.setAttribute("role", "status");
        contador.setAttribute("aria-live", "polite");
        contador.setAttribute("aria-atomic", "true");
    }

    cards.forEach(function (card) {

        const titulo = card.querySelector("h3").textContent.trim();

        // Botões "Ver detalhes" distinguíveis entre si
        const botao = card.querySelector("button");
        if (botao) {
            botao.setAttribute("aria-label", "Ver detalhes: " + titulo);
        }

        // Nota lida como "Avaliação 4.9 de 5"
        const nota = card.querySelector(".titulo-avaliacao span");
        if (nota) {
            const valor = nota.textContent.replace(/[^\d.]/g, "");
            nota.setAttribute("aria-label", "Avaliação " + valor + " de 5");
        }

        // Emojis das tags não são lidos em voz alta
        card.querySelectorAll(".tags span").forEach(function (tag) {
            const texto = tag.textContent.trim();
            const espaco = texto.indexOf(" ");
            if (espaco > 0) {
                const emoji = document.createElement("span");
                emoji.setAttribute("aria-hidden", "true");
                emoji.textContent = texto.slice(0, espaco) + " ";
                tag.textContent = texto.slice(espaco + 1);
                tag.prepend(emoji);
            }
        });

    });

    /* ================= GUARDAR ORDEM ORIGINAL ================= */

    cards.forEach(function (card, index) {
        card.dataset.indice = index;
        card.dataset.ordemOriginal = index;
    });

    /* ================= PESQUISA DA HOME ================= */

    let pesquisaHome = null;

    const pesquisaSalva = sessionStorage.getItem("pesquisaTurismo");

    if (pesquisaSalva) {
        try {
            pesquisaHome = JSON.parse(pesquisaSalva);
        } catch (erro) {
            console.log("Erro ao recuperar pesquisa da Home.");
        }

        // usa a pesquisa uma vez só (F5 ou clicar em "Pacotes" mostra tudo)
        sessionStorage.removeItem("pesquisaTurismo");
    }

    /* ================= NORMALIZAR TEXTO ================= */

    function normalizar(texto) {

        if (!texto) {
            return "";
        }

        return texto
            .toString()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();

    }

    /* ================= CONVERTER DEFICIÊNCIA ================= */

    function converterDeficiencia(texto) {

        const valor = normalizar(texto);

        if (
            valor.includes("fisic") ||
            valor.includes("cadeir") ||
            valor.includes("mobil") ||
            valor.includes("motor")
        ) {
            return "fisica";
        }

        if (valor.includes("visual")) {
            return "visual";
        }

        if (valor.includes("auditiv")) {
            return "auditiva";
        }

        if (valor.includes("intelect")) {
            return "intelectual";
        }

        return "";

    }

    /* ================= DADOS DOS PACOTES (lidos do HTML) ================= */

    const regioesPorEstado = {
        PR: "Sul", RS: "Sul", SC: "Sul",
        SP: "Sudeste", RJ: "Sudeste", MG: "Sudeste", ES: "Sudeste",
        BA: "Nordeste", MA: "Nordeste", PE: "Nordeste", CE: "Nordeste",
        RN: "Nordeste", PB: "Nordeste", AL: "Nordeste", SE: "Nordeste", PI: "Nordeste",
        MS: "Centro-Oeste", MT: "Centro-Oeste", GO: "Centro-Oeste", DF: "Centro-Oeste",
        AM: "Norte", PA: "Norte", AC: "Norte", RO: "Norte", RR: "Norte", AP: "Norte", TO: "Norte"
    };

    const nomesDeficiencia = {
        fisica: "Física",
        visual: "Visual",
        auditiva: "Auditiva",
        intelectual: "Intelectual"
    };

    const dadosPacotes = cards.map(function (card) {

        const local = card.querySelector(".local").textContent.trim();
        const uf = local.slice(-2).toUpperCase();

        const preco = parseInt(
            card.querySelectorAll(".preco strong")[1].textContent.replace(/\D/g, "")
        );

        const duracao = parseInt(card.querySelector(".preco small").textContent);

        const avaliacao = parseFloat(
            card.querySelector(".titulo-avaliacao span").textContent.replace(/[^\d.]/g, "")
        );

        const tags = normalizar(card.querySelector(".tags").textContent);

        // Lê do atributo data-deficiencias (aceita maiúsculas e minúsculas)
        const deficiencias = (card.dataset.deficiencias || "")
            .split(",")
            .map(converterDeficiencia)
            .filter(Boolean);

        // Atualiza o texto "Atende:" do card com a lista real
        const atendimento = card.querySelector(".atendimento");

        if (atendimento) {
            atendimento.textContent =
                "◉ Atende: " +
                deficiencias.map(function (d) {
                    return nomesDeficiencia[d];
                }).join(", ");
        }

        return {
            regiao: regioesPorEstado[uf] || "",
            deficiencias: deficiencias,
            preco: preco,
            duracao: duracao,
            avaliacao: avaliacao,
            transporte: tags.includes("transporte adaptado"),
            hospedagem: tags.includes("hospedagem"),
            passeio: tags.includes("passeio acessivel")
        };

    });

    /* ================= ENCONTRAR DESTINO ================= */

    function destinoCombina(card, destino) {

        if (!destino) {
            return true;
        }

        const busca = normalizar(destino);

        // Procura só no título e no local (não na descrição)
        const textoCard = normalizar(
            card.querySelector("h3").textContent + " " +
            card.querySelector(".local").textContent
        );

        if (textoCard.includes(busca)) {
            return true;
        }

        // Nomes que podem estar escritos de outro jeito no card
        const equivalencias = {
            "foz do iguacu": "foz de iguacu",
            "gramado": "gramado",
            "rio de janeiro": "rio de janeiro",
            "lencois maranhenses": "lencois",
            "fernando de noronha": "noronha"
        };

        return !!(
            equivalencias[busca] &&
            textoCard.includes(equivalencias[busca])
        );

    }

    /* ================= MOSTRAR PESQUISA DA HOME ================= */

    function mostrarPesquisaHome() {

        if (!pesquisaHome) {
            return;
        }

        const destino = pesquisaHome.destino || "";

        // "Qualquer necessidade" não conta como necessidade
        const necessidade = converterDeficiencia(pesquisaHome.necessidade)
            ? pesquisaHome.necessidade
            : "";

        if (destino === "" && necessidade === "") {
            return;
        }

        let resumo = document.querySelector(".resumo-pesquisa");

        if (!resumo) {

            resumo = document.createElement("div");
            resumo.className = "resumo-pesquisa";
            resumo.setAttribute("role", "status");

            const titulo = document.querySelector(".titulo-pagina");

            if (titulo) {
                titulo.appendChild(resumo);
            }

        }

        let texto = "Pesquisa realizada";

        if (destino) {
            texto += " para: " + destino;
        }

        if (necessidade) {
            texto += " | Necessidade: " + necessidade;
        }

        resumo.textContent = texto;

    }

    /* ================= FILTRO PRINCIPAL ================= */

    function aplicarFiltros() {

        const regiaoSelecionada = filtros[0] ? filtros[0].value : "Todas";
        const deficienciaSelecionada = filtros[1] ? filtros[1].value : "Qualquer";
        const precoSelecionado = filtros[2] ? filtros[2].value : "Qualquer";
        const duracaoSelecionada = filtros[3] ? filtros[3].value : "Qualquer";

        let precoMaximo = Infinity;

        if (precoSelecionado !== "Qualquer") {
            precoMaximo = parseInt(precoSelecionado.replace(/\D/g, ""));
        }

        let duracaoFiltro = null;

        if (duracaoSelecionada === "Até 3 dias") {
            duracaoFiltro = 3;
        } else if (duracaoSelecionada !== "Qualquer") {
            duracaoFiltro = parseInt(duracaoSelecionada);
        }

        const necessidadeHome = pesquisaHome
            ? converterDeficiencia(pesquisaHome.necessidade)
            : "";

        const destinoHome = pesquisaHome ? pesquisaHome.destino : "";

        let quantidade = 0;

        cards.forEach(function (card, index) {

            const dados = dadosPacotes[index];

            let mostrar = true;

            /* REGIÃO */
            if (
                regiaoSelecionada !== "Todas" &&
                dados.regiao !== regiaoSelecionada
            ) {
                mostrar = false;
            }

            /* DEFICIÊNCIA DO FILTRO */
            if (mostrar && deficienciaSelecionada !== "Qualquer") {
                const deficiencia = converterDeficiencia(deficienciaSelecionada);
                if (!dados.deficiencias.includes(deficiencia)) {
                    mostrar = false;
                }
            }

            /* DEFICIÊNCIA VINDA DA HOME */
            if (mostrar && necessidadeHome) {
                if (!dados.deficiencias.includes(necessidadeHome)) {
                    mostrar = false;
                }
            }

            /* DESTINO VINDO DA HOME */
            if (mostrar && destinoHome) {
                if (!destinoCombina(card, destinoHome)) {
                    mostrar = false;
                }
            }

            /* PREÇO */
            if (mostrar && dados.preco > precoMaximo) {
                mostrar = false;
            }

            /* DURAÇÃO */
            if (mostrar && duracaoFiltro !== null) {
                if (duracaoSelecionada === "Até 3 dias") {
                    if (dados.duracao > 3) {
                        mostrar = false;
                    }
                } else if (dados.duracao !== duracaoFiltro) {
                    mostrar = false;
                }
            }

            /* ACESSIBILIDADE */
            if (mostrar && checkboxes[0] && checkboxes[0].checked && !dados.transporte) {
                mostrar = false;
            }

            if (mostrar && checkboxes[1] && checkboxes[1].checked && !dados.hospedagem) {
                mostrar = false;
            }

            if (mostrar && checkboxes[2] && checkboxes[2].checked && !dados.passeio) {
                mostrar = false;
            }

            /* MOSTRAR OU ESCONDER (hidden esconde também de leitores de tela e do teclado) */
            card.hidden = !mostrar;

            if (mostrar) {
                quantidade++;
            }

        });

        ordenarPacotes();
        atualizarContador(quantidade);
        verificarNenhumResultado(quantidade);

    }

    /* ================= ORDENAÇÃO ================= */

    function ordenarPacotes() {

        if (!grid || !ordenacao) {
            return;
        }

        const opcao = ordenacao.value;

        const cardsOrdenados = [...cards];

        cardsOrdenados.sort(function (a, b) {

            const dadosA = dadosPacotes[parseInt(a.dataset.indice)];
            const dadosB = dadosPacotes[parseInt(b.dataset.indice)];

            if (opcao === "Menor preço") {
                return dadosA.preco - dadosB.preco;
            }

            if (opcao === "Maior preço") {
                return dadosB.preco - dadosA.preco;
            }

            if (opcao === "Melhor avaliação") {
                return dadosB.avaliacao - dadosA.avaliacao;
            }

            return (
                parseInt(a.dataset.ordemOriginal) -
                parseInt(b.dataset.ordemOriginal)
            );

        });

        cardsOrdenados.forEach(function (card) {
            grid.appendChild(card);
        });

    }

    /* ================= CONTADOR ================= */

    function atualizarContador(quantidade) {

        if (!contador) {
            return;
        }

        if (quantidade === 0) {
            contador.textContent = "Nenhum pacote encontrado.";
            return;
        }

        contador.textContent =
            quantidade +
            (quantidade === 1 ? " pacote encontrado" : " pacotes encontrados") +
            " com acessibilidade auditada";

    }

    /* ================= NENHUM RESULTADO ================= */

    function verificarNenhumResultado(quantidade) {

        let mensagem = document.querySelector(".sem-resultados");

        if (quantidade === 0) {

            if (!mensagem) {

                mensagem = document.createElement("div");
                mensagem.className = "sem-resultados";

                // Sem role="status": o contador já anuncia "Nenhum pacote encontrado"
                mensagem.innerHTML = `
                    <strong>Nenhum pacote encontrado</strong>
                    <p>Tente mudar os filtros ou pesquisar outro destino.</p>
                    <button type="button" class="btn-limpar-resultados">
                        Limpar filtros
                    </button>
                `;

                grid.appendChild(mensagem);

                mensagem
                    .querySelector(".btn-limpar-resultados")
                    .addEventListener("click", limparFiltros);

            }

        } else if (mensagem) {
            mensagem.remove();
        }

    }

    /* ================= LIMPAR FILTROS ================= */

    function limparFiltros() {

        filtros.forEach(function (select) {
            select.selectedIndex = 0;
        });

        checkboxes.forEach(function (checkbox) {
            checkbox.checked = false;
        });

        sessionStorage.removeItem("pesquisaTurismo");
        pesquisaHome = null;

        const resumo = document.querySelector(".resumo-pesquisa");

        if (resumo) {
            resumo.remove();
        }

        aplicarFiltros();

        // Devolve o foco ao primeiro filtro (o botão clicado pode ter sido removido)
        if (filtros[0]) {
            filtros[0].focus();
        }

    }

    /* ================= BOTÃO LIMPAR FILTROS ================= */

    const tituloFiltros = document.querySelector(".filtros h3");

    if (tituloFiltros) {

        const botaoLimpar = document.createElement("button");

        botaoLimpar.textContent = "Limpar filtros";
        botaoLimpar.type = "button";
        botaoLimpar.className = "limpar-filtros";

        // Fora do <h3>, para não virar parte do título
        tituloFiltros.insertAdjacentElement("afterend", botaoLimpar);

        botaoLimpar.addEventListener("click", limparFiltros);

    }

    /* ================= ESTILOS DOS ELEMENTOS CRIADOS PELO JS ================= */

    const estilo = document.createElement("style");

    estilo.textContent = `

        .pacote-card[hidden] {
            display: none !important;
        }

        .resumo-pesquisa {
            margin-top: 12px;
            padding: 12px 16px;
            border-radius: 10px;
            background: #e8f4f4;
            color: #185f63;
            font-size: 14px;
            font-weight: bold;
        }

        .limpar-filtros {
            display: block;
            margin-top: 10px;
            width: 100%;
            min-height: 44px;
            padding: 8px 10px;
            border: 1px solid #100633;
            border-radius: 8px;
            background: white;
            color: #100633;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
        }

        .limpar-filtros:hover {
            background: #100633;
            color: white;
        }

        .limpar-filtros:focus-visible,
        .btn-limpar-resultados:focus-visible,
        .filtros select:focus-visible,
        .filtros input:focus-visible,
        .ordenacao select:focus-visible {
            outline: 3px solid #185f63;
            outline-offset: 2px;
        }

        .sem-resultados {
            grid-column: 1 / -1;
            padding: 45px 20px;
            text-align: center;
            border: 1px solid #ddd;
            border-radius: 15px;
            background: white;
        }

        .sem-resultados strong {
            display: block;
            color: #100633;
            font-size: 20px;
            margin-bottom: 10px;
        }

        .sem-resultados p {
            color: #595959;
            font-size: 15px;
            margin-bottom: 20px;
        }

        .btn-limpar-resultados {
            min-height: 44px;
            padding: 10px 20px;
            border: none;
            border-radius: 22px;
            background: #100633;
            color: white;
            cursor: pointer;
            font-weight: bold;
        }

        @media (prefers-reduced-motion: reduce) {
            * {
                transition: none !important;
                animation: none !important;
            }
        }

    `;

    document.head.appendChild(estilo);

    /* ================= EVENTOS ================= */

    filtros.forEach(function (select) {
        select.addEventListener("change", aplicarFiltros);
    });

    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener("change", aplicarFiltros);
    });

    if (ordenacao) {
        ordenacao.addEventListener("change", aplicarFiltros);
    }

    /* ================= INICIALIZAÇÃO ================= */

    mostrarPesquisaHome();
    aplicarFiltros();

});
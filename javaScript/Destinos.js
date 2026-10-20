// Galeria: troca a foto principal ao clicar nas miniaturas ou nas setas
const fotoPrincipal = document.getElementById("foto-principal");
const miniaturas = document.querySelectorAll(".mini");
const fotos = [fotoPrincipal.getAttribute("src")];
const textos = [fotoPrincipal.getAttribute("alt")];

miniaturas.forEach((mini) => {
    const img = mini.querySelector("img");
    fotos.push(img.getAttribute("src"));
    textos.push(img.getAttribute("alt"));
});

let atual = 0;

function mostrarFoto(indice) {
    atual = (indice + fotos.length) % fotos.length;
    fotoPrincipal.src = fotos[atual];
    fotoPrincipal.alt = textos[atual];

    miniaturas.forEach((mini, i) => {
        mini.classList.toggle("ativa", i + 1 === atual);
    });
}

miniaturas.forEach((mini, i) => {
    mini.addEventListener("click", () => mostrarFoto(i + 1));
});

document.getElementById("foto-anterior").addEventListener("click", () => mostrarFoto(atual - 1));
document.getElementById("foto-proxima").addEventListener("click", () => mostrarFoto(atual + 1));

// Filtros das fotos do passeio
const filtros = document.querySelectorAll(".filtro");
const cards = document.querySelectorAll(".foto-card");

filtros.forEach((botao) => {
    botao.addEventListener("click", () => {
        const categoria = botao.dataset.filtro;

        filtros.forEach((f) => f.classList.remove("ativo"));
        botao.classList.add("ativo");

        cards.forEach((card) => {
            card.hidden = categoria !== "todos" && card.dataset.categoria !== categoria;
        });
    });
});

// Janelas (modais): Ouvir em áudio, Vídeo em Libras e Leitura fácil
function ligarModal(idBotao, idModal, idFechar, aoFechar, aoAbrir) {
    const botao = document.getElementById(idBotao);
    const janela = document.getElementById(idModal);
    const fechar = document.getElementById(idFechar);

    if (!botao || !janela || !fechar) {
        console.error("Elemento não encontrado:", idBotao, idModal, idFechar);
        return;
    }

    botao.addEventListener("click", (e) => {
        e.preventDefault();
        if (!janela.open) {
            janela.showModal();
            if (aoAbrir) aoAbrir();
        }
    });

    fechar.addEventListener("click", () => janela.close());

    janela.addEventListener("click", (e) => {
        if (e.target === janela) janela.close();
    });

    if (aoFechar) janela.addEventListener("close", aoFechar);
}

// Áudio: toca ao abrir e pausa/volta ao início ao fechar
const playerAudio = document.getElementById("player-audio");

ligarModal(
    "btn-audio",
    "modal-audio",
    "fechar-audio",
    () => {
        if (playerAudio) {
            playerAudio.pause();
            playerAudio.currentTime = 0;
        }
    },
    () => {
        if (playerAudio) playerAudio.play().catch(() => {});
    }
);

// Vídeo em Libras
const videoLibras = document.getElementById("video-libras");

ligarModal("btn-libras", "modal-libras", "fechar-libras", () => {
    if (videoLibras) {
        videoLibras.pause();
        videoLibras.currentTime = 0;
    }
});

// Leitura fácil
ligarModal("btn-leitura", "modal-leitura", "fechar-leitura");

// Mostra um aviso se o arquivo de áudio não for encontrado
const fonteAudio = document.getElementById("fonte-audio");
const erroAudio = document.getElementById("erro-audio");

if (fonteAudio && erroAudio) {
    fonteAudio.addEventListener("error", () => {
        erroAudio.hidden = false;
    });
}
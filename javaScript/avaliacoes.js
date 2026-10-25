(function () {
  'use strict';

  var secao = document.getElementById('avaliacoes');
  if (!secao) return;

  // vêm do data-* da <section id="avaliacoes"> no HTML de cada destino
  var NOTA_BASE = parseFloat(secao.getAttribute('data-nota')) || 5;
  var TOTAL_BASE = parseInt(secao.getAttribute('data-total'), 10) || 0;
  var CHAVE = 'tsb_avaliacoes_' + (secao.getAttribute('data-destino') || 'destino');
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  var lista = document.getElementById('av-lista');
  var form = document.getElementById('av-form');
  var btnAbrir = document.getElementById('av-abrir-form');
  var btnCancelar = document.getElementById('av-cancelar');
  var btnVerTodas = document.getElementById('av-ver-todas');
  var elNota = document.getElementById('av-nota');
  var elTotal = document.getElementById('av-total');
  var elStatus = document.getElementById('av-status');
  var elTexto = document.getElementById('av-texto');
  var elContador = document.getElementById('av-contador');

  if (!lista || !form) return;

  var novas = carregar();

  novas.forEach(function (a) {
    if (!a.id) a.id = gerarId();
    lista.appendChild(criarItem(a, false));
  });
  atualizarResumo();
  atualizarBotaoVerTodas();

  /* ---------- eventos ---------- */

  btnAbrir.addEventListener('click', function () {
    var abrir = form.hidden;
    form.hidden = !abrir;
    btnAbrir.setAttribute('aria-expanded', String(abrir));
    if (abrir) {
      document.getElementById('av-nome').focus();
      form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  btnCancelar.addEventListener('click', fecharForm);

  // apagar: só existe botão nas avaliações criadas neste navegador (as do próprio usuário)
  lista.addEventListener('click', function (e) {
    var btn = e.target.closest('.av__apagar');
    if (!btn) return;
    var item = btn.closest('.av__item');
    var id = item && item.getAttribute('data-id');
    var minha = novas.some(function (a) { return a.id === id; });
    if (!minha) return;
    if (!window.confirm('Apagar sua avaliação? Essa ação não pode ser desfeita.')) return;

    novas = novas.filter(function (a) { return a.id !== id; });
    salvar();
    item.remove();
    atualizarResumo();
    atualizarBotaoVerTodas();
    btnAbrir.focus();
    elStatus.textContent = 'Avaliação apagada.';
    setTimeout(function () { elStatus.textContent = ''; }, 4000);
  });

  btnVerTodas.addEventListener('click', function () {
    var aberta = lista.classList.toggle('is-aberta');
    btnVerTodas.setAttribute('aria-expanded', String(aberta));
    btnVerTodas.textContent = aberta ? 'Ver menos' : 'Ver todas as avaliações';
  });

  elTexto.addEventListener('input', function () {
    elContador.textContent = elTexto.value.length;
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    limparErros();

    var nome = form.nome.value.trim();
    var perfil = form.perfil.value;
    var nota = Number(form.nota.value);
    var texto = form.texto.value.trim();
    var mes = form.mes.value; // "2026-09" ou ""
    var ok = true;

    if (!nome) { erro('av-nome', 'Digite seu nome.'); ok = false; }
    if (!perfil) { erro('av-perfil', 'Escolha seu perfil.'); ok = false; }
    if (!nota) { erro('nota', 'Escolha uma nota de 1 a 5.'); ok = false; }
    if (texto.length < 10) { erro('av-texto', 'Escreva pelo menos 10 caracteres.'); ok = false; }
    if (!ok) {
      var primeiro = form.querySelector('.is-invalido') || form.querySelector('.av__estrelas-input input');
      if (primeiro) primeiro.focus();
      return;
    }

    var avaliacao = { id: gerarId(), nome: nome, perfil: perfil, nota: nota, texto: texto, data: formatarData(mes) };
    novas.push(avaliacao);
    salvar();

    var item = criarItem(avaliacao, true);
    lista.appendChild(item);            // entra depois do João P.
    lista.classList.add('is-aberta');   // garante que apareça mesmo com a lista recolhida
    btnVerTodas.setAttribute('aria-expanded', 'true');
    btnVerTodas.textContent = 'Ver menos';

    atualizarResumo();
    atualizarBotaoVerTodas();
    fecharForm();
    form.reset();
    elContador.textContent = '0';

    elStatus.textContent = 'Avaliação publicada. Obrigado por compartilhar!';
    setTimeout(function () { elStatus.textContent = ''; }, 5000);
    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  /* ---------- funções ---------- */

  function criarItem(a, nova) {
    var art = document.createElement('article');
    art.className = 'av__item' + (nova ? ' av__item--nova' : '');
    art.setAttribute('data-id', a.id);

    var avatar = document.createElement('div');
    avatar.className = 'av__avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = a.nome.charAt(0).toUpperCase();

    var autor = document.createElement('div');
    autor.className = 'av__autor';
    var nome = document.createElement('p');
    nome.className = 'av__nome';
    nome.textContent = a.nome;
    var data = document.createElement('p');
    data.className = 'av__data';
    data.textContent = a.data;
    autor.appendChild(nome);
    autor.appendChild(data);

    var conteudo = document.createElement('div');
    conteudo.className = 'av__conteudo';
    var estrelas = document.createElement('p');
    estrelas.className = 'av__estrelas';
    estrelas.setAttribute('role', 'img');
    estrelas.setAttribute('aria-label', a.nota + ' de 5 estrelas');
    estrelas.textContent = new Array(a.nota + 1).join('★') + new Array(6 - a.nota).join('☆');
    var texto = document.createElement('p');
    texto.className = 'av__texto';
    texto.textContent = a.texto;          // textContent evita injeção de HTML
    var tag = document.createElement('span');
    tag.className = 'av__tag';
    tag.textContent = a.perfil;
    conteudo.appendChild(estrelas);
    conteudo.appendChild(texto);
    conteudo.appendChild(tag);

    art.appendChild(avatar);
    art.appendChild(autor);
    art.appendChild(conteudo);

    var apagar = document.createElement('button');
    apagar.type = 'button';
    apagar.className = 'av__apagar';
    apagar.setAttribute('aria-label', 'Apagar minha avaliação');
    apagar.title = 'Apagar minha avaliação';
    apagar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12"/><path d="M9 7V4h6v3"/></svg>';
    art.appendChild(apagar);
    return art;
  }

  function atualizarResumo() {
    var soma = NOTA_BASE * TOTAL_BASE;
    novas.forEach(function (a) { soma += a.nota; });
    var total = TOTAL_BASE + novas.length;
    elNota.textContent = (soma / total).toFixed(1).replace('.', ',');
    elTotal.textContent = total;
  }

  function atualizarBotaoVerTodas() {
    btnVerTodas.hidden = lista.children.length <= 3;
  }

  function gerarId() {
    return 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function formatarData(mes) {
    if (mes) {
      var p = mes.split('-');
      return 'viajou em ' + MESES[Number(p[1]) - 1] + '/' + p[0];
    }
    var hoje = new Date();
    return 'publicado em ' + MESES[hoje.getMonth()] + '/' + hoje.getFullYear();
  }

  function fecharForm() {
    form.hidden = true;
    btnAbrir.setAttribute('aria-expanded', 'false');
    limparErros();
    btnAbrir.focus();
  }

  function erro(id, msg) {
    var alvo = form.querySelector('[data-erro-para="' + id + '"]');
    if (alvo) alvo.textContent = msg;
    var campo = document.getElementById(id);
    if (campo) campo.classList.add('is-invalido');
  }

  function limparErros() {
    form.querySelectorAll('.av__erro').forEach(function (el) { el.textContent = ''; });
    form.querySelectorAll('.is-invalido').forEach(function (el) { el.classList.remove('is-invalido'); });
  }

  function carregar() {
    try { return JSON.parse(localStorage.getItem(CHAVE)) || []; }
    catch (e) { return []; }
  }

  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(novas)); }
    catch (e) { /* sem armazenamento: a avaliação fica só até recarregar a página */ }
  }
})();
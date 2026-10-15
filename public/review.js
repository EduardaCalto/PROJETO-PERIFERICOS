const elStatus = document.getElementById('status');
const elConteudo = document.getElementById('conteudo');

// Ícones dos critérios (textos fixos do código; o banco só escolhe a chave)
const ICONES = {
  coracao: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  carteira: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  bateria: '<rect width="16" height="10" x="2" y="7" rx="2"/><path d="M22 11v2M6 11v2M10 11v2"/>',
  estrela: '<path d="M12 3c.6 5 2.4 6.8 9 9-6.6 2.2-8.4 4-9 9-.6-5-2.4-6.8-9-9 6.6-2.2 8.4-4 9-9Z"/>'
};

function mostrarErro(texto) {
  elStatus.className = 'status erro';
  elStatus.textContent = texto;
}

function criarIcone(chave) {
  const span = criar('span', 'icone');
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONES[chave] || ICONES.estrela}</svg>`;
  return span;
}

function secao(titulo) {
  const s = criar('section', 'review-secao');
  s.appendChild(criar('h2', '', titulo));
  return s;
}

function lista(itens) {
  const ul = criar('ul');
  itens.forEach((t) => ul.appendChild(criar('li', '', t)));
  return ul;
}

function cabecalho(p) {
  const cab = criar('header', 'review-cab');

  cab.appendChild(criarFoto(p, 'foto review-foto'));

  const info = criar('div');
  info.appendChild(criar('p', 'marca review-selo', `${p.marca} · ${NOME_CATEGORIA[p.categoria] || p.categoria}`));
  info.appendChild(criar('h1', '', p.nome));
  if (p.temReview && temValor(p.nota)) {
    info.appendChild(criar('p', 'review-nota', `${String(p.nota).replace('.', ',')}/10`));
    info.appendChild(criar('p', 'review-sub', 'Avaliação pessoal'));
  } else if (!p.temReview) {
    info.appendChild(criar('p', 'review-sub', 'Ainda não avaliei este produto'));
  }
  cab.appendChild(info);
  return cab;
}

function blocoReview(p, artigo) {
  const positivos = (p.pontosPositivos || []).filter(temValor);
  const negativos = (p.pontosNegativos || []).filter(temValor);
  const criterios = (p.criterios || []).filter((c) => c && temValor(c.titulo));
  const veredito = temValor(p.review) ? p.review : null;

  if (!positivos.length && !negativos.length && !criterios.length && !veredito) {
    artigo.appendChild(criar('p', 'review-vazio', 'Review em breve. Por enquanto, confira a ficha técnica abaixo.'));
    return;
  }

  if (positivos.length) {
    const s = secao('Pontos positivos');
    s.appendChild(lista(positivos));
    artigo.appendChild(s);
  }
  if (negativos.length) {
    const s = secao('Pontos negativos');
    s.appendChild(lista(negativos));
    artigo.appendChild(s);
  }
  if (criterios.length) {
    const grade = criar('div', 'criterios');
    criterios.forEach((c) => {
      const card = criar('div', 'criterio');
      card.appendChild(criarIcone(c.icone));
      card.appendChild(criar('h3', '', c.titulo));
      if (temValor(c.texto)) card.appendChild(criar('p', '', c.texto));
      grade.appendChild(card);
    });
    artigo.appendChild(grade);
  }
  if (veredito) {
    const caixa = criar('div', 'veredito');
    caixa.appendChild(criar('p', 'veredito-rotulo', 'Meu veredito'));
    caixa.appendChild(criar('p', '', veredito));
    artigo.appendChild(caixa);
  }
}

function blocoFicha(p, artigo) {
  const specs = Object.entries(CAMPOS).filter(([chave]) => temValor((p.specs || {})[chave]));
  if (!specs.length) return;

  const s = secao('Ficha técnica');
  const dl = criar('dl', 'specs');
  specs.forEach(([chave, [rotulo, unidade]]) => {
    const linha = criar('div');
    linha.appendChild(criar('dt', '', rotulo));
    linha.appendChild(criar('dd', '', formatarValor(p.specs[chave], unidade)));
    dl.appendChild(linha);
  });
  s.appendChild(dl);
  artigo.appendChild(s);
}

function blocoAcoes(p, artigo) {
  const acoes = criar('div', 'review-acoes');
  if (urlSegura(p.videoUrl)) {
    const a = criar('a', 'botao', 'Assistir ao vídeo');
    a.href = p.videoUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    acoes.appendChild(a);
  }
  if (urlSegura(p.fonteSpecs)) {
    const a = criar('a', 'ver-review', 'Ver produto');
    a.href = p.fonteSpecs;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    acoes.appendChild(a);
  }
  if (acoes.children.length) artigo.appendChild(acoes);
}

async function carregar() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    mostrarErro('Escolha um produto na lista para ver o review.');
    return;
  }

  try {
    const resposta = await fetch(`/api/produtos/${encodeURIComponent(id)}`);
    if (resposta.status === 404 || resposta.status === 400) {
      mostrarErro('Não encontrei esse produto. Volte para a lista e escolha de novo.');
      return;
    }
    if (!resposta.ok) throw new Error('Resposta inválida');
    const p = await resposta.json();

    document.title = `${p.nome} | Calto Tech`;
    const artigo = criar('article', 'review');
    artigo.appendChild(cabecalho(p));
    if (p.temReview) blocoReview(p, artigo);
    else artigo.appendChild(criar('p', 'review-vazio', 'Ainda não avaliei este produto. Aqui está a ficha técnica.'));
    blocoFicha(p, artigo);
    blocoAcoes(p, artigo);

    elStatus.remove();
    elConteudo.replaceChildren(artigo);
  } catch (erro) {
    mostrarErro('Não consegui carregar o review. Confira se o servidor está rodando (npm start) e se o MongoDB está ligado.');
  }
}

carregar();

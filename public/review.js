const elStatus = document.getElementById('status');
const elConteudo = document.getElementById('conteudo');

function mostrarErro(texto) {
  elStatus.className = 'status erro';
  elStatus.textContent = texto;
}

function secao(titulo) {
  const s = criar('section', 'review-secao');
  s.appendChild(criar('h2', '', titulo));
  return s;
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
  if (!temValor(p.review)) {
    artigo.appendChild(criar('p', 'review-vazio', 'Review em breve. Por enquanto, confira a ficha técnica abaixo.'));
    return;
  }

  const caixa = criar('div', 'veredito');
  caixa.appendChild(criar('p', 'veredito-rotulo', 'Meu veredito'));
  caixa.appendChild(criar('p', '', p.review));
  artigo.appendChild(caixa);
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

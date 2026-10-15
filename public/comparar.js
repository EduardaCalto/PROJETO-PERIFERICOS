// Quais campos têm um "melhor" valor claro: 'max' = maior é melhor, 'min' = menor é melhor
const MELHOR = {
  dpiMax: 'max',
  pollingRateHz: 'max',
  bateriaMah: 'max',
  fpsMax: 'max',
  pesoGramas: 'min'
};
// Peso só entra como critério onde "mais leve" é vantagem
const PESO_VALE_EM = ['mouse', 'headset'];

const elStatus = document.getElementById('status');
const elWrap = document.getElementById('tabela-wrap');
const elSoDiferencas = document.getElementById('so-diferencas');

function mostrarErro(texto) {
  elStatus.className = 'status erro';
  elStatus.textContent = texto;
}

function indicesMelhores(chave, categoria, valores) {
  const regra = MELHOR[chave];
  if (!regra) return [];
  if (chave === 'pesoGramas' && !PESO_VALE_EM.includes(categoria)) return [];

  const numeros = valores.map((v) => (typeof v === 'number' ? v : null));
  const validos = numeros.filter((n) => n !== null);
  if (validos.length < 2) return [];

  const alvo = regra === 'max' ? Math.max(...validos) : Math.min(...validos);
  if (validos.every((n) => n === alvo)) return []; // todos iguais: ninguém é melhor
  return numeros.map((n, i) => (n === alvo ? i : -1)).filter((i) => i >= 0);
}

function celulaTexto(valor, unidade = '') {
  const td = criar('td');
  if (temValor(valor)) {
    td.textContent = formatarValor(valor, unidade);
  } else {
    td.textContent = 'Não informado';
    td.classList.add('vazio');
  }
  return td;
}

function celulaLink(url, texto) {
  const td = criar('td');
  if (urlSegura(url)) {
    const a = criar('a', '', texto);
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    td.appendChild(a);
  } else {
    td.textContent = 'Não informado';
    td.classList.add('vazio');
  }
  return td;
}

function criarLinha(rotulo, celulas, diferente) {
  const tr = document.createElement('tr');
  tr.dataset.igual = String(!diferente);
  tr.appendChild(criar('th', '', rotulo));
  celulas.forEach((c) => tr.appendChild(c));
  return tr;
}

function diferem(valores) {
  return new Set(valores.map((v) => (temValor(v) ? String(v) : ''))).size > 1;
}

function montarTabela(produtos) {
  const categoria = produtos[0].categoria;
  const tabela = criar('table', 'tabela');

  // Cabeçalho com os produtos
  const thead = document.createElement('thead');
  const trCab = document.createElement('tr');
  trCab.appendChild(criar('td'));
  produtos.forEach((p) => {
    const th = criar('th', 'produto-cab');
    th.scope = 'col';
    th.appendChild(criarFoto(p));
    th.appendChild(criar('span', 'marca', p.marca));
    th.appendChild(criar('span', 'nome', p.nome));
    th.appendChild(criar('span', p.temReview ? 'selo avaliado' : 'selo ficha',
      p.temReview ? 'Avaliado por mim' : 'Só ficha técnica'));
    trCab.appendChild(th);
  });
  thead.appendChild(trCab);
  tabela.appendChild(thead);

  const tbody = document.createElement('tbody');

  // Fichas técnicas: só campos que algum produto preencheu
  Object.entries(CAMPOS).forEach(([chave, [rotulo, unidade]]) => {
    const valores = produtos.map((p) => (p.specs || {})[chave]);
    if (!valores.some(temValor)) return;

    const melhores = indicesMelhores(chave, categoria, valores);
    const celulas = valores.map((v, i) => {
      const td = celulaTexto(v, unidade);
      if (melhores.includes(i)) {
        td.classList.add('melhor');
        td.appendChild(criar('span', 'etiqueta', 'melhor'));
      }
      return td;
    });
    tbody.appendChild(criarLinha(rotulo, celulas, diferem(valores)));
  });

  // Nota (também participa do filtro de diferenças)
  const notas = produtos.map((p) => p.nota);
  if (notas.some(temValor)) {
    tbody.appendChild(criarLinha('Minha nota', notas.map((n) => celulaTexto(n, '/10')), diferem(notas)));
  }

  // Parte autoral: sempre visível
  const trReview = criarLinha('Minha opinião', produtos.map((p) => {
    const td = criar('td', 'texto-longo');
    if (p.temReview && temValor(p.review)) td.textContent = p.review;
    else { td.textContent = p.temReview ? 'Review em breve' : 'Ainda não avaliei este produto'; td.classList.add('vazio'); }
    return td;
  }), true);
  tbody.appendChild(trReview);

  tbody.appendChild(criarLinha('Link do produto', produtos.map((p) => celulaLink(p.fonteSpecs, 'Ver produto')), true));

  tabela.appendChild(tbody);
  return tabela;
}

function aplicarFiltroDiferencas() {
  const so = elSoDiferencas.checked;
  elWrap.querySelectorAll('tbody tr').forEach((tr) => {
    tr.hidden = so && tr.dataset.igual === 'true';
  });
}

async function carregar() {
  const ids = (new URLSearchParams(location.search).get('ids') || '').split(',').filter(Boolean);
  if (ids.length < 2 || ids.length > 3) {
    mostrarErro('Escolha de 2 a 3 produtos na lista para comparar.');
    return;
  }

  try {
    const resposta = await fetch(`/api/produtos/comparar?ids=${encodeURIComponent(ids.join(','))}`);
    if (!resposta.ok) throw new Error('Resposta inválida');
    const recebidos = await resposta.json();

    // Mantém a ordem em que você escolheu
    const produtos = ids.map((id) => recebidos.find((p) => p._id === id)).filter(Boolean);
    if (produtos.length < 2) {
      mostrarErro('Não encontrei esses produtos. Volte para a lista e escolha de novo.');
      return;
    }

    document.title = `Comparando ${produtos.map((p) => p.nome).join(' x ')}`;
    elStatus.textContent = '';
    elWrap.replaceChildren(montarTabela(produtos));
    aplicarFiltroDiferencas();
  } catch (erro) {
    mostrarErro('Não consegui carregar a comparação. Confira se o servidor está rodando (npm start) e se o MongoDB está ligado.');
  }
}

elSoDiferencas.addEventListener('change', aplicarFiltroDiferencas);
carregar();

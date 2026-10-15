const CATEGORIAS = {
  todos: 'Todos',
  mouse: 'Mouses',
  teclado: 'Teclados',
  headset: 'Headsets',
  webcam: 'Webcams'
};

const MAX_SPECS_NO_CARD = 4;
const MAX_COMPARAR = 3;

const estado = {
  produtos: [],
  categoria: 'todos',
  soReview: false,
  selecionados: [] // ids dos produtos marcados para comparar
};

const elFiltros = document.getElementById('filtros-categoria');
const elLista = document.getElementById('lista');
const elStatus = document.getElementById('status');
const elSoReview = document.getElementById('so-review');
const elBarra = document.getElementById('barra');
const elBarraTexto = document.getElementById('barra-texto');
const elBarraLink = document.getElementById('barra-link');
const elLimpar = document.getElementById('limpar');
const elResumo = document.getElementById('resumo');

// Fotos do setup (public/img). Se alguma não carregar, mostra o espaço reservado no lugar.
document.querySelectorAll('.setup-foto').forEach((foto) => {
  const semFoto = () => {
    foto.replaceChildren(criar('span', 'foto-aviso', 'Foto em breve'));
    foto.classList.add('sem-foto');
    foto.removeAttribute('href');
  };
  const img = foto.querySelector('img');
  if (img.complete && img.naturalWidth === 0) semFoto();
  else img.addEventListener('error', semFoto);
});

// Números do topo: total, avaliados e categorias
function renderizarResumo() {
  const avaliados = estado.produtos.filter((p) => p.temReview).length;
  const categorias = new Set(estado.produtos.map((p) => p.categoria)).size;
  const itens = [
    [estado.produtos.length, 'produtos'],
    [avaliados, 'avaliados por mim'],
    [categorias, 'categorias']
  ];
  elResumo.replaceChildren(...itens.map(([n, texto]) => {
    const li = criar('li');
    li.appendChild(criar('strong', '', String(n)));
    li.append(texto);
    return li;
  }));
}

function specsPreenchidas(specs = {}) {
  return Object.entries(specs)
    .filter(([chave, valor]) => CAMPOS[chave] && temValor(valor))
    .slice(0, MAX_SPECS_NO_CARD);
}

function categoriaSelecionada() {
  if (estado.selecionados.length === 0) return null;
  const primeiro = estado.produtos.find((p) => p._id === estado.selecionados[0]);
  return primeiro ? primeiro.categoria : null;
}

function criarCard(p) {
  const card = criar('article', 'card');
  card.dataset.cat = p.categoria;

  // Espaço da foto, com categoria e nota por cima
  const foto = criarFoto(p);
  foto.appendChild(criar('span', 'tag tag-cat', NOME_CATEGORIA[p.categoria] || p.categoria));
  if (p.temReview && temValor(p.nota)) {
    const nota = criar('span', 'tag tag-nota', `${String(p.nota).replace('.', ',')}/10`);
    nota.setAttribute('aria-label', `Minha nota: ${p.nota} de 10`);
    foto.appendChild(nota);
  }
  card.appendChild(foto);

  const corpo = criar('div', 'corpo');
  corpo.appendChild(criar('span', 'marca', p.marca));
  corpo.appendChild(criar('h2', '', p.nome));

  if (!p.temReview) corpo.appendChild(criar('span', 'selo ficha', 'Só ficha técnica'));

  const lista = criar('dl', 'specs');
  const specs = specsPreenchidas(p.specs);
  if (specs.length === 0) {
    lista.appendChild(criar('p', 'status', 'Ficha técnica em preparação.'));
  }
  specs.forEach(([chave, valor]) => {
    const [rotulo, unidade] = CAMPOS[chave];
    const linha = criar('div');
    linha.appendChild(criar('dt', '', rotulo));
    linha.appendChild(criar('dd', '', formatarValor(valor, unidade)));
    lista.appendChild(linha);
  });
  corpo.appendChild(lista);

  const rodape = criar('div', 'rodape');
  if (temValor(p.preco)) rodape.appendChild(criar('span', 'preco', formatarPreco(p.preco)));
  const ver = criar('a', 'ver-review', p.temReview ? 'Ler review' : 'Ver ficha');
  ver.href = `review.html?id=${encodeURIComponent(p._id)}`;
  rodape.appendChild(ver);
  corpo.appendChild(rodape);

  // Caixa "Comparar"
  const rotulo = criar('label', 'comparar');
  const caixa = document.createElement('input');
  caixa.type = 'checkbox';
  caixa.dataset.id = p._id;
  caixa.addEventListener('change', () => alternarSelecao(p._id, caixa.checked));
  rotulo.appendChild(caixa);
  rotulo.appendChild(criar('span', '', 'Comparar'));
  corpo.appendChild(rotulo);

  card.appendChild(corpo);
  return card;
}

function alternarSelecao(id, marcado) {
  if (marcado) {
    if (estado.selecionados.length < MAX_COMPARAR && !estado.selecionados.includes(id)) {
      estado.selecionados.push(id);
    }
  } else {
    estado.selecionados = estado.selecionados.filter((x) => x !== id);
  }
  atualizarSelecao();
}

// Atualiza caixas e barra sem recriar os cards (mantém o foco do teclado)
function atualizarSelecao() {
  const categoria = categoriaSelecionada();
  const cheio = estado.selecionados.length >= MAX_COMPARAR;

  elLista.querySelectorAll('input[type="checkbox"]').forEach((caixa) => {
    const produto = estado.produtos.find((p) => p._id === caixa.dataset.id);
    const marcado = estado.selecionados.includes(caixa.dataset.id);
    const outraCategoria = categoria !== null && produto.categoria !== categoria;

    caixa.checked = marcado;
    caixa.disabled = !marcado && (cheio || outraCategoria);
    caixa.title = caixa.disabled
      ? (outraCategoria ? 'Só dá para comparar produtos da mesma categoria' : `Máximo de ${MAX_COMPARAR} produtos`)
      : '';
  });

  const n = estado.selecionados.length;
  elBarra.hidden = n === 0;
  if (n === 1) {
    elBarraTexto.textContent = '1 selecionado. Escolha mais 1 ou 2 da mesma categoria.';
  } else {
    elBarraTexto.textContent = `${n} selecionados`;
  }
  elBarraLink.hidden = n < 2;
  elBarraLink.href = `comparar.html?ids=${estado.selecionados.map(encodeURIComponent).join(',')}`;
}

function produtosFiltrados() {
  return estado.produtos.filter((p) =>
    (estado.categoria === 'todos' || p.categoria === estado.categoria) &&
    (!estado.soReview || p.temReview)
  );
}

function renderizarFiltros() {
  elFiltros.replaceChildren();
  Object.entries(CATEGORIAS).forEach(([chave, nome]) => {
    const qtd = chave === 'todos'
      ? estado.produtos.length
      : estado.produtos.filter((p) => p.categoria === chave).length;

    const botao = criar('button', 'chip', nome);
    botao.type = 'button';
    botao.setAttribute('aria-pressed', String(estado.categoria === chave));
    botao.appendChild(criar('span', 'qtd', String(qtd)));
    botao.addEventListener('click', () => {
      estado.categoria = chave;
      renderizarFiltros();
      renderizarLista();
    });
    elFiltros.appendChild(botao);
  });
}

function renderizarLista() {
  const itens = produtosFiltrados();
  elLista.replaceChildren(...itens.map(criarCard));
  elStatus.className = 'status';
  elStatus.textContent = itens.length === 0
    ? 'Nenhum produto com esses filtros. Escolha outra categoria ou desmarque "Só os que eu avaliei".'
    : `${itens.length} ${itens.length === 1 ? 'produto' : 'produtos'}`;
  atualizarSelecao();
}

async function carregar() {
  try {
    const resposta = await fetch('/api/produtos');
    if (!resposta.ok) throw new Error('Resposta inválida do servidor');
    estado.produtos = await resposta.json();
    renderizarResumo();
    renderizarFiltros();
    renderizarLista();
  } catch (erro) {
    elStatus.className = 'status erro';
    elStatus.textContent = 'Não consegui carregar os produtos. Confira se o servidor está rodando (npm start) e se o MongoDB está ligado.';
  }
}

elSoReview.addEventListener('change', () => {
  estado.soReview = elSoReview.checked;
  renderizarLista();
});

elLimpar.addEventListener('click', () => {
  estado.selecionados = [];
  atualizarSelecao();
});

carregar();

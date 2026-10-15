// Rótulos e unidades de cada campo da ficha técnica (a ordem aqui define a ordem na tela)
const CAMPOS = {
  dpiMax: ['DPI máx.', ''],
  pesoGramas: ['Peso', ' g'],
  sensor: ['Sensor', ''],
  conexao: ['Conexão', ''],
  botoes: ['Botões', ''],
  pollingRateHz: ['Polling rate', ' Hz'],
  bateriaMah: ['Bateria', ' mAh'],
  formato: ['Formato', ''],
  layout: ['Layout', ''],
  tipoSwitch: ['Switch', ''],
  hotswap: ['Hot-swap', ''],
  rgb: ['RGB', ''],
  microfone: ['Microfone', ''],
  driverMm: ['Driver', ' mm'],
  surround: ['Surround', ''],
  resolucao: ['Resolução', ''],
  fpsMax: ['FPS máx.', ' fps'],
  campoVisaoGraus: ['Campo de visão', '°']
};

// Cria um elemento com texto (textContent evita injetar HTML)
function criar(tag, classe, texto) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

function temValor(v) {
  return v !== null && v !== undefined && v !== '';
}

function formatarValor(valor, unidade) {
  if (valor === true) return 'Sim';
  if (valor === false) return 'Não';
  return `${valor}${unidade}`;
}

function formatarPreco(preco) {
  return `R$ ${Number(preco).toFixed(2).replace('.', ',')}`;
}

// Só aceita links http(s)
function urlSegura(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

const NOME_CATEGORIA = { mouse: 'Mouse', teclado: 'Teclado', headset: 'Headset', webcam: 'Webcam' };

// Espaço da foto do produto. Aceita '/img/arquivo.png' (pasta public/img) ou um link http(s).
// Sem foto (ou se o arquivo não carregar), mostra as asas e o aviso "Foto em breve".
function criarFoto(p, classe = 'foto') {
  const foto = criar('div', classe);
  foto.dataset.cat = p.categoria;

  const semFoto = () => {
    foto.replaceChildren(criar('span', 'foto-aviso', 'Foto em breve'));
    foto.classList.add('sem-foto');
  };

  if (typeof p.imagem === 'string' && /^(\/img\/|https?:\/\/)/i.test(p.imagem)) {
    const img = document.createElement('img');
    img.src = p.imagem;
    img.alt = `Foto do ${p.nome}`;
    img.loading = 'lazy';
    img.addEventListener('error', () => {
      foto.classList.remove('com-foto');
      semFoto();
    });
    foto.appendChild(img);
    foto.classList.add('com-foto');
  } else {
    semFoto();
  }
  return foto;
}

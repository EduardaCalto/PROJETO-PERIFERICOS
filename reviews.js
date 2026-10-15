// Guarda os reviews no banco SEM mexer no resto do produto (specs, preço, etc.).
// Para rodar:  node reviews.js
// Pode rodar quantas vezes quiser: ele só atualiza os campos escritos aqui.
//
// A chave é o nome EXATO do produto, como está no banco.
// Campos opcionais por produto:
//   imagem: '/img/arquivo.png'   (coloque o arquivo em public/img/)
require('dotenv').config();
const mongoose = require('mongoose');
const Produto = require('./models/Produto');

const reviews = {
  // ---------- Headsets ----------
  'Astro A10': {
    nota: 5.5,
    review: 'O headset oferece bastante conforto durante o uso, porém apresentou problemas recorrentes de mau contato nas conexões de áudio, o que prejudicou a experiência geral.'
  },

  'Fifine H13': {
    nota: 9,
    review: 'Um headset com bom custo-benefício, bastante confortável e com microfone que atende bem a chamadas. Ainda preciso realizar mais testes para formar uma avaliação definitiva.'
  },

  'HyperX Cloud Stinger': {
    nota: 9.5,
    review: 'Foi meu primeiro headset gamer e me acompanhou por bastante tempo. Parei de utilizá-lo porque o revestimento sintético começou a descascar, embora sua durabilidade geral tenha sido um ponto marcante da minha experiência.'
  },

  // ---------- Mouses ----------
  'Attack Shark X11': {
    nota: 10,
    review: 'É meu mouse atual, até o momento não apresentou problemas. Destaco a boa autonomia da bateria e o peso leve, que contribuem para uma experiência de uso muito satisfatória.'
  },

  'Attack Shark X6': {
    nota: 10,
    review: 'Utilizei este mouse por bastante tempo antes de migrar para o X11. É uma opção mais leve.'
  },

  'Rapoo MT760L': {
    nota: 10,
    review: 'Um mouse extremamente confortável, utilizado principalmente nos estudos e no trabalho. Seu formato se encaixa muito bem na minha mão, tornando o uso prolongado bastante agradável.'
  },

  'Redragon M711': {
    nota: 8.5,
    review: 'Utilizei este mouse por muitos anos e ele nunca apresentou problemas de funcionamento. O único ponto negativo foi o revestimento, que acabou descascando com o tempo de uso.'
  },

  // ---------- Teclados ----------
  'Redragon Surara Pro': {
    nota: 7,
    review: 'Na época em que utilizei este teclado, ele apresentou problemas nos switches, o que acabou comprometendo a experiência de uso.'
  },

  'Gravastar K1 Lite': {
    // Nota original: 100.000 (normalizada para 10/10)
    nota: 10,
    review: 'É um dos meus teclados favoritos. Gosto muito do conjunto do produto, até agora minha experiência com ele tem sido extremamente positiva.'
  },

  'Rapoo E9050L': {
    nota: 10,
    review: 'Um excelente teclado para escritório e trabalho. Na minha experiência, é uma opção que atende muito bem às atividades de produtividade.'
  },

  // O nome abaixo precisa ser igual ao do banco. Se você renomear o produto
  // para "Royal Kludge R75" no seed.js, troque aqui também (e apague o antigo no Compass).
  'Royal Kludge 75%': {
    nota: 9,
    review: 'Um teclado que considero muito bom para jogos. Utilizo-o com frequência e gosto especialmente da sensação dos switches durante a digitação.'
  },

  'Superframe Ribbon RGB 75%': {
    nota: 8,
    review: 'Foi meu teclado por bastante tempo e, no geral, entregou uma boa experiência. O principal problema que encontrei foi a autonomia da bateria, que diminuía rapidamente.'
  },

  // ---------- Webcams ----------
  'Logitech Brio 100': {
    nota: 8,
    review: 'Utilizei a webcam com frequência atendendo minhas necessidades. Entretanto, considero que existem alternativas com recursos superiores na mesma faixa de preço.'
  },

  'eMeet S600L': {
    nota: 10,
    review: 'Uma webcam que me impressionou muito. Destaco a resolução 4K e a iluminação integrada em formato de ring light, que considero um diferencial importante do produto.'
  }
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    for (const [nome, dados] of Object.entries(reviews)) {
      // $unset limpa os antigos pontos positivos/negativos que ficaram salvos no banco
      const r = await Produto.updateOne(
        { nome },
        { $set: { ...dados, temReview: true }, $unset: { pontosPositivos: 1, pontosNegativos: 1 } },
        { runValidators: true, strict: false }
      );
      console.log(r.matchedCount ? `Review salvo: ${nome}` : `Produto não encontrado (confira o nome): ${nome}`);
    }
  } catch (err) {
    console.error('Erro ao salvar reviews:', err.message);
  } finally {
    await mongoose.disconnect();
  }
})();

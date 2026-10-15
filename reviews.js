// Guarda os reviews no banco SEM mexer no resto do produto (specs, preço, etc.).
// Para rodar:  node reviews.js
// Pode rodar quantas vezes quiser: ele só atualiza os campos escritos aqui.
//
// A chave é o nome EXATO do produto, como está no banco.
// Campos opcionais por produto:
//   imagem: '/img/arquivo.png'   (coloque o arquivo em public/img/)
//   videoUrl: 'https://...'
//   criterios: [{ titulo: 'Conforto', texto: '...', icone: 'coracao' }]
//              icone: 'coracao' | 'carteira' | 'bateria' | 'estrela'
require('dotenv').config();
const mongoose = require('mongoose');
const Produto = require('./models/Produto');

const reviews = {
  // ---------- Headsets ----------
  'Astro A10': {
    nota: 5.5,
    pontosPositivos: ['Bastante confortável durante o uso.'],
    pontosNegativos: ['Problemas recorrentes de mau contato nas conexões de áudio.'],
    review: 'O headset oferece bastante conforto durante o uso, porém apresentou problemas recorrentes de mau contato nas conexões de áudio, o que prejudicou a experiência geral.'
  },

  'Fifine H13': {
    // Avaliação inicial: review em andamento
    nota: 9,
    pontosPositivos: [
      'Bom custo-benefício.',
      'Bastante confortável.',
      'Microfone que atende bem a chamadas.'
    ],
    review: 'Um headset com bom custo-benefício, bastante confortável e com microfone que atende bem a chamadas. Ainda preciso realizar mais testes para formar uma avaliação definitiva.'
  },

  'HyperX Cloud Stinger': {
    nota: 9.5,
    pontosPositivos: ['Durabilidade geral.'],
    pontosNegativos: ['O revestimento sintético começou a descascar.'],
    review: 'Foi meu primeiro headset gamer e me acompanhou por bastante tempo. Parei de utilizá-lo porque o revestimento sintético começou a descascar, embora sua durabilidade geral tenha sido um ponto marcante da minha experiência.'
  },

  // ---------- Mouses ----------
  'Attack Shark X11': {
    nota: 10,
    pontosPositivos: ['Boa autonomia da bateria.', 'Peso leve.', 'Confiabilidade no uso.'],
    review: 'É meu mouse atual e, até o momento, não apresentou problemas. Destaco a boa autonomia da bateria e o peso leve, que contribuem para uma experiência de uso muito satisfatória.'
  },

  'Attack Shark X6': {
    nota: 10,
    pontosPositivos: ['Muito leve.', 'Combina com a estética do meu setup.'],
    review: 'Utilizei este mouse por bastante tempo antes de migrar para o X11. É uma opção bastante leve, e minha troca aconteceu principalmente porque o novo modelo combinava melhor com a estética do meu setup.'
  },

  'Rapoo MT760L': {
    nota: 10,
    pontosPositivos: ['Ergonomia.', 'Conforto no uso prolongado.'],
    review: 'Um mouse extremamente confortável, utilizado principalmente nos estudos e no trabalho. Seu formato se encaixa muito bem na minha mão, tornando o uso prolongado bastante agradável.'
  },

  // ---------- Teclados ----------
  'Gravastar K1 Lite': {
    // Nota original: 100.000 (normalizada para 10/10)
    nota: 10,
    review: 'É um dos meus teclados favoritos. Gosto muito do conjunto do produto e, até agora, minha experiência com ele tem sido extremamente positiva.'
  },

  'Rapoo E9050L': {
    nota: 10,
    pontosPositivos: ['Adequado para trabalho e produtividade.'],
    review: 'Um excelente teclado para escritório e trabalho. Na minha experiência, é uma opção que atende muito bem às atividades de produtividade.'
  },

  // O nome abaixo precisa ser igual ao do banco. Se você renomear o produto
  // para "Royal Kludge R75" no seed.js, troque aqui também (e apague o antigo no Compass).
  'Royal Kludge 75%': {
    nota: 9,
    pontosPositivos: ['Boa experiência de digitação.', 'Ótimo para jogos.'],
    review: 'Um teclado que considero muito bom para jogos. Utilizo-o com frequência e gosto especialmente da sensação dos switches durante a digitação.'
  },

  'Superframe Ribbon RGB 75%': {
    nota: 8,
    pontosPositivos: ['Boa experiência geral de uso.'],
    pontosNegativos: ['A autonomia da bateria diminuía rapidamente.'],
    review: 'Foi meu teclado por bastante tempo e, no geral, entregou uma boa experiência. O principal problema que encontrei foi a autonomia da bateria, que diminuía rapidamente.'
  },

  // ---------- Webcams ----------
  'Logitech Brio 100': {
    nota: 8,
    pontosPositivos: ['Atende bem a aulas online.'],
    pontosNegativos: ['Existem alternativas com recursos superiores na mesma faixa de preço.'],
    review: 'Utilizei a webcam com frequência durante aulas a distância, atendendo bem a essa finalidade. Entretanto, considero que existem alternativas com recursos superiores na mesma faixa de preço.'
  },

  'eMeet S600L': {
    // Nota original: 10.000 (normalizada para 10/10)
    nota: 10,
    pontosPositivos: ['Resolução 4K.', 'Iluminação integrada em formato de ring light.'],
    review: 'Uma webcam que me impressionou muito. Destaco a resolução 4K e a iluminação integrada em formato de ring light, que considero um diferencial importante do produto.'
  }
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    for (const [nome, dados] of Object.entries(reviews)) {
      const r = await Produto.updateOne({ nome }, { $set: { ...dados, temReview: true } }, { runValidators: true });
      console.log(r.matchedCount ? `Review salvo: ${nome}` : `Produto não encontrado (confira o nome): ${nome}`);
    }
  } catch (err) {
    console.error('Erro ao salvar reviews:', err.message);
  } finally {
    await mongoose.disconnect();
  }
})();

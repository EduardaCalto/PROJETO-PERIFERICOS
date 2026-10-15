const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  marca: { type: String, required: true },
  categoria: {
    type: String,
    required: true,
    enum: ['mouse', 'teclado', 'headset', 'webcam']
  },
  preco: Number,            // preço de referência (avise isso no site)
  imagem: String,           // caminho ou URL da foto
  fonteSpecs: String,       // link do site do fabricante

  // Ficha técnica: campos variam por categoria
  // mouse:   { dpi, pesoGramas, sensor, conexao, botoes }
  // teclado: { formato, tipoSwitch, hotswap, conexao, rgb }
  // headset: { conexao, microfone, driver, surround }
  // webcam:  { resolucao, fps, campoVisao, microfone }
  specs: { type: Object, default: {} },

  // Parte autoral (seu conteúdo)
  temReview: { type: Boolean, default: false },
  nota: { type: Number, min: 0, max: 10 },
  review: String,           // texto do "Meu veredito"
  pontosPositivos: [String],
  pontosNegativos: [String],
  // Cartões de critério. icone: coracao | carteira | bateria | estrela
  criterios: [new mongoose.Schema({ titulo: String, texto: String, icone: String }, { _id: false })],
  videoUrl: String
}, { timestamps: true });

module.exports = mongoose.model('Produto', produtoSchema);

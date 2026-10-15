const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  marca: { type: String, required: true },
  categoria: {
    type: String,
    required: true,
    enum: ['mouse', 'teclado', 'headset', 'webcam']
  },
  imagem: String,           // caminho ou URL da foto
  fonteSpecs: String,       // link do site do fabricante

  // Ficha técnica: campos variam por categoria
  // mouse:   { dpiMax, pesoGramas, sensor, conexao, botoes, pollingRateHz, bateriaMah }
  // teclado: { formato, layout, tipoSwitch, hotswap, conexao, rgb, bateriaMah, pesoGramas }
  // headset: { conexao, microfone, driverMm, surround, pesoGramas }
  // webcam:  { resolucao, fpsMax, campoVisaoGraus, microfone, conexao }
  specs: { type: Object, default: {} },

  // Parte autoral (seu conteúdo)
  temReview: { type: Boolean, default: false },
  nota: { type: Number, min: 0, max: 10 },
  review: String,           // texto do "Meu veredito"
}, { timestamps: true });

module.exports = mongoose.model('Produto', produtoSchema);

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

  specs: { type: Object, default: {} },

  temReview: { type: Boolean, default: false },
  nota: { type: Number, min: 0, max: 10 },
  review: String,           // minha review 
}, { timestamps: true });

module.exports = mongoose.model('Produto', produtoSchema);

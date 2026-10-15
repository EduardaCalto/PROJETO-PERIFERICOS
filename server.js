require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Produto = require('./models/Produto');

const app = express();
app.use(express.json());
app.use(express.static('public')); // front-end (HTML/CSS/JS)

// Lista produtos, com filtro opcional: /api/produtos?categoria=mouse
app.get('/api/produtos', async (req, res) => {
  try {
    const filtro = {};
    if (req.query.categoria) filtro.categoria = req.query.categoria;
    const produtos = await Produto.find(filtro).sort({ nome: 1 });
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar produtos' });
  }
});

// Compara 2 ou 3 produtos: /api/comparar?ids=ID1,ID2,ID3
// (declarada antes de /:id para não ser confundida com ele)
app.get('/api/produtos/comparar', async (req, res) => {
  try {
    const ids = (req.query.ids || '').split(',').filter(Boolean);
    if (ids.length < 2 || ids.length > 3) {
      return res.status(400).json({ erro: 'Envie de 2 a 3 ids' });
    }
    const produtos = await Produto.find({ _id: { $in: ids } });
    res.json(produtos);
  } catch (err) {
    res.status(400).json({ erro: 'Ids inválidos' });
  }
});

// Um produto específico (usado na página de review)
app.get('/api/produtos/:id', async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(produto);
  } catch (err) {
    res.status(400).json({ erro: 'Id inválido' });
  }
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(PORT, () => console.log(`Servidor em http://localhost:${PORT}`));
  })
  .catch((err) => console.error('Erro ao conectar no MongoDB:', err.message));


require('dotenv').config();
const mongoose = require('mongoose');
const Produto = require('./models/Produto');

const base = (
  nome,
  marca,
  categoria,
  specs = {},
  fonteSpecs = '',
  temReview = true
) => ({
  nome,
  marca,
  categoria,
  specs,
  fonteSpecs,
  temReview
});

const produtos = [
  // Mouses
  base('Redragon M711', 'Redragon', 'mouse', {
    dpiMax: 10000,
    pesoGramas: 130,
    sensor: 'PixArt PMW3325',
    conexao: 'USB com fio',
    botoes: 7,
    pollingRateHz: 1000
  }, 'https://www.redragon.com.br/cobra'),

  base('Attack Shark X6', 'Attack Shark', 'mouse', {
    dpiMax: 26000,
    pesoGramas: 49,
    sensor: 'PixArt PAW3395',
    conexao: 'USB / 2.4 GHz / Bluetooth 5.2',
    botoes: null,
    pollingRateHz: 1000
  }, 'https://attackshark.com/products/x6-49g-wireless-gaming-mouse-charging-dock'),

  base('Attack Shark X11', 'Attack Shark', 'mouse', {
    dpiMax: 22000,
    pesoGramas: 63,
    sensor: 'PixArt PAW3311',
    conexao: 'USB / 2.4 GHz / Bluetooth 5.2',
    botoes: null,
    pollingRateHz: 1000
  }, 'https://attackshark.com/pt/products/attack-shark-x11-wireless-gaming-mouse-charging-dock'),

  base('Rapoo MT760L', 'Rapoo', 'mouse', {
    dpiMax: 4000,
    pesoGramas: 101,
    sensor: 'PixArt PAW3220',
    conexao: '2.4 GHz / Bluetooth 5.0',
    botoes: 11,
    bateriaMah: 800
  }, 'https://www.rapoo.com/en/product/MT760L-MT760M'),

  // Teclados
  base('Redragon Surara Pro', 'Redragon', 'teclado', {
    formato: 'Full Size',
    layout: 'ABNT2',
    tipoSwitch: 'Óptico',
    hotswap: true,
    conexao: 'USB com fio',
    rgb: true,
    pesoGramas: 1077
  }, 'https://www.redragon.com.br/surara-pro'),

  base('Superframe Ribbon RGB 75%', 'Superframe', 'teclado', {
    formato: '75%',
    layout: 'ANSI',
    tipoSwitch: 'Linear Red',
    hotswap: true,
    conexao: 'USB-C / Bluetooth / 2.4 GHz',
    rgb: true,
    bateriaMah: 2000
  }, 'https://www.terabyteshop.com.br/produto/25526/teclado-gamer-superframe-ribbon-wireless-rgb-switch-red-75-abnt2-hot-swap-blackgrey'),

  base('Royal Kludge 75%', 'Royal Kludge', 'teclado', {
    formato: '75%',
    layout: 'US QWERTY',
    tipoSwitch: 'Linear Cream',
    hotswap: true,
    conexao: 'USB / Bluetooth / 2.4 GHz',
    rgb: true,
    bateriaMah: 4000,
    pesoGramas: 680
  }, 'https://rkgamingstore.com/products/r75-75-wireless-gaming-keyboard'),

  base('Gravastar K1 Lite', 'Gravastar', 'teclado', {
    formato: '75%',
    layout: '',
    tipoSwitch: 'Linear',
    hotswap: true,
    conexao: 'USB / Bluetooth / 2.4 GHz',
    rgb: true,
    bateriaMah: 4000,
    pesoGramas: 850
  }, 'https://www.gravastar.com/products/mercury-k1-lite-transparent-black'),

  base('Rapoo E9050L', 'Rapoo', 'teclado', {
    formato: 'Compacto (78 teclas)',
    layout: '',
    tipoSwitch: 'Tesoura',
    hotswap: null,
    conexao: 'USB / Bluetooth 4.0 / Bluetooth 5.0 / 2.4 GHz',
    rgb: null,
    bateriaMah: 500,
    pesoGramas: 292
  }, 'https://rapoo.com/en/product/E9050L'),

  // Headsets
  base('Astro A10', 'Astro', 'headset', {
    conexao: 'P2 3,5 mm',
    microfone: true,
    driverMm: 32,
    surround: null,
    pesoGramas: 246
  }, 'https://www.logitechg.com/en-sg/products/gaming-audio/a10-gen-2.html'),

  base('HyperX Cloud Stinger', 'HyperX', 'headset', {
    conexao: 'P2 3,5 mm',
    microfone: true,
    driverMm: 50,
    surround: null,
    pesoGramas: 275
  }, 'https://au.hyperx.com/blogs/press/hyperx-adds-pink-colorway-to-cloud-stinger-gaming-headset-line'),

  base('Fifine H13', 'Fifine', 'headset', {
    conexao: 'USB Tipo-A com fio',
    microfone: true,
    driverMm: 50,
    surround: true,
    pesoGramas: 390
  }, 'https://fifinemicrophone.com/products/fifine-ampligame-h13-headset'),

  // Webcam
  base('Logitech Brio 100', 'Logitech', 'webcam', {
    resolucao: '1920x1080 (Full HD)',
    fpsMax: 30,
    campoVisaoGraus: 58,
    microfone: true,
    conexao: 'USB-A'
  }, 'https://www.logitech.com/pt-br/shop/p/brio-100-webcam'),

  base('eMeet S600L', 'eMeet', 'webcam', {
    resolucao: '3840x2160 (4K a 30 fps; 60 fps em 1080p)',
    fpsMax: 60,
    campoVisaoGraus: 73,
    microfone: true,
    conexao: 'USB-C'
  }, 'https://emeet.com/pt-br/products/emeet-smartcam-s600l'),

  // Headset ainda não recebido: sem review
  base('Picun G2', 'Picun', 'headset', {
    conexao: '',
    microfone: null,
    driverMm: null,
    surround: null,
    pesoGramas: null
  }, '', false)
];

// Fotos dos produtos
const IMAGENS = {
  'Astro A10': '/img/astroA10.jpg',
  'Logitech Brio 100': '/img/brio100.jpg',
  'HyperX Cloud Stinger': '/img/cloudstinger.jpg',
  'Rapoo E9050L': '/img/e9050l.jpg',
  'Gravastar K1 Lite': '/img/gravastar.jpg',
  'Fifine H13': '/img/h13.jpg',
  'Rapoo MT760L': '/img/mt760l.jpg',
  'Superframe Ribbon RGB 75%': '/img/superframeribbon.jpg',
  'Attack Shark X11': '/img/x11.jpg',
  'Attack Shark X6': '/img/x6.jpg',
  'eMeet S600L': '/img/emeets600l.webp',
  'Redragon M711': '/img/cobraM711.jpg',
  'Redragon Surara Pro': '/img/surarapro.webp',
  'Royal Kludge 75%': '/img/rk75.webp'
};
produtos.forEach((p) => {
  if (IMAGENS[p.nome]) p.imagem = IMAGENS[p.nome];
});

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    for (const produto of produtos) {
      await Produto.updateOne(
        {
          nome: produto.nome,
          marca: produto.marca
        },
        {
          $set: produto
        },
        {
          upsert: true,
          runValidators: true
        }
      );
    }

    console.log(`${produtos.length} produtos cadastrados/atualizados.`);
  } catch (err) {
    console.error('Erro ao popular o banco:', err.message);
  } finally {
    await mongoose.disconnect();
  }
})();

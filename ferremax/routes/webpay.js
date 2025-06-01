// routes/webpay.js
const express = require('express');
const router = express.Router();
const { WebpayPlus, Options } = require('transbank-sdk');

// Configura Webpay Plus con los datos de integración (para pruebas)
const webpay = new WebpayPlus.Transaction(
  new Options(
    '597055555532', // Código de comercio
    '597055555532', // Código de comercio también como API Key (en integración)
    'https://webpay3g.transbank.cl' // URL base del servicio
  )
);

// Ruta para iniciar pago
router.post('/pagar', async (req, res) => {
  const { monto, orden } = req.body;

  try {
    const response = await webpay.create(
      orden,              // buyOrder
      'sesion-ferremax',  // sessionId
      monto,              // amount
      'http://localhost:3000/webpay/retorno' // returnUrl
    );

    res.json({ url: response.url, token: response.token });
  } catch (err) {
    console.error('❌ Error iniciando transacción:', err);
    res.status(500).json({ error: 'No se pudo iniciar transacción' });
  }
});

// Ruta de retorno desde Webpay
router.post('/retorno', async (req, res) => {
  const { token_ws } = req.body;

  try {
    const result = await webpay.commit(token_ws);

    res.send(`
      <h1>✅ Pago realizado</h1>
      <p>Orden: ${result.buyOrder}</p>
      <p>Estado: ${result.status}</p>
      <a href="/">Volver al inicio</a>
    `);
  } catch (err) {
    console.error('❌ Error confirmando el pago:', err);
    res.status(500).send('Error al confirmar el pago');
  }
});

module.exports = router;

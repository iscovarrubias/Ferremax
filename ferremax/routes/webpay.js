const express = require('express');
const axios = require('axios');
const router = express.Router();

// ✅ CREDENCIALES DE INTEGRACIÓN DE PRUEBA (oficiales de Transbank)
const COMMERCE_CODE = '597055555532'; // Código de comercio de prueba
const API_KEY = '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C'; // API Key de prueba
const BASE_URL = 'https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2';

router.post('/pagar', async (req, res) => {
  const { monto, orden } = req.body;

  try {
    const response = await axios.post(`${BASE_URL}/transactions`, {
      amount: monto,
      session_id: 'ferremax-' + Date.now(),
      buy_order: orden,
      return_url: 'http://localhost:3000/webpay/respuesta'
    }, {
      headers: {
        'Tbk-Api-Key-Id': COMMERCE_CODE,
        'Tbk-Api-Key-Secret': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      url: response.data.url,
      token: response.data.token
    });
  } catch (error) {
    console.error('Error creando transacción:', error.response?.data || error.message);
    res.status(500).json({ error: 'No se pudo iniciar la transacción' });
  }
});

router.post('/respuesta', async (req, res) => {
  const token = req.body.token_ws;

  try {
    const response = await axios.put(`${BASE_URL}/transactions/${token}`, {}, {
      headers: {
        'Tbk-Api-Key-Id': COMMERCE_CODE,
        'Tbk-Api-Key-Secret': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    res.send(`<h1>Pago Exitoso</h1><pre>${JSON.stringify(response.data, null, 2)}</pre>`);
  } catch (error) {
    console.error('Error al confirmar transacción:', error.response?.data || error.message);
    res.status(500).send('Error al confirmar el pago');
  }
});

module.exports = router;

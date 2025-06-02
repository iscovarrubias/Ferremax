const express = require('express');
const axios = require('axios');
const router = express.Router();

// CREDENCIALES
const COMMERCE_CODE = '597055555532'; 
const API_KEY = '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C'; 
const BASE_URL = 'https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2';

/**
 * @swagger
 * /webpay/pagar:
 *   post:
 *     summary: Inicia una transacción de pago con Webpay
 *     tags: [Webpay]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               monto:
 *                 type: number
 *                 example: 10000
 *               orden:
 *                 type: string
 *                 example: "ORDEN123"
 *     responses:
 *       200:
 *         description: URL y token para continuar con el pago
 */
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

    console.log('URL de pago:', response.data.url);
    console.log('Token:', response.data.token);

    res.json({
      url: response.data.url,
      token: response.data.token
    });
  } catch (error) {
    console.error('Error creando transacción:', error.response?.data || error.message);
    res.status(500).json({ error: 'No se pudo iniciar la transacción' });
  }
});

/**
 * @swagger
 * /webpay/respuesta:
 *   post:
 *     summary: Confirma una transacción de Webpay
 *     tags: [Webpay]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               token_ws:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transacción confirmada
 *       500:
 *         description: Error al confirmar el pago
 */
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

/**
 * @swagger
 * /webpay/respuesta:
 *   get:
 *     summary: Maneja la respuesta de Webpay tras redirigir al usuario
 *     tags: [Webpay]
 *     parameters:
 *       - in: query
 *         name: token_ws
 *         schema:
 *           type: string
 *       - in: query
 *         name: TBK_TOKEN
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultado del pago
 */
router.get('/respuesta', async (req, res) => {
  const { token_ws, TBK_TOKEN } = req.query;

  if (TBK_TOKEN) {
    console.log('Compra anulada por el usuario');
    return res.send(`
      <h1>Compra anulada</h1>
      <p>La transacción fue cancelada por el usuario.</p>
      <p>Serás redirigido al carrito en 5 segundos...</p>
      <script>
        setTimeout(() => {
          window.location.href = "/carrito.html";
        }, 5000);
      </script>
    `);
  }

  if (token_ws) {
    try {
      const response = await axios.put(`${BASE_URL}/transactions/${token_ws}`, {}, {
        headers: {
          'Tbk-Api-Key-Id': COMMERCE_CODE,
          'Tbk-Api-Key-Secret': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      return res.send(`
        <h1>Pago Exitoso</h1>
        <pre>${JSON.stringify(response.data, null, 2)}</pre>
      `);
    } catch (error) {
      console.error('Error al confirmar transacción:', error.response?.data || error.message);
      return res.status(500).send('Error al confirmar el pago');
    }
  }

  res.status(400).send('Parámetros inválidos en la respuesta');
});

module.exports = router;

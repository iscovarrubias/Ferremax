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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                 token:
 *                   type: string
 *       500:
 *         description: Error al iniciar la transacción
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
 *     summary: Muestra mensaje cuando el usuario cancela la transacción
 *     tags: [Webpay]
 *     parameters:
 *       - in: query
 *         name: TBK_TOKEN
 *         schema:
 *           type: string
 *       - in: query
 *         name: TBK_ORDEN_COMPRA
 *         schema:
 *           type: string
 *       - in: query
 *         name: TBK_ID_SESION
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mensaje de transacción cancelada
 */
router.get('/respuesta', (req, res) => {
  const { TBK_TOKEN, TBK_ORDEN_COMPRA, TBK_ID_SESION } = req.query;

  console.log('Compra anulada por el usuario');
  console.log('Token:', TBK_TOKEN);
  console.log('Orden:', TBK_ORDEN_COMPRA);
  console.log('Sesión:', TBK_ID_SESION);

  res.send(`
    <h1>Compra anulada</h1>
    <p>La transacción fue cancelada por el usuario.</p>
    <p>Serás redirigido al carrito en 5 segundos...</p>
    <script>
      setTimeout(() => {
        window.location.href = "/carrito.html";
      }, 5000);
    </script>
  `);
});

module.exports = router;

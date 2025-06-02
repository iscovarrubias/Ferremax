const express = require('express');
const cors = require('cors');
const path = require('path');
const router = express.Router();

const productRoutes = require('./routes/productroutes');
const userRoutes = require('./routes/productuser');       
const webpayRoutes = require('./routes/webpay');

// Swagger
const { swaggerUi, swaggerSpec } = require('./config/swagger'); 

const app = express();
const PORT = process.env.PORT || 3000;
const pagesPath = path.join(__dirname, '..', 'pages');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas API
app.use('/webpay', webpayRoutes);
app.use('/api/productos', productRoutes);
app.use('/api', userRoutes);  

app.use(express.static(pagesPath));

// Logging simple para cada petición
app.use((req, res, next) => {
  console.log(`Petición recibida: ${req.method} ${req.url}`);
  next();
});

// Ruta principal
app.get('/', (req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
  res.sendFile(path.join(pagesPath, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📘 Documentación Swagger en http://localhost:${PORT}/api-docs`);
});

const express = require('express');
const cors = require('cors');
const path = require('path');
const router = express.Router();

const productRoutes = require('./routes/productroutes'); // Rutas de productos
const userRoutes = require('./routes/productuser');       // Rutas de usuarios

const app = express();
const PORT = process.env.PORT || 3000;
const pagesPath = path.join(__dirname, '..', 'pages');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use('/api/productos', productRoutes);
app.use('/api', userRoutes);  // <--- aquí va solo '/api'


// Archivos estáticos (HTML, CSS, etc.)
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

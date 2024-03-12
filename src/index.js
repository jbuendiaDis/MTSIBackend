const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const { usersRoutes } = require('./routes/userRoutes');
const { tollsRoutes } = require('./routes/tollsRoutes');
const { clientRoutes } = require('./routes/clientsRoutes');
const { rendimientoRoutes } = require('./routes/rendimientoRoutes');
const { trasladosRoutes } = require('./routes/trasladosRoutes');
const { gastosRoutes } = require('./routes/gastosRoutes');
const { peajesRoutes } = require('./routes/peajesRoutes');
const { authRoutes } = require('./routes/authRoutes');
const { quotesRoutes } = require('./routes/quotesRoutes');
const { userClientRoutes } = require('./routes/userClient');
const { gananciasRoutes } = require('./routes/gananciasRoutes');
const { configureDataRoutes } = require('./routes/configureDataRoutes');
const { costoPeajeRoutes } = require('./routes/costoPeajeRoutes');
const { quote01Routes } = require('./routes/quote01Routes');
const { countryRoutes } = require('./routes/countryRoutes');
const { catalogRoutes } = require('./routes/catalogRoutes');
const { banderaRoutes } = require('./routes/banderaRoutes');
const { municipiosRoutes  } = require('./routes/municipiosRoutes');

const connectToDatabase = require('./db');

const app = express();
const port = process.env.PORT || 2024;

// Aumentar el límite del tamaño del cuerpo de la solicitud para JSON
app.use(express.json({ limit: '50mb' }));
// Aumentar el límite del tamaño del cuerpo de la solicitud para datos codificados en URL
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

connectToDatabase();

// Configura middlewares, enrutadores y rutas
app.use(express.json());

// Configuración Swagger
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Documentation for your API',
    },
  },
  apis: ['controllers/configureDataController.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use('/api', usersRoutes);
app.use('/api', clientRoutes);
app.use('/api', tollsRoutes);
app.use('/api', rendimientoRoutes);
app.use('/api', trasladosRoutes);
app.use('/api', gastosRoutes);
app.use('/api', peajesRoutes);
app.use('/api', authRoutes);
app.use('/api', quotesRoutes);
app.use('/api', userClientRoutes);
app.use('/api', gananciasRoutes);
app.use('/api', configureDataRoutes);
app.use('/api', costoPeajeRoutes);
app.use('/api', quote01Routes);
app.use('/api', countryRoutes);
app.use('/api', catalogRoutes);
app.use('/api', banderaRoutes);
app.use('/api', municipiosRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal en el servidor.');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

module.exports = app;

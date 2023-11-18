const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const port = process.env.PORT || 3000;

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

const connectToDatabase = require('./db');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

connectToDatabase();

// Configura middlewares, enrutadores y rutas
app.use(express.json());

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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal en el servidor.');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

module.exports = app;

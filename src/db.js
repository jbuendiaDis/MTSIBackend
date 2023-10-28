const mongoose = require('mongoose');
require('dotenv').config(); // Cargar variables de entorno desde el archivo .env

// Obtén la URL de conexión desde las variables de entorno
const dbURL = process.env.MONGODB_URI;

// Establece opciones de conexión de Mongoose (opcional)
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Función para conectar a la base de datos
const connectToDatabase = async () => {
  try {
    await mongoose.connect(dbURL, mongooseOptions);
    console.log('Conexión a la base de datos establecida con éxito');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
  }
};

module.exports = connectToDatabase;
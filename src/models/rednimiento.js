const mongoose = require('mongoose');

// Definir el esquema para una entidad "Rendimientos" con marca, modelo y rendimiento
const rendimientoSchema = new mongoose.Schema({
  marca: {
    type: String,
    required: true,
  },
  modelo: {
    type: String,
    required: true,
  },
  rendimiento: {
    type: Number,
    required: true,
  }, // Suponemos que rendimiento es un número (por ejemplo, en km por litro).
});

// Crear un modelo basado en el esquema
const Rendimientos = mongoose.model('Rendimientos', rendimientoSchema);

module.exports = Rendimientos;

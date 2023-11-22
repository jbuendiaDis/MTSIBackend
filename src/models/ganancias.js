const mongoose = require('mongoose');

const gananciaSchema = new mongoose.Schema({
  desde: {
    type: Date,
    required: true,
  },
  hasta: {
    type: Date,
    required: true,
  },
  ganancia: {
    type: Number,
    required: true,
  },
  fechaCreacion: {
    type: Date,
    required: true,
  },
  fechaActualizacion: {
    type: Date,
    required: true,
  },
});

const Ganancia = mongoose.model('Ganancia', gananciaSchema);

module.exports = Ganancia;

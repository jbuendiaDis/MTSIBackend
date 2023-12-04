const mongoose = require('mongoose');

const costoPeajeSchema = new mongoose.Schema({
  estadoId: {
    type: Number,
    required: true,
  },
  nombreCaseta: {
    type: String,
    required: true,
  },
  monto: {
    type: Number,
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  fechaActualizacion: {
    type: Date,
  },
});

const CostoPeaje = mongoose.model('CostoPeaje', costoPeajeSchema);

module.exports = CostoPeaje;

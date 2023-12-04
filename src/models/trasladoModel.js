const mongoose = require('mongoose');

const trasladoSchema = new mongoose.Schema({
  tipoTraslado: {
    type: String,
    required: true,
  },
  concepto: {
    type: String,
    required: true,
  },
  sueldo: {
    type: Number,
    required: true,
  },
});

const Traslado = mongoose.model('Traslado', trasladoSchema);

module.exports = Traslado;

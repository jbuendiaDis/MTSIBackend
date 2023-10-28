const mongoose = require('mongoose');

const gastosSchema = new mongoose.Schema({
  idCliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true,
  },
  estadoOrigen: String,
  localidadOrigen: String,
  estadoDestino: String,
  localidadDestino: String,
  origen: String,
  destino: String,
  pasajeOrigen: Number,
  pasajeDestino: Number,
  comidas: Number,
  hoteles: Number,
  peajes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Peajes' }],
});

const Gastos = mongoose.model('Gastos', gastosSchema);

module.exports = Gastos;

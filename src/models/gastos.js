const mongoose = require('mongoose');

const gastosSchema = new mongoose.Schema({
  idCliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true,
  },
  rutaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Peajes'
  },
  pasajeOrigen: Number,
  pasajeDestino: Number,
  comidas: Number,
  hoteles: Number,
  vuelo: Number,
  taxi: Number,
  ferry: Number,
  udsUsa: Number,
  liberacionPuerto: Number,
  talachas: Number,
  fitosanitarias: Number,
  urea: Number,
  extra: Number,
  //peajes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Peajes' }]
});

const Gastos = mongoose.model('Gastos', gastosSchema);

module.exports = Gastos;

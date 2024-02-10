const mongoose = require('mongoose');

const quoteHistorySchema = new mongoose.Schema({
  quoteId: mongoose.Schema.Types.ObjectId,
  folio: Number,
  clienteNombre: String,
  origen: String,
  destino: String,
  kms: Number,
  rendimiento: Number,
  litros: Number,
  diesel: Number,
  comidas: Number,
  pasajeOrigen: Number,
  pasajeDestino: Number,
  peajesViapass: Number,
  seguroTraslado: Number,
  sueldo: Number,
  pagoEstadia: Number,
  subTotal: Number,
  admon: Number,
  total: Number,
  inflacion: Number,
  financiamiento: Number,
  ganancia: Number,
  costo: Number,
  fechaCreacion: { type: Date, default: Date.now }
});

const QuoteHistory = mongoose.model('cotizacionHistorial', quoteHistorySchema);

module.exports = QuoteHistory;


const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  origen: { type: String },
  destino: { type: String },
  kms: { type: Number },
  rend: { type: Number },
  lts: { type: Number },
  diesel: { type: Number },
  dieselExtra: { type: Number },
  comidas: { type: Number },
  pasajeOrigen: { type: Number },
  pasajeDestino: { type: Number },
  peajeEfectivo: { type: Number },
  peajesViapass: { type: Number },
  seguroDeTraslado: { type: Number },
  sueldo: { type: Number },
  pagoDeEstadia: { type: Number },
  ferry: { type: Number },
  hotel: { type: Number },
  vuelo: { type: Number },
  taxi: { type: Number },
  udsUsa: { type: Number },
  liberacionPuerto: { type: Number },
  talachas: { type: Number },
  fitosanitarias: { type: Number },
  urea: { type: Number },
  extra: { type: Number },
  subTotal: { type: Number },
  admon: { type: Number },
  total: { type: Number },
  inflacion: { type: Number },
  financiamiento: { type: Number },
  ganancia: { type: Number },
  costo: { type: Number },
  cliente: { type: String },
});

const Quote = mongoose.model('Quote', dataSchema);

module.exports = Quote;

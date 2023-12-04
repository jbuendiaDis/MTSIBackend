const mongoose = require('mongoose');

const peajesSchema = new mongoose.Schema({
  idgasto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gastos',
  },
  localidadOrigen: String,
  localidadDestino: String,
  kms: Number,
  tipoUnidad: {
    type: String,
    enum: ['Automovil', 'Otro'],
  },
  puntos: [
    {
      casetas: {
        type: String,
        enum: ['VIAPASS', 'EFEC'],
      },
      nombreCaseta: String,
      costo: Number,
    },
  ],
  totalPeajes: Number,
});

const Peajes = mongoose.model('Peajes', peajesSchema);

module.exports = Peajes;

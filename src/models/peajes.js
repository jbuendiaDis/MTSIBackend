const mongoose = require('mongoose');

// Definir el esquema para una entidad de peajes
const peajesSchema = new mongoose.Schema({
  idgasto: { type: mongoose.Schema.Types.ObjectId, ref: 'Gastos' },
  kms: Number,
  casetas: {
    type: String,
    enum: ['VIAPASS', 'EFEC'],
  },
  puntos: [
    {
      nombreCaseta: String,
      costo: Number,
    },
  ],
  totalPeajes: Number,
});

// Crear un modelo basado en el esquema
const Peajes = mongoose.model('Peajes', peajesSchema);

module.exports = Peajes;

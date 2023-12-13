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
    enum: ['Automoviles', 'Autobuses', 'Camiones', 'Motocicleta', 'Camión 3 ejes', 'Camion 4 ejes', 'Camion 5 ejes', 'camnon 6 eies', 'Camión 7 ejes', 'Camión 8 ejes', 'Camión 9 ejes', 'Otro'],
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

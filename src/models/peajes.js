const mongoose = require('mongoose');

const peajesSchema = new mongoose.Schema({
  localidadOrigen: String,
  localidadDestino: String,
  kms: Number,
  tipoUnidad: {
    type: String,
    enum: ['Automoviles', 'Autobuses', 'Camiones', 'Motocicleta', 'Camión 3 ejes', 'Camión 4 ejes', 'Camión 5 ejes', 'Camión 6 ejes', 'Camión 7 ejes', 'Camión 8 ejes', 'Camión 9 ejes', 'Otro'],
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

const Peajes = mongoose.model('Ruta', peajesSchema);

module.exports = Peajes;

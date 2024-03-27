const mongoose = require('mongoose');

function getCurrentFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const day = ('0' + now.getDate()).slice(-2);
    const hours = ('0' + now.getHours()).slice(-2);
    const minutes = ('0' + now.getMinutes()).slice(-2);
  
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  }

const SolicitudesSchema = new mongoose.Schema({
  folio: Number,
  estatus: {
    type: String,
    required: true,
    default: 'Pendiente'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clienteId: {
    type: String,
    required: true
  },
  clienteName: {
    type: String,
    required: true
  },
  tipoViajeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Catalogs',
    required: true
  },
  tipoViajeName: {
    type: String,
    required: true
  },
  createdAt: {
    type: String,
    default: getCurrentFormattedDate // Establece la fecha en el formato deseado al crear
  },
  updatedAt: {
    type: String,
    default: getCurrentFormattedDate // Establece la fecha en el formato deseado al crear
  },
  tipoSeguro: {
    type: String 
  },compania: {
    type: String 
  },numeroPoliza: {
    type: String 
  },modelo: {
    type: String 
  },peso: {
    type: String 
  },fotoUnidad: {
    type: String 
  },urlMapa : {
    type: String 
  },
});

SolicitudesSchema.pre('save', function(next) {
  this.updatedAt = getCurrentFormattedDate(); // Actualiza la fecha en el formato deseado antes de guardar
  next();
});

const Solicitudes = mongoose.model('Solicitudes', SolicitudesSchema);

module.exports = Solicitudes;

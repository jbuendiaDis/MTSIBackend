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

const SolicitudDetalleSchema = new mongoose.Schema({
  solicitudId: {
    type: mongoose.Schema.Types.ObjectId, // O type: Number, si vas a usar el folio como referencia
    ref: 'Solicitudes',
    required: true
  },
  folio: {
    type: Number,
    required: true
  },
  localidadOrigenId: {
    type: String,
    required: true
  },
  
  localidadOrigenName: {
    type: String,
    required: true
  },
  localidadOrigenCodigo: {
    type: String,
    required: true
  },
  localidadOrigenTipoCobro: {
    type: String,
    required: true
  },

 

  localidadDestinoId: {
    type: String,
    required: true
  },
  localidadDestinoName: {
    type: String,
    required: true
  },
  localidadDestinoCodigo: {
    type: String,
    required: true
  },
  localidadDestinoTipoCobro: {
    type: String,
    required: true
  },      
  unidadId: {
    type: String,
    required: true
  },
  unidadMarca: {
    type: String,
   
  },
  unidadModelo: {
    type: String,
    
  },
  trasladoId: {
    type: String,
    required: true
  },
  trasladoTipo: {
    type: String,
    required: true
  },
  trasladoConcepto: {
    type: String,
    required: true
  },
  tipoViajeId: {
    type: String,
    required: true
  },
  tipoViajeName: {
    type: String,
    required: true
  },


  
  manual: {
    type: String 
  },
  dimensiones: {
    type: String 
  },
  createdAt: {
    type: String,
    default: getCurrentFormattedDate // Establece la fecha en el formato deseado al crear
  },
  updatedAt: {
    type: String,
    default: getCurrentFormattedDate // Establece la fecha en el formato deseado al crear
  }
});

SolicitudDetalleSchema.pre('save', function(next) {
    this.updatedAt = getCurrentFormattedDate(); // Actualiza la fecha en el formato deseado antes de guardar
    next();
  });

const SolicitudDetalle = mongoose.model('SolicitudDetalle', SolicitudDetalleSchema);

module.exports = SolicitudDetalle;

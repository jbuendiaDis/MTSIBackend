const mongoose = require('mongoose');

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
    required: true
  },
  unidadModelo: {
    type: String,
    required: true
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
    type: String,
    required: true
  },
  dimensiones: {
    type: String,
    required: true
  }
}, { timestamps: true });

const SolicitudDetalle = mongoose.model('SolicitudDetalle', SolicitudDetalleSchema);

module.exports = SolicitudDetalle;

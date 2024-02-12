const mongoose = require('mongoose');

const solicitudDetailSchema = new mongoose.Schema({
  folio: {
    type: Number,
    required: true,
  },
  mensaje: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Esto agregará automáticamente campos para `createdAt` y `updatedAt`
});

const SolicitudDetail = mongoose.model('SolicitudMensaje', solicitudDetailSchema);

module.exports = SolicitudDetail;

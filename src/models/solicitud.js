const mongoose = require('mongoose');

const SolicitudSchema = new mongoose.Schema({

    folio: {
       type: Number,
    },
    estatus: {
        type: String,
        required: true,
        default:'Pendiente'
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
    clienteName:{
        type: String,
        required: true
    }
}, { timestamps: true });

const Solicitud = mongoose.model('Solicitudes', SolicitudSchema);

module.exports = Solicitud;

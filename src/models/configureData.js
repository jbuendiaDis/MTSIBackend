const mongoose = require('mongoose');

const configureDataSchema = new mongoose.Schema({
  rendimiento: {
    type: Number,
    required: true,
  },
  combustible: {
    type: Number,
    required: true,
  },
  inflacion: {
    type: Number,
    required: true,
  },
  financiamiento: {
    type: Number,
    required: true,
  },
  otros: {
    type: Number,
    required: true,
  },
  sucontrato: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Activo', 'Inactivo', 'Expirado'],
    default: 'Activo',
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  horaCreacion: {
    type: String,
    default: new Date().toLocaleTimeString('en-US', { hour12: false }),
  },
  fechaActualizacion: {
    type: Date,
  },
});

const ConfigureData = mongoose.model('ConfigureData', configureDataSchema);

module.exports = ConfigureData;

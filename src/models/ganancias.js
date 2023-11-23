const mongoose = require('mongoose');

const gananciaSchema = new mongoose.Schema({
  desde: {
    type: Number,
    required: true,
  },
  hasta: {
    type: Number,
    required: true,
  },
  ganancia: {
    type: Number,
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now, 
  },
  fechaActualizacion:{
    type: Date,
  },
});

const Ganancia = mongoose.model('Ganancia', gananciaSchema);

module.exports = Ganancia;

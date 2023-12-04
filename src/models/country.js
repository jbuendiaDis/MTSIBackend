const mongoose = require('mongoose');

const CountrySchema = new mongoose.Schema({
  codigo: {
    type: Number,
    required: true,
    unique: true,  
  },
  estado: Number,
  coordenadas: {
    type: [Number],
  },
  nombre: String,
  costo: Number,
  
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  fechaActualizacion: {
    type: Date,
  },
});

CountrySchema.index({ codigo: 1 }, { unique: true });

const CountryModel = mongoose.model('Country', CountrySchema);

module.exports = CountryModel;

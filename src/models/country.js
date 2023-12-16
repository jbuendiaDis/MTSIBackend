const mongoose = require('mongoose');
const Catalog = require('../models/catalog');

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
 
  tipoUnidad: {
    type: String,
    required: true,
    validate: {
      validator: async function (value) {
        try {
          // Validar que el valor de tipoUnidad coincide con el catálogo padre con ID 23
          const catalogEntry = await Catalog.findOne({ descripcion: value, idPadre: '65790e5ed80af3d60dbb535d' });

          if (!catalogEntry) {
            throw new Error(`El tipo de unidad "${value}" no coincide con el catálogo padre con ID '65790e5ed80af3d60dbb535d'.`);
          }

          return true;
        } catch (error) {
          return false;
        }
      },
      message: 'El tipo de unidad no coincide con el catálogo padre con ID  65790e5ed80af3d60dbb535d' ,
    },
  },
  
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

const mongoose = require('mongoose');

const CatalogSchema = new mongoose.Schema({
 
  descripcion: String,
  codigo: String,
  idPadre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Catalog',
    default: null,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  fechaActualizacion: {
    type: Date,
  },
});

const CatalogModel = mongoose.model('Catalog', CatalogSchema);

module.exports = CatalogModel;

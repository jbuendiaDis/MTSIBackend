// models/Municipio.js
const mongoose = require('mongoose');

const municipioSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  estado: String,
  municipio: String,
  estadoId: Number,
});

const MunicipioModel = mongoose.model('Municipio', municipioSchema);

module.exports = MunicipioModel;
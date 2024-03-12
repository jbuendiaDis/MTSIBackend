// models/Municipio.js
const mongoose = require('mongoose');

const municipioSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  estado: String,

  municipio: String,
  estadoId: Number,
});

//module.exports = mongoose.model('Municipio', municipioSchema);

const CountryModel = mongoose.model('Municipio', municipioSchema);

module.exports = CountryModel;

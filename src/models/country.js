const mongoose = require('mongoose');

const CountrySchema = new mongoose.Schema({
  estado: Number,
  coordenadas: {
    type: [Number],
  },
  nombre: String,
});

const CountryModel = mongoose.model('Country', CountrySchema);

module.exports = CountryModel;

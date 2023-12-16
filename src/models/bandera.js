const mongoose = require('mongoose');

const BanderaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
  },
  descripcion: String,
  valor: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
});

const Bandera = mongoose.model('Bandera', BanderaSchema);

module.exports = Bandera;

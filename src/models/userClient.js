const mongoose = require('mongoose');

const userClientSchema = new mongoose.Schema({
  idCliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  nombreCliente: {
    type: String,
    required: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  genero: {
    type: String,
    required: true,
  },
  puesto: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    require: true,
  },
  telOficina: {
    type: String,
    required: false,
  },
  telMovil: {
    type: String,
    required: false,
  },
  whatsapp: {
    type: String,
    required: false,
  },
  direccion: {
    type: String,
    required: false,
  },
  notas: {
    type: String,
    required: false,
  },
});

const UserClient = mongoose.model('UserClient', userClientSchema);

module.exports = UserClient;

 

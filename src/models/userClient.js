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
    type: String 
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
    type: String 
  },
  telMovil: {
    type: String 
  },
  whatsapp: {
    type: String 
  },
  direccion: {
    type: String,
    required: false,
  },
  notas: {
    type: String,
    required: false,
  },
  extension: {
    type: String
  },


  
});

const UserClient = mongoose.model('UserClient', userClientSchema);

module.exports = UserClient;

 

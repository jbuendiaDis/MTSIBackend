const mongoose = require('mongoose');

// Definir el esquema para una entidad de clientes
const clienteSchema = new mongoose.Schema({
  codigoCliente: {
    type: String,
    required: true,
    unique: true,
    minlength: 8,
    maxlength: 14,
  },
  razonSocial: {
    type: String,
    required: true,
  },
  rfc: {
    type: String,
    required: true,
  },
  metodoPago: String,
  formaPago: String,
  regimenFiscal: {
    type: String,
    required: true,
  },
  usoCFDI: {
    type: String,
    required: true,
  },
  telefono: String,
  calle: String,
  numeroExterior: String,
  numeroInterior: String,
  colonia: String,
});

// Crear un modelo basado en el esquema
const Cliente = mongoose.model('Cliente', clienteSchema);

module.exports = Cliente;

/* eslint-disable no-await-in-loop */
const Cliente = require('../models/clients');

// Función para generar un código de cliente único de longitud "length"
function generateUniqueCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i += 1) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
}

// Controlador para crear un nuevo cliente
const createCliente = async (req, res) => {
  try {
    let { codigoCliente } = req.body;
    if (!codigoCliente) {
      do {
        codigoCliente = generateUniqueCode(10);
      } while (await Cliente.findOne({ codigoCliente }));
    }

    const razonSocial = req.body.razonSocial ? req.body.razonSocial.toUpperCase() : '';

    const cliente = new Cliente({
      codigoCliente,
      razonSocial,
      rfc: req.body.rfc,
      metodoPago: req.body.metodoPago,
      formaPago: req.body.formaPago,
      regimenFiscal: req.body.regimenFiscal,
      usoCFDI: req.body.usoCFDI,
      telefono: req.body.telefono,
      calle: req.body.calle,
      numeroExterior: req.body.numeroExterior,
      numeroInterior: req.body.numeroInterior,
      colonia: req.body.colonia,
    });

    const nuevoCliente = await cliente.save();
    res.status(201).json(nuevoCliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

// Controlador para obtener todos los clientes
const getClientes = async (req, res) => {
  try {
    console.log('rq', req.params);

    const clientes = await Cliente.find();
    res.status(200).json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

// Controlador para obtener un cliente por su ID
const getClienteById = async (req, res) => {
  try {
    console.log('rw', req.params.id);

    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      res.status(404).json({ message: 'Cliente no encontrado.' });
    }
    res.status(200).json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

const getClienteLike = async (req, res) => {
  try {
    console.log('rr', req.params);

    const { razonSocialQuery } = req.params; // Obtener la subcadena de los parámetros.
    console.log(razonSocialQuery);

    const clientes = await Cliente.find({
      razonSocial: { $regex: new RegExp(razonSocialQuery, 'i') }, // 'i' indica insensible a mayúsculas/minúsculas.
    });

    res.status(200).json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

// Controlador para actualizar un cliente por su ID
const updateCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cliente) {
      res.status(404).json({ message: 'Cliente no encontrado.' });
    }
    res.status(200).json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

// Controlador para eliminar un cliente por su ID
const deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndRemove(req.params.id);
    if (!cliente) {
      res.status(404).json({ message: 'Cliente no encontrado.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

module.exports = {
  createCliente,
  getClientes,
  getClienteById,
  updateCliente,
  deleteCliente,
  getClienteLike,
};

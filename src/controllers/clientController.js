/* eslint-disable no-await-in-loop */
const Cliente = require('../models/clients');
const Catalog = require('../models/catalog');

const responseError = require('../functions/responseError');

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
    // eslint-disable-next-line object-curly-newline
    const { razonSocial, rfc, regimenFiscal, usoCFDI } = req.body;

    if (!codigoCliente) {
      do {
        codigoCliente = generateUniqueCode(10);
      } while (await Cliente.findOne({ codigoCliente }));
    }

    if (!razonSocial || !rfc || !regimenFiscal || !usoCFDI) {
      res.formatResponse('ok', 204, 'Faltan campos obligatorios', []);
      return;
    }
    const razonSocialUpper = req.body.razonSocial ? req.body.razonSocial.toUpperCase() : '';

    const cliente = new Cliente({
      codigoCliente,
      razonSocial: razonSocialUpper,
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
      estadoId: req.body.estadoId,
    });

    const existingClient = await Cliente.findOne({ rfc });
    if (existingClient) {
      res.formatResponse('ok', 204, 'El RFC ya esta registrado.', []);
      return;
    }

    const nuevoCliente = await cliente.save();
    res.formatResponse('ok', 200, 'Usuario registrado con éxito.', nuevoCliente);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const determinarEstadoNombre = async (estadoId) => {
  try {
    const catalogEntry = await Catalog.findOne({ codigo: estadoId, idPadre: '6579211bba59a5eee8b34567' });

    console.log('catalogEntry:', catalogEntry);

    if (catalogEntry) {
      return catalogEntry.descripcion;
    }
    return '';
  } catch (error) {
    console.error('Error al consultar el catálogo:', error);
    return '';
  }
};

// Controlador para obtener todos los clientes
const getClientes = async (req, res) => {
  try {
    const clients = await Cliente.find().select('-__v');

    if (clients.length > 0) {
      // Mapear los clientes para agregar el campo 'estadonombre'
      const clientsWithEstadoNombre = await Promise.all(clients.map(async (client) => {
        const estadoNombre = await determinarEstadoNombre(client.estadoId);
        return {
          // eslint-disable-next-line no-underscore-dangle
          ...client._doc,
          estado: estadoNombre,
        };
      }));

      res.formatResponse('ok', 200, 'Consulta exitosa', clientsWithEstadoNombre);
    } else {
      res.formatResponse('ok', 204, 'data not found', []);
    }
  } catch (error) {
    await responseError(409, error, res);
  }
};

// Controlador para obtener un cliente por su ID
const getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      res.formatResponse('ok', 204, 'Cliente no encontrado.', []);
      return;
    }
    res.formatResponse('ok', 200, 'Consulta exitosa', cliente);
  } catch (error) {
    await responseError(409, error, res);
  }
};

// Controlador para buscar cliente
const getClienteLike = async (req, res) => {
  try {
    const { razonSocialQuery } = req.params;

    const cliente = await Cliente.find({
      razonSocial: { $regex: new RegExp(razonSocialQuery, 'i') },
    });

    if (cliente.length <= 0) {
      res.formatResponse('ok', 204, 'Cliente no encontrado.', []);
      return;
    }

    res.formatResponse('ok', 200, 'Consulta exitosa', cliente);
  } catch (error) {
    await responseError(409, error, res);
  }
};

// Controlador para actualizar un cliente por su ID
const updateCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cliente) {
      res.formatResponse('ok', 204, 'Cliente no encontrado.', []);
      return;
    }
    res.formatResponse('ok', 200, 'Actualización exitosa', cliente);
  } catch (error) {
    await responseError(409, error, res);
  }
};

// Controlador para eliminar un cliente por su ID
const deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndRemove(req.params.id);
    if (!cliente) {
      res.formatResponse('ok', 204, 'Cliente no encontrado.', []);
    }
    res.formatResponse('ok', 200, 'Cliente borrado', [{ deleteID: req.params.id }]);
  } catch (error) {
    await responseError(409, error, res);
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

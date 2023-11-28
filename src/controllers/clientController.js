/* eslint-disable no-await-in-loop */
const Cliente = require('../models/clients');

const generateUUID = require('../utils/generateUUID');
const logAuditEvent = require('../utils/auditLogger');
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
    });

    const existingClient = await Cliente.findOne({ rfc });
    if (existingClient) {
      res.formatResponse('ok', 204, 'El RFC ya esta registrado.', []);
      return;
    }

    const nuevoCliente = await cliente.save();
    res.formatResponse('ok', 200, 'Usuario registrado con éxito.', nuevoCliente);
  } catch (error) {
    const uuid = generateUUID();
    const errorDescription = error;
    logAuditEvent(uuid, errorDescription);
    res.formatResponse(
      'ok',
      409,
      `Algo ocurrio favor de reportar al area de sistemas con el siguiente folio ${uuid}`,
      errorDescription,
    );
  }
};

// Controlador para obtener todos los clientes
const getClientes = async (req, res) => {
  try {
    const client = await Cliente.find().select('-__v');
    if (client.length > 0) {
      res.formatResponse('ok', 200, 'request success', client);
    } else {
      res.formatResponse('ok', 204, 'data not found', []);
    }
  } catch (error) {
    await responseError(409,error,res);
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
    res.formatResponse('ok', 200, 'request success', cliente);
  } catch (error) {
    await responseError(409,error,res);
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

    res.formatResponse('ok', 200, 'request success', cliente);
  } catch (error) {
    await responseError(409,error,res);
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
    res.formatResponse('ok', 200, 'request success', cliente);
  } catch (error) {
    await responseError(409,error,res);
  }
};

// Controlador para eliminar un cliente por su ID
const deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndRemove(req.params.id);
    if (!cliente) {
      res.formatResponse('ok', 204, 'Cliente no encontrado.', []);
    }
    res.formatResponse('ok', 200, 'User Delete success', [{ deleteID: req.params.id }]);
  } catch (error) {
    await responseError(409,error,res);
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

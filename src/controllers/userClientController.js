const bcrypt = require('bcrypt');
const UserClient = require('../models/userClient');

const generateUUID = require('../utils/generateUUID');
const logAuditEvent = require('../utils/auditLogger');

// Obtener todos los userClients
const getAllUserClients = async (req, res) => {
  try {
    const userClients = await UserClient.find();
    if (userClients.length > 0) {
      res.formatResponse('ok', 200, 'request success', userClients);
    } else {
      res.formatResponse('ok', 204, 'data not found', []);
    }
  } catch (error) {
    const uuid = generateUUID();
    await logAuditEvent(uuid, error);
    res.formatResponse(
      'ok',
      409,
      `Algo ocurrio favor de reportar al area de sistemas con el siguiente folio ${uuid}`,
      [],
    );
  }
};

// Obtener un userClient por su ID
const getUserClientById = async (req, res) => {
  try {
    console.log(req.params.id);
    const userClient = await UserClient.findById(req.params.id);
    if (!userClient) {
      res.formatResponse('ok', 204, 'data not found', []);
    }
    res.formatResponse('ok', 200, 'request success', userClient);
  } catch (error) {
    const uuid = generateUUID();
    await logAuditEvent(uuid, error);
    res.formatResponse(
      'ok',
      409,
      `Algo ocurrio favor de reportar al area de sistemas con el siguiente folio ${uuid}`,
      [],
    );
  }
};

const createUserClient = async (req, res) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const { name, email, password } = req.body;

  if (!emailRegex.test(email)) {
    res.formatResponse('ok', 204, 'Correo electrónico inválido', []);
  }

  if (!password) {
    res.formatResponse('ok', 204, 'La contraseña no puede estar vacía', []);
    return;
  }

  try {
    const existingUserClient = await UserClient.findOne({ email });
    if (existingUserClient) {
      res.formatResponse('ok', 204, 'El correo electrónico ya está registrado', []);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userClient = new UserClient({
      ...req.body,
      name,
      email,
      password: hashedPassword,
    });

    const newUserClient = await userClient.save();
    res.formatResponse('ok', 200, 'request success', newUserClient);
  } catch (error) {
    const uuid = generateUUID();
    await logAuditEvent(uuid, error);
    res.formatResponse(
      'ok',
      409,
      `Algo ocurrio favor de reportar al area de sistemas con el siguiente folio ${uuid}`,
      [],
    );
  }
};

const updateUserClient = async (req, res) => {
  try {
    const userClient = await UserClient.findById(req.params.id);
    if (!userClient) {
      res.formatResponse('ok', 204, 'data not found', []);
    }
    // eslint-disable-next-line no-underscore-dangle
    const updateUserData = { ...userClient._doc, ...req.body };

    const updatedUserClient = await UserClient.findByIdAndUpdate(
      req.params.id,
      updateUserData,
      { new: true },
    );

    res.formatResponse('ok', 200, 'request success', updatedUserClient);
  } catch (error) {
    const uuid = generateUUID();
    await logAuditEvent(uuid, error);
    res.formatResponse(
      'ok',
      409,
      `Algo ocurrio favor de reportar al area de sistemas con el siguiente folio ${uuid}`,
      [],
    );
  }
};

const deleteUserClient = async (req, res) => {
  try {
    const userClient = await UserClient.findById(req.params.id);
    if (!userClient) {
      res.formatResponse('ok', 204, 'data not found', []);
      return;
    }

    await UserClient.findByIdAndRemove(req.params.id);
    res.formatResponse('ok', 200, 'request success', []);
  } catch (error) {
    const uuid = generateUUID();
    await logAuditEvent(uuid, error);
    res.formatResponse(
      'ok',
      409,
      `Algo ocurrio favor de reportar al area de sistemas con el siguiente folio ${uuid}`,
      [],
    );
  }
};

module.exports = {
  getAllUserClients,
  getUserClientById,
  createUserClient,
  updateUserClient,
  deleteUserClient,
};

const bcrypt = require('bcrypt');
const UserClient = require('../models/userClient');
 
const generateUUID = require('../utils/generateUUID');
const logAuditEvent = require('../utils/auditLogger');
const responseError = require('../functions/responseError');

// Obtener todos los userClients
const getAllUserClients = async (req, res) => {
  try {
    const userClients = await UserClient.find();
    if (userClients.length > 0) {
      res.formatResponse('ok', 200, 'request success', userClients);
    } else {
      return await responseError(204,'data not found',res);
    }
  } catch (error) {
    await responseError(409,error,res);
  }
};

// Obtener un userClient por su ID
const getUserClientById = async (req, res) => {
  try {
    console.log(req.params.id);
    const userClient = await UserClient.findById(req.params.id);
    if (!userClient) {
      return await responseError(204,'data not found',res);
    }
    res.formatResponse('ok', 200, 'request success', userClient);
  } catch (error) {
    await responseError(409,error,res);
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
    await responseError(409,error,res);
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
    await responseError(409,error,res);
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
    await responseError(409,error,res);
  }
};

module.exports = {
  getAllUserClients,
  getUserClientById,
  createUserClient,
  updateUserClient,
  deleteUserClient,
};

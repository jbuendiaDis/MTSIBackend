/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const UserClient = require('../models/userClient');
const Clientes = require('../models/clients');

async function login(req, res, next) {
  const { email, password } = req.body;

  // Busca al usuario por su correo electrónico
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  // Verifica la contraseña
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  // Genera un token JWT
  const token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      data: {
        id: user._id,
        name: user.name,
        lastname: user.lastname,
        position: user.position,
        email: user.email
      },
    },
    process.env.TOKEN_SECRET,
  );

  return res.status(200).send({
    response: {
      status: 'ok',
      code: 200,
      message: 'success processing',
    },
    payload: {
      token,
      user: {
        id: user._id,
        name: user.name,
        lastname: user.lastname,
        position: user.position,
        email: user.email,
        age: user.age,
        signature: user.signature,
        role:user.role
      },
    },
  });
}

async function loginclient(req, res, next) {
  const { email, password, codigoCliente } = req.body;

  const user = await UserClient.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas.' });
  }

  const idCliente = user.idCliente.toString();

  const cliente = await Clientes.findOne({ _id: idCliente });

  if (!cliente) {
    return res.status(401).json({ message: 'Credenciales inválidas..' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid || codigoCliente !== cliente.codigoCliente) {
    return res.status(401).json({ message: 'Credenciales inválidas...' });
  }

  // Genera un token JWT
  const token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      data: {
        id: user._id,
        name: user.name,
        lastname: user.lastname,
        position: user.position,
        email: user.email,
      },
    },
    process.env.TOKEN_SECRET,
  );

  return res.status(200).json({
    response: {
      status: 'ok',
      code: 200,
      message: 'success processing',
    },
    payload: {
      token,
      user: {
        id: user._id,
        name: user.name,
        lastname: user.lastname,
        position: user.position,
        email: user.email,
        age: user.age,
        signature: user.signature,
      },
    },
  });
}

module.exports = {
  login,
  loginclient,
};

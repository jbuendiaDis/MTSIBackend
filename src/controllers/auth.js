/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

async function login(req, res, next) {
  const { email, password } = req.body;

  // Busca al usuario por su correo electrónico
  const user = await User.findOne({ email });

  if (!user) {
    res.status(401).json({ message: 'Credenciales inválidas' });
  }

  // Verifica la contraseña
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    res.status(401).json({ message: 'Credenciales inválidas' });
  }

  // Genera un token JWT
  const token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      data: user,
    },
    process.env.TOKEN_SECRET,
  );

  res.status(200).send({
    response: {
      status: 'ok',
      code: 200,
      message: 'success processing',
    },
    payload: {
      token,
      user,
    },
  });
}

module.exports = {
  login,
};

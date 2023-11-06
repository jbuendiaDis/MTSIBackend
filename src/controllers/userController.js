const bcrypt = require('bcrypt');
const User = require('../models/User');

const generateUUID = require('../utils/generateUUID');
const logAuditEvent = require('../utils/auditLogger');

// Crear un nuevo usuario
async function createUser(req, res) {
  const { name, email, password } = req.body;
  const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
  try {
    // Validar que los campos obligatorios estén presentes
    if (!name || !email || !password) {
      res.formatResponse('ok', 204, 'Faltan campos obligatorios', []);
      return;
    }

    if (!regex.test(password)) {
      res.formatResponse('ok', 204, 'Minimo 8 caracteres una mayusacula y un caracter especial', []);
      return;
    }

    // Verificar si ya existe un usuario con el mismo correo
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.formatResponse('ok', 204, 'El correo ya está en uso.', []);
      return;
    }

    // Cifrar la contraseña antes de guardarla en la base de datos
    const saltRounds = 15;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear un nuevo usuario
    const newUser = new User({
      ...req.body,
      name,
      email,
      password: hashedPassword,
    });

    // Guardar el usuario en la base de datos
    const user = await newUser.save();
    res.formatResponse('ok', 200, 'Usuario registrado con éxito.', user);
  } catch (error) {
    const uuid = generateUUID();
    const errorDescription = error;
    logAuditEvent(uuid, errorDescription);
  }
}

// Obtener todos los usuarios
async function getUsers(req, res) {
  try {
    const users = await User.find().select('-password -__v');
    if (users.length > 0) {
      res.formatResponse('ok', 200, 'request success', users);
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
}

// Obtener un usuario por su ID
async function getUserById(req, res) {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select('-password -__v');
    if (!user) {
      res.formatResponse('ok', 204, 'user not found', []);
      return;
    }
    res.formatResponse('ok', 200, 'request success', user);
  } catch (error) {
    res.formatResponse('ok', 409, 'request decline', error);
  }
}

// Actualizar un usuario por su ID
async function updateUser(req, res) {
  const { userId } = req.params;
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });
    if (!updatedUser) {
      res.formatResponse('ok', 204, 'user not found', []);

      return;
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Eliminar un usuario por su ID
async function deleteUser(req, res) {
  const { userId } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      res.formatResponse('ok', 204, 'user not found', []);
      return;
    }
    res.formatResponse('ok', 200, 'User Delete success', [{ deleteID: userId }]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};

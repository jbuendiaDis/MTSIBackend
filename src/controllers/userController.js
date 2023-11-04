const bcrypt = require('bcrypt');
const User = require('../models/User');

// Crear un nuevo usuario
async function createUser(req, res) {
  const { name, email, password } = req.body;

  try {
    // Validar que los campos obligatorios estén presentes
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    // Verificar si ya existe un usuario con el mismo correo
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'El correo ya está en uso.' });
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
    await newUser.save();

    res.status(201).json({ message: 'Usuario registrado con éxito.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
}

// Obtener todos los usuarios
async function getUsers(req, res) {
  try {
    res.formatResponse(200, '200', 'Respuesta de ejemplo', {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Obtener un usuario por su ID
async function getUserById(req, res) {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Actualizar un usuario por su ID
async function updateUser(req, res) {
  const { userId } = req.params;
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });
    if (!updatedUser) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Eliminar un usuario por su ID
async function deleteUser(req, res) {
  const userId = req.params.id;
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.status(204).send();
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

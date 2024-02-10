const User = require('../models/User');
const UserClientModel = require('../models/userClient');

const getUserNameById = async (userId) => {
  try {
    if (!userId) {
      return null;
    }

    // Intenta encontrar el usuario en la tabla User
    let user = await User.findById(userId);
    if (user) {
      return `${user.name} ${user.lastname}`;
    }

    // Si no se encuentra en User, intenta buscar en UserClient
    user = await UserClientModel.findOne({ _id: userId });
    if (user) {
      // Asume que quieres devolver el nombre del cliente (usuario cliente)
      let nombre = user.nombreCliente ? `${user.nombre} (Cliente)` : null;

      console.log(nombre);
      return nombre;
    }

    return null; // Retorna null si el usuario no se encuentra en ninguna de las dos tablas
  } catch (error) {
    console.error("Error al buscar el nombre del usuario: ", error);
    throw error;
  }
};

module.exports = getUserNameById;


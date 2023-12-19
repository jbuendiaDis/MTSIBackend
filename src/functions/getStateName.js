const Catalogo = require('../models/catalog');

const getStateName = async (estadoId) => {
  try {
    if (!estadoId) {
      return null;
    }

    const estadoCatalogo = await Catalogo.findOne({ codigo: estadoId, idPadre: '6579211bba59a5eee8b34567' });

    return estadoCatalogo ? estadoCatalogo.descripcion : null;
  } catch (error) {
    throw error;
  }
};

module.exports = getStateName;

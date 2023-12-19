// functions/getDestinationName.js
const Catalog = require('../models/catalog');

const getDestinationName = async (codigo) => {
  try {
    const catalogEntry = await Catalog.findOne({ codigo });

    if (!catalogEntry) {
      return null;
    }

    return catalogEntry.descripcion;
  } catch (error) {
    console.error('Error al obtener el nombre del destino:', error);
    return null;
  }
};

module.exports = getDestinationName;

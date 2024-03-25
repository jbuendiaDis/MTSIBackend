// functions/getDestinationName.js
const MunicipiosModel = require('../models/Municipio');

const getDestinationIdEstado = async (id) => {
  try {
    //const catalogEntry = await Country.findOne({ codigo });

    const catalogEntry =await MunicipiosModel.findOne({ _id: id });

    if (!catalogEntry) {
      return null;
    }

    return catalogEntry.estadoId;
  } catch (error) {
    console.error('Error al obtener el id del estado:', error);
    return null;
  }
};

module.exports = getDestinationIdEstado;

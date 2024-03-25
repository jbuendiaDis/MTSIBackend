// functions/getMunicipioName.js
const MunicipiosModel = require('../models/Municipio');

const getMunicipioName = async (id) => {
  try {
    const catalogEntry = await MunicipiosModel.findOne({ _id: id });

    if (!catalogEntry) {
      return null;
    }

    return catalogEntry.municipio;
  } catch (error) {
    console.error('Error al obtener el nombre del municipio:', error);
    return null;
  }
};
module.exports = getMunicipioName;
 
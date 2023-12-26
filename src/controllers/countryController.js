const fs = require('fs/promises');
const path = require('path');

const responseError = require('../functions/responseError');
const getStateName = require('../functions/getStateName');

const Country = require('../models/country');

const createCountry = async (req, res) => {
  try {
    const {
      costo, estado, nombre, tipoUnidad,
    } = req.body;

    const existingCountry = await Country.findOne({
      costo,
      estado,
      nombre,
      tipoUnidad,
    });

    if (existingCountry) {
      res.formatResponse('error', 204, 'Ya existe un peaje con estos datos.', []);
    }

    const lastCountry = await Country.findOne().sort({ codigo: -1 });

    const newCodigo = lastCountry ? lastCountry.codigo + 1 : 1;

    const newCountry = new Country({
      ...req.body,
      codigo: newCodigo,
    });

    const savedCountry = await newCountry.save();

    res.formatResponse('ok', 200, 'Peaje registrado con éxito.', savedCountry);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const getAllCountries = async (req, res) => {
  try {
    const countries = await Country.find();

    const countriesWithEstado = await Promise.all(
      countries.map(async (country) => {
        const estadoNombre = await getStateName(country.estado);

        console.log('estadoNombre->', estadoNombre);

        if (estadoNombre) {
          return {
            ...country.toObject(),
            estadoNombre,
          };
        }
        return country.toObject();
      }),
    );

    res.formatResponse('ok', 202, 'Consulta exitosa', countriesWithEstado);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const getCountryByCode = async (req, res) => {
  const { codigo } = req.params;

  try {
    const country = await Country.findOne({ codigo });

    if (!country) {
      res.formatResponse('ok', 204, 'Country no encontrado.', []);
    }

    const estadoNombre = await getStateName(country.estado);

    const countryWithEstado = {
      ...country.toObject(),
      estadoNombre,
    };

    res.formatResponse('ok', 200, 'Consulta exitosa', countryWithEstado);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const getCountryById = async (req, res) => {
  const { id } = req.params;

  try {
    const country = await Country.findById(id);

    if (!country) {
      res.formatResponse('ok', 204, 'Country no encontrado.', []);
      return;
    }

    const estadoNombre = await getStateName(country.estado);

    const countryWithEstado = {
      ...country.toObject(),
      estadoNombre,
    };

    res.formatResponse('ok', 200, 'Consulta exitosa', countryWithEstado);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const getCountryByEstado = async (req, res) => {
  const estado = parseInt(req.params.estado, 10);

  try {
    const countries = await Country.find({ estado });

    if (!countries || countries.length === 0) {
      res.formatResponse('ok', 204, `No hay localidades para el estado ${estado}.`, []);
      return;
    }

    // Mapear cada país y agregar el nombre del estado
    const countriesWithEstado = await Promise.all(countries.map(async (country) => {
      const estadoNombre = await getStateName(country.estado);

      return {
        ...country.toObject(),
        estadoNombre,
      };
    }));

    res.formatResponse('ok', 200, 'Consulta exitosa', countriesWithEstado);
  } catch (error) {
    await responseError(409, error, res);
  }
};


const getCountryByNombre = async (req, res) => {
  const { nombre } = req.params;

  try {
    const countries = await Country.find({ nombre: { $regex: nombre, $options: 'i' } });

    if (!countries || countries.length === 0) {
      res.formatResponse('ok', 204, `No hay países con nombre similar a "${nombre}".`, []);
    }

    res.formatResponse('ok', 200, 'Consulta exitosa', countries);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const updateCountryByCode = async (req, res) => {
  try {
    const { codigo } = req.params;

    const updatedCountry = await Country.findOneAndUpdate(
      { codigo },
      { ...req.body, fechaActualizacion: new Date() },
      { new: true },
    );

    if (!updatedCountry) {
      res.formatResponse('ok', 204, 'Country no encontrado.', []);
    }

    res.formatResponse('ok', 200, 'Country actualizado con éxito.', updatedCountry);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const deleteCountryById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCountry = await Country.findByIdAndDelete(id);

    if (!deletedCountry) {
      res.formatResponse('ok', 204, 'Country no encontrado.', []);
    }

    res.formatResponse('ok', 200, 'Country eliminado con éxito.', deletedCountry);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const savePointsAsCountries = async (req, res) => {
  try {
    const createCountryInternal = async (data, newCodigo) => {
      // Crear el nuevo país con el nuevo código
      const newCountry = new Country({
        ...data,
        codigo: newCodigo,
      });

      // Guardar el nuevo país en la base de datos
      const savedCountry = await newCountry.save();

      return savedCountry;
    };

    const dataFilePath = path.join(__dirname, '../functions/data.json');
    const rawData = await fs.readFile(dataFilePath, 'utf-8');
    const data = JSON.parse(rawData);

    if (!data || !data.puntos || typeof data.puntos !== 'object') {
      res.formatResponse('error', 400, 'La estructura de puntos no es válida.', []);
    }

    const savedCountries = [];

    Object.keys(data.puntos).forEach(async (codigo) => {
      const punto = data.puntos[codigo];

      const lastCountry = await Country.findOne().sort({ codigo: -1 });

      const newCodigo = lastCountry ? lastCountry.codigo + 1 : 1;

      const savedCountry = await createCountryInternal({
        codigo,
        estado: punto.estado,
        coordenadas: punto.coordenadas,
        nombre: punto.nombre,
        fechaCreacion: new Date(),
      }, newCodigo);

      savedCountries.push(savedCountry);
    });
    res.formatResponse('ok', 200, 'Puntos guardados como localidades con éxito.', savedCountries);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const getCountryByEstadoYTipoUnidad = async (req, res) => {
  try {
    const { estado, tipoUnidad } = req.params;

    // Verificar si el estado y tipo de unidad son proporcionados
    if (!estado || !tipoUnidad) {
      return  res.formatResponse('error', 204, 'Los parámetros estado y tipoUnidad son requeridos.', []);
       // Importante: terminar la ejecución después de enviar la respuesta
    }

    const countries = await Country.find({ estado, tipoUnidad });

    if (!countries || countries.length === 0) {
      return  res.formatResponse('ok', 204, `No hay localidades para el estado ${estado} y tipo de unidad ${tipoUnidad}.`, []);
       // Importante: terminar la ejecución después de enviar la respuesta
    }

    res.formatResponse('ok', 200, 'Consulta exitosa', countries);
  } catch (error) {
    await responseError(409, error, res);
  }
};


module.exports = {
  createCountry,
  getAllCountries,
  getCountryById,
  updateCountryByCode,
  getCountryByCode,
  deleteCountryById,
  savePointsAsCountries,
  getCountryByEstado,
  getCountryByNombre,
  getCountryByEstadoYTipoUnidad,
};

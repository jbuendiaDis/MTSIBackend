// controllers/countryController.js
const fs = require('fs/promises');
const path = require('path');
const Country = require('../models/country');
const responseError = require('../functions/responseError');

const createCountry = async (req, res) => {
  try {
    const { codigo } = req.body;

    // Verificar si ya existe un documento con el mismo código
    const existingCountry = await Country.findOne({ codigo });

    if (existingCountry) {
      return res.formatResponse('error', 204, 'Ya existe una localidad con el mismo código.', []);
    }

    // Si no existe, crear y guardar el nuevo país
    const newCountry = new Country(req.body);
    const savedCountry = await newCountry.save();

    res.formatResponse('ok', 200, 'Country registrado con éxito.', savedCountry);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const getAllCountries = async (req, res) => {
  try {
    const countries = await Country.find();
    res.formatResponse('ok', 200, 'Consulta exitosa', countries);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const getCountryByCode = async (req, res) => {
  console.info("getCountryByCode",req.params);
  const codigo= req.params.codigo;
  try {
    const country = await Country.findOne({ codigo: codigo });

    if (!country) {
      return res.formatResponse('ok', 204, 'Country no encontrado.', []);
    }

    res.formatResponse('ok', 200, 'Consulta exitosa', country);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const getCountryByEstado = async (req, res) => {
  const estado = parseInt(req.params.estado);

  try {
    const countries = await Country.find({ estado });

    if (!countries || countries.length === 0) {
      return res.formatResponse('ok', 204, `No hay localidades para el estado ${estado}.`, []);
    }

    res.formatResponse('ok', 200, 'Consulta exitosa', countries);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const getCountryByNombre = async (req, res) => {
  const nombre = req.params.nombre;

  try {
    const countries = await Country.find({ nombre: { $regex: nombre, $options: 'i' } });

    if (!countries || countries.length === 0) {
      return res.formatResponse('ok', 204, `No hay países con nombre similar a "${nombre}".`, []);
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
      { new: true }
    );

    if (!updatedCountry) {
      return res.formatResponse('ok', 204, 'Country no encontrado.', []);
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
      return res.formatResponse('ok', 204, 'Country no encontrado.', []);
    }

    res.formatResponse('ok', 200, 'Country eliminado con éxito.', deletedCountry);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const savePointsAsCountries = async (req, res) => {
  try {
 
    const dataFilePath = path.join(__dirname, '../functions/data.json');
 
    const rawData = await fs.readFile(dataFilePath, 'utf-8');
    const data = JSON.parse(rawData);

    if (!data || !data.puntos || typeof data.puntos !== 'object') {
      return res.formatResponse('error', 400, 'La estructura de puntos no es válida.', []);
    }

    const countriesToSave = [];
 
    for (const codigo in data.puntos) {
      if (data.puntos.hasOwnProperty(codigo)) {
        const punto = data.puntos[codigo];
  
        countriesToSave.push({
          codigo,
          estado: punto.estado,
          coordenadas: punto.coordenadas,
          nombre: punto.nombre,
          fechaCreacion: new Date(),
        });
      }
    }
 
    const savedCountries = await Country.create(countriesToSave);

    res.formatResponse('ok', 200, 'Puntos guardados como localidades con éxito.', savedCountries);
  } catch (error) {
    await responseError(409, error, res);
  }
};

module.exports = {
  createCountry,
  getAllCountries,
  updateCountryByCode,
  getCountryByCode,
  deleteCountryById,
  savePointsAsCountries,
  getCountryByEstado,
  getCountryByNombre
};

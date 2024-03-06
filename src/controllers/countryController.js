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
      return res.formatResponse('error', 204, 'Ya existe una localidades con estos datos.', []);
    }

    const lastCountry = await Country.findOne().sort({ codigo: -1 });

    const newCodigo = lastCountry ? lastCountry.codigo + 1 : 1;

    const newCountry = new Country({
      ...req.body,
      codigo: newCodigo,
    });

    const savedCountry = await newCountry.save();

    res.formatResponse('ok', 200, 'Localidad registrado con éxito.', savedCountry);
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
      res.formatResponse('ok', 204, 'Localidades no encontrado.', []);
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
      res.formatResponse('ok', 204, 'Localidades no encontrado.', []);
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
      res.formatResponse('ok', 204, `No hay localidades con nombre similar a "${nombre}".`, []);
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
      res.formatResponse('ok', 204, 'Localidad no encontrada.', []);
    }

    res.formatResponse('ok', 200, 'Localidad actualizado con éxito.', updatedCountry);
  } catch (error) {
    await responseError(409, error, res);
  }
};


const updateCountryById = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedCountry = await Country.findByIdAndUpdate(
      id,
      { ...req.body, fechaActualizacion: new Date() },
      { new: true },
    );

    if (!updatedCountry) {
      res.formatResponse('ok', 204, 'Localidad no encontrado.', []);
    }

    res.formatResponse('ok', 200, 'Localidad actualizado con éxito.', updatedCountry);
  } catch (error) {
    await responseError(409, error, res);
  }
};





const deleteCountryById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCountry = await Country.findByIdAndDelete(id);

    if (!deletedCountry) {
      res.formatResponse('ok', 204, 'Localidad no encontrado.', []);
    }

    res.formatResponse('ok', 200, 'Localidad eliminado con éxito.', deletedCountry);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const savePointsAsCountriess = async (req, res) => {
  try {
    const createCountryInternal = async (data, newCodigo) => {
      // Verifica si 'tipoUnidad' no está presente en los datos
      if (!data.tipoUnidad) {
        // Si 'tipoUnidad' no está presente, establece valores para 'tipoUnidad1' y 'tipoUnidad2'
        data.tipoUnidad1 = 'valorPredeterminado1'; // Ajusta estos valores según sea necesario
        data.tipoUnidad2 = 'valorPredeterminado2'; // Ajusta estos valores según sea necesario
      }
    
      // Crea el nuevo país con el nuevo código (y posiblemente 'tipoUnidad1' y 'tipoUnidad2')
      const newCountry = new Country({
        ...data,
        codigo: newCodigo,
      });
    
      // Guarda el nuevo país en la base de datos
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

const savePointsAsCountries = async (req, res) => {
  try {
    const createCountryInternal = async (data, tipoUnidad, newCodigo) => {
      // Ajusta los datos según el tipo de unidad especificado
      const dataWithTipoUnidad = {
        ...data,
        codigo: newCodigo,
        tipoUnidad: tipoUnidad, // Asigna directamente el tipo de unidad al documento
      };

      // Crea el nuevo país con los datos ajustados
      const newCountry = new Country(dataWithTipoUnidad);

      // Guarda el nuevo país en la base de datos
      const savedCountry = await newCountry.save();

      return savedCountry;
    };

    const dataFilePath = path.join(__dirname, '../functions/data.json');
    const rawData = await fs.readFile(dataFilePath, 'utf-8');
    const data = JSON.parse(rawData);

    if (!data || !data.puntos || typeof data.puntos !== 'object') {
      return res.formatResponse('error', 400, 'La estructura de puntos no es válida.', []);
    }

    const savedCountries = [];

    for (const codigo of Object.keys(data.puntos)) {
      const punto = data.puntos[codigo];

      // Suponiendo que el código sea numérico y único para cada par de registros
      let lastCountry = await Country.findOne().sort({ codigo: -1 });
      let newCodigo = lastCountry ? lastCountry.codigo + 1 : 1;

      // Crea y guarda el país con tipoUnidad1
      const savedCountry1 = await createCountryInternal({
        ...punto,
        nombre: punto.nombre,
        fechaCreacion: new Date(),
      }, 'Automoviles', newCodigo);

      savedCountries.push(savedCountry1);

      // Actualiza newCodigo para el siguiente registro
      newCodigo++;

      // Crea y guarda el país con tipoUnidad2
      const savedCountry2 = await createCountryInternal({
        ...punto,
        nombre: punto.nombre,
        fechaCreacion: new Date(),
      }, 'Autobuses', newCodigo);

      savedCountries.push(savedCountry2);


      // Actualiza newCodigo para el siguiente registro
      newCodigo++;

      // Crea y guarda el país con tipoUnidad2
      const savedCountry3 = await createCountryInternal({
        ...punto,
        nombre: punto.nombre,
        fechaCreacion: new Date(),
      }, 'Camiones', newCodigo);

      savedCountries.push(savedCountry3);


      // Actualiza newCodigo para el siguiente registro
      newCodigo++;

      // Crea y guarda el país con tipoUnidad2
      const savedCountry5 = await createCountryInternal({
        ...punto,
        nombre: punto.nombre,
        fechaCreacion: new Date(),
      }, 'Motocicleta', newCodigo);

      savedCountries.push(savedCountry5);


      // Actualiza newCodigo para el siguiente registro
      newCodigo++;

      // Crea y guarda el país con tipoUnidad2
      const savedCountry6 = await createCountryInternal({
        ...punto,
        nombre: punto.nombre,
        fechaCreacion: new Date(),
      }, 'Camión 3 ejes', newCodigo);

      savedCountries.push(savedCountry6);


      // Actualiza newCodigo para el siguiente registro
      newCodigo++;

      // Crea y guarda el país con tipoUnidad2
      const savedCountry7 = await createCountryInternal({
        ...punto,
        nombre: punto.nombre,
        fechaCreacion: new Date(),
      }, 'Camión 4 ejes', newCodigo);

      savedCountries.push(savedCountry7);


      // Actualiza newCodigo para el siguiente registro
      newCodigo++;

      // Crea y guarda el país con tipoUnidad2
      const savedCountry8 = await createCountryInternal({
        ...punto,
        nombre: punto.nombre,
        fechaCreacion: new Date(),
      }, 'Camión 5 ejes', newCodigo);

      savedCountries.push(savedCountry8);


      // Actualiza newCodigo para el siguiente registro
      newCodigo++;

      // Crea y guarda el país con tipoUnidad2
      const savedCountry9 = await createCountryInternal({
        ...punto,
        nombre: punto.nombre,
        fechaCreacion: new Date(),
      }, 'Camión 6 ejes', newCodigo);

      savedCountries.push(savedCountry9);


      // Actualiza newCodigo para el siguiente registro
      newCodigo++;

      // Crea y guarda el país con tipoUnidad2
      const savedCountry10 = await createCountryInternal({
        ...punto,
        nombre: punto.nombre,
        fechaCreacion: new Date(),
      }, 'Camión 7 ejes', newCodigo);

      savedCountries.push(savedCountry10);


      // Actualiza newCodigo para el siguiente registro
      newCodigo++;

      // Crea y guarda el país con tipoUnidad2
      const savedCountry11 = await createCountryInternal({
        ...punto,
        nombre: punto.nombre,
        fechaCreacion: new Date(),
      }, 'Camión 8 ejes', newCodigo);

      savedCountries.push(savedCountry11);


      // Actualiza newCodigo para el siguiente registro
      newCodigo++;

      // Crea y guarda el país con tipoUnidad2
      const savedCountry12 = await createCountryInternal({
        ...punto,
        nombre: punto.nombre,
        fechaCreacion: new Date(),
      }, 'Camión 9 ejes', newCodigo);

      savedCountries.push(savedCountry12);


      // Actualiza newCodigo para el siguiente registro
      newCodigo++;

      // Crea y guarda el país con tipoUnidad2
      const savedCountry13 = await createCountryInternal({
        ...punto,
        nombre: punto.nombre,
        fechaCreacion: new Date(),
      }, 'Otro', newCodigo);

      savedCountries.push(savedCountry13);

      


    }

    res.formatResponse('ok', 200, 'Puntos guardados como localidades con éxito.', savedCountries);
  } catch (error) {
    console.error('Error al guardar puntos como países:', error);
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

const getLocalidadesByEstado = async (req, res) => {
  try {
    const { estado } = req.params;

    const localidadesNombres = await Country.distinct('nombre', { estado: parseInt(estado, 10) });
    
    const localidades = await Country.find({ estado: parseInt(estado, 10), nombre: { $in: localidadesNombres } }, '_id nombre');

    if (localidades.length > 0) {
      res.formatResponse('ok', 200, 'Consulta exitosa', localidades);
    } else {
      res.formatResponse('ok', 204, 'No se encontraron localidades para el estado especificado', []);
    }
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
  updateCountryById,
  getLocalidadesByEstado
};

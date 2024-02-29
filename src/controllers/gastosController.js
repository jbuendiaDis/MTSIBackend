const Gastos = require('../models/gastos');
const GastosModel = require('../models/gastos');
const Peajes = require('../models/peajes');
const responseError = require('../functions/responseError');

const getDestinationName = require('../functions/getDestinationName');
const getDestinationIdEstado = require('../functions/getDestinationIdEstado');
const getStateName = require('../functions/getStateName');


const { exec } = require('child_process');
const path = require('path');


// Función para ejecutar el respaldo de la base de datos
const respaldarDB = (req, res) => {
  const dbNombre = 'MTSI'; // Asegúrate de reemplazarlo con el nombre de tu base de datos
  const salidaDir = path.join(__dirname, '../backups'); // Cambia la ruta según donde quieras guardar tus respaldos

  const fecha = new Date().toISOString().replace(/:/g, '-'); // Formato de fecha para evitar problemas en nombres de archivos
  const respaldoPath = `${salidaDir}/${dbNombre}-${fecha}`;

  const comando = `mongodump --db ${dbNombre} --out ${respaldoPath}`;

  exec(comando, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al realizar el respaldo: ${error}`);
      return res.status(500).send('Error al realizar el respaldo de la base de datos.');
    }
    console.log(`Respaldo realizado con éxito en ${respaldoPath}`);
    res.send(`Respaldo realizado con éxito en ${respaldoPath}`);
  });
};

// Controlador para crear un nuevo registro de gastos
const createGastos = async (req, res) => {
  try {
    const gastosData = req.body;
    const gastos = new Gastos(gastosData);
    await gastos.save();
    res.formatResponse('ok', 200, 'Consulta exitosa', gastos);
  } catch (error) {
    await responseError(409, error, res);
  }
};

// Controlador para obtener todos los registros de gastos
const getGastos = async (req, res) => {
  try {
    const gastos = await Gastos.find();
    res.formatResponse('ok', 200, 'Consulta exitosa', gastos);
  } catch (error) {
    await responseError(409, error, res);
  }
};

// Controlador para obtener un registro de gastos por su ID
const getGastosById = async (req, res) => {
  try {
    // Ahora gasto es un solo documento, no un array
    const gasto = await Gastos.findById(req.params.id);

    if (!gasto) {
      return res.formatResponse('error', 404, 'Gasto no encontrado', {});
    }

    // No necesitas mapear ya que es un solo documento
    const ruta = await Peajes.findById(gasto.rutaId);
    if (!ruta) {
      // Maneja el caso en que la ruta no se encuentre
      console.log('Ruta no encontrada para el gasto con id:', gasto._id);
      // Puedes decidir cómo manejar este caso, por ejemplo, devolver el gasto sin los nombres de origen y destino
      return res.formatResponse('ok', 200, 'Consulta exitosa, pero ruta no encontrada', gasto.toObject());
    }

    const nombreOrigen = await getDestinationName(ruta.localidadOrigen);
    const nombreDestino = await getDestinationName(ruta.localidadDestino);

    const gastosConPeajes = {
      ...gasto.toObject(),
      nombreOrigen: nombreOrigen,
      nombreDestino: nombreDestino
    };

    res.formatResponse('ok', 200, 'Consulta exitosa', gastosConPeajes);
  } catch (error) {
      await responseError(409, error, res);
  }
};


const getGastosConPeajes = async (req, res) => {
  try {
    const gastosList = await GastosModel.find();

    const gastosConPeajes = await Promise.all(gastosList.map(async (gasto) => {
      const ruta = await Peajes.findById(gasto.rutaId);
      const peajes = ruta ? ruta.puntos : [];
      const peajesCostos = peajes.reduce((acc, curr) => acc + curr.costo, 0);

      const nombreOrigen = ruta ? await getDestinationName(ruta.localidadOrigen) : null;
      const nombreDestino = ruta ? await getDestinationName(ruta.localidadDestino) : null;
      const kilometraje = ruta ? ruta.kms : 0; // Accede al kilometraje de la ruta

      return {
        ...gasto.toObject(),
        nombreOrigen: nombreOrigen,
        nombreDestino: nombreDestino,
        peajes: peajes, // La lista de peajes
        peajesCostos: peajesCostos, // La suma de los costos de los peajes
        kms: kilometraje // El kilometraje total de la ruta
      };
    }));

    res.formatResponse('ok', 200, 'Consulta exitosa', gastosConPeajes);
  } catch (error) {
    await responseError(409, error, res);
  }
};







// Controlador para actualizar un registro de gastos por su ID
const updateGastos = async (req, res) => {
  try {
    const gastosData = req.body;
    const gastos = await Gastos.findByIdAndUpdate(req.params.id, gastosData, { new: true });
    if (!gastos) {
      return await responseError(204, 'Registro de gastos no encontrado.', res);
    }
    res.formatResponse('ok', 200, 'Consulta exitosa', gastos);
  } catch (error) {
    await responseError(409, error, res);
  }
};

// Controlador para eliminar un registro de gastos por su ID
const deleteGastos = async (req, res) => {
  try {
    const gastos = await Gastos.findByIdAndRemove(req.params.id);
    if (!gastos) {
      return await responseError(204, 'Registro de gastos no encontrado.', res);
    }
    res.formatResponse('ok', 200, 'Consulta exitosa', gastos);
  } catch (error) {
    await responseError(409, error, res);
  }
};

module.exports = {
  createGastos,
  getGastos,
  getGastosById,
  updateGastos,
  deleteGastos,
  getGastosConPeajes,
  respaldarDB
};

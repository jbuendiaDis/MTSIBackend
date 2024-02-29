const Gastos = require('../models/gastos');
const GastosModel = require('../models/gastos');
const Peajes = require('../models/peajes');
const responseError = require('../functions/responseError');

const getDestinationName = require('../functions/getDestinationName');
const getDestinationIdEstado = require('../functions/getDestinationIdEstado');
const getStateName = require('../functions/getStateName');


const { exec } = require('child_process');
const path = require('path');

require('dotenv').config();
 
const fs = require('fs').promises;
 
// Utiliza la cadena de conexión de tus variables de entorno
const uri = process.env.MONGODB_URI;
// El nombre de la base de datos se extrae de la URI, pero aquí lo definimos explícitamente
const dbName = "MTSI2";

const { MongoClient, ObjectId } = require('mongodb');
 
const dbNameOld = "MTSI";
const directorioDeBackups = path.join(__dirname, '../backups'); // Asegúrate de ajustar esta ruta

const cargarDBDesdeJSON = async (req, res) => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Conectado a MongoDB para cargar datos.');

    const db = client.db(dbName);
    const archivos = await fs.readdir(directorioDeBackups);

    for (const archivo of archivos) {
      const contenido = await fs.readFile(path.join(directorioDeBackups, archivo), 'utf8');
      let datos = JSON.parse(contenido);
      const nombreColeccion = path.basename(archivo, '.json');

      // Convertir _id de string a ObjectId
      datos = datos.map(documento => {
        if (documento._id && typeof documento._id === 'string') {
          documento._id = new ObjectId(documento._id);
        }
        return documento;
      });

      if (datos.length === 0) {
        console.log(`La colección ${nombreColeccion} está vacía o el archivo no contiene un arreglo. Saltando...`);
        continue; // Salta al siguiente archivo si no hay datos para insertar
      }

      await db.collection(nombreColeccion).deleteMany({}); // Elimina los datos existentes
      await db.collection(nombreColeccion).insertMany(datos);
      console.log(`Datos cargados en la colección ${nombreColeccion}`);
    }

    res.send('Datos cargados con éxito desde los archivos JSON.');
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    res.status(500).send('Error al cargar los datos en la base de datos.');
  } finally {
    await client.close();
  }
};

const cargarDBDesdeJSON0 = async (req, res) => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Conectado a MongoDB para cargar datos.');

    const db = client.db(dbNameNew);

    // Lee el directorio de backups para obtener los archivos
    const archivos = await fs.readdir(directorioDeBackups);
    for (const archivo of archivos) {
      const contenido = await fs.readFile(path.join(directorioDeBackups, archivo), 'utf8');
      const datos = JSON.parse(contenido);
      const nombreColeccion = path.basename(archivo, '.json');

      // Opción 1: Insertar datos directamente, reemplazando toda la colección
      await db.collection(nombreColeccion).deleteMany({}); // ¡Cuidado! Esto elimina todos los datos existentes
      await db.collection(nombreColeccion).insertMany(datos);

      // Opción 2: Actualizar documentos existentes o insertar nuevos
      // for (const documento of datos) {
      //   await db.collection(nombreColeccion).updateOne({ _id: documento._id }, { $set: documento }, { upsert: true });
      // }

      console.log(`Datos cargados en la colección ${nombreColeccion}`);
    }

    res.send('Datos cargados con éxito desde los archivos JSON.');
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    res.status(500).send('Error al cargar los datos en la base de datos.');
  } finally {
    await client.close();
  }
};


const respaldarDB = async (req, res) => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Conectado a MongoDB para respaldo.');

    const db = client.db(dbNameOld);
    const collections = await db.listCollections().toArray();
    const salidaDir = path.join(__dirname, '../backups');

    for (const collection of collections) {
      const colName = collection.name;
      const data = await db.collection(colName).find({}).toArray();
      const filePath = path.join(salidaDir, `${colName}.json`);

      // Asegura que el directorio de respaldo existe
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Escribe los datos en el archivo  
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`Respaldo realizado para la colección ${colName}`);
    }

    res.send('Respaldo completado con éxito para todas las colecciones.');
  } catch (error) {
    console.error('Error al realizar el respaldo:', error);
    res.status(500).send('Error al realizar el respaldo de la base de datos.');
  } finally {
    await client.close();
  }
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
  respaldarDB,
  cargarDBDesdeJSON
};

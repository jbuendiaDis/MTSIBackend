const responseError = require('../functions/responseError');

const getDestinationName = require('../functions/getDestinationName');
const getDestinationIdEstado = require('../functions/getDestinationIdEstado');
const getStateName = require('../functions/getStateName');

require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const path = require('path');
const dbNameOld = 'MTSI';
const dbNameNew = 'MTSI02';
const uri = process.env.MONGODB_URI;
const fs = require('fs').promises;

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
      const documents = await db.collection(colName).find({}).toArray();
      const typedData = documents.map((doc) => addTypeInformation(doc));
      const filePath = path.join(salidaDir, `${colName}.json`);

      // Asegura que el directorio de respaldo existe
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Escribe los datos en el archivo
      await fs.writeFile(filePath, JSON.stringify(typedData, null, 2));
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

function addTypeInformation(doc) {
  const typedDoc = {};
  for (const key in doc) {
    const value = doc[key];
    typedDoc[key] = { value, type: getType(value) };
  }
  return typedDoc;
}

function getType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

const cargarRespaldoADB = async (req, res) => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const respaldoDir = path.join(__dirname, '../backups');

  try {
    await client.connect();
    console.log('Conectado a MongoDB para cargar respaldo.');

    const db = client.db(dbNameNew);
    const archivosRespaldos = await fs.readdir(respaldoDir);

    for (const archivo of archivosRespaldos) {
      const colName = path.basename(archivo, '.json');
      const filePath = path.join(respaldoDir, archivo);
      const contenido = await fs.readFile(filePath, 'utf8');
      const documentos = JSON.parse(contenido);
      const datosOriginales = documentos.map((doc) => convertirATipoOriginal(doc));

      // Verifica si hay documentos a insertar antes de realizar la operación
      if (datosOriginales.length > 0) {
        await db.collection(colName).insertMany(datosOriginales);
        console.log(`Cargado respaldo en la colección ${colName}`);
      } else {
        console.log(`No se encontraron documentos para insertar en la colección ${colName}. Se omite esta colección.`);
      }
    }

    res.send('Cargado respaldo con éxito para todas las colecciones.');
  } catch (error) {
    console.error('Error al cargar el respaldo:', error);
    res.status(500).send('Error al cargar el respaldo a la base de datos.');
  } finally {
    await client.close();
  }
};

function convertirATipoOriginal(doc) {
  const docOriginal = {};
  for (const key in doc) {
    const { value, type } = doc[key];
    // Ajuste específico para manejar ObjectId y evitar conversión incorrecta a fechas
    if (type === 'object' && ObjectId.isValid(value)) {
      docOriginal[key] = new ObjectId(value);
    } else if (type === 'object' && key === '_id' && !ObjectId.isValid(value)) {
      // Maneja el caso donde _id no es un ObjectId válido, manteniéndolo como está
      docOriginal[key] = value;
    } else if (type === 'object') {
      // Intenta convertir a fecha, si aplica
      const date = new Date(value);
      docOriginal[key] = isNaN(date.getTime()) ? value : date;
    } else if (type === 'string') {
      docOriginal[key] = value;
    } else if (type === 'number') {
      docOriginal[key] = Number(value);
    } else if (type === 'array') {
      docOriginal[key] = value.map((item) => convertirATipoOriginal(item));
    } else {
      // Para otros tipos, asigna el valor directamente
      docOriginal[key] = value;
    }
  }
  return docOriginal;
}

module.exports = {
  respaldarDB,
  cargarRespaldoADB,
};

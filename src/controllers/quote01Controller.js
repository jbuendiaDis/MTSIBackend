const Quote = require('../models/quotes');
const responseError = require('../functions/responseError');

/* const createQuote01Old = async (req, res) => {
  try {
    const {
      origenId, destinoId, tipoUnidad, tipoTraslado, tipoViaje,
    } = req.body;

    // Validar campos
    if (!tipoUnidad || !tipoTraslado || !tipoViaje || !origenId || !destinoId) {
      res.formatResponse('ok', 204, 'Campos origen,destino,
       tipoUnidad, tipoTraslado y tipoViaje son obligatorios.', []);
      return;
    }

    const quote = new Quote({
      origenId,
      destinoId,
      tipoUnidad,
      tipoTraslado,
      tipoViaje,
    });

    const resultado = await quote.save();

    res.formatResponse('ok', 200, 'Quote registrado con éxito.', resultado);
  } catch (error) {
    await responseError(409, error, res);
  }
}; */

const createQuote01 = async (req, res) => {
  try {
    console.log('req.body->', req.body);
    const { destinos } = req.body;

    // Validar la existencia de destinos
    if (!destinos || !Array.isArray(destinos) || destinos.length === 0) {
      res.formatResponse('ok', 204, 'El campo "destinos" es obligatorio y debe ser un array no vacío.', []);
      return;
    }

    const quotes = await Promise.all(destinos.map(async (destino) => {
      const {
        origenId, destinoId, tipoUnidad, tipoTraslado, tipoViaje,
      } = destino;

      // Validar campos
      if (!tipoUnidad || !tipoTraslado || !tipoViaje || !origenId || !destinoId) {
        return res.formatResponse('ok', 204, 'Los campos "origenId", "destinoId", "tipoUnidad", "tipoTraslado" y "tipoViaje" son obligatorios.', []);
      }

      const quote = new Quote({
        origenId,
        destinoId,
        tipoUnidad,
        tipoTraslado,
        tipoViaje,
      });

      return quote.save();
    }));

    res.formatResponse('ok', 200, 'Quotes registrados con éxito.', quotes);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const getQuotes01 = async (req, res) => {
  try {
    const quotes = await Quote.find().select('origenId destinoId tipoUnidad tipoTraslado tipoViaje _id');
    if (quotes.length > 0) {
      res.formatResponse('ok', 200, 'Consulta exitosa', quotes);
    } else {
      res.formatResponse('ok', 204, 'No se encontraron datos', []);
    }
  } catch (error) {
    await responseError(409, error, res);
  }
};

const getQuote01ById = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);

    // Verificar si el registro ha sido modificado (tiene fecha de actualización)
    if (!quote.fechaActualizacion) {
      // TODO: Asignar valores consultados en cada elemento si el registro es nuevo
      quote.origen = 'Ejemplo Origen';
      quote.destino = 'Ejemplo Destino';
      quote.kms = 1000;
      quote.rend = 100;
      quote.lts = 10000;
      quote.tipoUnidad = 222;
      quote.tipoTraslado = 333;
      quote.tipoViaje = 444;
    }

    res.formatResponse('ok', 200, 'Consulta exitosa', quote);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const updateQuote01 = async (req, res) => {
  try {
    // Realiza lo necesario para llenar los campos manualmente según tu especificación
    const quoteActualizado = await Quote.findByIdAndUpdate(
      req.params.id,
      req.body,
      {

        fechaActualizacion: new Date(),
      },
      { new: true },
    );

    if (!quoteActualizado) {
      res.formatResponse('ok', 204, 'Quote no encontrado.', []);
      return;
    }

    res.formatResponse('ok', 200, 'Quote actualizado con éxito.', quoteActualizado);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const deleteQuote01 = async (req, res) => {
  try {
    const quote = await Quote.findByIdAndRemove(req.params.id);
    if (!quote) {
      res.formatResponse('ok', 204, 'Quote no encontrado.', []);
    }
    res.formatResponse('ok', 200, 'Quote eliminado con éxito', [{ deleteID: req.params.id }]);
  } catch (error) {
    await responseError(409, error, res);
  }
};

module.exports = {
  createQuote01,
  getQuotes01,
  getQuote01ById,
  updateQuote01,
  deleteQuote01,
};

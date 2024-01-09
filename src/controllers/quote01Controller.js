const mongoose = require('mongoose');
const Quote = require('../models/quotes');
const responseError = require('../functions/responseError');
const getClientNameById = require('../functions/getClientNameById');  
const getUserNameById = require('../functions/getUserNameById'); 

 

const createQuote011 = async (req, res) => {
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


const createQuote01 = async (req, res) => {
  try {
    const { destinos } = req.body;

    // Validar la existencia de destinos
    if (!destinos || !Array.isArray(destinos) || destinos.length === 0) {
      res.formatResponse('ok', 204, 'El campo "destinos" es obligatorio y debe ser un array no vacío.', []);
      return;
    }

    const quotes = await Promise.all(destinos.map(async (destino) => {
      const { origenId, destinoId, tipoUnidad, tipoTraslado, tipoViaje, estatus } = destino;

      // Obtener el último folio registrado
      const lastQuote = await Quote.findOne().sort({ folio: -1 });

      // Calcular el nuevo folio
      const newFolio = lastQuote && !isNaN(lastQuote.folio) ? lastQuote.folio + 1 : 1;

      // Crear la instancia de Quote con userId
      const quote = new Quote({
        origenId,
        destinoId,
        tipoUnidad,
        tipoTraslado,
        tipoViaje,
        estatus,
        folio: newFolio,
        userId: req.user.data.id, // Agregado el campo userId
      });

      // Guardar el nuevo registro
      return quote.save();
    }));

    res.formatResponse('ok', 200, 'Quotes registrados con éxito.', quotes);

  } catch (error) {
    await responseError(409, error, res);
  }
};


const getQuotes01 = async (req, res) => {
  try {
    const quotes = await Quote.find().select('folio           _id estatus fechaCreacion userId');

    if (quotes.length > 0) {
      const quotesWithClientName = await Promise.all(
        quotes.map(async (quote) => {
          const clientName = await getClientNameById(quote.userId);

          if (!clientName) {
            // Si el nombre del cliente no existe, buscar el nombre del usuario
            const userName = await getUserNameById(quote.userId);
            return {
              ...quote.toObject(),
              clientName: userName,
            };
          }

          return {
            ...quote.toObject(),
            clientName,
          };
        })
      );

      res.formatResponse('ok', 200, 'Consulta exitosa', quotesWithClientName);
    } else {
      res.formatResponse('ok', 204, 'No se encontraron datos', []);
    }
  } catch (error) {
    await responseError(409, error, res);
  }
};


const getQuotesByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;

    const quotes = await Quote.find({ userId: clientId }).select('folio origenId destinoId tipoUnidad tipoTraslado tipoViaje _id estatus fechaCreacion userId');

    if (quotes.length > 0) {
      const quotesWithClientName = await Promise.all(
        quotes.map(async (quote) => {
          const clientName = await getClientNameById(quote.userId);

          if (!clientName) {
            // Si el nombre del cliente no existe, buscar el nombre del usuario
            const userName = await getUserNameById(quote.userId);
            return {
              ...quote.toObject(),
              clientName: userName,
            };
          }

          return {
            ...quote.toObject(),
            clientName,
          };
        })
      );

      res.formatResponse('ok', 200, 'Consulta exitosa', quotesWithClientName);
    } else {
      res.formatResponse('ok', 204, 'No se encontraron cotizaciones para el cliente especificado', []);
    }
  } catch (error) {
    await responseError(409, error, res);
  }
};

 
const getQuote01ById = async (req, res) => {
  try {
    const quotes = await Quote.find({ folio: req.params.folio });

    if (!quotes || quotes.length === 0) {
      res.formatResponse('ok', 204, 'No se encontraron cotizaciones para el folio especificado', []);
      return;
    }

    // Puedes mantener la lógica de configurar los valores predeterminados para cada cotización si lo deseas
    for (const quote of quotes) {
      if (!quote.fechaActualizacion) {
        quote.origen = 'Ejemplo Origen';
        quote.destino = 'Ejemplo Destino';
        quote.kms = 1000;
        quote.rend = 100;
        quote.lts = 10000;
        quote.tipoUnidad = 222;
        quote.tipoTraslado = 333;
        quote.tipoViaje = 444;

        quote.hoteles=32; //    km/800 por (costo de tabla de gastos)

        quote.totalLitros=32;
        quote.precioDiesel=32;
        quote.costoComidas=32;
        quote.costoPasajes=32;
        quote.costoPeajes=32;
        quote.costoSueldo=32;
        quote.subtotal=32;
        quote.gastosAdministrativos=32;
        quote.total=32;
        quote.costoInflacion=32;
        quote.financiamiento=32;
        quote.ganancia=32;
        quote.costoTotal=32;
      }
    }

    res.formatResponse('ok', 200, 'Consulta exitosa', quotes);
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


const cancelQuote = async (req, res) => {
  try {
    const { folio } = req.params;

    // Buscar todas las cotizaciones con el folio proporcionado
    const quotes = await Quote.find({ folio });

    // Verificar si se encontraron cotizaciones
    if (!quotes || quotes.length === 0) {
      res.formatResponse('fail', 404, 'No se encontraron cotizaciones con el folio proporcionado.', []);
      return;
    }

    // Actualizar el estatus de todas las cotizaciones encontradas a 'Cancelada'
    await Quote.updateMany({ folio }, { estatus: 'Cancelada' });

    res.formatResponse('ok', 200, `Cotizaciones con folio ${folio} canceladas con éxito.`, []);
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
  cancelQuote,
  getQuotesByClientId,
   
};

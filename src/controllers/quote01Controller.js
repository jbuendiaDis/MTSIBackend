const mongoose = require('mongoose');
const Quote = require('../models/quotes');
const Peajes = require('../models/peajes');
const CountryModel = require('../models/country');
const RendimientoModel = require('../models/rednimiento');
const configureDataModel = require('../models/configureData');
const GastosModel = require('../models/gastos');
const BanderaModel = require('../models/bandera');
const TrasladoModel = require('../models/trasladoModel');
const GananciaModel = require('../models/ganancias');
const UserClientModel = require('../models/userClient');

const responseError = require('../functions/responseError');
const getClientNameById = require('../functions/getClientNameById');  
const getUserNameById = require('../functions/getUserNameById'); 
const getDestinationName = require('../functions/getDestinationName');

 

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


const createQuote01_old = async (req, res) => {
  try {
    const { destinos } = req.body;

    // Validar la existencia de destinos
    if (!destinos || !Array.isArray(destinos) || destinos.length === 0) {
      res.formatResponse('ok', 204, 'El campo "destinos" es obligatorio y debe ser un array no vacío.', []);
      return;
    }

    // Buscar el cliente asociado al userId
    const userClient = await UserClientModel.findOne({ _id: req.user.data.id });
    if (!userClient) {
      return res.formatResponse('ok', 204, 'Cliente no encontrado para el usuario proporcionado.', []);
    }

    const quotes = await Promise.all(destinos.map(async (destino) => {
      const { localidadOrigenId, localidadDestinoId, tipoUnidad, tipoTraslado, tipoViaje, estatus } = destino;

      // Obtener el último folio registrado
      const lastQuote = await Quote.findOne().sort({ folio: -1 });

      // Calcular el nuevo folio
      const newFolio = lastQuote && !isNaN(lastQuote.folio) ? lastQuote.folio + 1 : 1;

      // Crear la instancia de Quote con userId
      const quote = new Quote({
        localidadOrigenId,
        localidadDestinoId,
        tipoUnidad,
        tipoTraslado,
        tipoViaje,
        estatus,
        folio: newFolio,
        userId: req.user.data.id, // Agregado el campo userId
        clienteId:userClient.idCliente.toString()
      });

      // Guardar el nuevo registro
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
    if (!destinos || !Array.isArray(destinos) || destinos.length === 0) {
      return res.formatResponse('ok', 204, 'El campo "destinos" es obligatorio y debe ser un array no vacío.', []);
    }

    // Buscar el cliente asociado al userId
    const userClient = await UserClientModel.findOne({ _id: req.user.data.id });
    if (!userClient) {
      return res.formatResponse('ok', 204, 'Cliente no encontrado para el usuario proporcionado.', []);
    }

    const quotes = await Promise.all(destinos.map(async (destino) => {
      const { localidadOrigenId, localidadDestinoId, tipoUnidad, tipoTraslado, tipoViaje, estatus,manual, dimensiones } = destino;

      const localidadOrigen = await CountryModel.findById(localidadOrigenId);
      const localidadDestino = await CountryModel.findById(localidadDestinoId);

      if (!localidadOrigen || !localidadDestino) {
        return res.formatResponse('ok', 204, 'Información de localidad no encontrada para origen o destino.', []);
      }

      let existeRuta = false;

      const rutaExiste = await Peajes.findOne({
        localidadOrigen: localidadOrigen.codigo,
        localidadDestino: localidadDestino.codigo
      });

      if (rutaExiste) {
        existeRuta = true;
      }

      const lastQuote = await Quote.findOne().sort({ folio: -1 });
      const newFolio = lastQuote && !isNaN(lastQuote.folio) ? lastQuote.folio + 1 : 1;

      const quote = new Quote({
        origenId: localidadOrigen.codigo,
        destinoId: localidadDestino.codigo,
        tipoUnidad,
        tipoTraslado,
        tipoViaje,
        estatus,
        folio: newFolio,
        userId: req.user.data.id,
        clienteId: userClient.idCliente.toString(),
        manual, 
        dimensiones,
        existeRuta:existeRuta
      });

      return quote.save();
    }));

    res.formatResponse('ok', 200, 'Quotes registrados con éxito.', quotes);
  } catch (error) {
    console.error(error);
    res.formatResponse('error', 409, error.message, []);
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

    const quotes = await Quote.find({ clienteId: clientId }).select('folio origenId destinoId tipoUnidad tipoTraslado tipoViaje _id estatus fechaCreacion userId');

    if (quotes.length > 0) {
      const quotesWithDetails = await Promise.all(quotes.map(async (quote) => {
        // Buscar por código para obtener el nombre de la localidad de origen
        const origen = await CountryModel.findOne({ codigo: quote.origenId });
        const destino = await CountryModel.findOne({ codigo: quote.destinoId });

        // Intentar obtener el nombre del cliente o usuario
        const clientName = await getClientNameById(quote.userId) || await getUserNameById(quote.userId);

        return {
          ...quote.toObject(),
          clientName,
          nombreOrigen: origen ? origen.nombre : 'Origen no encontrado',
          nombreDestino: destino ? destino.nombre : 'Destino no encontrado',
        };
      }));

      res.formatResponse('ok', 200, 'Consulta exitosa', quotesWithDetails);
    } else {
      res.formatResponse('ok', 204, 'No se encontraron cotizaciones para el cliente especificado', []);
    }
  } catch (error) {
    console.error(error);
    await responseError(409, error, res);
  }
};


const getQuote01ById = async (req, res) => {
  try {
    const quotes = await Quote.find({ folio: req.params.folio });
    //console.log("quotes:", quotes);

    if (!quotes || quotes.length === 0) {
      res.formatResponse('ok', 204, 'No se encontraron cotizaciones para el folio especificado', []);
      return;
    }




    //cambiar

    const quotesWithKms = await Promise.all(quotes.map(async (quote) => {
      // Buscar el documento de Peajes que coincide con origenId y destinoId
      const peaje = await Peajes.findOne({
        localidadOrigen: quote.origenId.toString(),
        localidadDestino: quote.destinoId.toString(),
      });

      // Buscar la localidad de origen y destino en la colección countries
      const origen = await CountryModel.findOne({ codigo: quote.origenId, tipoUnidad: peaje ? peaje.tipoUnidad : null });
      const destino = await CountryModel.findOne({ codigo: quote.destinoId, tipoUnidad: peaje ? peaje.tipoUnidad : null });

      // Realizar la consulta para obtener el rendimiento basado en el tipoUnidad
      const rendimiento = await RendimientoModel.findById(quote.tipoUnidad);

      // Buscar el único registro activo
      const configureData = await configureDataModel.findOne({ status: 'Activo' });

      // Buscar gastos
      const gastos = await GastosModel.findOne({
        localidadOrigen: quote.origenId.toString(),
        localidadDestino: quote.destinoId.toString(),
      });
      //console.log("gastos:", gastos);


      const banderaPasajeOrigen = await BanderaModel.findOne({ nombre: "pasajeOrigen" });
      const banderaPasajeDestino = await BanderaModel.findOne({ nombre: "pasajeDestino" });

      const traslado = await TrasladoModel.findById(quote.tipoTraslado);

      const banderaLimiteSueldos = await BanderaModel.findOne({ nombre: "limite sueldos" });
      const limiteSueldos = banderaLimiteSueldos ? banderaLimiteSueldos.valor : 5;  // Usar 5 como valor predeterminado si no se encuentra

      const banderaPorcentajeAdmon = await BanderaModel.findOne({ nombre: "PorcentajeAdmon" });
      const porcentajeAdmon = banderaPorcentajeAdmon ? banderaPorcentajeAdmon.valor : 8;  // Usar 8 como valor predeterminado si no se encuentra




      let v_valorExtraPasajeOrigen = banderaPasajeOrigen ? banderaPasajeOrigen.valor : 0;
      let v_valorExtraPasajeDestino = banderaPasajeDestino ? banderaPasajeDestino.valor : 0;

      let porcentajeFinanciamiento = configureData ? configureData.financiamiento : 0;
      

      let v_otrosGastos = configureData ? configureData.otros : 0;


      // Añadir nombres de las localidades y otros valores a la cotización
      let nombreOrigen = origen ? origen.nombre : 'Origen no encontrado';
      let nombreDestino = destino ? destino.nombre : 'Destino no encontrado';
      let v_kms = peaje ? peaje.kms : 0;
      let v_rend = rendimiento ? rendimiento.rendimiento : 0;
      let v_totalLitros = v_kms / v_rend;
      let v_costoDiesel = configureData ? configureData.combustible : 0;
      let v_diesel = v_costoDiesel * v_totalLitros;
      let v_comidas = gastos && gastos.comidas ? gastos.comidas : 0;
      let v_costoPasajeOrigen = (gastos && gastos.pasajeOrigen ? gastos.pasajeOrigen : 0) + v_valorExtraPasajeOrigen;
      let v_costoPasajeDestino = (gastos && gastos.pasajeDestino ? gastos.pasajeDestino : 0) + v_valorExtraPasajeDestino;
      let v_totalPeajes = peaje ? peaje.totalPeajes : 0;
      let v_seguroTraslado = gastos && gastos.seguroTraslado ? gastos.seguroTraslado : 0;
      let v_sueldo = traslado ? (traslado.sueldo < limiteSueldos ? traslado.sueldo * v_kms : traslado.sueldo) : 0;

      let v_pagoEstadia = gastos && gastos.pagoDeEstadia ? gastos.pagoDeEstadia : 0;
      let v_subtotal = v_diesel + 
                 v_comidas + 
                 v_costoPasajeOrigen + 
                 v_costoPasajeDestino + 
                 v_totalPeajes +   
                 v_seguroTraslado + 
                 v_sueldo + 
                 v_pagoEstadia;

      let v_admon = (v_subtotal * porcentajeAdmon) / 100;

      let v_total = v_subtotal + v_admon + v_otrosGastos;
      let v_financiamiento = (v_total * porcentajeFinanciamiento) / 100;

      let porcentajeInflacion  = configureData ? configureData.inflacion : 0;

      let v_inflacion = v_total * (porcentajeInflacion / 100);


      const gananciaEntry = await GananciaModel.findOne({ 
        desde: { $lte: v_kms },
        hasta: { $gte: v_kms }
      });
      
      let v_ganancia = gananciaEntry ? gananciaEntry.ganancia : 0;

      let v_costoTotal = v_total + v_financiamiento + v_inflacion + v_ganancia;



      return {
        id: quote._id,
        folio: quote.folio,
        origen: nombreOrigen,
        destino: nombreDestino,
        kms: parseFloat(v_kms.toFixed(2)),
        rendimiento: parseFloat(v_rend.toFixed(2)),
        litros: parseFloat(v_totalLitros.toFixed(2)),
        diesel: parseFloat(v_diesel.toFixed(2)),
        comidas: parseFloat(v_comidas.toFixed(2)),
        pasajeOrigen: parseFloat(v_costoPasajeOrigen.toFixed(2)),
        pasajeDestino: parseFloat(v_costoPasajeDestino.toFixed(2)),
        peajesViapass: parseFloat(v_totalPeajes.toFixed(2)),
        seguroTraslado: parseFloat(v_seguroTraslado.toFixed(2)),
        sueldo: parseFloat(v_sueldo.toFixed(2)),
        pagoEstadia: parseFloat(v_pagoEstadia.toFixed(2)),
        subTotal: parseFloat(v_subtotal.toFixed(2)),
        admon: parseFloat(v_admon.toFixed(2)),
        total: parseFloat(v_total.toFixed(2)),
        inflacion: parseFloat(v_inflacion.toFixed(2)),
        financiamiento: parseFloat(v_financiamiento.toFixed(2)),
        ganancia: parseFloat(v_ganancia.toFixed(2)),
        costo : parseFloat(v_costoTotal.toFixed(2))
     
      };
      
    }));

    res.formatResponse('ok', 200, 'Consulta exitosa', quotesWithKms);
  } catch (error) {
    await responseError(409, error, res);
  }
};


 
const getQuote01ByIdOld = async (req, res) => {
  
    let v_lts=0;
    let v_kms=0;
    let v_rend=0;

  try {
    const quotes = await Quote.find({ folio: req.params.folio });
    

    if (!quotes || quotes.length === 0) {
      res.formatResponse('ok', 204, 'No se encontraron cotizaciones para el folio especificado', []);
      return;
    }

    // Puedes mantener la lógica de configurar los valores predeterminados para cada cotización si lo deseas
    for (const quote of quotes) {
      if (!quote.fechaActualizacion) {
        quote.origen = await getDestinationName(quote.origenId);
        quote.destino = await getDestinationName(quote.destinoId);

        v_kms=1;
        quote.kms = v_kms;
        
        v_rend=1;
        quote.rend = v_rend;

        v_lts=v_kms/v_rend;
        quote.lts = v_lts;
        
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

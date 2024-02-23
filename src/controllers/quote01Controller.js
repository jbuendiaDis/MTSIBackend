const jwt = require('jsonwebtoken');
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
const CotizacionHistorialModel = require('../models/cotizacionHistorialModel');
const SolicitudModel = require('../models/solicitud');
const ClienteModel = require('../models/clients');
const SolicitudDetalleModel = require('../models/solicitudDetalle');

const responseError = require('../functions/responseError');
const getClientNameById = require('../functions/getClientNameById');
const getUserNameById = require('../functions/getUserNameById');
const getDestinationName = require('../functions/getDestinationName');
const CatalogModel = require('../models/catalog');
const UserClient = require('../models/userClient');
const QuoteHistory = require('../models/cotizacionHistorialModel');
const enviarCorreo = require('../functions/sendMail');

const createSolicitud = async (req, res) => {
  try {
    const { destinos } = req.body;
    if (!destinos || !Array.isArray(destinos) || destinos.length === 0) {
      return res.formatResponse('ok', 204, 'El campo "destinos" es obligatorio y debe ser un array no vacío.', []);
    }

    // Verificar que todos los destinos tienen el mismo tipoViaje
    const primerTipoViaje = destinos[0].tipoViaje;
    const tiposViajeSonIguales = destinos.every((destino) => destino.tipoViaje === primerTipoViaje);

    if (!tiposViajeSonIguales) {
      return res.formatResponse('ok', 204, 'Todos los destinos deben tener el mismo tipo de viaje.', []);
    }
    // Buscar la descripción del tipo de viaje usando primerTipoViajeId
    const tipoViaje = await CatalogModel.findById(primerTipoViaje);
    if (!tipoViaje) {
      return res.formatResponse('ok', 204, 'Tipo de viaje no encontrado.', []);
    }

    // Buscar el cliente asociado al userId
    const userClient = await UserClientModel.findOne({ _id: req.user.data.id });
    if (!userClient) {
      return res.formatResponse('ok', 204, 'Cliente no encontrado para el usuario proporcionado.', []);
    }

    // Obtener el nombre del cliente (razón social) usando el clienteId
    const cliente = await ClienteModel.findById(userClient.idCliente); // Asumiendo que idCliente es el _id en la colección de clientes
    if (!cliente) {
      return res.formatResponse('ok', 204, 'Cliente no encontrado.', []);
    }

    const lastSolicitud = await SolicitudModel.findOne().sort({ folio: -1 });
    const newFolio = lastSolicitud && !isNaN(lastSolicitud.folio) ? lastSolicitud.folio + 1 : 1;

    // Crear una nueva solicitud
    const nuevaSolicitud = await new SolicitudModel({
      folio: newFolio,
      estatus: 'Pendiente', // Asegúrate de definir 'estatus' adecuadamente si es dinámico
      userId: req.user.data.id,
      clienteId: userClient.idCliente.toString(),
      clienteName: cliente.razonSocial,
      tipoViajeId: tipoViaje._id,
      tipoViajeName: tipoViaje.descripcion,

    }).save();

    // Iterar sobre 'destinos' para crear detalles de la solicitud-------------------------------------------------------------------------------------------------------------
    const detallesPromesas = destinos.map(async (destino) => {
      // Realizar la consulta para obtener el dato catalogos basado en el tipoViaje
      let v_tipoViaje = null;
      const tipoViaje = await CatalogModel.findById(destino.tipoViaje);
      v_tipoViaje = tipoViaje.descripcion;

      // Consulta tipo traslado
      const traslado = await TrasladoModel.findById(destino.tipoTraslado);

      let rendimiento;
      // Realizar la consulta para obtener el dato rendimiento basado en el tipoUnidad
      if(destino.tipoUnidad!='other'){
          rendimiento = await RendimientoModel.findById(destino.tipoUnidad);

      }
      

      // Buscar la localidad de origen y destino en la colección countries
      const origenData = await CountryModel.findById(destino.localidadOrigenId);
      // console.log("origenData:",origenData);
      const destinoData = await CountryModel.findById(destino.localidadDestinoId);
      // console.log("destinoData:",destinoData);

      const peaje = await Peajes.findOne({ localidadOrigen: origenData.codigo, localidadDestino: destinoData.codigo });

      // console.log("peaje:",peaje);

      return new SolicitudDetalleModel({
        solicitudId: nuevaSolicitud._id,
        folio: nuevaSolicitud.folio,
        localidadOrigenId: destino.localidadOrigenId,
        localidadOrigenName: origenData.nombre,
        localidadOrigenCodigo: origenData.codigo,
        localidadOrigenTipoCobro: origenData.tipoUnidad,

        localidadDestinoId: destino.localidadDestinoId,
        localidadDestinoName: destinoData.nombre,
        localidadDestinoCodigo: destinoData.codigo,
        localidadDestinoTipoCobro: destinoData.tipoUnidad,

        unidadId: destino.tipoUnidad,
        unidadMarca: rendimiento ? rendimiento.marca : undefined,
        unidadModelo: rendimiento ? rendimiento.modelo : undefined,
        trasladoId: destino.tipoTraslado,
        trasladoTipo: traslado.tipoTraslado,
        trasladoConcepto: traslado.concepto,
        tipoViajeId: destino.tipoViaje,
        tipoViajeName: v_tipoViaje,
        manual: destino.manual,
        dimensiones: destino.dimensiones,
      }).save();
    });

    const detalles = await Promise.all(detallesPromesas);

    res.formatResponse('ok', 200, 'Solicitud y detalles registrados con éxito.', { solicitud: nuevaSolicitud, detalles });
  } catch (error) {
    console.error(error);
    res.formatResponse('error', 409, error.message, []);
  }
};

const getCotizacionByFolio = async (req, res) => {
  try {
    const folio = parseInt(req.params.folio, 10);
    const solicitud = await SolicitudModel.findOne({ folio });
    let solicitudDetalle = await SolicitudDetalleModel.find({ folio });

    // Verifica si la solicitud no se encontró
    if (!solicitud) {
      return res.formatResponse('ok', 204, 'No se encontraron cotizaciones para el folio especificado', []);
    }

    // Verifica si el array de cotizaciones está vacío
    if (solicitudDetalle.length === 0) {
      res.formatResponse('ok', 204, 'No se encontraron cotizaciones para el folio especificado', []);
      return;
    }

    // Buscar la descripción del tipo de viaje usando tipoViajeId de la solicitud
    const tipoViaje = await CatalogModel.findById(solicitud.tipoViajeId);
    if (!tipoViaje) {
      return res.formatResponse('ok', 204, 'Tipo de viaje no encontrado.', []);
    }

    let v_tipoViaje = 0;

    switch (tipoViaje._id.toString()) {
    case '657d410b090a350a86310db8': // Rodando
      v_tipoViaje = 1;
      break;
    case '657d411f090a350a86310dc0': // Sin rodar
      v_tipoViaje = 2;

      // TODO:CAmbiar por algo dinamico o catalogo
      const idUbicacionC = '6582738f73bd91d97dbd8f28';
      const idUbicacionCName = 'Santiago Tianguistenco';
      const idUbicacionCcodigo = 1428;

      // Crear nuevo detalle de viaje de C a A (el primer destino original)
      const viajeDeCA = {
        ...solicitudDetalle[0].toObject(), // Clonar el primer objeto y ajustar para viaje de C a A
        localidadOrigenId: idUbicacionC,
        localidadOrigenName: idUbicacionCName,
        localidadOrigenCodigo: idUbicacionCcodigo,

        localidadDestinoId: solicitudDetalle[0].localidadOrigenId,
        localidadDestinoName: solicitudDetalle[0].localidadOrigenName,
        localidadDestinoCodigo: solicitudDetalle[0].localidadOrigenCodigo,

      };

      // Crear nuevo detalle de viaje de B a C (el último destino original)
      const viajeDeBC = {
        ...solicitudDetalle[solicitudDetalle.length - 1].toObject(), // Clonar el último objeto y ajustar para viaje de B a C
        localidadOrigenId: solicitudDetalle[solicitudDetalle.length - 1].localidadDestinoId,
        localidadOrigenName: solicitudDetalle[solicitudDetalle.length - 1].localidadDestinoName,
        localidadOrigenCodigo: solicitudDetalle[solicitudDetalle.length - 1].localidadDestinoCodigo,

        localidadDestinoId: idUbicacionC,
        localidadDestinoName: idUbicacionCName,
        localidadDestinoCodigo: idUbicacionCcodigo,
      };

      // Insertar los nuevos detalles al inicio y al final del array de detalles
      solicitudDetalle = [viajeDeCA, ...solicitudDetalle, viajeDeBC];
      break;
    case '657d4127090a350a86310dc4': // Local
      v_tipoViaje = 3;
      break;
    default:
      return res.formatResponse('ok', 204, 'Tipo de viaje no válido.', []);
    }

    const rutasFaltantes = [];

    for (const detalle of solicitudDetalle) {
      console.log('detalle.localidadOrigenCodigo.toString():', detalle.localidadOrigenCodigo.toString());
      console.log('detalle.localidadDestinoCodigo.toString():', detalle.localidadDestinoCodigo.toString());
      const peaje = await Peajes.findOne({
        localidadOrigen: detalle.localidadOrigenCodigo.toString(),
        localidadDestino: detalle.localidadDestinoCodigo.toString(),
      });

      if (!peaje) {
        // Agregar al array los códigos de origen y destino que no tienen peaje
        rutasFaltantes.push(`de ${detalle.localidadOrigenName} a ${detalle.localidadDestinoName}`);
      }
    }

    if (rutasFaltantes.length > 0) {
      // Si hay rutas faltantes, regresa un error 204 con los detalles de las rutas faltantes
      return res.formatResponse('ok', 204, `No se encontraron rutas para los siguientes trayectos: ${rutasFaltantes.join(', ')}`, []);
    }

    // Continuar con el procesamiento si todas las rutas existen...

    const configureData = await configureDataModel.findOne({ status: 'Activo' });

    // Variable para llevar el control de si es la primera iteración
    let primeraIteracion = true;

    const response = await Promise.all(solicitudDetalle.map(async (detalle) => {
      // console.log("detalle:",detalle);

      let v_kms = 0;
      let v_rend = 0;
      let v_totalLitros = 0;
      let v_diesel = 0;
      let v_comidas = 0;
      let v_costoPasajeOrigen = 0;
      let v_costoPasajeDestino = 0;
      let v_totalPeajes = 0;
      let v_seguroTraslado = 0;

      // let v_pagoEstadia=0;
      let v_ferry = 0;
      let v_hotel = 0;
      let v_vuelo = 0;
      let v_taxi = 0;
      let v_udsUsa = 0;
      let v_liberacionPuerto = 0;
      let v_talachas = 0;
      let v_fitosanitarias = 0;
      let v_urea = 0;
      let v_extra = 0;

      let v_sueldo = 0;
      let v_pagoEstadia = 0;
      let v_subtotal = 0;
      let v_admon = 0;
      let v_total = 0;
      let v_inflacion = 0;
      let v_financiamiento = 0;
      let v_ganancia = 0;
      let v_costoTotal = 0;

      // Buscar el documento de Peajes(rutas) que coincide con origenId y destinoId
      const peaje = await Peajes.findOne({
        localidadOrigen: detalle.localidadOrigenCodigo.toString(),
        localidadDestino: detalle.localidadDestinoCodigo.toString(),
      });
      const rendimiento = await RendimientoModel.findById(detalle.unidadId);


      const rutas = await Peajes.findOne({
        localidadOrigen: detalle.localidadOrigenCodigo.toString(),
        localidadDestino: detalle.localidadDestinoCodigo.toString(),
      });

      //console.log("rutas",rutas._id);

      const gastos = await GastosModel.findOne({
        rutaId: rutas._id
      });


      //console.log("localidadOrigenCodigo",detalle.localidadOrigenCodigo.toString());
      //console.log("localidadDestinoCodigo",detalle.localidadDestinoCodigo.toString());

      console.log("gastos",gastos);


      const banderaPasajeOrigen = await BanderaModel.findOne({ nombre: 'pasajeOrigen' });
      const banderaPasajeDestino = await BanderaModel.findOne({ nombre: 'pasajeDestino' });
      const traslado = await TrasladoModel.findById(detalle.trasladoId);
      const banderaLimiteSueldos = await BanderaModel.findOne({ nombre: 'limite sueldos' });
      const banderaPorcentajeAdmon = await BanderaModel.findOne({ nombre: 'PorcentajeAdmon' });

      const limiteKmHotelBandera = await BanderaModel.findOne({ nombre: 'limiteKmHotel' });
      const costoNocheHotelBandera = await BanderaModel.findOne({ nombre: 'costoNocheHotel' });
      const limiteKmHotel = limiteKmHotelBandera ? limiteKmHotelBandera.valor : 800;
      const costoNocheHotel = costoNocheHotelBandera ? costoNocheHotelBandera.valor : 400;

      const v_valorExtraPasajeOrigen = banderaPasajeOrigen ? banderaPasajeOrigen.valor : 0;
      const v_valorExtraPasajeDestino = banderaPasajeDestino ? banderaPasajeDestino.valor : 0;
      const limiteSueldos = banderaLimiteSueldos ? banderaLimiteSueldos.valor : 5; // Usar 5 como valor predeterminado si no se encuentra
      const porcentajeAdmon = banderaPorcentajeAdmon ? banderaPorcentajeAdmon.valor : 8; // Usar 8 como valor predeterminado si no se encuentra

      const porcentajeFinanciamiento = configureData ? configureData.financiamiento : 0;
      const v_otrosGastos = configureData ? configureData.otros : 0;

      v_kms = peaje ? peaje.kms : 0;
      v_rend = rendimiento ? rendimiento.rendimiento : 0;
      if (v_tipoViaje === 2) {
        v_rend -= 1;
      }
      v_totalLitros = v_kms / v_rend;
      v_costoDiesel = configureData ? configureData.combustible : 0;
      v_diesel = v_costoDiesel * v_totalLitros;
      v_comidas = gastos && gastos.comidas ? gastos.comidas : 0;
      v_costoPasajeOrigen = (gastos && gastos.pasajeOrigen ? gastos.pasajeOrigen : 0) + v_valorExtraPasajeOrigen;
      if (v_tipoViaje === 3 && !primeraIteracion) {
        v_costoPasajeOrigen = 0;
      } else {
        primeraIteracion = false; // Cambiar el estado de la primera iteración después de la primera vuelta
      }

      v_costoPasajeDestino = (gastos && gastos.pasajeDestino ? gastos.pasajeDestino : 0) + v_valorExtraPasajeDestino;
      v_totalPeajes = peaje ? peaje.totalPeajes : 0;
      v_seguroTraslado = gastos && gastos.seguroTraslado ? gastos.seguroTraslado : 0;

      v_ferry = gastos && gastos.ferry ? gastos.ferry : 0;
      v_hotel = gastos && gastos.hoteles ? gastos.hoteles : 0;

      console.log("v_hotel",v_hotel);

      // Cálculo para hoteles basado en los kilómetros totales
      const nochesHotel = Math.floor(v_kms / limiteKmHotel); // Usa el valor de la bandera
      console.log("v_kms",v_kms);
      console.log("limiteKmHotel",limiteKmHotel);
      console.log("nochesHotel",nochesHotel);
      console.log("costoNocheHotel",costoNocheHotel);
      
      v_hotel = nochesHotel * v_hotel;

      v_vuelo = gastos && gastos.vuelo ? gastos.vuelo : 0;
      v_taxi = gastos && gastos.taxi ? gastos.taxi : 0;
      v_udsUsa = gastos && gastos.udsUsa ? gastos.udsUsa : 0;
      v_liberacionPuerto = gastos && gastos.liberacionPuerto ? gastos.liberacionPuerto : 0;
      v_talachas = gastos && gastos.talachas ? gastos.talachas : 0;
      v_fitosanitarias = gastos && gastos.fitosanitarias ? gastos.fitosanitarias : 0;
      //console.log("v_fitosanitarias",v_fitosanitarias);
      v_urea = gastos && gastos.urea ? gastos.urea : 0;
      v_extra = gastos && gastos.extra ? gastos.extra : 0;

      v_sueldo = traslado ? (traslado.sueldo < limiteSueldos ? traslado.sueldo * v_kms : traslado.sueldo) : 0;
      v_pagoEstadia = gastos && gastos.pagoDeEstadia ? gastos.pagoDeEstadia : 0;
      v_subtotal = v_diesel
             + v_comidas
             + v_costoPasajeOrigen
             + v_costoPasajeDestino
             + v_totalPeajes
             + v_seguroTraslado
             + v_sueldo
             + v_pagoEstadia
             + v_ferry
             + v_hotel
             + v_vuelo
             + v_taxi
             + v_udsUsa
             + v_liberacionPuerto
             + v_talachas
             + v_fitosanitarias
             + v_urea
             + v_extra;


             console.log("v_diesel", v_diesel);
             console.log("v_comidas", v_comidas);
             console.log("v_costoPasajeOrigen", v_costoPasajeOrigen);
             console.log("v_costoPasajeDestino", v_costoPasajeDestino);
             console.log("v_totalPeajes", v_totalPeajes);
             console.log("v_seguroTraslado", v_seguroTraslado);
             console.log("v_sueldo", v_sueldo);
             console.log("v_pagoEstadia", v_pagoEstadia);
             console.log("v_ferry", v_ferry);
             console.log("v_hotel", v_hotel);
             console.log("v_vuelo", v_vuelo);
             console.log("v_taxi", v_taxi);
             console.log("v_udsUsa", v_udsUsa);
             console.log("v_liberacionPuerto", v_liberacionPuerto);
             console.log("v_talachas", v_talachas);
             console.log("v_fitosanitarias", v_fitosanitarias);
             console.log("v_urea", v_urea);
             console.log("v_extra", v_extra);
   

      v_admon = (v_subtotal * porcentajeAdmon) / 100;
      v_total = v_subtotal + v_admon + v_otrosGastos;
      v_financiamiento = (v_total * porcentajeFinanciamiento) / 100;
      porcentajeInflacion = configureData ? configureData.inflacion : 0;
      v_inflacion = v_total * (porcentajeInflacion / 100);

      const gananciaEntry = await GananciaModel.findOne({
        desde: { $lte: v_kms },
        hasta: { $gte: v_kms },
      });

      v_ganancia = gananciaEntry ? gananciaEntry.ganancia : 0;
      v_costoTotal = v_total + v_financiamiento + v_inflacion + v_ganancia;

      // Aquí guardamos en quote_history
      const quoteHistory = new CotizacionHistorialModel({
        quoteId: detalle._id,
        folio,
        clienteNombre: solicitud.clienteName,
        origen: detalle.localidadOrigenName,
        destino: detalle.localidadDestinoName,
        kms: v_kms,
        rendimiento: v_rend,
        litros: v_totalLitros,
        diesel: v_diesel,
        comidas: v_comidas,
        pasajeOrigen: v_costoPasajeOrigen,
        pasajeDestino: v_costoPasajeDestino,
        peajesViapass: v_totalPeajes,
        seguroTraslado: v_seguroTraslado,
        sueldo: v_sueldo,
        pagoEstadia: v_pagoEstadia,
        hotel: v_hotel,
        vuelo: v_vuelo,
        taxi: v_taxi,
        ferry: v_ferry,
        udsUsa: v_udsUsa,
        liberacionPuerto: v_liberacionPuerto,
        talachas: v_talachas,
        fitosanitarias: v_fitosanitarias,
        urea: v_urea,
        extra: v_extra,
        subTotal: v_subtotal,
        admon: v_admon,
        total: v_total,
        inflacion: v_inflacion,
        financiamiento: v_financiamiento,
        ganancia: v_ganancia,
        costo: v_costoTotal,
        fechaCreacion: new Date(),
      });
      await quoteHistory.save();

      return {
        // id: detalle._id,
        // folio: folio,
        clienteNombre: solicitud.clienteName,
        origen: detalle.localidadOrigenName,
        destino: detalle.localidadDestinoName,
        kms: parseFloat(v_kms.toFixed(2)),
        rendimiento: parseFloat(v_rend.toFixed(2)),
        litros: parseFloat(v_totalLitros.toFixed(2)),
        diesel: parseFloat(v_diesel.toFixed(2)),
        comidas: parseFloat(v_comidas.toFixed(2)),
        pasajeOrigen: parseFloat(v_costoPasajeOrigen.toFixed(2)),
        pasajeDestino: parseFloat(v_costoPasajeDestino.toFixed(2)),
        peajesViapass: parseFloat(v_totalPeajes.toFixed(2)),
        seguroTraslado: parseFloat(v_seguroTraslado.toFixed(2)),

        hotel: parseFloat(v_hotel.toFixed(2)),
        vuelo: parseFloat(v_vuelo.toFixed(2)),
        taxi: parseFloat(v_taxi.toFixed(2)),
        ferry: parseFloat(v_ferry.toFixed(2)),
        udsUsa: parseFloat(v_udsUsa.toFixed(2)),
        liberacionPuerto: parseFloat(v_liberacionPuerto.toFixed(2)),
        talachas: parseFloat(v_talachas.toFixed(2)),
        fitosanitarias: parseFloat(v_fitosanitarias.toFixed(2)),
        urea: parseFloat(v_urea.toFixed(2)),
        extra: parseFloat(v_extra.toFixed(2)),

        sueldo: parseFloat(v_sueldo.toFixed(2)),

        pagoEstadia: parseFloat(v_pagoEstadia.toFixed(2)),
        subTotal: parseFloat(v_subtotal.toFixed(2)),
        admon: parseFloat(v_admon.toFixed(2)),
        total: parseFloat(v_total.toFixed(2)),
        inflacion: parseFloat(v_inflacion.toFixed(2)),
        financiamiento: parseFloat(v_financiamiento.toFixed(2)),
        ganancia: parseFloat(v_ganancia.toFixed(2)),
        costo: parseFloat(v_costoTotal.toFixed(2)),

        dimensiones: detalle.dimensiones,
        trasladoTipo: detalle.trasladoTipo,

      };
    }));

    res.formatResponse('ok', 200, 'Datos consultados con éxito.', response);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const getSolicitudesSimples = async (req, res) => {
  try {
    // Buscar todas las solicitudes
    const solicitudes = await SolicitudModel.find().select('-_id folio  estatus createdAt userId tipoViajeId');

    if (solicitudes.length > 0) {
      const solicitudesConNombres = await Promise.all(
        solicitudes.map(async (solicitud) => {
          // Buscar el nombre del cliente usando el userId de la solicitud
          let clientName = await getClientNameById(solicitud.userId);

          // Si no se encuentra el nombre del cliente, buscar el nombre del usuario
          if (!clientName) {
            clientName = await getUserNameById(solicitud.userId);
          }

          // Buscar la descripción del tipo de viaje
          const tipoViaje = await CatalogModel.findById(solicitud.tipoViajeId);
          const tipoViajeDescripcion = tipoViaje ? tipoViaje.descripcion : 'Desconocido';

          return {
            ...solicitud.toObject(),
            clientName,
            tipoViajeDescripcion,
            // detalles: No se incluyen detalles específicos de SolicitudDetalleModel aquí
          };
        }),
      );

      res.formatResponse('ok', 200, 'Consulta exitosa', solicitudesConNombres);
    } else {
      res.formatResponse('ok', 204, 'No se encontraron datos', []);
    }
  } catch (error) {
    console.error(error);
    await responseError(409, error, res);
  }
};

const getSolicitudesByClienteId = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Asumiendo que ClienteModel es tu modelo para los clientes
    const cliente = await ClienteModel.findById(clientId);
    if (!cliente) {
      return res.formatResponse('ok', 204, 'Cliente no encontrado.', []);
    }

    const solicitudes = await SolicitudModel.find({ clienteId: clientId, estatus: "Pendiente" })
      .select('-_id folio estatus createdAt userId tipoViajeId')
      .sort({ folio: -1 }); // Ordena las solicitudes de forma descendente por folio

    if (solicitudes.length === 0) {
      return res.formatResponse('ok', 204, 'No se encontraron solicitudes para el cliente especificado', []);
    }

    // Agregar el nombre del cliente y el nombre del usuario a cada solicitud
    const response = await Promise.all(solicitudes.map(async (solicitud) => {
      const userName = await getUserNameById(solicitud.userId);

      return {
        ...solicitud.toObject(),
        clientName: cliente.razonSocial,
        userName: userName || 'Usuario no encontrado',
      };
    }));

    res.formatResponse('ok', 200, 'Consulta exitosa', response);
  } catch (error) {
    console.error(error);
    await responseError(409, error, res);
  }
};

const getSolicitudesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Buscar el nombre del usuario primero para incluirlo en la respuesta
    const userName = await getUserNameById(userId);
    if (!userName) {
      return res.formatResponse('ok', 204, 'Usuario no encontrado.', []);
    }

    const solicitudes = await SolicitudModel.find({ userId })
      .select('-_id folio estatus createdAt userId tipoViajeId')
      .sort({ folio: -1 }); // Ordena las solicitudes de forma descendente por folio

    if (solicitudes.length === 0) {
      return res.formatResponse('ok', 204, 'No se encontraron solicitudes para el usuario especificado', []);
    }

    // No es necesario buscar el cliente aquí, ya que el método es específico para el userId
    const response = solicitudes.map((solicitud) => ({
      ...solicitud.toObject(),
      userName, // Incluye el nombre del usuario obtenido previamente
    }));

    res.formatResponse('ok', 200, 'Consulta exitosa', response);
  } catch (error) {
    console.error(error);
    await responseError(409, error, res);
  }
};

const getSolicitudDetalleByFolio_ok = async (req, res) => {
  try {
    const { folio } = req.params;
    const folioNum = parseInt(folio, 10);

    const detallesSolicitud = await SolicitudDetalleModel.find({ folio: folioNum });
    if (detallesSolicitud.length === 0) {
      return res.formatResponse('ok', 204, 'No se encontraron detalles para la solicitud con el folio especificado', []);
    }

    const detallesEnriquecidos = await Promise.all(detallesSolicitud.map(async (detalle) => {
      const origen = await CountryModel.findById(detalle.localidadOrigenId);
      const destino = await CountryModel.findById(detalle.localidadDestinoId);

      const ultimoHistorial = await CotizacionHistorialModel.findOne({ quoteId: detalle._id })
        .sort({ fechaCreacion: -1 });

      // Extraer datos de ultimoHistorial directamente
      const historialData = ultimoHistorial ? {
        kms: ultimoHistorial.kms,
        rendimiento: ultimoHistorial.rendimiento,
        litros: ultimoHistorial.litros,
        diesel: ultimoHistorial.diesel,
        comidas: ultimoHistorial.comidas,
        pasajeOrigen: ultimoHistorial.pasajeOrigen,
        pasajeDestino: ultimoHistorial.pasajeDestino,
        peajesViapass: ultimoHistorial.peajesViapass,
        seguroTraslado: ultimoHistorial.seguroTraslado,
        sueldo: ultimoHistorial.sueldo,
        pagoEstadia: ultimoHistorial.pagoEstadia,
        subTotal: ultimoHistorial.subTotal,
        admon: ultimoHistorial.admon,
        total: ultimoHistorial.total,
        inflacion: ultimoHistorial.inflacion,
        financiamiento: ultimoHistorial.financiamiento,
        ganancia: ultimoHistorial.ganancia,
        costo: ultimoHistorial.costo,
        fechaCreacion: ultimoHistorial.fechaCreacion,
      } : {};

      return {
        ...detalle.toObject(),
        nombreOrigen: origen ? origen.nombre : 'Origen no encontrado',
        nombreDestino: destino ? destino.nombre : 'Destino no encontrado',
        // Extiende aquí con los datos de historialData
        ...historialData,
      };
    }));

    res.formatResponse('ok', 200, 'Detalles de la solicitud encontrados con éxito', detallesEnriquecidos);
  } catch (error) {
    console.error(error);
    await responseError(409, error, res);
  }
};

const getSolicitudDetalleByFolio = async (req, res) => {
  try {
    const { folio } = req.params;
    const folioNum = parseInt(folio, 10);

    const detallesSolicitud = await SolicitudDetalleModel.find({ folio: folioNum });
    if (detallesSolicitud.length === 0) {
      return res.formatResponse('ok', 204, 'No se encontraron detalles para la solicitud con el folio especificado', []);
    }

    const detallesEnriquecidos = await Promise.all(detallesSolicitud.map(async (detalle) => {
      const ultimoHistorial = await CotizacionHistorialModel.findOne({ quoteId: detalle._id })
        .sort({ fechaCreacion: -1 });

      const historialData = ultimoHistorial ? ultimoHistorial.toObject() : {};

      const fechaCreacionCotizacion = new Date(historialData.fechaCreacion);
      const formattedFechaCreacionCotizacion = `${fechaCreacionCotizacion.getFullYear()}/${
        String(fechaCreacionCotizacion.getMonth() + 1).padStart(2, '0')}/${
        String(fechaCreacionCotizacion.getDate()).padStart(2, '0')} ${
        String(fechaCreacionCotizacion.getHours()).padStart(2, '0')}:${
        String(fechaCreacionCotizacion.getMinutes()).padStart(2, '0')}`;

      return {
        folio: detalle.folio,
        localidadOrigenName: detalle.localidadOrigenName,
        localidadOrigenCodigo: detalle.localidadOrigenCodigo,
        localidadOrigenTipoCobro: detalle.localidadOrigenTipoCobro,
        localidadDestinoName: detalle.localidadDestinoName,
        localidadDestinoCodigo: detalle.localidadDestinoCodigo,
        localidadDestinoTipoCobro: detalle.localidadDestinoTipoCobro,
        unidadMarca: detalle.unidadMarca,
        unidadModelo: detalle.unidadModelo,
        trasladoTipo: detalle.trasladoTipo,
        trasladoConcepto: detalle.trasladoConcepto,
        tipoViajeName: detalle.tipoViajeName,
        manual: detalle.manual,
        dimensiones: detalle.dimensiones,
        fechacreacionsolicitud: detalle.createdAt,
        // Datos de historial
        kms: historialData.kms,
        rendimiento: historialData.rendimiento,
        litros: historialData.litros,
        diesel: historialData.diesel,
        comidas: historialData.comidas,
        pasajeOrigen: historialData.pasajeOrigen,
        pasajeDestino: historialData.pasajeDestino,
        peajesViapass: historialData.peajesViapass,
        seguroTraslado: historialData.seguroTraslado,
        sueldo: historialData.sueldo,
        pagoEstadia: historialData.pagoEstadia,
        subTotal: historialData.subTotal,
        admon: historialData.admon,
        total: historialData.total,
        inflacion: historialData.inflacion,
        financiamiento: historialData.financiamiento,
        ganancia: historialData.ganancia,
        costo: historialData.costo,
        fechacreacioncotizacion: historialData.fechaCreacion,
        fechacreacioncotizacions: formattedFechaCreacionCotizacion,

      };
    }));

    res.formatResponse('ok', 200, 'Detalles de la solicitud encontrados con éxito', detallesEnriquecidos);
  } catch (error) {
    console.error(error);
    await responseError(409, error, res);
  }
};

const getSolicitudDetallesimpleByFolio = async (req, res) => {
  try {
    const { folio } = req.params;
    const folioNum = parseInt(folio, 10);

    const detallesSolicitud = await SolicitudDetalleModel.find({ folio: folioNum });
    if (detallesSolicitud.length === 0) {
      return res.formatResponse('ok', 204, 'No se encontraron detalles para la solicitud con el folio especificado', []);
    }

    const detallesEnriquecidos = await Promise.all(detallesSolicitud.map(async (detalle) => {
      const ultimoHistorial = await CotizacionHistorialModel.findOne({ quoteId: detalle._id })
        .sort({ fechaCreacion: -1 });

      const historialData = ultimoHistorial ? ultimoHistorial.toObject() : {};

      const fechaCreacionCotizacion = new Date(historialData.fechaCreacion);
      const formattedFechaCreacionCotizacion = `${fechaCreacionCotizacion.getFullYear()}/${
        String(fechaCreacionCotizacion.getMonth() + 1).padStart(2, '0')}/${
        String(fechaCreacionCotizacion.getDate()).padStart(2, '0')} ${
        String(fechaCreacionCotizacion.getHours()).padStart(2, '0')}:${
        String(fechaCreacionCotizacion.getMinutes()).padStart(2, '0')}`;

      return {
        folio: detalle.folio,
        localidadOrigenName: detalle.localidadOrigenName,
        localidadOrigenCodigo: detalle.localidadOrigenCodigo,
        localidadOrigenTipoCobro: detalle.localidadOrigenTipoCobro,
        localidadDestinoName: detalle.localidadDestinoName,
        localidadDestinoCodigo: detalle.localidadDestinoCodigo,
        localidadDestinoTipoCobro: detalle.localidadDestinoTipoCobro,
        unidadMarca: detalle.unidadMarca,
        unidadModelo: detalle.unidadModelo,
        trasladoTipo: detalle.trasladoTipo,
        trasladoConcepto: detalle.trasladoConcepto,
        tipoViajeName: detalle.tipoViajeName,
        manual: detalle.manual,
        dimensiones: detalle.dimensiones,
        fechacreacionsolicitud: detalle.createdAt,
      };
    }));

    res.formatResponse('ok', 200, 'Detalles de la solicitud encontrados con éxito', detallesEnriquecidos);
  } catch (error) {
    console.error(error);
    await responseError(409, error, res);
  }
};

const sendSolicitudDetails = async (req, res) => {
  try {
    const { folio, mensaje } = req.body;
    const token = req.header('Authorization');

    const decoded = jwt.verify(token.split(' ')[1], process.env.TOKEN_SECRET);
    const { data } = decoded;

    if (folio === undefined || mensaje === undefined) {
      res.formatResponse('error', 400, 'Faltan datos requeridos: folio y/o mensaje.', []);
      return;
    }

    const folioNum = parseInt(folio, 10);

    const solicitud = await SolicitudModel.find({ folio: folio });



    const dataUserClient = await UserClient.findById(solicitud[0].userId);
    const detallesSolicitud = await SolicitudDetalleModel.find({ folio: folioNum });
    const cotizacionesConDetalles = await Promise.all(detallesSolicitud.map(async (cotizacion) => {
      const quoteHistory = await QuoteHistory.findOne({ quoteId: cotizacion._id }).sort({ fechaCreacion: -1 }).limit(1).exec();
      const { _doc } = quoteHistory;
      const coast = _doc.costo;
      const origen = cotizacion.localidadOrigenName;
      const arrived = cotizacion.localidadDestinoName;
      const model = cotizacion.unidadModelo;
      return {
        origen,
        destino: arrived,
        modelo: model,
        costo: coast,
      };
    }));

    enviarCorreo({
      cliente: dataUserClient.nombreCliente,
      nameClient: dataUserClient.nombre,
      message: mensaje,
      nameUser: `${data.name} ${data.lastname}`,
      userPuesto: data.position,
      clientPuesto: dataUserClient.puesto,
      firma: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Firma_Lic.Len%C3%ADn_Moreno.png',
      destinos: cotizacionesConDetalles,
    });
    // const newDetail = await SolicitudDetailModel.create({ folio, mensaje });

    const result = await SolicitudModel.updateOne(
      { folio: folio }, 
      { $set: { estatus: "Atendida" } }
    );

    res.formatResponse('ok', 200, 'Detalle de solicitud guardado exitosamente.', 'detalle');
  } catch (error) {
    await responseError(409, error, res);
  }
};

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
      const {
        localidadOrigenId, localidadDestinoId, tipoUnidad, tipoTraslado, tipoViaje, estatus,
      } = destino;

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
        clienteId: userClient.idCliente.toString(),
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
      const {
        localidadOrigenId, localidadDestinoId, tipoUnidad, tipoTraslado, tipoViaje, estatus, manual, dimensiones,
      } = destino;

      const localidadOrigen = await CountryModel.findById(localidadOrigenId);
      const localidadDestino = await CountryModel.findById(localidadDestinoId);

      if (!localidadOrigen || !localidadDestino) {
        return res.formatResponse('ok', 204, 'Información de localidad no encontrada para origen o destino.', []);
      }

      let existeRuta = false;

      const rutaExiste = await Peajes.findOne({
        localidadOrigen: localidadOrigen.codigo,
        localidadDestino: localidadDestino.codigo,
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
        existeRuta,
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
        }),
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

const getQuotesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const quotes = await Quote.find({ userId }).select('folio origenId destinoId tipoUnidad tipoTraslado tipoViaje _id estatus fechaCreacion userId');

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

const calculateQuoteDetails = async (quote) => {
  const peaje = await Peajes.findOne({
    localidadOrigen: quote.origenId.toString(),
    localidadDestino: quote.destinoId.toString(),
  });

  const origen = await CountryModel.findOne({ codigo: quote.origenId, tipoUnidad: peaje ? peaje.tipoUnidad : null });
  const destino = await CountryModel.findOne({ codigo: quote.destinoId, tipoUnidad: peaje ? peaje.tipoUnidad : null });

  const rendimiento = await RendimientoModel.findById(quote.tipoUnidad);

  const configureData = await configureDataModel.findOne({ status: 'Activo' });

  const gastos = await GastosModel.findOne({
    localidadOrigen: quote.origenId.toString(),
    localidadDestino: quote.destinoId.toString(),
  });

  const banderaPasajeOrigen = await BanderaModel.findOne({ nombre: 'pasajeOrigen' });
  const banderaPasajeDestino = await BanderaModel.findOne({ nombre: 'pasajeDestino' });

  const traslado = await TrasladoModel.findById(quote.tipoTraslado);

  const banderaLimiteSueldos = await BanderaModel.findOne({ nombre: 'limite sueldos' });
  const limiteSueldos = banderaLimiteSueldos ? banderaLimiteSueldos.valor : 5;

  const banderaPorcentajeAdmon = await BanderaModel.findOne({ nombre: 'PorcentajeAdmon' });
  const porcentajeAdmon = banderaPorcentajeAdmon ? banderaPorcentajeAdmon.valor : 8;

  const v_valorExtraPasajeOrigen = banderaPasajeOrigen ? banderaPasajeOrigen.valor : 0;
  const v_valorExtraPasajeDestino = banderaPasajeDestino ? banderaPasajeDestino.valor : 0;

  const porcentajeFinanciamiento = configureData ? configureData.financiamiento : 0;
  const v_otrosGastos = configureData ? configureData.otros : 0;

  const nombreOrigen = origen ? origen.nombre : 'Origen no encontrado';
  const nombreDestino = destino ? destino.nombre : 'Destino no encontrado';
  const v_kms = peaje ? peaje.kms : 0;
  const v_rend = rendimiento ? rendimiento.rendimiento : 0;
  const v_totalLitros = v_kms / v_rend;
  const v_costoDiesel = configureData ? configureData.combustible : 0;
  const v_diesel = v_costoDiesel * v_totalLitros;
  const v_comidas = gastos && gastos.comidas ? gastos.comidas : 0;
  const v_costoPasajeOrigen = (gastos && gastos.pasajeOrigen ? gastos.pasajeOrigen : 0) + v_valorExtraPasajeOrigen;
  const v_costoPasajeDestino = (gastos && gastos.pasajeDestino ? gastos.pasajeDestino : 0) + v_valorExtraPasajeDestino;
  const v_totalPeajes = peaje ? peaje.totalPeajes : 0;
  const v_seguroTraslado = gastos && gastos.seguroTraslado ? gastos.seguroTraslado : 0;
  const v_sueldo = traslado ? (traslado.sueldo < limiteSueldos ? traslado.sueldo * v_kms : traslado.sueldo) : 0;
  const v_pagoEstadia = gastos && gastos.pagoDeEstadia ? gastos.pagoDeEstadia : 0;
  const v_subtotal = v_diesel + v_comidas + v_costoPasajeOrigen + v_costoPasajeDestino + v_totalPeajes + v_seguroTraslado + v_sueldo + v_pagoEstadia;
  const v_admon = (v_subtotal * porcentajeAdmon) / 100;

  const v_total = v_subtotal + v_admon + v_otrosGastos;
  const v_financiamiento = (v_total * porcentajeFinanciamiento) / 100;

  const porcentajeInflacion = configureData ? configureData.inflacion : 0;
  const v_inflacion = v_total * (porcentajeInflacion / 100);

  const gananciaEntry = await GananciaModel.findOne({
    desde: { $lte: v_kms },
    hasta: { $gte: v_kms },
  });

  const v_ganancia = gananciaEntry ? gananciaEntry.ganancia : 0;
  const v_costoTotal = v_total + v_financiamiento + v_inflacion + v_ganancia;

  return {
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
    costo: parseFloat(v_costoTotal.toFixed(2)),
  };
};

const getQuoteDetailsByFolio = async (req, res) => {
  try {
    const quotes = await Quote.find({ folio: req.params.folio });

    if (!quotes || quotes.length === 0) {
      return res.formatResponse('ok', 204, 'No se encontraron cotizaciones para el folio especificado', []);
    }

    let v_tipoViaje = null;

    console.log('quotes.tipoViaje:', quotes);

    switch (quotes.tipoViaje.toString()) {
    case '657d410b090a350a86310db8': // Rodando
      v_tipoViaje = 'Rodando';
      break;
    case '657d411f090a350a86310dc0': // Sin rodar
      v_tipoViaje = 'Sin rodar';
      break;
    case '657d4127090a350a86310dc4': // Local
      v_tipoViaje = 'Local';
      break;
    }

    // Obtener el destino temporal para "Sin rodar"
    const origenTemporal = await BanderaModel.findOne({ nombre: 'destinoTemporalParaSinrodar' });
    const origenTemporalId = origenTemporal.valor;

    // Preparar las cotizaciones con detalles
    const quotesWithDetailsPromises = quotes.flatMap(async (quote) => {
      // Generar cotización original
      const originalQuoteDetails = calculateQuoteDetails(quote);

      // Si el tipo de viaje es "Sin rodar", añadir cotizaciones adicionales
      if (quote.tipoViaje.toString() === '657d411f090a350a86310dc0') { // Asumiendo este es el ID para "Sin rodar"
        // Añadir cotización adicional de C a A
        const quoteDetailsCA = { ...quote._doc, origenId: origenTemporalId, destinoId: quote.origenId };
        const caQuoteDetails = calculateQuoteDetails(quoteDetailsCA);

        // Añadir cotización adicional de B a C
        const quoteDetailsBC = { ...quote._doc, origenId: quote.destinoId, destinoId: origenTemporalId };
        const bcQuoteDetails = calculateQuoteDetails(quoteDetailsBC);

        return [originalQuoteDetails, caQuoteDetails, bcQuoteDetails];
      }
      return [originalQuoteDetails];
    });

    const quotesWithDetails = await Promise.all(quotes.map(async (quote) => {
      const quoteDetails = await calculateQuoteDetails(quote);
      return {
        id: quote._id,
        folio: quote.folio,
        ...quoteDetails,
        tipoViaje: v_tipoViaje,
        origenTemporalId,
      };
    }));

    res.formatResponse('ok', 200, 'Consulta exitosa', quotesWithDetails);
  } catch (error) {
    console.error(error);
    await responseError(409, error, res);
  }
};

const getQuoteDetailsByFolio_old = async (req, res) => {
  try {
    const quotes = await Quote.find({ folio: req.params.folio });

    if (!quotes || quotes.length === 0) {
      return res.formatResponse('ok', 204, 'No se encontraron cotizaciones para el folio especificado', []);
    }

    const quotesWithDetails = await Promise.all(quotes.map(async (quote) => {
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
      // console.log("gastos:", gastos);

      const banderaPasajeOrigen = await BanderaModel.findOne({ nombre: 'pasajeOrigen' });
      const banderaPasajeDestino = await BanderaModel.findOne({ nombre: 'pasajeDestino' });

      const traslado = await TrasladoModel.findById(quote.tipoTraslado);

      const banderaLimiteSueldos = await BanderaModel.findOne({ nombre: 'limite sueldos' });
      const limiteSueldos = banderaLimiteSueldos ? banderaLimiteSueldos.valor : 5; // Usar 5 como valor predeterminado si no se encuentra

      const banderaPorcentajeAdmon = await BanderaModel.findOne({ nombre: 'PorcentajeAdmon' });
      const porcentajeAdmon = banderaPorcentajeAdmon ? banderaPorcentajeAdmon.valor : 8; // Usar 8 como valor predeterminado si no se encuentra

      const v_valorExtraPasajeOrigen = banderaPasajeOrigen ? banderaPasajeOrigen.valor : 0;
      const v_valorExtraPasajeDestino = banderaPasajeDestino ? banderaPasajeDestino.valor : 0;

      const porcentajeFinanciamiento = configureData ? configureData.financiamiento : 0;

      const v_otrosGastos = configureData ? configureData.otros : 0;

      // Añadir nombres de las localidades y otros valores a la cotización
      const nombreOrigen = origen ? origen.nombre : 'Origen no encontrado';
      const nombreDestino = destino ? destino.nombre : 'Destino no encontrado';
      const v_kms = peaje ? peaje.kms : 0;
      const v_rend = rendimiento ? rendimiento.rendimiento : 0;
      const v_totalLitros = v_kms / v_rend;
      const v_costoDiesel = configureData ? configureData.combustible : 0;
      const v_diesel = v_costoDiesel * v_totalLitros;
      const v_comidas = gastos && gastos.comidas ? gastos.comidas : 0;
      const v_costoPasajeOrigen = (gastos && gastos.pasajeOrigen ? gastos.pasajeOrigen : 0) + v_valorExtraPasajeOrigen;
      const v_costoPasajeDestino = (gastos && gastos.pasajeDestino ? gastos.pasajeDestino : 0) + v_valorExtraPasajeDestino;
      const v_totalPeajes = peaje ? peaje.totalPeajes : 0;
      const v_seguroTraslado = gastos && gastos.seguroTraslado ? gastos.seguroTraslado : 0;
      const v_sueldo = traslado ? (traslado.sueldo < limiteSueldos ? traslado.sueldo * v_kms : traslado.sueldo) : 0;

      const v_pagoEstadia = gastos && gastos.pagoDeEstadia ? gastos.pagoDeEstadia : 0;
      const v_subtotal = v_diesel
                 + v_comidas
                 + v_costoPasajeOrigen
                 + v_costoPasajeDestino
                 + v_totalPeajes
                 + v_seguroTraslado
                 + v_sueldo
                 + v_pagoEstadia;

      const v_admon = (v_subtotal * porcentajeAdmon) / 100;

      const v_total = v_subtotal + v_admon + v_otrosGastos;
      const v_financiamiento = (v_total * porcentajeFinanciamiento) / 100;

      const porcentajeInflacion = configureData ? configureData.inflacion : 0;

      const v_inflacion = v_total * (porcentajeInflacion / 100);

      const gananciaEntry = await GananciaModel.findOne({
        desde: { $lte: v_kms },
        hasta: { $gte: v_kms },
      });

      const v_ganancia = gananciaEntry ? gananciaEntry.ganancia : 0;

      const v_costoTotal = v_total + v_financiamiento + v_inflacion + v_ganancia;

      // Aquí guardamos en quote_history
      const quoteHistory = new QuoteHistoryModel({
        quoteId: quote._id,
        // Incluir todos los campos
        folio: quote.folio,
        origen: nombreOrigen,
        destino: nombreDestino,
        kms: v_kms,
        rendimiento: v_rend,
        litros: v_totalLitros,
        diesel: v_diesel,
        comidas: v_comidas,
        pasajeOrigen: v_costoPasajeOrigen,
        pasajeDestino: v_costoPasajeDestino,
        peajesViapass: v_totalPeajes,
        seguroTraslado: v_seguroTraslado,
        sueldo: v_sueldo,
        pagoEstadia: v_pagoEstadia,
        subTotal: v_subtotal,
        admon: v_admon,
        total: v_total,
        inflacion: v_inflacion,
        financiamiento: v_financiamiento,
        ganancia: v_ganancia,
        costo: v_costoTotal,
        fechaCreacion: new Date(),
      });
      await quoteHistory.save();

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
        costo: parseFloat(v_costoTotal.toFixed(2)),
        tipoViaje: v_tipoViaje,

      };
    }));

    res.formatResponse('ok', 200, 'Consulta exitosa', quotesWithDetails);
  } catch (error) {
    console.error(error);
    await responseError(409, error, res);
  }
};

const getQuote01ById_old_ok = async (req, res) => {
  try {
    const quotes = await Quote.find({ folio: req.params.folio });

    if (!quotes || quotes.length === 0) {
      res.formatResponse('ok', 204, 'No se encontraron cotizaciones para el folio especificado', []);
      return;
    }

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
      // console.log("gastos:", gastos);

      const banderaPasajeOrigen = await BanderaModel.findOne({ nombre: 'pasajeOrigen' });
      const banderaPasajeDestino = await BanderaModel.findOne({ nombre: 'pasajeDestino' });

      const traslado = await TrasladoModel.findById(quote.tipoTraslado);

      const banderaLimiteSueldos = await BanderaModel.findOne({ nombre: 'limite sueldos' });
      const limiteSueldos = banderaLimiteSueldos ? banderaLimiteSueldos.valor : 5; // Usar 5 como valor predeterminado si no se encuentra

      const banderaPorcentajeAdmon = await BanderaModel.findOne({ nombre: 'PorcentajeAdmon' });
      const porcentajeAdmon = banderaPorcentajeAdmon ? banderaPorcentajeAdmon.valor : 8; // Usar 8 como valor predeterminado si no se encuentra

      const v_valorExtraPasajeOrigen = banderaPasajeOrigen ? banderaPasajeOrigen.valor : 0;
      const v_valorExtraPasajeDestino = banderaPasajeDestino ? banderaPasajeDestino.valor : 0;

      const porcentajeFinanciamiento = configureData ? configureData.financiamiento : 0;

      const v_otrosGastos = configureData ? configureData.otros : 0;

      // Añadir nombres de las localidades y otros valores a la cotización
      const nombreOrigen = origen ? origen.nombre : 'Origen no encontrado';
      const nombreDestino = destino ? destino.nombre : 'Destino no encontrado';
      const v_kms = peaje ? peaje.kms : 0;
      const v_rend = rendimiento ? rendimiento.rendimiento : 0;
      const v_totalLitros = v_kms / v_rend;
      const v_costoDiesel = configureData ? configureData.combustible : 0;
      const v_diesel = v_costoDiesel * v_totalLitros;
      const v_comidas = gastos && gastos.comidas ? gastos.comidas : 0;
      const v_costoPasajeOrigen = (gastos && gastos.pasajeOrigen ? gastos.pasajeOrigen : 0) + v_valorExtraPasajeOrigen;
      const v_costoPasajeDestino = (gastos && gastos.pasajeDestino ? gastos.pasajeDestino : 0) + v_valorExtraPasajeDestino;
      const v_totalPeajes = peaje ? peaje.totalPeajes : 0;
      const v_seguroTraslado = gastos && gastos.seguroTraslado ? gastos.seguroTraslado : 0;
      const v_sueldo = traslado ? (traslado.sueldo < limiteSueldos ? traslado.sueldo * v_kms : traslado.sueldo) : 0;

      const v_pagoEstadia = gastos && gastos.pagoDeEstadia ? gastos.pagoDeEstadia : 0;
      const v_subtotal = v_diesel
                 + v_comidas
                 + v_costoPasajeOrigen
                 + v_costoPasajeDestino
                 + v_totalPeajes
                 + v_seguroTraslado
                 + v_sueldo
                 + v_pagoEstadia;

      const v_admon = (v_subtotal * porcentajeAdmon) / 100;

      const v_total = v_subtotal + v_admon + v_otrosGastos;
      const v_financiamiento = (v_total * porcentajeFinanciamiento) / 100;

      const porcentajeInflacion = configureData ? configureData.inflacion : 0;

      const v_inflacion = v_total * (porcentajeInflacion / 100);

      const gananciaEntry = await GananciaModel.findOne({
        desde: { $lte: v_kms },
        hasta: { $gte: v_kms },
      });

      const v_ganancia = gananciaEntry ? gananciaEntry.ganancia : 0;

      const v_costoTotal = v_total + v_financiamiento + v_inflacion + v_ganancia;

      // Aquí guardamos en quote_history
      const quoteHistory = new QuoteHistoryModel({
        quoteId: quote._id,
        folio: quote.folio,
        origen: nombreOrigen,
        destino: nombreDestino,
        kms: v_kms,
        rendimiento: v_rend,
        litros: v_totalLitros,
        diesel: v_diesel,
        comidas: v_comidas,
        pasajeOrigen: v_costoPasajeOrigen,
        pasajeDestino: v_costoPasajeDestino,
        peajesViapass: v_totalPeajes,
        seguroTraslado: v_seguroTraslado,
        sueldo: v_sueldo,
        pagoEstadia: v_pagoEstadia,
        subTotal: v_subtotal,
        admon: v_admon,
        total: v_total,
        inflacion: v_inflacion,
        financiamiento: v_financiamiento,
        ganancia: v_ganancia,
        costo: v_costoTotal,
        fechaCreacion: new Date(),
      });
      await quoteHistory.save();

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
        costo: parseFloat(v_costoTotal.toFixed(2)),

      };
    }));

    res.formatResponse('ok', 200, 'Consulta exitosa', quotesWithKms);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const getQuote01ByIdOld = async (req, res) => {
  let v_lts = 0;
  let v_kms = 0;
  let v_rend = 0;

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

        v_kms = 1;
        quote.kms = v_kms;

        v_rend = 1;
        quote.rend = v_rend;

        v_lts = v_kms / v_rend;
        quote.lts = v_lts;

        quote.tipoUnidad = 222;
        quote.tipoTraslado = 333;
        quote.tipoViaje = 444;

        quote.hoteles = 32; //    km/800 por (costo de tabla de gastos)

        quote.totalLitros = 32;
        quote.precioDiesel = 32;
        quote.costoComidas = 32;
        quote.costoPasajes = 32;
        quote.costoPeajes = 32;
        quote.costoSueldo = 32;
        quote.subtotal = 32;
        quote.gastosAdministrativos = 32;
        quote.total = 32;
        quote.costoInflacion = 32;
        quote.financiamiento = 32;
        quote.ganancia = 32;
        quote.costoTotal = 32;
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

const getQuoteHistoryByFolio = async (req, res) => {
  try {
    const { folio } = req.params;

    const quoteHistories = await QuoteHistoryModel.find({ folio }).populate('quoteId').exec();

    if (quoteHistories.length > 0) {
      res.formatResponse('ok', 200, 'Historial de cotizaciones encontrado', quoteHistories);
    } else {
      res.formatResponse('ok', 204, 'No se encontraron historiales para el folio especificado', []);
    }
  } catch (error) {
    console.error(error);
    res.formatResponse('error', 409, error.message, []);
  }
};

module.exports = {
  createSolicitud,
  getCotizacionByFolio,
  getSolicitudesSimples,
  getSolicitudesByClienteId,
  getSolicitudesByUserId,
  getSolicitudDetalleByFolio,
  getSolicitudDetallesimpleByFolio,
  sendSolicitudDetails,

  createQuote01,
  getQuotes01,
  getQuoteDetailsByFolio,
  updateQuote01,
  deleteQuote01,
  cancelQuote,
  getQuotesByClientId,
  getQuotesByUserId,
  getQuoteHistoryByFolio,

};

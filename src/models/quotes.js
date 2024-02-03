const mongoose = require('mongoose');
const Catalog = require('../models/catalog');
const User = require('../models/User');


const dataSchema = new mongoose.Schema({
  origen: { type: String },
  destino: { type: String },

  origenId: { type: Number },
  destinoId: { type: Number },
  tipoUnidad: { type: String },
  tipoTraslado: { type: String },
  tipoViaje: { type: Number },
  kms: { type: Number },
  rend: { type: Number },
  lts: { type: Number },
  diesel: { type: Number },
  dieselExtra: { type: Number },
  comidas: { type: Number },
  pasajeOrigen: { type: Number },
  pasajeDestino: { type: Number },
  peajeEfectivo: { type: Number },
  peajesViapass: { type: Number },
  seguroDeTraslado: { type: Number },
  sueldo: { type: Number },
  pagoDeEstadia: { type: Number },
  ferry: { type: Number },
  hotel: { type: Number },
  vuelo: { type: Number },
  taxi: { type: Number },
  udsUsa: { type: Number },
  liberacionPuerto: { type: Number },
  talachas: { type: Number },
  fitosanitarias: { type: Number },
  urea: { type: Number },
  extra: { type: Number },
  subTotal: { type: Number },
  admon: { type: Number },
  total: { type: Number },
  inflacion: { type: Number },
  financiamiento: { type: Number },
  ganancia: { type: Number },
  costo: { type: Number },
  cliente: { type: String },

  fechaCreacion: {
    type: Date, 
    default: Date.now,
  },
  fechaActualizacion: {
    type: Date,
  },

  estatus: {
    type: String,
    required: true,
    default:'Pendiente',
    validate: {
      validator: async function (value) {
        try {
          // Validar que el valor de tipoUnidad coincide con el catálogo padre con ID 65827bdb73bd91d97dbe222b
          const catalogEntry = await Catalog.findOne({ descripcion: value, idPadre: '65827bdb73bd91d97dbe222b' });

          if (!catalogEntry) {
            throw new Error(`El valor de \'estatus\' "${value}" no coincide con el catálogo padre con ID '65827bdb73bd91d97dbe222b'.`);
          }

          return true;
        } catch (error) {
          return false;
        }
      },
      message: 'El valor de \'estatus\' no es válido, no coincide con el catálogo padre con ID  65827bdb73bd91d97dbe222b' ,
    },
  },
   
  folio: { type: Number, required: true },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  
    required: true,
  },
  hoteles: { type: Number },
  totalLitros: { type: Number },
  precioDiesel: { type: Number },
  costoComidas: { type: Number },
  costoPasajes: { type: Number },
  costoPeajes: { type: Number },
  costoSueldo: { type: Number },
  subtotal: { type: Number },
  gastosAdministrativos: { type: Number },
  total: { type: Number },
  costoInflacion: { type: Number },
  financiamiento: { type: Number },
  ganancia: { type: Number },
  costoTotal: { type: Number },
  
  
  
  

  
});

const Quote = mongoose.model('Quote', dataSchema);

module.exports = Quote;

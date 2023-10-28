const axios = require('axios');
const cheerio = require('cheerio');

const ENDPOINT = 'http://aplicaciones4.sct.gob.mx/sibuac_internet/ControllerUI';

async function obtenerRutas(data, params) {
  const COMBUSTIBLE = 11.25;
  const RENDIMIENTO = 14.0;

  const ciudadOrigen = params.ciudad_origen.padEnd(4, '0');
  const ciudadDestino = params.ciudad_destino.padEnd(4, '0');

  const estadoOrigen = data.puntos[ciudadOrigen].estado;
  const estadoDestino = data.puntos[ciudadDestino].estado;

  const query = {
    action: 'cmdSolRutas',
    tipo: 1,
    red: 'simplificada',
    edoOrigen: estadoOrigen,
    ciudadOrigen,
    edoDestino: estadoDestino,
    ciudadDestino,
    vehiculos: params.vehiculos || 2,
    calculaRendimiento: params.calcula_rendimiento === 'true' ? 'si' : null,
    tamanioVehiculo: params.tamanio_vehiculo || 2,
    rendimiento: params.rendimiento || RENDIMIENTO,
    combustible: params.combustible || COMBUSTIBLE,
  };

  try {
    const response = await axios.get(ENDPOINT, { params: query });
    const html = response.data;
    console.log(html);
    const $ = cheerio.load(html);

    const trs = $('#tContenido tr');
    let distanciaTotal = 0.0;
    let peajeTotal = 0.0;

    trs.slice(2, trs.length - 5).each((i, tr) => {
      const $tr = $(tr);

      const carretera = $tr.find('td:eq(2)').text().trim().replace(/\s+/g, '');

      if (!params.zonas_urbanas) {
        if (carretera === 'Zona Urbana') {
          return;
        }
      }

      const longitud = parseFloat($tr.find('td:eq(3)').text().trim().replace(/\s+/g, ''));
      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(parseInt(longitud, 10))) {
        distanciaTotal += longitud;
      }
      const costo = parseFloat($tr.find('td:eq(6)').text().trim().replace(/\s+/g, ''));
      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(parseInt(costo, 10))) {
        peajeTotal += costo;
      }
    });

    return {
      distancia: distanciaTotal,
      peaje: peajeTotal,
    };
  } catch (error) {
    console.error(error);
    throw new Error('Error al obtener los datos de la solicitud');
  }
}

// Ejemplo de uso
const data = require('./data.json'); // Reemplaza con la ubicación real de tu archivo data.json

const params = {
  ciudad_origen: '15460',
  ciudad_destino: '11320',
  vehiculos: '10',
  calcula_rendimiento: 'false',
  tamanio_vehiculo: '6',
  rendimiento: '12',
};

obtenerRutas(data, params)
  .then((result) => console.log(result))
  .catch((error) => console.error(error));

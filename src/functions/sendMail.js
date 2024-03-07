const nodemailer = require('nodemailer');
const generarCorreoHTML = require('../utils/generarCorreoHTML');
require('dotenv').config(); // Cargar variables de entorno desde el archivo .env

const emailMTS = process.env.EMAIL;
const pwMTS = process.env.SMTP_PW;
/*console.log({
  user: emailMTS, // 'juan.buendia@callytek.com', // Cambia por tu dirección de correo
  pass: pwMTS, // 'uwwd klbx wkjr iygq', // Cambia por tu contraseña
});*/
// Configura el transporte de Nodemailer
const transporter = nodemailer.createTransport({
  host: 'mail.mtsi.com.mx', // Cambia el proveedor de correo según tu necesidad
  port: 26,
  secure: false,
  tls: {
    rejectUnauthorized: false, // Desactivar la validación del nombre de host
  },
  auth: {
    user: emailMTS, // 'juan.buendia@callytek.com', // Cambia por tu dirección de correo
    pass: pwMTS, // 'uwwd klbx wkjr iygq', // Cambia por tu contraseña
  },
});

async function enviarCorreo(quotesData) {
  try {
    const { cliente } = quotesData;
    const tablaHTML = generarCorreoHTML(quotesData);
    const correoOptions = {
      from: 'cotizaciones@mtsi.com.mx',
      to: 'juan.carlos.buendia@outlook.com', // email,
      subject: `Cotización ${cliente}`,
      html: tablaHTML,
    };

    // Envía el correo
    transporter.sendMail(correoOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo:', error);
      } else {
        console.log('Correo enviado:', info.response);
      }
    });
  } catch (error) {
    console.error('Error en el controlador:', error);
  }
}

module.exports = enviarCorreo;

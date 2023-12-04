const nodemailer = require('nodemailer');
const generarCorreoHTML = require('../utils/generarCorreoHTML');

// Configura el transporte de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Cambia el proveedor de correo según tu necesidad
  auth: {
    user: 'juan.buendia@callytek.com', // Cambia por tu dirección de correo
    pass: 'uwwd klbx wkjr iygq', // Cambia por tu contraseña
  },
});

async function enviarCorreo(quotesData) {
  try {
    const tablaHTML = generarCorreoHTML(quotesData);
    console.log(quotesData.cliente);
    const correoOptions = {
      from: 'juan.buendia@mtsisystem.com',
      /*       to: 'juan.carlos.buendia@outlook.com', */
      to: 'feber32@gmail.com',
      subject: `Cotización ${quotesData[0].cliente}`,
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

const formatAmount = (value) => {
  const mask = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });
  return mask.format(Number(value));
};

function generarTablaHTML(destinos) {
  let tablaHTML = `
        <table>
            <tr>
                <th>Partida</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Modelo</th>
                <th>Costo Unitario</th>
            </tr>`;

  destinos.forEach((quote, index) => {
    tablaHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${quote.origen}</td>
                <td>${quote.destino}</td>
                <td>${quote.modelo ? quote.modelo : 'otro'}</td>
                <td>${formatAmount(quote.costo)}</td>
            </tr>`;
  });

  tablaHTML += `
        </table>`;

  return tablaHTML;
}

function generarCorreoHTML(quotesData) {
  const {
    cliente, nameClient, message, nameUser, userPuesto, clientPuesto, destinos, firma,
  } = quotesData;
  const tablaGenerada = generarTablaHTML(destinos);

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const yy = String(now.getFullYear());

  const fechaCon15Dias = new Date(now);
  fechaCon15Dias.setDate(fechaCon15Dias.getDate() + 15);

  const meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const ddd = String(fechaCon15Dias.getDate()).padStart(2, '0');
  const yyy = String(fechaCon15Dias.getFullYear());

  const correoHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Cotización de Traslado ${cliente}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 100%;
            padding: 30px;
        }

        h3 {
            text-align: end;
        }
        p {
            text-align: justify;

        }
       table {
            font-family: Arial, sans-serif;
            border-collapse: collapse;
            width: 100%;
        }

        th, td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
        }

        tr:nth-child(even) {
            background-color: #f2f2f2;
        }

        th {
            background-color: #011C4D;
            color: white;
        }
    </style>
</head>
<body>
  <img style="background-color: #011C4D; width: 250px; height: 150px;" src="https://www.mtsi.com.mx/_app/immutable/assets/logo.0fc72d3f.svg" alt="logo">
    <h3>Ciudad de México a ${dd} de ${meses[now.getMonth() + 1]} de ${yy}</h3>
    <p>${clientPuesto} ${nameClient} </p>
    <p>Estimado ${nameClient}</p>

    <p>Por medio de la presente nos permitimos poner a su amable consideración nuestra cotización para el traslado Sany Año ${yy}, nueva rodando por su propia tracción.</p>
    
      ${tablaGenerada}

      ${message}

    <p>Esta cotización tiene validez a partir de la fecha de expedición hasta el ${ddd} de ${meses[fechaCon15Dias.getMonth() + 1]} de ${yyy}.</p>

    <p>Sin más por el presente y en espera de vernos favorecidos por su preferencia, me reitero a sus órdenes.</p>

    <p>Atentamente,</p>
      
    
    <p>${nameUser}</p>
    
      <p class="Paragraph SCXW95780569 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow-wrap: break-word; white-space: pre-wrap; font-weight: normal; font-style: normal; vertical-align: baseline; font-kerning: none; background-color: transparent; color: rgb(51, 51, 51); text-align: justify; text-indent: 0px;"><span class="WACImageContainer NoPadding DragDrop BlobObject SCXW95780569 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; position: relative; cursor: move; left: 0px; top: 2px; display: inline-block; text-indent: 0px;"><img class="WACImage SCXW95780569 BCX0" src=${firma} style="padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; border: none; width: 147px; height: 65px; padding-bottom: 16px;; white-space: pre !important;"></span><span class="EOP SCXW95780569 BCX0" data-ccp-props='{"335551550":6,"335551620":6}' style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-size: 10pt; line-height: 16.1875px; font-family: Arial, Arial_EmbeddedFont, Arial_MSFontService, sans-serif; color: rgb(51, 51, 51);">&nbsp;</span></p>
      
    <p>${userPuesto}</p>
</body>
</html>

    `;

  return correoHTML;
}

module.exports = generarCorreoHTML;

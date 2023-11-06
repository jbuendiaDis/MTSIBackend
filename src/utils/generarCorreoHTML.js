const formatAmount = (value) => {
  const mask = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });
  return mask.format(Number(value));
};

function generarTablaHTML(quotesData) {
  let tablaHTML = `
        <table>
            <tr>
                <th>NUM</th>
                <th>ORIGEN</th>
                <th>DESTINO</th>
                <th>MODELO</th>
                <th>Costo Unitario</th>
            </tr>`;

  quotesData.forEach((quote, index) => {
    tablaHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${quote.origen}</td>
                <td>${quote.destino}</td>
                <td>${quote.modelo ? quote.modelo : 'SANY'}</td>
                <td>${formatAmount(quote.costo)}</td>
            </tr>`;
  });

  tablaHTML += `
        </table>`;

  return tablaHTML;
}

function generarCorreoHTML(quotesData) {
  const { cliente, nameClient = 'Erick Botello' } = quotesData;
  const tablaGenerada = generarTablaHTML(quotesData);

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear());

  const fechaCon15Dias = new Date(now); // Crea una nueva fecha basada en la fecha actual
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
  const mmm = String(fechaCon15Dias.getMonth() + 1).padStart(2, '0');
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
    <h3>Ciudad de México a ${dd} de ${meses[mm]} de ${yy}</h3>
    <p>Lic. ${nameClient} </p>
    <p>Estimada ${nameClient}</p>

    <p>Por medio de la presente nos permitimos poner a su amable consideración nuestra cotización para el traslado Sany Año ${yy}, nueva rodando por su propia tracción.</p>
    
      ${tablaGenerada}

    <p>El costo por unidad más I. V. A.</p>

    <p>El traslado incluye Diésel para recorrido, viáticos del operador, Peaje (Viapass), placas de traslado, gastos administrativos y localización GPS.</p>

    <p>Si la unidad sale con bajo nivel de combustible se les notifica por mail para su autorización de diésel extra. El mínimo nivel para salir necesitamos son 10 centímetros.</p>

    <p>En caso no salir la unidad se cobra traslado en falso, se aplica el 40% (cuarenta por ciento) del costo del traslado.</p>

    <p>Si el Distribuidor solicita los servicios del trasladista, o no reciben alguna unidad y se tiene que esperar hasta el próximo día, se cobra una estancia de $1,300.00 (mil trescientos pesos 00/100 M.N).</p>

    <p>Estos precios NO incluyen Seguro de la unidad, Refacciones (bandas, aceite, mangueras), Reparaciones Eléctricas o Mecánicas, Arrastre de grúa.</p>

    <p>La unidad deberá estar asegurada al momento de efectuar el traslado.</p>

    <p>En caso de NO estar asegurada la unidad se puede trasladar bajo su responsabilidad. De surgir cualquier eventualidad, Multi Traslados y Servicios S.A. de C.V. se deslinda de cualquier responsabilidad.</p>

    <p>De ser aceptada la cotización, se solicita depositar el 70% de la misma en Banamex, Sucursal Alberca Olímpica Núm. 563, Cuenta 8497338, Clabe bancaria 002180056384973385 a nombre de Multi Traslados y Servicios, S.A. de C.V. Favor de enviar la ficha y confirmar al Tel.: 01 (55) 56 04 40 10 ext 109 o vía E-mail a asanchez@multitrasladosyservicios.net.</p>

    <p>Esta cotización tiene validez a partir de la fecha de expedición hasta el ${ddd} de ${meses[mmm]} de ${yyy}.</p>

    <p>Sin más por el presente y en espera de vernos favorecidos por su preferencia, me reitero a sus órdenes.</p>

    <p>Atentamente,</p>
    
    <p>Alejandra Sánchez G.</p>
    
      <p class="Paragraph SCXW95780569 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow-wrap: break-word; white-space: pre-wrap; font-weight: normal; font-style: normal; vertical-align: baseline; font-kerning: none; background-color: transparent; color: rgb(51, 51, 51); text-align: justify; text-indent: 0px;"><span class="WACImageContainer NoPadding DragDrop BlobObject SCXW95780569 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; position: relative; cursor: move; left: 0px; top: 2px; display: inline-block; text-indent: 0px;"><img class="WACImage SCXW95780569 BCX0" src="https://azaharaletras.com/wp-content/uploads/2023/03/firma-m-gonzalez-4.jpg.webp" style="padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; border: none; width: 147px; height: 65px; padding-bottom: 16px;; white-space: pre !important;"></span><span class="EOP SCXW95780569 BCX0" data-ccp-props='{"335551550":6,"335551620":6}' style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-size: 10pt; line-height: 16.1875px; font-family: Arial, Arial_EmbeddedFont, Arial_MSFontService, sans-serif; color: rgb(51, 51, 51);">&nbsp;</span></p>
      
    <p>Gerente de Logística.</p>
</body>
</html>

    `;

  return correoHTML;
}

module.exports = generarCorreoHTML;

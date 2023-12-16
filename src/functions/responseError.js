const generateUUID = require('../utils/generateUUID');
const logAuditEvent = require('../utils/auditLogger');

async function responseError(type, errorDescription, res) {

    console.error(errorDescription);

    if (type === 409) {

        const uuid = generateUUID();

        if (errorDescription.name === 'CastError') {
            return res.formatResponse('error', 400, 'ID no válido', []);
        } else {
            logAuditEvent(uuid, errorDescription);
            return res.formatResponse(
                'error',
                409,
                `Algo ocurrió, favor de reportar al área de sistemas con el siguiente folio ${uuid}`,
                errorDescription,
            );
        }
    }

    if (type === 204) {

        const uuid = generateUUID();

        logAuditEvent(uuid, errorDescription);
        return res.formatResponse(
            'ok',
            204,
            `Algo ocurrió, favor de reportar al área de sistemas con el siguiente folio ${uuid}`,
            errorDescription,
        );
    }

    // Agregar este bloque para manejar cualquier otro tipo de error
    logAuditEvent(uuid, errorDescription);
    return res.formatResponse(
        'error',
        500,
        `Algo inesperado ocurrió, favor de reportar al área de sistemas con el siguiente folio ${uuid}`,
        errorDescription,
    );
}

module.exports = responseError;

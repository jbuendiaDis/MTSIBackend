const generateUUID = require('../utils/generateUUID');
const logAuditEvent = require('../utils/auditLogger');

async function responseError(type,errorDescription,res) {

    console.error(errorDescription);

    if(type==409){

        const uuid = generateUUID();


        if (errorDescription.name === 'CastError') {

            res.formatResponse('ok', 204, 'ID no válido', []);

        }else{

            logAuditEvent(uuid, errorDescription);
            res.formatResponse(
            'ok',
            204,
            `Algo ocurrio favor de reportar al area de sistemas con el siguiente folio ${uuid}`,
            errorDescription,
            );
        }

        logAuditEvent(uuid, errorDescription);
        res.formatResponse(
        'ok',
        409,
        `Algo ocurrio favor de reportar al area de sistemas con el siguiente folio ${uuid}`,
        errorDescription,
        );

    }

    if(type==204){

        const uuid = generateUUID();

        logAuditEvent(uuid, errorDescription);
        res.formatResponse(
        'ok',
        204,
        `Algo ocurrio favor de reportar al area de sistemas con el siguiente folio ${uuid}`,
        errorDescription,
        );
 
    }

}


module.exports = responseError;
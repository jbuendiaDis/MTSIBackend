const generateUUID = require('../utils/generateUUID');
const logAuditEvent = require('../utils/auditLogger');

async function responseError(type,error,res) {

    console.error(error);

    if(type==409){

        const uuid = generateUUID();
        const errorDescription = error;
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
        const errorDescription = error;
        logAuditEvent(uuid, errorDescription);
        res.formatResponse(
        'ok',
        204,
        `ssssssssssssssssssssss ${uuid}`,
        errorDescription,
        );

    }
    

}


module.exports = responseError;
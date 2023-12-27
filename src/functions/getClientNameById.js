const UserClient = require('../models/userClient');

const getClientNameById = async (clientId) => {
  try {
    if (!clientId) {
      return null;
    }

    const client = await UserClient.findById(clientId);

    return client ? client.nombreCliente : null;
  } catch (error) {
    throw error;
  }
};

module.exports = getClientNameById;

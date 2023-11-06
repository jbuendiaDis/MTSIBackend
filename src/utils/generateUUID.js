const { v4: uuidv4 } = require('uuid');

function generateUUID() {
  const uuid = uuidv4();
  return uuid;
}

module.exports = generateUUID;

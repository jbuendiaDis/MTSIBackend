// middleware/formatResponse.js

const formatResponse = (req, res, next) => {
  if (res.headersSent) {
    return; // Si ya se ha respondido, no hagas nada
  }
  res.formatResponse = (status, code, message, data) => {
    const response = {
      response: {
        status,
        code,
        message,
      },
      payload: {
        data,
      },
    };

    res.status(200).json(response);
  };
  next();
};

module.exports = formatResponse;

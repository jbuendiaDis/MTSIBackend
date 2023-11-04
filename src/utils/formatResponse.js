// middleware/formatResponse.js
const formatResponse = (req, res, next) => {
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

const jwt = require('jsonwebtoken');

// Middleware para validar y verificar tokens JWT
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) res.status(401).json({ error: 'Acceso denegado' });
  try {
    const verified = jwt.verify(token.split(' ')[1], process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error });
  }
};

module.exports = {
  verifyToken,
};

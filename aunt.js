const jwt = require('jsonwebtoken');

const signToken = (data) => {
  const token = jwt.sign(data, process.env.JWT_KEY, { expiresIn: '1h' });
  return token;
};

const verifyToken = (token) => {
  const data = jwt.verify(token, process.env.JWT_KEY);
  return data;
};

module.exports = { signToken, verifyToken };
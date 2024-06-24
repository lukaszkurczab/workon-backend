const jwt = require('jsonwebtoken');

const secretKey = process.env.SECRET_KEY || ';*Ki$a53O52zfb1G?oFa(lve&J)]r0ID';

const generateAccessToken = user => {
  return jwt.sign({ id: user.id, email: user.email }, secretKey, {
    expiresIn: '2h',
  });
};

const generateRefreshToken = user => {
  return jwt.sign({ id: user.id, email: user.email }, secretKey, {
    expiresIn: '30d',
  });
};

module.exports = { generateAccessToken, generateRefreshToken };

const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY || ';*Ki$a53O52zfb1G?oFa(lve&J)]r0ID';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;

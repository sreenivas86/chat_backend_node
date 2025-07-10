const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // 🔥 Extract only the token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // usually { id: ..., iat: ..., exp: ... }
    next();
  } catch (err) {
    console.error('JWT error:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = protect;

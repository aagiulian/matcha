const jwt = require("jsonwebtoken");

const issuer = "matcha";
const audience = "localhost";

function generateToken({ id, username }) {
  let jwtPayload = {
    id: id,
    role: "user"
  };
  let signOptions = {
    issuer,
    subject: username,
    audience,
    expiresIn: 60 * 60 * 24, // expires in 24 hours
    algorithm: "RS256"
  };
  return jwt.sign(jwtPayload, process.env.JWT_PRIVATE, signOptions);
}

module.exports = {
  generateToken
};

var jwt = require("jsonwebtoken");

const issuer = "matcha";
const audience = "localhost";

function generateToken(user) {
  let jwtPayload = {
    id: user.id,
    role: "user"
  };
  let signOptions = {
    issuer,
    subject: user.username,
    audience,
    expiresIn: 60 * 60 * 24, // expires in 24 hours
    algorithm: "RS256"
  };
  return jwt.sign(jwtPayload, process.env.JWT_PRIVATE, signOptions);
}

module.exports = {
  generateToken
};

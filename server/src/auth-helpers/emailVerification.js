import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const reactAppPort = 30080;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "giuliano.arthur@gmail.com",
    pass: "fyrquvpgysozpyip"
  }
});

function sendMailToken(username, email) {
  jwt.sign(
    {
      username: username
    },
    process.env.JWT_PRIVATE,
    {
      expiresIn: 60 * 60 * 24, // expires in 24 hours
      algorithm: "RS256"
    },
    (err, emailToken) => {
      const url = `http://${process.env.HOST}:${reactAppPort}/verify/${emailToken}`;
      transporter.sendMail({
        to: email,
        subject: "Confirm Email",
        html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`
      });
    }
  );
}
module.exports = {
  sendMailToken
};

import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

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
      const url = `http://localhost:3000/verify/${emailToken}`;
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

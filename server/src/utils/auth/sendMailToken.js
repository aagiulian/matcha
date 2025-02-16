import jwt from "jsonwebtoken";
import transporter from "./mailTransporter";

export default function sendMailToken(username, email) {
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
      const url = `http://${
        process.env.REACT_APP_HOST
      }/verify/${emailToken}`;
      transporter.sendMail({
        to: email,
        subject: "Confirm Email",
        html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`
      });
    }
  );
}

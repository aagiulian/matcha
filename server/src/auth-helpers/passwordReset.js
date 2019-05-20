import { transporter } from "./mailTransporter";

const reactAppPort = 30080;

function resetPasswordEmail({ token, email }) {
  const url = `http://${process.env.REACT_APP_HOST}/resetpassword/${token}`;
  transporter.sendMail({
    to: email,
    subject: "Reset Password",
    html: `Please click this email to confirm reset your password: <a href="${url}">${url}</a>`
  });
}

module.exports = {
  resetPasswordEmail
};

import { transporter } from "./mailTransporter";

const reactAppPort = 30080;

function resetPasswordMail({ token, email }) {
  const url = `http://${
    process.env.HOST
  }:${reactAppPort}/resetpassword/${token}`;
  transporter.sendMail({
    to: email,
    subject: "Reset Password",
    html: `Please click this email to confirm reset your password: <a href="${url}">${url}</a>`
  });
}

module.exports = {
  resetPasswordMail
};

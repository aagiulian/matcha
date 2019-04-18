function resetPasswordMail({ transporter, token, email }) {
  const url = `http://localhost:3000/resetpassword/${token}`;
  transporter.sendMail({
    to: email,
    subject: "Reset Password",
    html: `Please click this email to confirm reset your password: <a href="${url}">${url}</a>`
  });
}

module.exports = {
  resetPasswordMail
};

import nodemailer from "nodemailer";

/*
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "giuliano.arthur@gmail.com",
    pass: "fyrquvpgysozpyip"
  }
});

module.exports = {
  transporter
};
*/

export default const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "giuliano.arthur@gmail.com",
    pass: "fyrquvpgysozpyip"
  }
});

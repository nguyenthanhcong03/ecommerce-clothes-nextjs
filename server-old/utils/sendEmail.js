import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  // const transporter = nodemailer.createTransport({
  //   host: "smtp.gmail.com",
  //   port: 587,
  //   secure: false, // true for port 465, false for other ports
  //   auth: {
  //     user: "maddison53@ethereal.email",
  //     pass: "jn7jnAPss4f63QBp6D",
  //   },
  // });
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);

  // // async..await is not allowed in global scope, must use a wrapper
  // async function main(email, html) {
  //   // send mail with defined transport object
  //   const info = await transporter.sendMail({
  //     from: '"OUTFITORY SHOP" <no-reply@hihi.com>', // sender address
  //     to: email, // list of receivers
  //     subject: "Forgot password", // Subject line
  //     // text: "Hello world?", // plain text body
  //     html: html, // html body
  //   });

  //   return info;
  // }
  // main(email, html).catch(console.error);
};

export { sendEmail };


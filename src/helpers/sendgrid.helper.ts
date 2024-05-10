
import { config } from 'dotenv';
import * as process from "node:process";

const sendEmail = async (email: string, subject: string, html: string) => {
  config();
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  await sgMail.send({
    to: `TrueWatch <${email}>`,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: subject,
    html: html
  })
    .then(response => console.log(response))
    .catch(error => console.error(error));
}

const sendCreatedUser = async (email: string, username: string) => {
  await sendEmail(email, 'Bienvenido a Truewatch', `<p>Hello ${username}, your user has been created</p>`)
}

const sendChangePassword = async (email: string, username: string) => {
  await sendEmail(email, 'Solicitud de cambio de contraseña', `<p>Hello ${username}, your user has been updated</p>`)
}

export { sendCreatedUser, sendChangePassword};

import { config } from 'dotenv';
import * as process from "node:process";

const sendEmail = async (email: string, subject: string, html: string) => {
  config();
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  await sgMail.send({
    to: email,
    from: `TrueWatch <${process.env.SENDGRID_FROM_EMAIL}`,
    subject: subject,
    html: html
  })
    .catch(error => console.error(error));
}

const sendCreatedUser = async (email: string, username: string) => {
  await sendEmail(email, 'Bienvenido a Truewatch', `<p>Hello ${username}, your user has been created</p>`)
}

const sendChangePassword = async (email: string, username: string, jwtToken: string ) => {
  await sendEmail(email, 'Solicitud de cambio de contraseña', `<p>Hola ${username},<br /> Se ha generado una solicitud de cambio de contraseña, para proceder a cambiarla haga click en el <a href="${process.env.FRONTEND_URL}/change-password/${jwtToken}">link</a> </p> <p>El enlace caducará pasados 30minutos.</p>`)
}

export { sendCreatedUser, sendChangePassword};
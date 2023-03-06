import nodemailer from 'nodemailer';
import pug from 'pug';
import { convert } from 'html-to-text';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class Email {
  constructor(user, url) {
    this.url = url;
    this.to = user.email;
    this.from = process.env.EMAIL_FROM;
    this.firstname = user.name.split(' ')[0];
  }

  newTransporter() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        // service: 'Gmail'
        service: 'SendGrid',
        auth: {
          user: process.env.EMAIL_USERNAME_PROD,
          pass: process.env.EMAIL_PASSWORD_PROD,
        },
      });
    }

    return nodemailer.createTransport({
      // service: 'Gmail'
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(template, subject) {
    // 2) Create a html template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      { url: this.url, firstname: this.firstname }
    );

    // 3) Define the Email option
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    // 4) Actually send the email
    await this.newTransporter().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.sendEmail('welcome', 'Welcome to natours');
  }

  async sendForgotPassWord() {
    await this.sendEmail(
      'forgotPassword',
      'Your password reset token (valid for 10 min)'
    );
  }
}

// const sendEmail = async (options) => {
//   // 1) Create a transporter
//   const transporter = nodemailer.createTransport({
//     // service: 'Gmail'
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   // 2) Define the Email option
//   const mailOptions = {
//     from: 'pojungchen8gmail.com',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   // 3) Actually send the email
//   await transporter.sendMail(mailOptions);
// };

const nodemailer = require('nodemailer');
require('dotenv').config();

const EMAIL = process.env.EMAIL;
const PASSWD = process.env.PASSWORD;

// Simple delay to wait files to be created, could be an node watcher...
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendEmail(files) {
    try {
        const date = new Date().toLocaleString();
        const bodyHTML = require('./templateEmail');

        await delay(15000);

        const emails = [
            'daniel.campos@youcast.tv.br',
            'vinicius.okaeda@youcast.tv.br',
            'carlos.salce@youcast.tv.br',
            'alvino.barboza@youcast.tv.br',
            'joao.kentaro@youcast.tv.br',
        ];
        const bodyPlainText = `
        Email enviado automáticamente,
        Segue relatório gerados às ${date}.
        `;

        let transporter = nodemailer.createTransport({
            host: 'smtp.youcast.tv.br',
            port: 587,
            auth: {
                user: EMAIL,
                pass: PASSWD,
            },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: 'noreply2@mail.youcast.tv.br', // sender address
            to: emails, // list of receivers
            subject: 'Relatórios gerados dia 20', // Subject line
            text: bodyPlainText, // plain text body
            html: bodyHTML, // html body
            attachments: files,
        });
    } catch (error) {
        console.log(error);
    }
    // console.log("Message sent: %s", info.messageId);
    // // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // // Preview only available when sending through an Ethereal account
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

// sendEmail().catch(console.error);

module.exports = sendEmail;

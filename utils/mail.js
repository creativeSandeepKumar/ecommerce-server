import { config } from "dotenv";
import Mailgen  from "mailgen";
import nodemailer from "nodemailer";

config();



const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        product: {
            theme: "default",
            name: "ecommerce",
            link: "www.ecommerce.com",
        },
    });

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

    const emailHtml = mailGenerator.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,
        },
    });

    const mail = {
        from: "mailtrap@tutorbe.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    };

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.log("Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file");
        console.log("Error:", error);
    }
};

const emailVerificationMailGenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our ecommerce app! We're very excited to have you on board.",
            action: {
                instructions: "To verify your email click on following button:",
                button: {
                    color: "#22BC66",
                    text: "Verify your email",
                    link: verificationUrl,
                }
            },
            outro: "Need help, or have questions? Just reply to this email, We'd love to help you.",
        }
    }
}


const forgotPasswordMailGenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: "We got a request to reset the password of our account",
            action: {
              instructions:
                "To reset your password click on the following button or link:",
              button: {
                color: "#22BC66", // Optional action button color
                text: "Reset password",
                link: passwordResetUrl,
              },
            },
            outro:
              "Need help, or have questions? Just reply to this email, we'd love to help.",
          },
    }
}

export {
    sendEmail,
    emailVerificationMailGenContent,
    forgotPasswordMailGenContent
}
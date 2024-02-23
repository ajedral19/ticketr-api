import nodemailer from "nodemailer";
import { config } from "dotenv";

const env = config().parsed;
const { EMAIL = "", PASS = "" } = env;

const transforter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL,
        pass: PASS,
    },
});

/**
 *
 * @param {{to: String, subject: String, text: String}} options
 * @returns
 */
const transport = (options) => {
    let result = false;
    const { text, subject, to } = options;
    const mailOptions = {
        from: EMAIL,
        to,
        subject,
        text,
    };

    transforter.sendMail(mailOptions, (error, info) => {
        if (error) {
            // generate a log
            result = true;
        } else {
            result = false;
        }
    });

    return result;
};

/**
 *
 * @param {String} content
 * @param {String} subject
 * @param {String} receiver
 * @returns boolean
 */
export const sendMail = (content, subject, receiver) => {
    const transport_result = transport({
        to: receiver,
        subject,
        text: content,
    });

    return transport_result;
};

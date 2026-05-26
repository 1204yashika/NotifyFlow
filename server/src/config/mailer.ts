import nodemailer from 'nodemailer';
import { env } from './env.js';

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,   // true for port 465, false for 587
  requireTLS: env.SMTP_PORT === 587,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,     // allow self-signed certs in dev
  },
});
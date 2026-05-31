import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

const smtpConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

/** Whether outbound email is actually deliverable (SMTP configured). */
export const emailEnabled = smtpConfigured;

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    })
  : nodemailer.createTransport({ jsonTransport: true });

const mailFrom = env.MAIL_FROM || 'Bestie Paw <no-reply@bestiepaw.com>';

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export const sendMail = async ({ to, subject, html, text }: SendMailInput) => {
  if (!smtpConfigured) {
    logger.warn('SMTP not configured. Skipping email send.');
    return;
  }

  await transporter.sendMail({ from: mailFrom, to, subject, html, text });
};

export const sendVerificationEmail = async (to: string, code: string) => {
  const subject = 'Verify your Bestie Paw email';
  const text = `Your verification code is ${code}. It expires in 10 minutes.`;

  if (!smtpConfigured) {
    logger.warn('SMTP not configured. Skipping verification email send.');
    return;
  }

  await transporter.sendMail({ from: mailFrom, to, subject, text });
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const subject = 'Reset your Bestie Paw password';
  const text = `Use this token to reset your password: ${token}`;

  if (!smtpConfigured) {
    logger.warn('SMTP not configured. Skipping reset email send.');
    return;
  }

  await transporter.sendMail({ from: mailFrom, to, subject, text });
};

export const sendReminderEmail = async (to: string, petName: string, title: string, dueDate: Date) => {
  const subject = `Reminder: ${title}`;
  const text = `Upcoming reminder for ${petName}: ${title} at ${dueDate.toISOString()}.`;

  if (!smtpConfigured) {
    logger.warn('SMTP not configured. Skipping reminder email send.');
    return;
  }

  await transporter.sendMail({ from: mailFrom, to, subject, text });
};

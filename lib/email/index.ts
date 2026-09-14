// Email service abstraction
// Currently uses Nodemailer; swap provider by changing the transport.
import nodemailer from 'nodemailer';

const getTransport = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const transport = getTransport();
  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}

export function credentialEmailHtml(params: {
  studentName: string;
  username: string;
  password: string;
  loginUrl: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1B6B3A; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 20px;">Nizami Islamic Center</h1>
        <p style="color: #E8F5EE; margin: 4px 0 0; font-size: 14px;">& Nizami Education</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #1A1A2E;">Welcome, ${params.studentName}!</h2>
        <p>Your account has been created. Here are your login credentials:</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Username:</strong> ${params.username}</p>
          <p style="margin: 8px 0 0;"><strong>Password:</strong> ${params.password}</p>
        </div>
        <p style="color: #ef4444; font-size: 14px;">⚠️ You will be asked to change this password on first login.</p>
        <a href="${params.loginUrl}" style="display: inline-block; background: #1B6B3A; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Login Now</a>
      </div>
    </div>
  `;
}

import nodemailer from 'nodemailer';
import { InviteEmail } from '@/components/email/InviteEmail';

// Create a transporter using SMTP settings from environment variables
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendLiveInvitationEmail(email: string, projectName: string, inviteUrl: string, inviterName: string) {
    // If SMTP settings are missing, fall back to console logging
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('\n--- 📧 MOCK EMAIL SENT (SMTP SETTINGS MISSING) ---');
        console.log(`To: ${email}`);
        console.log(`Link: ${inviteUrl}`);
        console.log('--- END ---\n');
        return;
    }

    try {
        // Use dynamic import to prevent webpack from leaking server-only dependencies into client chunks
        const { renderToStaticMarkup } = await import('react-dom/server');
        
        const emailHtml = renderToStaticMarkup(
            <InviteEmail projectName={projectName} inviterName={inviterName} inviteUrl={inviteUrl} />
        );

        const mailOptions = {
            from: `"Flow" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Join ${projectName} on Flow`,
            html: emailHtml,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Live email sent to ${email} via Nodemailer`);
    } catch (error) {
        console.error('Nodemailer Error:', error);
    }
}

import { Resend } from 'resend';


export const sendVerificationEmail = async (email: string, token: string) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5170';
    const verificationLink = `${frontendUrl}/verify/${token}`;

    await resend.emails.send({
      from: 'Neuro Match <support@neuro-match.com>', // Or your verified domain email
      to: email,
      subject: 'Verify Your Email ✔',
      html: `
        <h2>Welcome to Neuro Match!</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>If you didn't create this account, you can ignore this email.</p>
      `,
    });

    console.log('✅ Verification email sent successfully');
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

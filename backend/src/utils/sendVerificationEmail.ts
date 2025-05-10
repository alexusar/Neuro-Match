import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Use the frontend URL from environment variables, fallback to localhost
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5170';
    const verificationLink = `${frontendUrl}/verify-email/${token}`;

    await transporter.sendMail({
      from: `"Neuro-Match App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email ✔',
      html: `
        <h2>Welcome to Neuro-Match!</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>If you didn't create this account, please ignore this email.</p>
      `,
    });

    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};



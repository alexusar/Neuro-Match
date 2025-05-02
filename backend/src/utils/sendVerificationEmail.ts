import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verificationLink = `/api/auth/verify/${token}`; // Update port if different

  await transporter.sendMail({
    from: `"Neuro-Match App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email ✔',
    html: `
      <h2>Welcome to Neuro-Match!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}">${verificationLink}</a>
    `,
  });
};



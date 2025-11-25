import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { name, email, phone, message } = await request.json();

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email to YOU (the business owner)
    const mailToYou = {
      from: `"${name} via Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      replyTo: `"${name}" <${email}>`, // When you hit reply, it goes to the user
      subject: `🔔 New Contact: ${name} - ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #f97316; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📧 New Contact Form Message</h1>
          </div>
          
          <!-- Sender Info Box -->
          <div style="background-color: #fff7ed; padding: 25px; margin: 20px;">
            <h2 style="color: #f97316; margin: 0 0 15px 0; font-size: 20px;">👤 Sender Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #78716c; font-weight: bold; width: 100px;">Name:</td>
                <td style="padding: 8px 0; color: #292524; font-size: 16px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #78716c; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0;">
                  <a href="mailto:${email}" style="color: #f97316; text-decoration: none; font-weight: 600;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #78716c; font-weight: bold;">Phone:</td>
                <td style="padding: 8px 0; color: #292524;">
                  ${phone ? `<a href="tel:${phone}" style="color: #f97316; text-decoration: none;">${phone}</a>` : 'Not provided'}
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Message Box -->
          <div style="background-color: #ffffff; padding: 25px; margin: 0 20px 20px 20px; border-left: 4px solid #f97316; border-radius: 8px;">
            <h3 style="color: #292524; margin-top: 0; font-size: 18px;">💬 Message:</h3>
            <p style="color: #57534e; line-height: 1.8; font-size: 15px; white-space: pre-wrap;">${message}</p>
          </div>
          
          <!-- Quick Action Buttons -->
          <div style="padding: 20px; text-align: center; background-color: #fafaf9;">
            <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px;">
              📧 Reply via Email
            </a>
            ${phone ? `
            <a href="tel:${phone}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px;">
              📞 Call Now
            </a>
            ` : ''}
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f5f5f4; padding: 15px; text-align: center; color: #78716c; font-size: 12px;">
            <p style="margin: 5px 0;">Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            <p style="margin: 5px 0;">This email was sent from your website contact form</p>
          </div>
        </div>
      `,
    };

    // Auto-reply email to the USER (optional but professional)
    const mailToUser = {
      from: `"Colonel Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '✅ We received your message - Colonel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #f97316; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Message Received!</h1>
          </div>
          
          <!-- Body -->
          <div style="padding: 30px; background-color: white;">
            <p style="color: #292524; font-size: 16px; line-height: 1.6;">Hi <strong>${name}</strong>,</p>
            
            <p style="color: #57534e; font-size: 15px; line-height: 1.6;">
              Thank you for contacting us! We've received your message and will get back to you as soon as possible.
            </p>
            
            <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
              <h3 style="color: #f97316; margin-top: 0; font-size: 16px;">📋 Your Message:</h3>
              <p style="color: #57534e; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
            
            <p style="color: #57534e; font-size: 15px; line-height: 1.6;">
              If you have any urgent concerns, feel free to reach out to us directly at:
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <p style="margin: 10px 0;">
                📧 <a href="mailto:contact@colonel.com" style="color: #f97316; text-decoration: none; font-weight: bold;">contact@colonel.com</a>
              </p>
              <p style="margin: 10px 0;">
                📞 <a href="tel:+919876543210" style="color: #f97316; text-decoration: none; font-weight: bold;">+91 98765 43210</a>
              </p>
            </div>
            
            <p style="color: #78716c; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              Best regards,<br>
              <strong style="color: #292524;">The Colonel Team</strong>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f5f5f4; padding: 15px; text-align: center; color: #78716c; font-size: 12px;">
            <p style="margin: 5px 0;">This is an automated response. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    // Send both emails
    await transporter.sendMail(mailToYou);
    await transporter.sendMail(mailToUser);

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { name, email, phone, organization, preferredDate, message, serviceName, serviceId } = await request.json();

    // Validate input
    if (!name || !email || !phone || !message || !serviceName) {
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

    // Get service icon emoji
    const serviceEmojis = {
      1: '🎤', // Talk/Seminar
      2: '👨‍🏫', // Mentorship
      3: '🎯', // Strategic Consultation
    };
    const serviceEmoji = serviceEmojis[serviceId] || '📋';

    // Format the date nicely
    const formattedDate = preferredDate 
      ? new Date(preferredDate).toLocaleDateString('en-IN', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'Not specified';

    // Email to YOU (the business owner) - SERVICE BOOKING
    const mailToYou = {
      from: `"${name} - Service Booking" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      replyTo: `"${name}" <${email}>`,
      subject: `${serviceEmoji} SERVICE BOOKING: ${serviceName} - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 3px solid #f97316; border-radius: 16px; overflow: hidden;">
          <!-- Header with Service Badge -->
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 30px; text-align: center; position: relative;">
            <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 8px 20px; border-radius: 20px; margin-bottom: 15px;">
              <span style="color: white; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Service Booking Request</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 900;">${serviceEmoji} ${serviceName}</h1>
          </div>
          
          <!-- Service Info Banner -->
          <div style="background: linear-gradient(90deg, #fff7ed 0%, #ffedd5 100%); padding: 20px 30px; border-bottom: 2px solid #fed7aa;">
            <div style="display: flex; align-items: center; gap: 15px;">
              <div style="background: #f97316; color: white; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">
                ${serviceEmoji}
              </div>
              <div>
                <div style="color: #9a3412; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Booking Request For</div>
                <div style="color: #7c2d12; font-size: 18px; font-weight: bold;">${serviceName}</div>
              </div>
            </div>
          </div>
          
          <!-- Client Information -->
          <div style="background-color: #ffffff; padding: 30px;">
            <h2 style="color: #f97316; margin: 0 0 20px 0; font-size: 22px; border-bottom: 2px solid #fed7aa; padding-bottom: 10px;">
              👤 Client Information
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; color: #78716c; font-weight: bold; width: 150px; vertical-align: top;">Name:</td>
                <td style="padding: 12px 0; color: #292524; font-size: 16px; font-weight: 600;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #78716c; font-weight: bold; vertical-align: top;">Email:</td>
                <td style="padding: 12px 0;">
                  <a href="mailto:${email}" style="color: #f97316; text-decoration: none; font-weight: 600; background: #fff7ed; padding: 6px 12px; border-radius: 6px; display: inline-block;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #78716c; font-weight: bold; vertical-align: top;">Phone:</td>
                <td style="padding: 12px 0;">
                  <a href="tel:${phone}" style="color: #f97316; text-decoration: none; font-weight: 600; background: #fff7ed; padding: 6px 12px; border-radius: 6px; display: inline-block;">${phone}</a>
                </td>
              </tr>
              ${organization ? `
              <tr>
                <td style="padding: 12px 0; color: #78716c; font-weight: bold; vertical-align: top;">Organization:</td>
                <td style="padding: 12px 0; color: #292524; font-size: 16px; font-weight: 600;">${organization}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 12px 0; color: #78716c; font-weight: bold; vertical-align: top;">Preferred Date:</td>
                <td style="padding: 12px 0; color: #292524; font-size: 16px;">
                  <span style="background: #dcfce7; color: #166534; padding: 6px 12px; border-radius: 6px; display: inline-block; font-weight: 600;">
                    📅 ${formattedDate}
                  </span>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Requirements/Message -->
          <div style="background-color: #fafaf9; padding: 30px; border-top: 2px solid #f5f5f4;">
            <h3 style="color: #292524; margin-top: 0; font-size: 18px; display: flex; align-items: center; gap: 8px;">
              <span style="background: #f97316; color: white; width: 32px; height: 32px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 16px;">📝</span>
              Client Requirements & Details
            </h3>
            <div style="background: white; padding: 20px; border-radius: 12px; border-left: 4px solid #f97316;">
              <p style="color: #57534e; line-height: 1.8; font-size: 15px; white-space: pre-wrap; margin: 0;">${message}</p>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div style="padding: 30px; text-align: center; background: linear-gradient(90deg, #fff7ed 0%, #ffedd5 100%); border-top: 2px solid #fed7aa;">
            <p style="color: #9a3412; margin: 0 0 20px 0; font-weight: bold;">Quick Actions</p>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
              <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.3);">
                📧 Reply to Client
              </a>
              <a href="tel:${phone}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                📞 Call Client
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #292524; padding: 20px; text-align: center; color: #a8a29e;">
            <p style="margin: 5px 0; font-size: 13px;">
              <strong style="color: #f97316;">Booking Received:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </p>
            <p style="margin: 5px 0; font-size: 12px;">This is a service booking request from your website</p>
          </div>
        </div>
      `,
    };

    // Confirmation email to the CLIENT
    const mailToClient = {
      from: `"Colonel - Service Booking" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ Booking Confirmed: ${serviceName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #f97316; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 30px; text-align: center;">
            <div style="background: white; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 8px 16px rgba(0,0,0,0.2);">
              <span style="font-size: 40px;">${serviceEmoji}</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 900;">Booking Confirmed!</h1>
            <p style="color: #fed7aa; margin: 10px 0 0 0; font-size: 16px;">We've received your booking request</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 40px 30px; background-color: white;">
            <p style="color: #292524; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Hi <strong style="color: #f97316;">${name}</strong>,
            </p>
            
            <p style="color: #57534e; font-size: 15px; line-height: 1.7;">
              Thank you for your interest in booking <strong>${serviceName}</strong>! We've received your request and our team will review the details shortly.
            </p>
            
            <!-- Booking Summary -->
            <div style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f97316;">
              <h3 style="color: #f97316; margin-top: 0; font-size: 18px; margin-bottom: 15px;">📋 Booking Summary</h3>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; color: #78716c; font-size: 14px;">Service:</td>
                  <td style="padding: 8px 0; color: #292524; font-weight: bold; text-align: right;">${serviceName}</td>
                </tr>
                ${preferredDate ? `
                <tr>
                  <td style="padding: 8px 0; color: #78716c; font-size: 14px;">Preferred Date:</td>
                  <td style="padding: 8px 0; color: #292524; font-weight: bold; text-align: right;">${formattedDate}</td>
                </tr>
                ` : ''}
                ${organization ? `
                <tr>
                  <td style="padding: 8px 0; color: #78716c; font-size: 14px;">Organization:</td>
                  <td style="padding: 8px 0; color: #292524; font-weight: bold; text-align: right;">${organization}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <!-- What's Next -->
            <div style="background: #fafaf9; padding: 20px; border-radius: 12px; margin: 25px 0;">
              <h4 style="color: #292524; margin: 0 0 15px 0; font-size: 16px;">⏭️ What Happens Next?</h4>
              <ol style="color: #57534e; line-height: 1.8; padding-left: 20px; margin: 0;">
                <li style="margin-bottom: 8px;">Our team will review your booking details</li>
                <li style="margin-bottom: 8px;">We'll contact you within 24-48 hours</li>
                <li style="margin-bottom: 8px;">We'll discuss and finalize the arrangements</li>
                <li>Confirm the booking and schedule</li>
              </ol>
            </div>
            
            <p style="color: #57534e; font-size: 15px; line-height: 1.7;">
              If you have any immediate questions or need to make changes, feel free to reach out:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="margin-bottom: 15px;">
                <a href="mailto:contact@colonel.com" style="color: #f97316; text-decoration: none; font-weight: bold; font-size: 16px;">
                  📧 contact@colonel.com
                </a>
              </div>
              <div>
                <a href="tel:+919876543210" style="color: #f97316; text-decoration: none; font-weight: bold; font-size: 16px;">
                  📞 +91 98765 43210
                </a>
              </div>
            </div>
            
            <p style="color: #78716c; font-size: 14px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e7e5e4;">
              Best regards,<br>
              <strong style="color: #292524;">The Colonel Team</strong>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #292524; padding: 20px; text-align: center; color: #a8a29e; font-size: 12px;">
            <p style="margin: 5px 0;">This is an automated confirmation email</p>
            <p style="margin: 5px 0;">Booking ID: #${Date.now()}</p>
          </div>
        </div>
      `,
    };

    // Send both emails
    await transporter.sendMail(mailToYou);
    await transporter.sendMail(mailToClient);

    return NextResponse.json(
      { message: 'Booking request sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Booking email error:', error);
    return NextResponse.json(
      { error: 'Failed to process booking', details: error.message },
      { status: 500 }
    );
  }
}
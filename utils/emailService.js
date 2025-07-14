const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send property notification email
const sendPropertyNotificationEmail = async ({ propertyData, ownerEmail, ownerName }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'admin@vasaiproperties.com',
      cc: ownerEmail,
      subject: 'New Property Listing Submitted - Vasai Properties',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
          <div style="background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🏠 New Property Submission</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">A new property has been submitted for listing on Vasai Properties</p>
          </div>
          
          <div style="padding: 30px; background: white; margin: 0;">
            <h2 style="color: #16a34a; margin-bottom: 20px; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">Property Details</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr style="background: #f8fafc;">
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Title:</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1f2937;">${propertyData.title}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Type:</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1f2937; text-transform: capitalize;">${propertyData.type}</td>
              </tr>
              <tr style="background: #f8fafc;">
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">BHK:</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1f2937;">${propertyData.bhk} BHK</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Bathrooms:</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1f2937;">${propertyData.bathrooms}</td>
              </tr>
              <tr style="background: #f8fafc;">
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Area:</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1f2937;">${propertyData.area} sq ft</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Price:</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; color: #16a34a; font-weight: bold; font-size: 18px;">₹${propertyData.price.toLocaleString()}</td>
              </tr>
              <tr style="background: #f8fafc;">
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Location:</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1f2937;">${propertyData.location}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Status:</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1f2937; text-transform: capitalize;">For ${propertyData.status}</td>
              </tr>
            </table>
            
            <h3 style="color: #16a34a; margin-top: 25px; margin-bottom: 15px;">Description</h3>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin-bottom: 25px;">
              <p style="margin: 0; color: #374151; line-height: 1.6;">${propertyData.description}</p>
            </div>
            
            <h3 style="color: #16a34a; margin-bottom: 15px;">Owner Information</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr style="background: #f8fafc;">
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Name:</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1f2937;">${ownerName}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Email:</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1f2937;">${ownerEmail}</td>
              </tr>
              <tr style="background: #f8fafc;">
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Phone:</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1f2937;">${propertyData.ownerPhone}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #16a34a; color: white; padding: 25px; text-align: center; border-radius: 0 0 10px 10px;">
            <h3 style="margin: 0 0 10px 0;">Next Steps</h3>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Please review this property listing and approve it to make it live on the website.</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
              <p style="margin: 0; font-size: 14px; font-weight: bold;">Vasai Properties Team</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Making property dreams come true</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    // Send confirmation email to property owner
    const ownerConfirmation = {
      from: process.env.EMAIL_USER,
      to: ownerEmail,
      subject: 'Property Listing Submitted Successfully - Vasai Properties',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
          <div style="background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Property Submitted Successfully!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for choosing Vasai Properties</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${ownerName},</p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Your property "<strong>${propertyData.title}</strong>" has been successfully submitted to Vasai Properties. 
              Our team will review your listing and it will be live on our website soon.
            </p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 20px 0;">
              <h3 style="color: #16a34a; margin: 0 0 10px 0;">What happens next?</h3>
              <ul style="color: #374151; margin: 0; padding-left: 20px;">
                <li>Our team will verify your property details</li>
                <li>Your listing will be live within 24 hours</li>
                <li>Interested buyers/tenants will contact you directly</li>
                <li>We'll send you updates about inquiries</li>
              </ul>
            </div>
            
            <p style="color: #374151; line-height: 1.6;">
              If you have any questions or need to make changes to your listing, please contact us at 
              <a href="tel:+919876543210" style="color: #16a34a; text-decoration: none;">+91 9876543210</a> or 
              <a href="mailto:info@vasaiproperties.com" style="color: #16a34a; text-decoration: none;">info@vasaiproperties.com</a>
            </p>
          </div>
          
          <div style="background: #16a34a; color: white; padding: 25px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0; font-size: 14px; font-weight: bold;">Vasai Properties Team</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Your trusted real estate partner</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(ownerConfirmation);

    return { success: true, message: 'Property notification emails sent successfully' };

  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
};

// Send inquiry email
const sendInquiryEmail = async ({ propertyTitle, inquirerData, ownerEmail, ownerName }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: ownerEmail,
      subject: `New Inquiry for "${propertyTitle}" - Vasai Properties`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">💬 New Property Inquiry</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Someone is interested in your property!</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${ownerName},</p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              You have received a new inquiry for your property "<strong>${propertyTitle}</strong>" through Vasai Properties.
            </p>
            
            <h3 style="color: #2563eb; margin-bottom: 15px; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Inquirer Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr style="background: #f8fafc;">
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Name:</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1f2937;">${inquirerData.name}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Email:</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1f2937;">
                  <a href="mailto:${inquirerData.email}" style="color: #2563eb; text-decoration: none;">${inquirerData.email}</a>
                </td>
              </tr>
              <tr style="background: #f8fafc;">
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Phone:</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1f2937;">
                  <a href="tel:${inquirerData.phone}" style="color: #2563eb; text-decoration: none;">${inquirerData.phone}</a>
                </td>
              </tr>
            </table>
            
            <h3 style="color: #2563eb; margin-bottom: 15px;">Message</h3>
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin-bottom: 25px;">
              <p style="margin: 0; color: #374151; line-height: 1.6;">${inquirerData.message}</p>
            </div>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a;">
              <h4 style="color: #16a34a; margin: 0 0 10px 0;">Recommended Next Steps:</h4>
              <ul style="color: #374151; margin: 0; padding-left: 20px;">
                <li>Contact the inquirer directly via phone or email</li>
                <li>Schedule a property viewing if they're interested</li>
                <li>Provide additional details they might need</li>
                <li>Keep us updated on the progress</li>
              </ul>
            </div>
          </div>
          
          <div style="background: #2563eb; color: white; padding: 25px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0 0 10px 0; font-size: 16px;">Please contact the inquirer directly to discuss further.</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
              <p style="margin: 0; font-size: 14px; font-weight: bold;">Vasai Properties Team</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Connecting property dreams</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Inquiry email sent successfully' };

  } catch (error) {
    console.error('Inquiry email service error:', error);
    throw error;
  }
};

module.exports = {
  sendPropertyNotificationEmail,
  sendInquiryEmail
};
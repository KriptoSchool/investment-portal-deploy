// Email notification service for Aaron M LLP
// This is a simple implementation - in production, integrate with services like:
// - SendGrid, Mailgun, AWS SES, or Resend

interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface ApprovalEmailData {
  applicantName: string;
  email: string;
  temporaryPassword: string;
  agentId: string;
  loginUrl: string;
}

interface RejectionEmailData {
  applicantName: string;
  email: string;
}

// Generate approval email template
export function generateApprovalEmail(data: ApprovalEmailData): EmailTemplate {
  const { applicantName, email, temporaryPassword, agentId, loginUrl } = data;
  
  const subject = 'Welcome to Aaron M LLP - Your Application Has Been Approved!';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Aaron M LLP</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2EE6A6, #3EA8FF); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 20px 0; }
        .credentials { background-color: #f8f9fa; border: 2px solid #2EE6A6; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .credential-item { margin: 10px 0; }
        .credential-label { font-weight: bold; color: #2EE6A6; }
        .credential-value { font-family: 'Courier New', monospace; background-color: #e9ecef; padding: 5px 10px; border-radius: 4px; display: inline-block; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #2EE6A6, #3EA8FF); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Aaron M LLP!</h1>
          <p>Your consultant application has been approved</p>
        </div>
        
        <div class="content">
          <p>Dear <strong>${applicantName}</strong>,</p>
          
          <p>Congratulations! We are pleased to inform you that your consultant application has been <strong>approved</strong>. Welcome to the Aaron M LLP family!</p>
          
          <div class="credentials">
            <h3 style="color: #2EE6A6; margin-top: 0;">🔐 Your Login Credentials</h3>
            
            <div class="credential-item">
              <span class="credential-label">📧 Email:</span><br>
              <span class="credential-value">${email}</span>
            </div>
            
            <div class="credential-item">
              <span class="credential-label">🔑 Temporary Password:</span><br>
              <span class="credential-value">${temporaryPassword}</span>
            </div>
            
            <div class="credential-item">
              <span class="credential-label">🆔 Agent ID:</span><br>
              <span class="credential-value">${agentId}</span>
            </div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important Security Notice:</strong><br>
            Please change your password immediately after your first login for security purposes.
          </div>
          
          <p style="text-align: center;">
            <a href="${loginUrl}" class="cta-button">🚀 Access Your Dashboard</a>
          </p>
          
          <h3>📋 Next Steps:</h3>
          <ol>
            <li><strong>Login:</strong> Use the credentials above to access your dashboard</li>
            <li><strong>Change Password:</strong> Update your password on first login</li>
            <li><strong>Complete Profile:</strong> Fill in any remaining profile information</li>
            <li><strong>Start Earning:</strong> Begin building your client network and earning commissions</li>
          </ol>
          
          <h3>💰 Commission Structure:</h3>
          <ul>
            <li><strong>2% Passive Commission:</strong> Ongoing quarterly earnings</li>
            <li><strong>10% One-off Commission:</strong> Initial investment bonus</li>
            <li><strong>Hierarchical Bonuses:</strong> Additional earnings from team performance</li>
          </ul>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>We look forward to a successful partnership!</p>
          
          <p>Best regards,<br>
          <strong>Aaron M LLP Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© 2024 Aaron M LLP. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Welcome to Aaron M LLP!
    
    Dear ${applicantName},
    
    Congratulations! Your consultant application has been approved.
    
    Your Login Credentials:
    Email: ${email}
    Temporary Password: ${temporaryPassword}
    Agent ID: ${agentId}
    
    Login URL: ${loginUrl}
    
    IMPORTANT: Please change your password immediately after your first login.
    
    Next Steps:
    1. Login using the credentials above
    2. Change your password on first login
    3. Complete your profile information
    4. Start building your client network
    
    Commission Structure:
    - 2% Passive Commission (ongoing quarterly)
    - 10% One-off Commission (initial investment bonus)
    - Hierarchical Bonuses (team performance)
    
    Welcome to the Aaron M LLP family!
    
    Best regards,
    Aaron M LLP Team
  `;
  
  return { to: email, subject, html, text };
}

// Generate rejection email template
export function generateRejectionEmail(data: RejectionEmailData): EmailTemplate {
  const { applicantName, email } = data;
  
  const subject = 'Aaron M LLP - Application Status Update';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Status Update</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #6c757d, #495057); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 20px 0; }
        .info-box { background-color: #f8f9fa; border-left: 4px solid #6c757d; padding: 20px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Status Update</h1>
          <p>Aaron M LLP Consultant Application</p>
        </div>
        
        <div class="content">
          <p>Dear <strong>${applicantName}</strong>,</p>
          
          <p>Thank you for your interest in joining Aaron M LLP as a consultant.</p>
          
          <p>After careful review of your application, we regret to inform you that we are unable to proceed with your application at this time.</p>
          
          <div class="info-box">
            <p><strong>Future Opportunities:</strong></p>
            <p>We encourage you to reapply after 6 months. During this time, you may wish to gain additional experience in sales, marketing, or financial services.</p>
          </div>
          
          <p>We appreciate the time and effort you invested in your application and wish you success in your future endeavors.</p>
          
          <p>If you have any questions, please feel free to contact our HR team.</p>
          
          <p>Best regards,<br>
          <strong>Aaron M LLP Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© 2024 Aaron M LLP. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Application Status Update
    
    Dear ${applicantName},
    
    Thank you for your interest in joining Aaron M LLP as a consultant.
    
    After careful review of your application, we regret to inform you that we are unable to proceed with your application at this time.
    
    Future Opportunities:
    We encourage you to reapply after 6 months. During this time, you may wish to gain additional experience in sales, marketing, or financial services.
    
    We appreciate the time and effort you invested in your application and wish you success in your future endeavors.
    
    Best regards,
    Aaron M LLP Team
  `;
  
  return { to: email, subject, html, text };
}

// Send email function (mock implementation)
// In production, replace this with actual email service integration
export async function sendEmail(emailData: EmailTemplate): Promise<boolean> {
  try {
    // Mock email sending - in production, integrate with:
    // - SendGrid: https://sendgrid.com/
    // - Mailgun: https://www.mailgun.com/
    // - AWS SES: https://aws.amazon.com/ses/
    // - Resend: https://resend.com/
    
    console.log('📧 EMAIL SENT (Mock):', {
      to: emailData.to,
      subject: emailData.subject,
      timestamp: new Date().toISOString()
    });
    
    console.log('📄 Email Content Preview:');
    console.log('Subject:', emailData.subject);
    console.log('To:', emailData.to);
    console.log('Text Content:', emailData.text.substring(0, 200) + '...');
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
}

// Helper function to send approval email
export async function sendApprovalEmail(data: ApprovalEmailData): Promise<boolean> {
  const emailTemplate = generateApprovalEmail(data);
  return await sendEmail(emailTemplate);
}

// Helper function to send rejection email
export async function sendRejectionEmail(data: RejectionEmailData): Promise<boolean> {
  const emailTemplate = generateRejectionEmail(data);
  return await sendEmail(emailTemplate);
}
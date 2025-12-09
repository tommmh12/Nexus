import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USER?.trim();
    // Remove quotes if present and trim
    const smtpPassword = process.env.SMTP_PASSWORD?.replace(/^["']|["']$/g, "").trim();

    console.log("🔍 SMTP Config Check:", {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser ? "✅ Set" : "❌ Missing",
      password: smtpPassword ? "✅ Set" : "❌ Missing",
    });

    if (!smtpUser || !smtpPassword) {
      console.warn("⚠️  SMTP credentials not configured. Email service will be disabled.");
      console.warn("   Please check SMTP_USER and SMTP_PASSWORD in .env file");
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    console.log("✅ Email service initialized");
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.error("❌ Email service not initialized. Check SMTP configuration.");
      return false;
    }

    try {
      const mailOptions = {
        from: `"Nexus System" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("✅ Email sent:", info.messageId);
      return true;
    } catch (error) {
      console.error("❌ Error sending email:", error);
      return false;
    }
  }

  // Gửi email tài khoản mới cho nhân viên
  async sendNewAccountEmail(
    to: string,
    fullName: string,
    employeeId: string,
    email: string,
    temporaryPassword: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .credentials { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffc107; }
          .credentials strong { color: #856404; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Chào mừng đến với Nexus!</h1>
          </div>
          <div class="content">
            <p>Xin chào <strong>${fullName}</strong>,</p>
            
            <p>Tài khoản của bạn đã được tạo thành công trên hệ thống Nexus. Dưới đây là thông tin đăng nhập của bạn:</p>
            
            <div class="credentials">
              <p><strong>Email đăng nhập:</strong> ${email}</p>
              <p><strong>Mã nhân viên:</strong> ${employeeId}</p>
              <p><strong>Mật khẩu tạm:</strong> ${temporaryPassword}</p>
            </div>
            
            <div class="info-box">
              <p><strong>⚠️ Lưu ý quan trọng:</strong></p>
              <ul>
                <li>Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu</li>
                <li>Không chia sẻ thông tin đăng nhập với người khác</li>
                <li>Mật khẩu tạm chỉ có hiệu lực trong thời gian ngắn</li>
              </ul>
            </div>
            
            <p>Bạn có thể đăng nhập tại: <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}">${process.env.FRONTEND_URL || "http://localhost:3000"}</a></p>
            
            <div class="footer">
              <p>Trân trọng,<br>Đội ngũ Nexus</p>
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to,
      subject: `[Nexus] Thông tin tài khoản mới - ${employeeId}`,
      html,
    });
  }

  // Gửi email cấp lại mật khẩu
  async sendResetPasswordEmail(
    to: string,
    fullName: string,
    employeeId: string,
    newPassword: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffc107; }
          .credentials strong { color: #856404; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Mật khẩu đã được cấp lại</h1>
          </div>
          <div class="content">
            <p>Xin chào <strong>${fullName}</strong>,</p>
            
            <p>Mật khẩu của bạn đã được cấp lại bởi quản trị viên hệ thống.</p>
            
            <div class="credentials">
              <p><strong>Mã nhân viên:</strong> ${employeeId}</p>
              <p><strong>Mật khẩu mới:</strong> ${newPassword}</p>
            </div>
            
            <p><strong>⚠️ Vui lòng đổi mật khẩu ngay sau khi đăng nhập để bảo mật tài khoản.</strong></p>
            
            <p>Bạn có thể đăng nhập tại: <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}">${process.env.FRONTEND_URL || "http://localhost:3000"}</a></p>
            
            <div class="footer">
              <p>Trân trọng,<br>Đội ngũ Nexus</p>
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to,
      subject: `[Nexus] Mật khẩu mới - ${employeeId}`,
      html,
    });
  }

  // Gửi email thông báo chung
  async sendNotificationEmail(
    to: string | string[],
    subject: string,
    content: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thông báo từ Nexus</h1>
          </div>
          <div class="content">
            ${content}
            <div class="footer">
              <p>Trân trọng,<br>Đội ngũ Nexus</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const recipients = Array.isArray(to) ? to.join(", ") : to;
    return await this.sendEmail({
      to: recipients,
      subject: `[Nexus] ${subject}`,
      html,
    });
  }
}

export const emailService = new EmailService();


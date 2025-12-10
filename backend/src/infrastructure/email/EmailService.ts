import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private transporter: Transporter | null = null;
  private config: EmailConfig | null = null;
  private enabled: boolean = false;

  constructor() {
    // Try to load from environment variables
    this.loadFromEnv();
  }

  private loadFromEnv() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;

    if (host && port && user && password) {
      this.configure({
        host,
        port: parseInt(port),
        secure: port === "465",
        user,
        password,
      });
      this.enabled = process.env.SMTP_ENABLED === "true";
    }
  }

  configure(config: EmailConfig) {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled && this.transporter !== null;
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    if (!this.isEnabled()) {
      console.log(
        "📧 Email service is disabled. Email not sent:",
        options.subject
      );
      return false;
    }

    if (!this.transporter) {
      throw new Error("Email service not configured");
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.config?.user,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      console.log("✅ Email sent successfully:", info.messageId);
      return true;
    } catch (error) {
      console.error("❌ Failed to send email:", error);
      throw error;
    }
  }

  async sendWelcomeEmail(
    email: string,
    fullName: string,
    employeeId: string,
    password: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .credentials { background-color: #fff; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; }
          .footer { background-color: #1f2937; color: #9ca3af; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
          .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Chào mừng đến với Nexus!</h1>
          </div>
          <div class="content">
            <h2>Xin chào ${fullName},</h2>
            <p>Tài khoản của bạn đã được tạo thành công trong hệ thống quản lý nội bộ Nexus.</p>
            
            <div class="credentials">
              <h3 style="margin-top: 0;">🔐 Thông tin đăng nhập của bạn:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Mã nhân viên:</strong> ${employeeId}</p>
              <p><strong>Mật khẩu tạm thời:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
            </div>

            <p><strong>⚠️ Lưu ý quan trọng:</strong></p>
            <ul>
              <li>Vui lòng <strong>đổi mật khẩu</strong> ngay sau lần đăng nhập đầu tiên</li>
              <li>Không chia sẻ thông tin đăng nhập với bất kỳ ai</li>
              <li>Hệ thống sẽ yêu cầu bạn thay đổi mật khẩu khi đăng nhập lần đầu</li>
            </ul>

            <a href="${
              process.env.FRONTEND_URL || "http://localhost:3000"
            }/login" class="button">
              Đăng nhập ngay
            </a>

            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với bộ phận IT.</p>
            <p>Chúc bạn làm việc hiệu quả!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Nexus. All rights reserved.</p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: "🎉 Chào mừng đến với Nexus - Thông tin tài khoản",
      html,
      text: `Xin chào ${fullName},\n\nTài khoản của bạn đã được tạo thành công.\n\nEmail: ${email}\nMã nhân viên: ${employeeId}\nMật khẩu tạm thời: ${password}\n\nVui lòng đổi mật khẩu sau khi đăng nhập lần đầu.`,
    });
  }

  getConfig(): EmailConfig | null {
    return this.config;
  }
}

// Singleton instance
export const emailService = new EmailService();

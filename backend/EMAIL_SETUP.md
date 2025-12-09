# Email Setup Guide

## Cấu hình SMTP cho Gmail

### Bước 1: Tạo App Password

1. Đăng nhập vào Google Account: https://myaccount.google.com
2. Bật **2-Step Verification** (nếu chưa bật)
3. Truy cập: https://myaccount.google.com/apppasswords
4. Chọn:
   - **App**: Mail
   - **Device**: Other (Custom name) → Nhập "Nexus System"
5. Click **Generate**
6. Copy App Password (16 ký tự, có khoảng trắng, ví dụ: `slga nnls kwuf ytoy`)

### Bước 2: Tạo file .env

Tạo file `.env` trong thư mục `backend/` với nội dung:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=phamnhathuy041@gmail.com
SMTP_PASSWORD=slga nnls kwuf ytoy

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

### Bước 3: Test Email Service

Khởi động backend và kiểm tra console log:
- ✅ "Email service initialized" - SMTP đã được cấu hình đúng
- ⚠️ "SMTP credentials not configured" - Cần kiểm tra lại .env

## Các tính năng gửi email

1. **Tạo nhân viên mới**: Tự động gửi email với thông tin tài khoản và mật khẩu tạm
2. **Cấp lại mật khẩu**: Gửi email với mật khẩu mới khi admin reset password
3. **Thông báo công ty**: Có thể sử dụng `emailService.sendNotificationEmail()` để gửi thông báo

## Troubleshooting

### Lỗi: "Invalid login"
- Kiểm tra App Password đã được copy đúng (bao gồm khoảng trắng)
- Đảm bảo 2-Step Verification đã được bật

### Lỗi: "Connection timeout"
- Kiểm tra firewall không chặn port 587
- Thử đổi SMTP_PORT=465 và secure=true

### Email không được gửi
- Kiểm tra console log để xem lỗi chi tiết
- Đảm bảo SMTP_USER và SMTP_PASSWORD đã được set trong .env
- Kiểm tra email có bị spam không


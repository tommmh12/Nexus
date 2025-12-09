# Environment Variables Configuration

Tài liệu này mô tả các biến môi trường cần thiết cho hệ thống Nexus.

## Backend Environment Variables

### Bắt buộc trong Production

Các biến sau đây **bắt buộc** phải được cấu hình khi `NODE_ENV=production`:

#### JWT Configuration

- **`JWT_SECRET`** (required in production)
  - Mô tả: Secret key để ký và xác thực JWT tokens
  - Ví dụ: `your-super-secret-jwt-key-min-32-characters-long`
  - Lưu ý: Phải là chuỗi ngẫu nhiên, dài và bảo mật. Không sử dụng giá trị mặc định trong production.
  - Mặc định (chỉ development): `nexus_super_secret_key_change_in_production`

- **`JWT_EXPIRES_IN`** (optional)
  - Mô tả: Thời gian hết hạn của access token
  - Mặc định: `7d` (7 ngày)
  - Ví dụ: `1h`, `24h`, `7d`, `30d`

- **`JWT_REFRESH_EXPIRES_IN`** (optional)
  - Mô tả: Thời gian hết hạn của refresh token
  - Mặc định: `30d` (30 ngày)
  - Ví dụ: `7d`, `30d`, `90d`

#### Database Configuration

- **`DB_PASSWORD`** (required in production)
  - Mô tả: Mật khẩu kết nối MySQL database
  - Ví dụ: `your_secure_database_password`
  - Lưu ý: Không sử dụng mật khẩu mặc định hoặc mật khẩu yếu trong production.

- **`DB_USER`** (required in production)
  - Mô tả: Username kết nối MySQL database
  - Mặc định (development): `root`
  - Ví dụ: `nexus_db_user`

- **`DB_HOST`** (optional)
  - Mô tả: Host của MySQL server
  - Mặc định: `localhost`

- **`DB_PORT`** (optional)
  - Mô tả: Port của MySQL server
  - Mặc định: `3306`

- **`DB_NAME`** (optional)
  - Mô tả: Tên database
  - Mặc định: `nexus_db`

#### CORS Configuration

- **`CORS_ORIGINS`** (optional)
  - Mô tả: Danh sách các origin được phép truy cập API, phân cách bởi dấu phẩy
  - Mặc định: `http://localhost:3000,http://localhost:5173`
  - Ví dụ: `https://app.nexus.com,https://admin.nexus.com`
  - Lưu ý: Hỗ trợ cả HTTP và HTTPS origins

- **`CORS_CREDENTIALS`** (optional)
  - Mô tả: Cho phép gửi credentials (cookies) trong CORS requests
  - Mặc định: `false`
  - Ví dụ: `true` hoặc `false`
  - Lưu ý: Chỉ bật nếu bạn thực sự cần sử dụng cookies

#### Server Configuration

- **`PORT`** (optional)
  - Mô tả: Port mà backend server sẽ chạy
  - Mặc định: `5000`

- **`NODE_ENV`** (optional)
  - Mô tả: Môi trường chạy ứng dụng
  - Giá trị: `development`, `production`, `test`
  - Mặc định: `development`
  - Lưu ý: Khi đặt là `production`, hệ thống sẽ yêu cầu các biến bắt buộc phải được cấu hình.

#### SMTP Configuration (Email)

- **`SMTP_HOST`** (optional)
  - Mô tả: SMTP server host
  - Mặc định: `smtp.gmail.com`
  - Ví dụ: `smtp.gmail.com`, `smtp.outlook.com`

- **`SMTP_PORT`** (optional)
  - Mô tả: SMTP server port
  - Mặc định: `587` (TLS) hoặc `465` (SSL)
  - Ví dụ: `587`, `465`

- **`SMTP_USER`** (optional)
  - Mô tả: Email đăng nhập SMTP
  - Ví dụ: `your_email@gmail.com`
  - Lưu ý: Đối với Gmail, cần sử dụng App Password thay vì mật khẩu thông thường

- **`SMTP_PASSWORD`** (optional)
  - Mô tả: Mật khẩu hoặc App Password cho SMTP
  - Ví dụ: `your_app_password`
  - Lưu ý: 
    - Đối với Gmail: Sử dụng App Password (tạo tại https://myaccount.google.com/apppasswords)
    - Đối với Outlook: Có thể dùng mật khẩu thông thường hoặc App Password

- **`FRONTEND_URL`** (optional)
  - Mô tả: URL của frontend để tạo link trong email
  - Mặc định: `http://localhost:3000`
  - Ví dụ: `https://app.nexus.com`

## Frontend Environment Variables

### Required

- **`VITE_API_URL`** (recommended)
  - Mô tả: Base URL của backend API
  - Mặc định: `http://localhost:5000/api`
  - Ví dụ: `https://api.nexus.com/api`
  - Lưu ý: Phải khớp với backend CORS configuration

## Setup Examples

### Development (.env.development)

```env
# Backend
NODE_ENV=development
PORT=5000

# JWT (optional in development, sẽ dùng default)
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Database (optional in development)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=nexus_db

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
CORS_CREDENTIALS=false
```

```env
# Frontend (.env.development)
VITE_API_URL=http://localhost:5000/api
```

### Production (.env.production)

```env
# Backend
NODE_ENV=production
PORT=5000

# JWT (REQUIRED)
JWT_SECRET=<generate-strong-random-secret-min-32-chars>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Database (REQUIRED)
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=nexus_db_user
DB_PASSWORD=<strong-secure-password>
DB_NAME=nexus_db

# CORS
CORS_ORIGINS=https://app.nexus.com,https://admin.nexus.com
CORS_CREDENTIALS=false

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FRONTEND_URL=https://app.nexus.com
```

```env
# Frontend (.env.production)
VITE_API_URL=https://api.nexus.com/api
```

### SMTP Setup cho Gmail

1. **Bật 2-Step Verification** trong Google Account
2. **Tạo App Password**:
   - Truy cập: https://myaccount.google.com/apppasswords
   - Chọn "Mail" và "Other (Custom name)" → Nhập "Nexus System"
   - Copy App Password (16 ký tự, có khoảng trắng)
3. **Cấu hình trong .env**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=phamnhathuy041@gmail.com
   SMTP_PASSWORD=slga nnls kwuf ytoy
   FRONTEND_URL=http://localhost:3000
   ```

## Security Best Practices

1. **JWT_SECRET**: 
   - Sử dụng ít nhất 32 ký tự ngẫu nhiên
   - Không commit vào git
   - Thay đổi định kỳ trong production

2. **DB_PASSWORD**:
   - Sử dụng mật khẩu mạnh (tối thiểu 16 ký tự)
   - Không sử dụng mật khẩu mặc định
   - Sử dụng user riêng cho ứng dụng, không dùng root

3. **Environment Files**:
   - Không commit file `.env` vào git
   - Sử dụng `.env.example` để document các biến cần thiết
   - Sử dụng secret management service trong production (AWS Secrets Manager, Azure Key Vault, etc.)

## Validation

Backend sẽ tự động kiểm tra và báo lỗi khi khởi động nếu:
- `NODE_ENV=production` và thiếu `JWT_SECRET`
- `NODE_ENV=production` và thiếu `DB_PASSWORD`
- `NODE_ENV=production` và thiếu `DB_USER`

## Troubleshooting

### Error: "JWT_SECRET environment variable is required in production"
- Giải pháp: Thêm `JWT_SECRET` vào file `.env` hoặc environment variables

### Error: "DB_PASSWORD environment variable is required in production"
- Giải pháp: Cấu hình `DB_PASSWORD` với mật khẩu database hợp lệ

### CORS errors in browser
- Kiểm tra `CORS_ORIGINS` trong backend có chứa frontend URL
- Kiểm tra `VITE_API_URL` trong frontend khớp với backend URL


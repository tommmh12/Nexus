# Nexus Login Integration - Complete ✅

## Đã hoàn thành

### Backend API

✅ **Express + TypeScript server** chạy trên port 5000
✅ **MySQL database** với 37 bảng
✅ **Authentication Service** với JWT
✅ **Login API** endpoint: `POST /api/auth/login`
✅ **Seed data** với 5 user test

### Frontend

✅ **Auth Service** kết nối API
✅ **LoginForm** gửi email + password đến backend
✅ **Auto login** khi có token hợp lệ
✅ **Logout** xóa session

## Test Accounts

| Email                | Password | Role     | Department |
| -------------------- | -------- | -------- | ---------- |
| admin@nexus.com      | admin123 | Admin    | IT         |
| nguyenvana@nexus.com | 123456   | Manager  | IT         |
| tranthib@nexus.com   | 123456   | Manager  | HR         |
| levanc@nexus.com     | 123456   | Employee | Finance    |
| phamthid@nexus.com   | 123456   | Employee | Marketing  |

## Cách sử dụng

### 1. Backend đang chạy

```
Backend API: http://localhost:5000
✅ Database connected
✅ JWT authentication ready
```

### 2. Frontend đang chạy

```
Frontend: http://localhost:3000
✅ Auth service connected
✅ Real login enabled
```

### 3. Test login

1. Mở http://localhost:3000
2. Nhập email: `admin@nexus.com`
3. Nhập password: `admin123`
4. Click "Đăng nhập ngay"
5. ✅ Chuyển sang Dashboard với thông tin user thật từ database

## API Endpoints

### POST /api/auth/login

**Request:**

```json
{
  "email": "admin@nexus.com",
  "password": "admin123",
  "rememberMe": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": "uuid",
      "employee_id": "NX001",
      "email": "admin@nexus.com",
      "full_name": "Quản trị viên hệ thống",
      "avatar_url": "https://...",
      "department_name": "Phòng Công nghệ thông tin",
      "position": "System Administrator",
      "role": "Admin",
      "status": "Active"
    },
    "tokens": {
      "accessToken": "jwt_token...",
      "refreshToken": "jwt_refresh_token..."
    }
  }
}
```

### GET /api/auth/me

Kiểm tra user hiện tại (cần Authorization header)

### POST /api/auth/logout

Đăng xuất và xóa session

## Thay đổi chính

### App.tsx

- ❌ Xóa `mockLoginApi`
- ✅ Import `authService`
- ✅ `handleLogin` nhận cả email + password
- ✅ `useEffect` check session khi load
- ✅ `handleLogout` gọi API logout

### LoginForm.tsx

- ✅ Truyền password vào `onLogin(email, password)`
- ✅ Xóa validation check `admin`

### authService.ts (NEW)

- ✅ Login API call
- ✅ Logout API call
- ✅ Get current user
- ✅ Token management (localStorage)

## Security Features

✅ Password hashing (bcrypt)
✅ JWT tokens (access + refresh)
✅ Secure session storage
✅ CORS protection
✅ Helmet security headers
✅ Token expiration (7d / 30d)
✅ Active status check

## Troubleshooting

**Login failed?**

- Check backend running: http://localhost:5000/health
- Check email format: must end with @nexus.com
- Check password: see test accounts above

**CORS error?**

- Backend CORS đã config cho localhost:3000
- Frontend .env có VITE_API_URL=http://localhost:5000/api

**Token invalid?**

- localStorage được clear khi logout
- Token auto verify khi reload page

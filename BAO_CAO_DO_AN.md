# BÁO CÁO ĐỒ ÁN CHUYÊN NGÀNH

## HỆ THỐNG CỔNG THÔNG TIN NỘI BỘ DOANH NGHIỆP - NEXUS

---

> **Tài liệu sườn báo cáo đồ án**  
> Dự kiến: 40-50 trang (không bao gồm phụ lục)

---

# MỤC LỤC

- [CHƯƠNG 1. TỔNG QUAN](#chương-1-tổng-quan) (6-8 trang)
- [CHƯƠNG 2. CƠ SỞ LÝ THUYẾT](#chương-2-cơ-sở-lý-thuyết) (15-25 trang)
- [CHƯƠNG 3. KẾT QUẢ THỰC NGHIỆM](#chương-3-kết-quả-thực-nghiệm) (10-15 trang)
- [CHƯƠNG 4. KẾT LUẬN VÀ KIẾN NGHỊ](#chương-4-kết-luận-và-kiến-nghị) (1-2 trang)
- [TÀI LIỆU THAM KHẢO](#tài-liệu-tham-khảo)
- [PHỤ LỤC](#phụ-lục)

---

# CHƯƠNG 1. TỔNG QUAN

**(Dự kiến 6-8 trang)**

## 1.1. Giới thiệu đề tài

### 1.1.1. Bối cảnh và xu hướng chuyển đổi số doanh nghiệp

> _Mô tả xu hướng chuyển đổi số trong doanh nghiệp Việt Nam và thế giới. Trích dẫn các báo cáo từ Gartner, McKinsey về nhu cầu số hóa quy trình nội bộ. Nêu tầm quan trọng của việc kết nối nhân viên trong môi trường làm việc hiện đại (remote work, hybrid work)._

### 1.1.2. Các nghiên cứu liên quan

> _Trình bày các giải pháp cổng thông tin nội bộ hiện có:_
>
> - **Microsoft SharePoint**: Nền tảng intranet phổ biến, chi phí cao
> - **Workplace by Meta**: Mạng xã hội doanh nghiệp
> - **Confluence (Atlassian)**: Quản lý tài liệu và wiki
> - **Slack/Microsoft Teams**: Giao tiếp nhóm
>
> _So sánh ưu nhược điểm, trích dẫn tài liệu tham khảo._

### 1.1.3. Hạn chế của các giải pháp hiện có

> _Phân tích các điểm hạn chế:_
>
> - Chi phí license cao cho doanh nghiệp vừa và nhỏ
> - Thiếu tích hợp đầy đủ (cần nhiều công cụ riêng biệt)
> - Không phù hợp với văn hóa doanh nghiệp Việt Nam
> - Khó tùy chỉnh theo nhu cầu cụ thể

---

## 1.2. Nhiệm vụ đồ án

**(1-2 trang)**

### 1.2.1. Tính cấp thiết và lý do hình thành đề tài

> _Nêu rõ:_
>
> - Doanh nghiệp Việt Nam cần giải pháp tích hợp, chi phí hợp lý
> - Nhu cầu kết nối nhân viên, quản lý công việc, chia sẻ thông tin tập trung
> - Xu hướng self-hosted để bảo mật dữ liệu nội bộ

### 1.2.2. Ý nghĩa khoa học và thực tiễn

> - **Khoa học**: Áp dụng kiến trúc Clean Architecture, công nghệ web hiện đại (React, Node.js, TypeScript)
> - **Thực tiễn**: Tạo ra sản phẩm có thể triển khai thực tế cho doanh nghiệp

### 1.2.3. Mục tiêu nghiên cứu

> _Xây dựng hệ thống Cổng thông tin nội bộ Nexus với các mục tiêu:_
>
> 1. Tích hợp đa chức năng: Tin tức, Forum, Chat, Quản lý dự án, Đặt phòng họp
> 2. Hỗ trợ 3 vai trò người dùng: Admin, Manager, Employee
> 3. Giao diện thân thiện, responsive
> 4. Bảo mật, phân quyền chặt chẽ

### 1.2.4. Đối tượng và phạm vi nghiên cứu

> - **Đối tượng**: Doanh nghiệp vừa và nhỏ (50-500 nhân viên)
> - **Phạm vi**:
>   - Web application (responsive)
>   - 6 module chính: News, Forum, Chat, Projects, Workspace, Organization
>   - Không bao gồm: Mobile native app, tích hợp ERP

---

## 1.3. Cấu trúc đồ án

**(Tối đa 1 trang)**

> _Đồ án được tổ chức thành 4 chương:_
>
> **Chương 1 - Tổng quan**: Giới thiệu đề tài, nghiên cứu liên quan, nhiệm vụ và cấu trúc đồ án.
>
> **Chương 2 - Cơ sở lý thuyết**: Trình bày các công nghệ sử dụng (React, Node.js, TypeScript, MySQL), kiến trúc hệ thống (Clean Architecture), các pattern thiết kế, và mô hình dữ liệu.
>
> **Chương 3 - Kết quả thực nghiệm**: Mô tả chi tiết các module chức năng, hồ sơ thiết kế UML, giao diện người dùng cho 3 vai trò (Admin, Manager, Employee), và các kết quả đạt được.
>
> **Chương 4 - Kết luận và kiến nghị**: Tổng kết kết quả, đánh giá đóng góp và đề xuất hướng phát triển.

---

# CHƯƠNG 2. CƠ SỞ LÝ THUYẾT

**(Dự kiến 15-25 trang)**

## 2.1. Kiến trúc hệ thống

### 2.1.1. Mô hình kiến trúc tổng thể

> _Mô tả kiến trúc 3-tier:_
>
> - **Presentation Layer**: React + TypeScript (SPA)
> - **Business Logic Layer**: Node.js + Express (RESTful API)
> - **Data Layer**: MySQL Database
>
> _Vẽ sơ đồ kiến trúc hệ thống_

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Admin     │  │   Manager   │  │  Employee   │          │
│  │   Portal    │  │   Portal    │  │   Portal    │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Node.js + Express Backend               │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │    │
│  │  │   Auth   │ │   News   │ │  Forum   │ │  Chat  │ │    │
│  │  │ Service  │ │ Service  │ │ Service  │ │Service │ │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │    │
│  │  │ Project  │ │ Booking  │ │   User   │            │    │
│  │  │ Service  │ │ Service  │ │ Service  │            │    │
│  │  └──────────┘ └──────────┘ └──────────┘            │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │    MySQL DB     │  │   File Storage  │                   │
│  │   (nexus_db)    │  │   (/uploads)    │                   │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.1.2. Clean Architecture

> _Giải thích nguyên lý Clean Architecture được áp dụng trong Backend:_
>
> - **Domain Layer**: Entities, Repository Interfaces
> - **Application Layer**: Use Cases, DTOs, Services
> - **Infrastructure Layer**: Database, External Services
> - **Presentation Layer**: Controllers, Routes, Middleware
>
> _Vẽ sơ đồ các layer và dependency rule_

### 2.1.3. Kiến trúc Frontend (Component-Based)

> _Mô tả cấu trúc React application:_
>
> - **Pages**: Các trang theo vai trò (admin, manager, employee)
> - **Components**: UI components tái sử dụng
> - **Hooks**: Custom hooks cho logic nghiệp vụ
> - **Services**: API communication layer
> - **Contexts**: State management (Auth, Theme, etc.)

---

## 2.2. Công nghệ sử dụng

### 2.2.1. Frontend Technologies

| Công nghệ        | Phiên bản | Mục đích                |
| ---------------- | --------- | ----------------------- |
| React            | 18.x      | UI Library              |
| TypeScript       | 5.x       | Type-safe JavaScript    |
| Vite             | 5.x       | Build tool, HMR         |
| Tailwind CSS     | 3.x       | Utility-first CSS       |
| Lucide React     | -         | Icon library            |
| React Router     | 6.x       | Client-side routing     |
| Axios            | -         | HTTP client             |
| Socket.io-client | -         | Real-time communication |

> _Giải thích lý do chọn từng công nghệ, ưu điểm so với alternatives_

### 2.2.2. Backend Technologies

| Công nghệ  | Phiên bản | Mục đích             |
| ---------- | --------- | -------------------- |
| Node.js    | 18+       | Runtime environment  |
| Express.js | 4.x       | Web framework        |
| TypeScript | 5.x       | Type-safe JavaScript |
| MySQL2     | -         | Database driver      |
| Socket.io  | -         | WebSocket server     |
| JWT        | -         | Authentication       |
| bcrypt     | -         | Password hashing     |
| Multer     | -         | File upload          |

### 2.2.3. Database

> _MySQL 8.0+_
>
> - Relational database phù hợp với dữ liệu có cấu trúc
> - Hỗ trợ transactions, foreign keys
> - Full-text search cho forum/news

### 2.2.4. DevOps & Tools

> - **Git**: Version control
> - **VS Code**: IDE
> - **Postman**: API testing
> - **MySQL Workbench**: Database management

---

## 2.3. Mô hình dữ liệu

### 2.3.1. Sơ đồ ERD tổng thể

> _Vẽ Entity-Relationship Diagram cho toàn bộ database_ > _Bao gồm khoảng 30+ bảng chia theo module_

### 2.3.2. Module User & Organization

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
├─────────────────────────────────────────────────────────────┤
│ id (PK)          │ UUID                                     │
│ employee_id      │ VARCHAR(20) UNIQUE - Mã nhân viên        │
│ full_name        │ VARCHAR(255) - Họ và tên                 │
│ email            │ VARCHAR(255) UNIQUE - Email công ty      │
│ password_hash    │ VARCHAR(255) - Mật khẩu đã hash          │
│ avatar_url       │ TEXT - Ảnh đại diện                      │
│ position         │ VARCHAR(100) - Chức vụ                   │
│ department_id    │ FK → departments                         │
│ role             │ ENUM('Admin','Manager','Employee')       │
│ status           │ ENUM('Active','Blocked','Pending')       │
│ created_at       │ TIMESTAMP                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      DEPARTMENTS                             │
├─────────────────────────────────────────────────────────────┤
│ id (PK)              │ UUID                                 │
│ name                 │ VARCHAR(255) - Tên phòng ban         │
│ description          │ TEXT - Mô tả                         │
│ manager_id           │ FK → users - Trưởng phòng            │
│ parent_department_id │ FK → departments (self-ref)          │
│ created_at           │ TIMESTAMP                            │
└─────────────────────────────────────────────────────────────┘
```

### 2.3.3. Module Forum & Communication

```
┌─────────────────────────────────────────────────────────────┐
│                    FORUM_CATEGORIES                          │
├─────────────────────────────────────────────────────────────┤
│ id, name, description, icon, color_class, order             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      FORUM_POSTS                             │
├─────────────────────────────────────────────────────────────┤
│ id (PK)          │ UUID                                     │
│ category_id      │ FK → forum_categories                    │
│ author_id        │ FK → users                               │
│ title            │ VARCHAR(500) - Tiêu đề                   │
│ content          │ TEXT - Nội dung (HTML)                   │
│ status           │ ENUM('Pending','Approved','Rejected')    │
│ upvote_count     │ INT - Số upvote                          │
│ comment_count    │ INT - Số bình luận                       │
│ view_count       │ INT - Lượt xem                           │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    FORUM_COMMENTS                            │
├─────────────────────────────────────────────────────────────┤
│ id, post_id, author_id, parent_id, content, upvote_count    │
└─────────────────────────────────────────────────────────────┘
```

### 2.3.4. Module Chat (Real-time)

```
┌──────────────────┐     ┌──────────────────┐
│ CHAT_GROUPS      │────▶│ CHAT_MESSAGES    │
│                  │     │                  │
│ id, name, type   │     │ id, group_id     │
│ is_private       │     │ sender_id        │
│ avatar_url       │     │ content          │
│ created_by       │     │ message_type     │
└──────────────────┘     │ file_url         │
        │                │ is_read          │
        ▼                └──────────────────┘
┌──────────────────┐
│ CHAT_MEMBERS     │
│                  │
│ group_id         │
│ user_id          │
│ role             │
│ joined_at        │
└──────────────────┘
```

### 2.3.5. Module Projects & Tasks

```
┌─────────────────────────────────────────────────────────────┐
│                       PROJECTS                               │
├─────────────────────────────────────────────────────────────┤
│ id, name, description, department_id, manager_id            │
│ status ('Active','Completed','On Hold','Cancelled')         │
│ priority, start_date, end_date, progress                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        TASKS                                 │
├─────────────────────────────────────────────────────────────┤
│ id, project_id, title, description, assignee_id             │
│ status ('To Do','In Progress','Review','Done')              │
│ priority, due_date, estimated_hours, actual_hours           │
└─────────────────────────────────────────────────────────────┘
```

### 2.3.6. Module Workspace (Room Booking)

```
┌──────────────────┐     ┌──────────────────┐
│ FLOOR_PLANS      │────▶│ MEETING_ROOMS    │
│                  │     │                  │
│ id, floor_number │     │ id, floor_id     │
│ name, is_active  │     │ name, capacity   │
└──────────────────┘     │ room_type        │
                         │ equipment        │
                         └──────────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ ROOM_BOOKINGS    │
                         │                  │
                         │ room_id          │
                         │ booked_by        │
                         │ booking_date     │
                         │ start_time       │
                         │ end_time         │
                         │ meeting_title    │
                         │ status           │
                         └──────────────────┘
```

---

## 2.4. Thiết kế hệ thống phân quyền

### 2.4.1. Ma trận phân quyền theo vai trò

| Chức năng                 | Admin          | Manager         | Employee      |
| ------------------------- | -------------- | --------------- | ------------- |
| **Dashboard**             | Toàn hệ thống  | Phòng ban       | Cá nhân       |
| **User Management**       | CRUD tất cả    | Xem phòng ban   | Xem profile   |
| **Department Management** | CRUD tất cả    | Xem             | Xem           |
| **News**                  | CRUD + Duyệt   | CRUD            | Xem + Comment |
| **Forum**                 | Moderate       | CRUD + Moderate | CRUD          |
| **Projects**              | Quản lý tất cả | CRUD phòng ban  | Xem assigned  |
| **Tasks**                 | Xem tất cả     | CRUD phòng ban  | CRUD assigned |
| **Room Booking**          | Quản lý phòng  | Đặt + Duyệt     | Đặt phòng     |
| **Chat**                  | Quản lý        | Chat            | Chat          |
| **System Settings**       | Full access    | -               | -             |

### 2.4.2. JWT Authentication Flow

> _Vẽ sequence diagram cho quá trình đăng nhập và xác thực_

```
┌────────┐          ┌────────┐          ┌────────┐
│ Client │          │ Server │          │   DB   │
└───┬────┘          └───┬────┘          └───┬────┘
    │   POST /login     │                   │
    │──────────────────▶│                   │
    │  {email,password} │   Query user      │
    │                   │──────────────────▶│
    │                   │   User data       │
    │                   │◀──────────────────│
    │                   │                   │
    │                   │ Verify password   │
    │                   │ Generate JWT      │
    │   {accessToken,   │                   │
    │    refreshToken}  │                   │
    │◀──────────────────│                   │
    │                   │                   │
    │ GET /api/resource │                   │
    │ Authorization:    │                   │
    │ Bearer <token>    │                   │
    │──────────────────▶│                   │
    │                   │ Verify JWT        │
    │                   │ Check permissions │
    │   {data}          │                   │
    │◀──────────────────│                   │
```

---

## 2.5. Thiết kế Real-time Communication

### 2.5.1. WebSocket với Socket.io

> _Mô tả cách sử dụng Socket.io cho chat real-time_

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Socket.io Client                        │    │
│  │  - connect()                                         │    │
│  │  - emit('send_message', data)                        │    │
│  │  - on('receive_message', callback)                   │    │
│  │  - on('user_typing', callback)                       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │ WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js)                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Socket.io Server                        │    │
│  │  - on('connection', handleConnection)                │    │
│  │  - on('send_message', saveAndBroadcast)              │    │
│  │  - on('join_room', addToRoom)                        │    │
│  │  - emit('receive_message', data)                     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2.5.2. Event Types

> - `connection`: User connects
> - `disconnect`: User disconnects
> - `join_room`: Join chat room
> - `leave_room`: Leave chat room
> - `send_message`: Send message
> - `receive_message`: Receive message
> - `typing`: User is typing
> - `stop_typing`: User stopped typing
> - `message_read`: Mark message as read

---

## 2.6. API Design (RESTful)

### 2.6.1. API Conventions

> - Base URL: `/api/v1`
> - HTTP Methods: GET, POST, PUT, PATCH, DELETE
> - Response format: JSON
> - Error handling: Standard HTTP status codes

### 2.6.2. Main API Endpoints

| Method             | Endpoint                  | Description         |
| ------------------ | ------------------------- | ------------------- |
| **Authentication** |                           |                     |
| POST               | /auth/login               | Đăng nhập           |
| POST               | /auth/register            | Đăng ký             |
| POST               | /auth/refresh             | Làm mới token       |
| POST               | /auth/logout              | Đăng xuất           |
| **Users**          |                           |                     |
| GET                | /users                    | Danh sách users     |
| GET                | /users/:id                | Chi tiết user       |
| PUT                | /users/:id                | Cập nhật user       |
| **Forum**          |                           |                     |
| GET                | /forum                    | Danh sách bài viết  |
| POST               | /forum                    | Tạo bài viết        |
| GET                | /forum/:id                | Chi tiết bài        |
| POST               | /forum/:id/comments       | Thêm comment        |
| POST               | /forum/:id/reaction       | React bài viết      |
| **Chat**           |                           |                     |
| GET                | /chat/groups              | Danh sách nhóm chat |
| POST               | /chat/groups              | Tạo nhóm            |
| GET                | /chat/groups/:id/messages | Lấy tin nhắn        |
| POST               | /chat/upload              | Upload file         |
| **Projects**       |                           |                     |
| GET                | /projects                 | Danh sách dự án     |
| POST               | /projects                 | Tạo dự án           |
| GET                | /projects/:id/tasks       | Tasks của dự án     |
| **Booking**        |                           |                     |
| GET                | /booking/floors           | Danh sách tầng      |
| GET                | /booking/rooms            | Danh sách phòng     |
| POST               | /booking                  | Đặt phòng           |
| PUT                | /booking/:id/approve      | Duyệt đặt phòng     |

---

# CHƯƠNG 3. KẾT QUẢ THỰC NGHIỆM

**(Dự kiến 10-15 trang)**

## 3.1. Tổng quan hệ thống

### 3.1.1. Cấu trúc thư mục dự án

```
nexus-portal/
├── backend/                    # Node.js Backend
│   ├── src/
│   │   ├── application/        # Use cases, DTOs, Services
│   │   ├── domain/             # Entities, Repositories
│   │   ├── infrastructure/     # DB, External services
│   │   └── presentation/       # Controllers, Routes
│   ├── uploads/                # File storage
│   └── package.json
│
├── web-frontend/               # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   │   ├── admin/          # Admin portal
│   │   │   ├── manager/        # Manager portal
│   │   │   └── employee/       # Employee portal
│   │   ├── services/           # API services
│   │   ├── hooks/              # Custom hooks
│   │   └── contexts/           # React contexts
│   └── package.json
│
├── shared/                     # Shared types & utils
├── docs/                       # Documentation
└── mobile-app/                 # (Future) React Native
```

### 3.1.2. Thống kê code

| Thành phần          | Số file  | Dòng code (ước tính) |
| ------------------- | -------- | -------------------- |
| Backend TypeScript  | 80+      | ~15,000              |
| Frontend TypeScript | 120+     | ~25,000              |
| SQL Migrations      | 25+      | ~2,000               |
| **Tổng**            | **225+** | **~42,000**          |

---

## 3.2. Giao diện người dùng theo vai trò

### 3.2.1. Portal Admin (Quản trị viên)

#### Dashboard Admin

> _Mô tả + Screenshot_
>
> - Thống kê tổng quan: Tổng users, Departments, Projects, Posts
> - Biểu đồ hoạt động hệ thống
> - Quick actions

#### Quản lý người dùng

> - Danh sách nhân viên với filter/search
> - Thêm/Sửa/Xóa/Block user
> - Import từ Excel

#### Quản lý phòng ban

> - Cơ cấu tổ chức dạng tree
> - Thống kê nhân sự theo phòng

#### Quản lý tin tức

> - CRUD tin tức
> - Duyệt/Từ chối tin

#### Moderate Forum

> - Duyệt bài viết
> - Xóa bài vi phạm
> - Quản lý categories

#### Quản lý phòng họp

> - CRUD tầng/phòng
> - Quản lý thiết bị
> - Duyệt yêu cầu đặt phòng

#### Cài đặt hệ thống

> - Cấu hình chung
> - Audit logs

---

### 3.2.2. Portal Manager (Quản lý)

#### Dashboard Manager

> _Mô tả + Screenshot_
>
> - Thống kê phòng ban: Nhân viên, Dự án, Nhiệm vụ
> - KPI phòng ban
> - Calendar events

#### Quản lý dự án

> - Danh sách dự án phòng ban
> - Tiến độ, trạng thái
> - Phân công nhiệm vụ

#### Quản lý nhiệm vụ

> - Kanban board
> - Giao việc cho nhân viên
> - Theo dõi tiến độ

#### Forum phòng ban

> - Tạo bài viết
> - Moderate bài trong phòng

#### Đặt phòng họp

> - Xem lịch phòng
> - Đặt phòng cho team
> - Duyệt yêu cầu

---

### 3.2.3. Portal Employee (Nhân viên)

#### Dashboard Employee

> _Mô tả + Screenshot_
>
> - Quick stats: Tasks, Meetings, Notifications
> - My upcoming events
> - Recent forum posts
> - Quick post (tạo bài nhanh)

#### Forum nội bộ

> - Xem danh sách bài viết
> - Tạo bài viết mới (Rich text editor)
> - Comment, React (Like, Love, Laugh, etc.)
> - Upvote/Downvote

#### Chat real-time

> - Danh sách nhóm chat
> - Chat 1-1 và nhóm
> - Gửi file/hình ảnh
> - Tìm kiếm tin nhắn
> - Thông tin nhóm (media, members)

#### Nhiệm vụ của tôi

> - Danh sách tasks được giao
> - Cập nhật trạng thái
> - Checklist, comments

#### Đặt phòng họp

> - Chọn tầng/phòng
> - Chọn ngày/giờ
> - Điền thông tin cuộc họp
> - Xem lịch đặt của mình

#### Thông tin cá nhân

> - Xem/Sửa profile
> - Đổi mật khẩu
> - Liên kết tài khoản

---

## 3.3. Thiết kế UML

### 3.3.1. Use Case Diagram

```
                    ┌─────────────────────────────────────┐
                    │           NEXUS SYSTEM              │
                    │                                     │
    ┌───────┐       │  ┌─────────────────────────────┐   │
    │ Admin │───────┼──│ Manage Users                │   │
    └───────┘       │  │ Manage Departments          │   │
        │           │  │ Manage News                 │   │
        │           │  │ Moderate Forum              │   │
        │           │  │ Manage Meeting Rooms        │   │
        │           │  │ System Settings             │   │
        │           │  └─────────────────────────────┘   │
        │           │                                     │
    ┌─────────┐     │  ┌─────────────────────────────┐   │
    │ Manager │─────┼──│ View Department Stats       │   │
    └─────────┘     │  │ Manage Projects             │   │
        │           │  │ Assign Tasks                │   │
        │           │  │ Create Forum Posts          │   │
        │           │  │ Book Meeting Rooms          │   │
        │           │  │ Approve Bookings            │   │
        │           │  └─────────────────────────────┘   │
        │           │                                     │
    ┌──────────┐    │  ┌─────────────────────────────┐   │
    │ Employee │────┼──│ View Dashboard              │   │
    └──────────┘    │  │ Read/Create Forum Posts     │   │
                    │  │ Chat with Colleagues        │   │
                    │  │ Update My Tasks             │   │
                    │  │ Book Meeting Rooms          │   │
                    │  │ Manage Profile              │   │
                    │  └─────────────────────────────┘   │
                    └─────────────────────────────────────┘
```

### 3.3.2. Sequence Diagram - Đặt phòng họp

```
┌────────┐     ┌─────────┐     ┌─────────────┐     ┌────────┐
│Employee│     │Frontend │     │   Backend   │     │Database│
└───┬────┘     └────┬────┘     └──────┬──────┘     └───┬────┘
    │               │                 │                │
    │ Chọn phòng    │                 │                │
    │──────────────▶│                 │                │
    │               │ GET /rooms      │                │
    │               │────────────────▶│                │
    │               │                 │ Query rooms    │
    │               │                 │───────────────▶│
    │               │                 │    Rooms       │
    │               │                 │◀───────────────│
    │               │ Room list       │                │
    │               │◀────────────────│                │
    │ Hiển thị      │                 │                │
    │◀──────────────│                 │                │
    │               │                 │                │
    │ Điền form     │                 │                │
    │──────────────▶│                 │                │
    │               │ POST /booking   │                │
    │               │────────────────▶│                │
    │               │                 │ Check conflict │
    │               │                 │───────────────▶│
    │               │                 │    OK          │
    │               │                 │◀───────────────│
    │               │                 │ Insert booking │
    │               │                 │───────────────▶│
    │               │                 │    Created     │
    │               │                 │◀───────────────│
    │               │ Success         │                │
    │               │◀────────────────│                │
    │ Thông báo     │                 │                │
    │◀──────────────│                 │                │
```

### 3.3.3. Class Diagram - Domain Entities

```
┌─────────────────────────────────────────────────────────────┐
│                          User                                │
├─────────────────────────────────────────────────────────────┤
│ - id: string                                                │
│ - employeeId: string                                        │
│ - fullName: string                                          │
│ - email: string                                             │
│ - role: 'Admin' | 'Manager' | 'Employee'                    │
│ - department: Department                                     │
├─────────────────────────────────────────────────────────────┤
│ + login(email, password): Token                             │
│ + updateProfile(data): User                                 │
│ + changePassword(old, new): boolean                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1..*
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Department                             │
├─────────────────────────────────────────────────────────────┤
│ - id: string                                                │
│ - name: string                                              │
│ - manager: User                                             │
│ - parent: Department?                                        │
├─────────────────────────────────────────────────────────────┤
│ + getEmployees(): User[]                                    │
│ + getProjects(): Project[]                                  │
└─────────────────────────────────────────────────────────────┘
```

### 3.3.4. Activity Diagram - Tạo bài viết Forum

```
┌─────────────────────────────────────────────────────────────┐
│                      START                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Nhập tiêu đề, nội dung                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                   ╱                ╲
                  ╱  Có thêm ảnh?   ╲
                  ╲                 ╱
                   ╲               ╱
                    └──────────────┘
                     │ Yes    │ No
                     ▼        │
┌─────────────────────────────┐ │
│     Upload ảnh lên server   │ │
└─────────────────────────────┘ │
                     │          │
                     ▼          │
┌─────────────────────────────┐ │
│    Nhúng URL ảnh vào nội dung│ │
└─────────────────────────────┘ │
                     │          │
                     └────┬─────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Gọi API createPost                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                   ╱                ╲
                  ╱  Thành công?    ╲
                  ╲                 ╱
                   ╲               ╱
                    └──────────────┘
                     │ Yes    │ No
                     ▼        ▼
            ┌─────────────┐ ┌─────────────┐
            │ Hiển thị    │ │ Hiển thị    │
            │ thông báo   │ │ lỗi         │
            │ thành công  │ └─────────────┘
            └─────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                        END                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3.4. Kết quả đạt được

### 3.4.1. Chức năng hoàn thành

| STT | Module              | Chức năng              | Trạng thái    |
| --- | ------------------- | ---------------------- | ------------- |
| 1   | **Authentication**  | Đăng nhập/Đăng xuất    | ✅ Hoàn thành |
| 2   |                     | Quản lý session        | ✅ Hoàn thành |
| 3   |                     | Phân quyền 3 role      | ✅ Hoàn thành |
| 4   | **User Management** | CRUD Users             | ✅ Hoàn thành |
| 5   |                     | Profile management     | ✅ Hoàn thành |
| 6   | **Organization**    | Quản lý phòng ban      | ✅ Hoàn thành |
| 7   |                     | Cơ cấu tổ chức         | ✅ Hoàn thành |
| 8   | **News**            | CRUD tin tức           | ✅ Hoàn thành |
| 9   |                     | Duyệt tin              | ✅ Hoàn thành |
| 10  | **Forum**           | CRUD bài viết          | ✅ Hoàn thành |
| 11  |                     | Rich text editor       | ✅ Hoàn thành |
| 12  |                     | Comments & Reactions   | ✅ Hoàn thành |
| 13  |                     | Upvote/Downvote        | ✅ Hoàn thành |
| 14  |                     | Upload hình ảnh        | ✅ Hoàn thành |
| 15  | **Chat**            | Chat 1-1 và nhóm       | ✅ Hoàn thành |
| 16  |                     | Real-time messaging    | ✅ Hoàn thành |
| 17  |                     | File/Image sharing     | ✅ Hoàn thành |
| 18  |                     | Search messages        | ✅ Hoàn thành |
| 19  |                     | Group info panel       | ✅ Hoàn thành |
| 20  | **Projects**        | CRUD dự án             | ✅ Hoàn thành |
| 21  |                     | Task management        | ✅ Hoàn thành |
| 22  | **Workspace**       | Quản lý phòng họp      | ✅ Hoàn thành |
| 23  |                     | Đặt phòng              | ✅ Hoàn thành |
| 24  |                     | Xem lịch               | ✅ Hoàn thành |
| 25  | **Notifications**   | In-app notifications   | ✅ Hoàn thành |
| 26  | **Dashboard**       | 3 dashboard cho 3 role | ✅ Hoàn thành |

### 3.4.2. Thống kê hiệu năng

> - Thời gian load trang trung bình: < 2s
> - API response time: < 500ms
> - WebSocket latency: < 100ms

### 3.4.3. Screenshots giao diện

> _(Chèn screenshots thực tế của hệ thống)_
>
> **Hình 3.1**: Dashboard Admin  
> **Hình 3.2**: Quản lý người dùng  
> **Hình 3.3**: Dashboard Employee  
> **Hình 3.4**: Forum - Danh sách bài viết  
> **Hình 3.5**: Forum - Chi tiết bài viết  
> **Hình 3.6**: Chat real-time  
> **Hình 3.7**: Đặt phòng họp  
> **Hình 3.8**: Dashboard Manager  
> **Hình 3.9**: Quản lý dự án  
> **Hình 3.10**: Kanban tasks

---

# CHƯƠNG 4. KẾT LUẬN VÀ KIẾN NGHỊ

**(1-2 trang)**

## 4.1. Kết luận

### 4.1.1. Kết quả đạt được

> _Tóm tắt những gì đã hoàn thành:_
>
> - Xây dựng thành công hệ thống Cổng thông tin nội bộ Nexus với đầy đủ các module cơ bản
> - Áp dụng kiến trúc Clean Architecture, công nghệ hiện đại
> - Hỗ trợ 3 vai trò người dùng với phân quyền chặt chẽ
> - Tích hợp real-time chat với Socket.io
> - Giao diện thân thiện, responsive

### 4.1.2. Những đóng góp

> - Tạo ra một giải pháp open-source có thể triển khai cho doanh nghiệp Việt Nam
> - Tích hợp nhiều chức năng trong một hệ thống thống nhất
> - Áp dụng best practices trong phát triển web

### 4.1.3. Hạn chế

> - Chưa có mobile native app
> - Chưa tích hợp với hệ thống ERP
> - Chưa có unit test đầy đủ
> - Chưa có CI/CD pipeline

---

## 4.2. Kiến nghị và hướng phát triển

### 4.2.1. Cải tiến ngắn hạn

> - Hoàn thiện unit tests và integration tests
> - Tối ưu hóa hiệu năng database
> - Thêm tính năng thông báo qua email
> - Cải thiện UX cho mobile

### 4.2.2. Phát triển dài hạn

> - Phát triển mobile app với React Native
> - Tích hợp AI chatbot hỗ trợ nhân viên
> - Tích hợp với các hệ thống HR, ERP
> - Thêm module báo cáo và analytics
> - Triển khai trên cloud (AWS/Azure/GCP)
> - Hỗ trợ multi-tenant cho SaaS

---

# TÀI LIỆU THAM KHẢO

1. Martin, R. C. (2017). _Clean Architecture: A Craftsman's Guide to Software Structure and Design_. Prentice Hall.

2. React Documentation. (2024). Retrieved from https://react.dev/

3. Node.js Documentation. (2024). Retrieved from https://nodejs.org/docs/

4. Socket.io Documentation. (2024). Retrieved from https://socket.io/docs/

5. MySQL 8.0 Reference Manual. (2024). Retrieved from https://dev.mysql.com/doc/

6. Tailwind CSS Documentation. (2024). Retrieved from https://tailwindcss.com/docs

7. TypeScript Handbook. (2024). Retrieved from https://www.typescriptlang.org/docs/

8. Express.js Documentation. (2024). Retrieved from https://expressjs.com/

9. JWT.io. (2024). Introduction to JSON Web Tokens. Retrieved from https://jwt.io/introduction

10. Gartner. (2024). _Digital Workplace Technology Trends_. Gartner Research.

---

# PHỤ LỤC

## Phụ lục A: Hướng dẫn cài đặt

```bash
# Clone repository
git clone <repository-url>
cd nexus-portal

# Backend setup
cd backend
npm install
cp .env.example .env
# Cấu hình database trong .env
npm run migrate
npm run dev

# Frontend setup
cd ../web-frontend
npm install
npm run dev
```

## Phụ lục B: Cấu hình môi trường (.env)

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nexus_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Server
PORT=5000
```

## Phụ lục C: Database Migrations

> _Liệt kê các file migration quan trọng_

## Phụ lục D: API Documentation

> _Chi tiết các API endpoints_

---

> **Ghi chú**: Đây là sườn báo cáo. Sinh viên cần:
>
> 1. Bổ sung nội dung chi tiết cho từng mục
> 2. Thêm screenshots thực tế
> 3. Vẽ các sơ đồ UML bằng công cụ chuyên dụng (StarUML, draw.io)
> 4. Cập nhật tài liệu tham khảo theo chuẩn trích dẫn của trường
> 5. Điều chỉnh số trang phù hợp với yêu cầu

---

_Tài liệu được tạo tự động - Nexus Internal Portal_

# Employee Portal - QA Checklist

## P0: Core Features

### Dashboard
- [ ] Loading: Skeleton hiển thị đúng cho từng block
- [ ] Empty: Hiển thị EmptyState với action phù hợp
- [ ] Error: Hiển thị thông báo lỗi + nút retry
- [ ] Data: Stats, tasks, projects, meetings, notifications load từ API thật
- [ ] Responsive: Desktop/tablet/mobile không vỡ layout
- [ ] Time filter: Hôm nay/Tuần này/Tháng này hoạt động

### My Tasks
- [ ] Loading: SkeletonTable hiển thị đúng
- [ ] Empty: EmptyState khi không có task
- [ ] Search: Tìm kiếm theo title, project name
- [ ] Filter: Lọc theo status, priority
- [ ] View modes: List view và Board view
- [ ] Task detail: Modal hiển thị đầy đủ thông tin
- [ ] Checklist: Hiển thị progress checklist

### My Projects
- [ ] Loading: SkeletonCard hiển thị đúng
- [ ] Empty: EmptyState khi không có project
- [ ] Search: Tìm kiếm theo name, code
- [ ] Filter: Lọc theo status
- [ ] View modes: Grid view và List view
- [ ] Project detail: Modal với tabs Overview/Tasks/Members
- [ ] Progress bar: Hiển thị tiến độ dự án

### Layout/Navigation
- [ ] Topbar: Logo, nav items, search, notifications, user menu
- [ ] Mobile menu: Responsive navigation
- [ ] Active state: Highlight nav item đang active
- [ ] Notifications dropdown: Hiển thị từ API thật
- [ ] User menu: Profile, settings, logout

## P1: Secondary Features

### Notifications Page
- [ ] Loading: Skeleton hiển thị đúng
- [ ] Empty: EmptyState khi không có thông báo
- [ ] Filter: Tất cả / Chưa đọc
- [ ] Mark as read: Đánh dấu đã đọc từng item
- [ ] Mark all as read: Đánh dấu tất cả đã đọc
- [ ] Unread indicator: Badge số lượng chưa đọc

### Booking Module
- [ ] Loading: Skeleton cho rooms và bookings
- [ ] Empty: EmptyState khi không có phòng
- [ ] Floor filter: Lọc theo tầng
- [ ] Date picker: Chọn ngày
- [ ] Time range: Chọn giờ bắt đầu/kết thúc
- [ ] Room status: Available/Booked/Pending
- [ ] Room detail: Modal với thông tin phòng
- [ ] Booking form: 2 bước (review → submit)
- [ ] My bookings: Sidebar hiển thị lịch của tôi

### Chat Module
- [ ] Loading: Skeleton cho conversations và messages
- [ ] Empty: EmptyState khi chưa có conversation
- [ ] Search: Tìm kiếm conversation
- [ ] Filter: Tất cả/Cá nhân/Nhóm
- [ ] New chat: Modal tìm user để bắt đầu chat
- [ ] Messages: Bubble style, timestamp, read status
- [ ] Send message: Input + send button
- [ ] Online status: Indicator cho user online

## P2: Polish

### Accessibility
- [ ] Keyboard navigation: Tab qua các elements
- [ ] Focus states: Visible focus ring
- [ ] ARIA labels: Cho buttons, inputs
- [ ] Color contrast: Đủ contrast ratio

### Responsive
- [ ] Desktop (1920px): Full layout
- [ ] Laptop (1366px): Adjusted spacing
- [ ] Tablet (768px): Stacked layout
- [ ] Mobile (375px): Single column

### Micro-interactions
- [ ] Button hover/active states
- [ ] Card hover effects
- [ ] Loading animations (skeleton pulse)
- [ ] Toast notifications
- [ ] Modal animations (fadeIn, scaleIn)

## API Endpoints Used

### Dashboard
- `GET /api/dashboard/overview` - Stats overview
- `GET /api/projects` - User's projects
- `GET /api/tasks/project/:id` - Tasks by project
- `GET /api/bookings?date=` - Today's bookings
- `GET /api/meetings` - Online meetings
- `GET /api/notifications` - User notifications

### Tasks
- `GET /api/projects` - Get all projects
- `GET /api/tasks/project/:id` - Tasks by project
- `GET /api/tasks/:id` - Task detail with checklist
- `PATCH /api/tasks/:id/status` - Update task status

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Project detail
- `GET /api/tasks/project/:id` - Project tasks

### Booking
- `GET /api/floors` - Get all floors
- `GET /api/rooms/availability?date=&floorId=` - Room availability
- `GET /api/bookings` - User's bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Chat
- `GET /api/chat/conversations` - Get conversations
- `GET /api/chat/conversations/:id/messages` - Get messages
- `POST /api/chat/messages` - Send message
- `PUT /api/chat/conversations/:id/read` - Mark as read
- `GET /api/chat/users` - Search users
- `GET /api/chat/conversations/with/:userId` - Get/create conversation

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

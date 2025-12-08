
import { Department, EmployeeProfile, Project, TaskDetail, ForumCategory, ForumPost, NewsArticle, Notification, ActivityLog, AlertRule, BackupFile, ProjectReport } from '../types';

export const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'n1',
        type: 'comment',
        title: 'Bình luận mới',
        message: 'Nguyễn Văn An đã bình luận về bài viết "Lịch nghỉ Tết 2025" của bạn.',
        timestamp: '5 phút trước',
        isRead: false,
        actorName: 'Nguyễn Văn An',
        actorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100'
    },
    // ...
];

export const MOCK_DEPARTMENTS: Department[] = [
    { id: 'bod', name: 'Ban Giám Đốc (Board of Directors)', managerName: 'Nguyễn Văn An', managerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100', memberCount: 5, description: 'Lãnh đạo và định hướng chiến lược toàn công ty.', budget: '---', kpiStatus: 'On Track', parentDeptId: undefined },
    { id: 'tech', name: 'Khối Công Nghệ (Technology)', managerName: 'Trần Minh Đức', managerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100', memberCount: 45, description: 'Phát triển sản phẩm, vận hành hạ tầng và bảo mật hệ thống.', budget: '5 tỷ VNĐ', kpiStatus: 'On Track', parentDeptId: 'bod' },
    { id: 'mkt', name: 'Khối Marketing & Truyền thông', managerName: 'Nguyễn Thị Hoa', managerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100', memberCount: 20, description: 'Xây dựng thương hiệu và thúc đẩy tăng trưởng người dùng.', budget: '3.2 tỷ VNĐ', kpiStatus: 'At Risk', parentDeptId: 'bod' },
    { id: 'sales', name: 'Khối Kinh Doanh (Sales)', managerName: 'Lê Hoàng', managerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100', memberCount: 35, description: 'Tìm kiếm khách hàng và tối ưu doanh thu.', budget: '2 tỷ VNĐ', kpiStatus: 'Behind', parentDeptId: 'bod' },
    { id: 'hr', name: 'Khối Hành chính Nhân sự', managerName: 'Phạm Thu Trang', managerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100', memberCount: 12, description: 'Tuyển dụng, đào tạo và quản lý văn phòng.', budget: '1.5 tỷ VNĐ', kpiStatus: 'On Track', parentDeptId: 'bod' },
    { id: 'dev', name: 'Software Development', managerName: 'Trần Văn Nam', managerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100', memberCount: 30, description: 'Đội ngũ lập trình viên Backend, Frontend và Mobile.', budget: '---', kpiStatus: 'On Track', parentDeptId: 'tech' },
    { id: 'infra', name: 'Infrastructure & Security', managerName: 'Đỗ Văn Hùng', managerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100&h=100', memberCount: 15, description: 'Quản lý Server, Network và An toàn thông tin.', budget: '---', kpiStatus: 'On Track', parentDeptId: 'tech' },
];

export const MOCK_USERS: EmployeeProfile[] = [
    { 
        id: 'u001', 
        fullName: 'Nguyễn Thị Hoa', 
        email: 'hoa.nt@nexus.com', 
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100',
        position: 'Trưởng phòng Marketing', 
        department: 'Khối Marketing & Truyền thông', 
        role: 'Manager', 
        status: 'Active',
        phone: '0987654321',
        joinDate: '15/05/2021',
        employeeId: 'NEX-001',
        karmaPoints: 1250,
        linkedAccounts: [
            { provider: 'google', email: 'hoa.nt@gmail.com', connected: true, lastSynced: '2 giờ trước' },
            { provider: 'slack', email: 'hoa.nt@nexus.slack.com', connected: true }
        ]
    },
    { 
        id: 'u002', 
        fullName: 'Trần Văn Nam', 
        email: 'nam.tv@nexus.com', 
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
        position: 'Senior Developer', 
        department: 'Software Development', 
        role: 'Employee', 
        status: 'Active',
        phone: '0912345678',
        joinDate: '10/01/2023',
        employeeId: 'NEX-002',
        karmaPoints: 3400,
        linkedAccounts: [
             { provider: 'github', email: 'trannamdev', connected: true },
             { provider: 'microsoft', email: 'nam.tv@nexus.com', connected: false }
        ]
    },
    { 
        id: 'u003', 
        fullName: 'Lê Hoàng', 
        email: 'hoang.le@nexus.com', 
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
        position: 'Sales Executive', 
        department: 'Khối Kinh Doanh (Sales)', 
        role: 'Employee', 
        status: 'Blocked',
        phone: '0909090909',
        joinDate: '20/11/2023',
        employeeId: 'NEX-003',
        linkedAccounts: []
    },
    {
        id: 'u004',
        fullName: 'Lê Văn B',
        email: 'le.b@nexus.com', 
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100&h=100',
        position: 'UI Designer',
        department: 'Khối Marketing & Truyền thông',
        role: 'Employee', 
        status: 'Active',
        phone: '0911223344',
        joinDate: '01/06/2023',
        employeeId: 'NEX-004',
        karmaPoints: 520,
        linkedAccounts: []
    }
];

export const MOCK_ACTIVITIES: ActivityLog[] = [
    { id: 'a1', userId: 'u001', userName: 'Nguyễn Thị Hoa', type: 'login', content: 'Đăng nhập vào hệ thống', timestamp: '10 phút trước', ipAddress: '192.168.1.15' },
    // ...
];

export const MOCK_PROJECTS: Project[] = [
    { 
        id: 1, 
        code: 'WEB-2024', 
        name: 'Tái thiết kế Website Nexus', 
        participatingDepartments: ['Khối Marketing & Truyền thông', 'Software Development'], 
        workflowId: '1',
        progress: 75, 
        status: 'In Progress', 
        members: 12, 
        startDate: '2024-10-01', 
        endDate: '2024-12-15', 
        priority: 'High', 
        budget: '200,000,000 VNĐ', 
        manager: 'Nguyễn Thị Hoa', 
        description: 'Nâng cấp toàn bộ giao diện website công ty, tích hợp cổng thanh toán mới và tối ưu hóa SEO.',
        documents: [
            { name: 'Yêu cầu kỹ thuật v1.0.pdf', url: '#', date: '2024-10-01', source: 'Project', uploader: 'Admin' },
            { name: 'Design System.fig', url: '#', date: '2024-10-05', source: 'Project', uploader: 'Design Team' }
        ]
    },
    { 
        id: 2, 
        code: 'ERP-PHASE2', 
        name: 'Hệ thống ERP Giai đoạn 2', 
        participatingDepartments: ['Software Development', 'Infrastructure & Security'], 
        workflowId: '2',
        progress: 30, 
        status: 'In Progress', 
        members: 25, 
        startDate: '2024-09-01', 
        endDate: '2025-03-01', 
        priority: 'Critical', 
        budget: '1,500,000,000 VNĐ', 
        manager: 'Trần Văn Nam', 
        description: 'Triển khai module Kho vận và Tài chính kế toán cho hệ thống ERP nội bộ.',
        documents: []
    },
    { 
        id: 3, 
        code: 'SALES-TET', 
        name: 'Chiến dịch Tết 2025', 
        participatingDepartments: ['Khối Kinh Doanh (Sales)', 'Khối Marketing & Truyền thông'], 
        workflowId: '1',
        progress: 10, 
        status: 'Planning', 
        members: 15, 
        startDate: '2024-11-15', 
        endDate: '2025-01-20', 
        priority: 'Medium', 
        budget: '500,000,000 VNĐ', 
        manager: 'Lê Hoàng', 
        description: 'Lên kế hoạch khuyến mãi, quà tặng và sự kiện tri ân khách hàng dịp Tết Nguyên Đán.',
        documents: []
    },
];

export const MOCK_PROJECT_TASKS: TaskDetail[] = [
    {
        id: 'TASK-101',
        projectId: 1,
        title: 'Thiết kế Mockup trang chủ v2.0',
        status: 'In Progress',
        priority: 'High',
        assigneeDepartment: 'Khối Marketing & Truyền thông',
        startDate: '2024-11-01',
        dueDate: '2024-11-20',
        description: 'Cần thiết kế lại layout trang chủ theo style guide mới. Chú ý phần Hero banner và section Testimonials.',
        tags: ['Design', 'UI/UX'],
        checklist: [
            { id: 'c1', text: 'Phác thảo Wireframe', isCompleted: true },
            { id: 'c2', text: 'Thiết kế High-fidelity', isCompleted: false },
            { id: 'c3', text: 'Review với Team Lead', isCompleted: false }
        ],
        comments: [
            { id: 'cm1', userId: 'u001', userName: 'Nguyễn Thị Hoa', userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100', text: 'Nhớ check lại màu brand nhé em, bản cũ hơi nhạt.', timestamp: '2 giờ trước' }
        ],
        attachments: [
            { name: 'Wireframe_v1.png', url: '#', date: '2024-11-02', type: 'image', source: 'Task', uploader: 'Lê Văn B' }
        ]
    },
    {
        id: 'TASK-102',
        projectId: 2,
        title: 'Viết API xác thực người dùng (Auth Service)',
        status: 'Done',
        priority: 'Critical',
        assigneeDepartment: 'Software Development',
        startDate: '2024-11-05',
        dueDate: '2024-11-15',
        description: 'Triển khai JWT authentication và refresh token mechanism.',
        tags: ['Backend', 'Security'],
        checklist: [
            { id: 'c1', text: 'Database Schema User', isCompleted: true },
            { id: 'c2', text: 'API Login/Register', isCompleted: true },
            { id: 'c3', text: 'Unit Test', isCompleted: true }
        ],
        comments: [],
        attachments: []
    },
    {
        id: 'TASK-103',
        projectId: 1,
        title: 'Họp kick-off team Marketing',
        status: 'To Do',
        priority: 'Medium',
        assigneeDepartment: 'Khối Marketing & Truyền thông',
        startDate: '2024-11-22',
        dueDate: '2024-11-22',
        description: 'Họp thống nhất kế hoạch chạy ads tháng 12.',
        tags: ['Meeting'],
        checklist: [],
        comments: [],
        attachments: []
    },
    {
        id: 'TASK-104',
        projectId: 1,
        title: 'Cắt HTML/CSS trang chủ',
        status: 'To Do',
        priority: 'High',
        assigneeDepartment: 'Software Development',
        startDate: '2024-11-10',
        dueDate: '2024-11-15', // Overdue
        description: 'Chuyển đổi thiết kế Figma sang HTML.',
        tags: ['Frontend'],
        checklist: [],
        comments: [],
        attachments: []
    }
];

export const MOCK_PROJECT_REPORTS: ProjectReport[] = [
    {
        id: 'pr1',
        projectId: 1,
        department: 'Khối Marketing & Truyền thông',
        title: 'Báo cáo giai đoạn 1: Thiết kế giao diện',
        content: 'Team đã hoàn thành xong bản vẽ Figma cho 5 trang chính: Trang chủ, Sản phẩm, Giới thiệu, Liên hệ, Blog. Đang chờ feedback từ BOD.',
        submittedBy: 'Nguyễn Thị Hoa',
        submittedDate: '2024-11-10',
        status: 'Approved',
        feedback: 'Thiết kế tốt, cần chỉnh lại màu footer một chút.',
        attachments: [
            { name: 'Report_GiaiDoan1.pdf', url: '#', date: '2024-11-10', source: 'Report', uploader: 'Marketing' }
        ]
    },
    {
        id: 'pr2',
        projectId: 1,
        department: 'Software Development',
        title: 'Báo cáo tuần 3 tháng 11',
        content: 'Đã setup xong server staging. Đang tiến hành cắt HTML/CSS theo bản design mới nhất. Dự kiến xong Frontend vào cuối tháng.',
        submittedBy: 'Trần Văn Nam',
        submittedDate: '2024-11-18',
        status: 'Pending',
        attachments: []
    }
];

export const MOCK_FORUM_CATEGORIES: ForumCategory[] = [
    { id: 'general', name: 'Thông báo chung', description: 'Các thông báo chính thức từ công ty, Ban giám đốc.', icon: 'Bell', color: 'bg-red-50 text-red-600', postCount: 124 },
    { id: 'tech', name: 'Góc Công nghệ', description: 'Thảo luận về Tech stack, AI, Gadgets và Xu hướng mới.', icon: 'Cpu', color: 'bg-blue-50 text-blue-600', postCount: 86 },
    { id: 'events', name: 'Sự kiện & Văn hóa', description: 'Team building, Year End Party, CLB Thể thao.', icon: 'Calendar', color: 'bg-orange-50 text-orange-600', postCount: 45 },
    { id: 'market', name: 'Góc Rao vặt', description: 'Trao đổi, mua bán đồ cũ giữa các đồng nghiệp.', icon: 'ShoppingBag', color: 'bg-green-50 text-green-600', postCount: 22 },
    { id: 'qna', name: 'Hỏi đáp & Hỗ trợ', description: 'Thắc mắc về quy trình, chính sách, IT Support.', icon: 'HelpCircle', color: 'bg-purple-50 text-purple-600', postCount: 56 },
];

export const MOCK_FORUM_POSTS: ForumPost[] = [
    {
        id: 'fp1',
        categoryId: 'general',
        authorName: 'Nguyễn Văn An',
        authorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100',
        authorDept: 'CEO',
        title: 'Thông báo về Lịch nghỉ Tết Nguyên Đán 2025',
        content: 'Thân gửi toàn thể CBNV, Ban Giám đốc xin thông báo lịch nghỉ Tết Nguyên Đán 2025 như sau: Chúng ta sẽ bắt đầu nghỉ từ ngày 25/01/2025 đến hết ngày 02/02/2025. Chúc mọi người một năm mới An Khang Thịnh Vượng!',
        timestamp: '2 giờ trước',
        upvotes: 256,
        downvotes: 2,
        userVote: 1,
        commentCount: 45,
        viewCount: 450,
        isPinned: true,
        isSaved: true,
        tags: ['Announcement', 'HR'],
        status: 'Approved',
        isSubscribed: true,
        comments: [
             { 
                 id: 'c1', postId: 'fp1', authorName: 'Phạm Thu Trang', authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100', authorDept: 'HR', content: 'Mọi người nhớ check email để xem chi tiết về thưởng Tết nhé!', timestamp: '1 giờ trước', upvotes: 24, downvotes: 0, 
                 replies: [
                     { id: 'c1_r1', postId: 'fp1', authorName: 'Lê Văn B', authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100&h=100', authorDept: 'UI Designer', content: 'Đã nhận được mail, cảm ơn chị Trang!', timestamp: '30 phút trước', upvotes: 2, downvotes: 0 }
                 ]
             }
        ]
    },
    {
        id: 'fp2',
        categoryId: 'tech',
        authorName: 'Trần Văn Nam',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
        authorDept: 'Software Dev',
        title: 'Thảo luận: Có nên migrate dự án ERP sang Next.js 14?',
        content: 'Hiện tại team Dev đang cân nhắc nâng cấp hệ thống ERP. Next.js 14 với Server Actions có vẻ rất hứa hẹn để giảm thiểu API layer. Anh em cho ý kiến nhé!',
        timestamp: '5 giờ trước',
        upvotes: 42,
        downvotes: 5,
        userVote: 0,
        commentCount: 18,
        viewCount: 120,
        isPinned: false,
        tags: ['Tech', 'Frontend', 'Discussion'],
        status: 'Approved',
        isSubscribed: false,
    },
    {
        id: 'fp3',
        categoryId: 'events',
        authorName: 'Lê Văn B',
        authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100&h=100',
        authorDept: 'Marketing',
        title: '[HOT] Đăng ký tham gia giải bóng đá Nexus Cup 2024',
        content: 'Giải bóng đá thường niên Nexus Cup đã quay trở lại! Các team nhanh tay đăng ký danh sách cầu thủ trước ngày 20/11 nhé. Giải thưởng năm nay lên tới 20 triệu đồng!',
        timestamp: '1 ngày trước',
        upvotes: 89,
        downvotes: 0,
        userVote: 0,
        commentCount: 35,
        viewCount: 300,
        isPinned: false,
        tags: ['Event', 'Sport'],
        status: 'Approved',
        isSubscribed: true,
    },
    {
        id: 'fp4',
        categoryId: 'events',
        authorName: 'Ban Tổ Chức',
        authorAvatar: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=100&h=100',
        authorDept: 'Culture',
        title: 'Khảo sát: Địa điểm tổ chức Year End Party 2024',
        content: 'Chào mọi người, BTC muốn lắng nghe ý kiến của mọi người về địa điểm tổ chức tiệc cuối năm nay. Hãy bình chọn bên dưới nhé!',
        timestamp: '30 phút trước',
        upvotes: 120,
        downvotes: 0,
        commentCount: 15,
        viewCount: 500,
        tags: ['Poll', 'YEP2024'],
        status: 'Approved',
        poll: {
            id: 'poll1',
            question: 'Bạn thích tổ chức YEP ở đâu?',
            totalVotes: 150,
            options: [
                { id: 'opt1', text: 'Trung tâm Hội nghị Gem Center', votes: 80 },
                { id: 'opt2', text: 'Khu du lịch Văn Thánh (Ngoài trời)', votes: 45 },
                { id: 'opt3', text: 'Khách sạn InterContinental', votes: 25 }
            ]
        }
    }
];

export const MOCK_NEWS: NewsArticle[] = [
    {
        id: 'news-1',
        title: 'Nexus Corp đạt cột mốc tăng trưởng 200% trong Quý 3',
        summary: 'Kết quả kinh doanh Quý 3 cho thấy sự bứt phá mạnh mẽ ở mảng Công nghệ và Dịch vụ số, khẳng định vị thế dẫn đầu của Nexus trên thị trường.',
        content: '<p>Trong buổi họp báo cáo kết quả kinh doanh Quý 3 vừa qua, CEO Nguyễn Văn An đã công bố những con số ấn tượng...</p><p>Chiến lược chuyển đổi số toàn diện đã mang lại quả ngọt khi doanh thu từ mảng dịch vụ phần mềm tăng gấp đôi so với cùng kỳ năm ngoái.</p>',
        coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop',
        category: 'Strategy',
        authorName: 'Ban Truyền Thông',
        authorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100',
        publishDate: '20/10/2024',
        readTime: '5 phút đọc',
        isFeatured: true,
        status: 'Published',
        tags: ['Growth', 'Q3 Report', 'Business']
    },
    {
        id: 'news-2',
        title: 'Review: Year End Party 2023 - Đêm hội của những ngôi sao',
        summary: 'Nhìn lại những khoảnh khắc đáng nhớ trong đêm tiệc tất niên vừa qua, nơi vinh danh những cá nhân xuất sắc nhất năm.',
        content: '...',
        coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop',
        category: 'Event',
        authorName: 'Nguyễn Thị Hoa',
        authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100',
        publishDate: '15/01/2024',
        readTime: '3 phút đọc',
        status: 'Published',
        tags: ['YEP', 'Party', 'Culture']
    },
    {
        id: 'news-3',
        title: 'Chính sách "Remote Working" mới áp dụng từ 2025',
        summary: 'Nexus Corp chính thức ban hành quy chế làm việc linh hoạt, cho phép nhân viên đăng ký làm việc từ xa lên đến 50% thời gian.',
        content: '...',
        coverImage: 'https://images.unsplash.com/photo-1593642532400-2682810df593?q=80&w=2069&auto=format&fit=crop',
        category: 'Announcement',
        authorName: 'Phạm Thu Trang',
        authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100',
        publishDate: '01/11/2024',
        readTime: '7 phút đọc',
        status: 'Published',
        tags: ['HR Policy', 'Remote', 'Benefits']
    },
    {
        id: 'news-4',
        title: 'Workshop: Ứng dụng AI trong công việc hàng ngày',
        summary: 'Mời toàn thể nhân viên tham gia buổi chia sẻ về cách sử dụng GenAI để tối ưu hiệu suất công việc.',
        content: '...',
        coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop',
        category: 'Culture',
        authorName: 'Trần Văn Nam',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
        publishDate: '05/11/2024',
        readTime: '2 phút đọc',
        status: 'Draft',
        tags: ['AI', 'Workshop', 'Training']
    }
];

export const MOCK_ALERTS: AlertRule[] = [
    { id: 'al1', name: 'Hợp đồng sắp hết hạn', description: 'Cảnh báo khi nhân viên sắp hết hạn hợp đồng.', isEnabled: true, threshold: 30, unit: 'days', notifyTo: ['Admin', 'Manager'], category: 'HR' },
    { id: 'al2', name: 'Quỹ phép còn lại thấp', description: 'Thông báo khi nhân viên còn dưới 2 ngày phép.', isEnabled: false, threshold: 2, unit: 'count', notifyTo: ['Employee', 'Manager'], category: 'HR' },
    { id: 'al3', name: 'Thử việc sắp kết thúc', description: 'Nhắc nhở đánh giá thử việc trước thời hạn.', isEnabled: true, threshold: 7, unit: 'days', notifyTo: ['Manager'], category: 'HR' },
    { id: 'al4', name: 'Dung lượng lưu trữ hệ thống', description: 'Cảnh báo khi ổ cứng server đầy.', isEnabled: true, threshold: 90, unit: 'percent', notifyTo: ['Admin'], category: 'System' },
];

export const MOCK_BACKUPS: BackupFile[] = [
    { id: 'bk1', fileName: 'backup_full_20241120.sql', size: '4.2 GB', createdAt: '20/11/2024 02:00', type: 'Full', status: 'Success' },
    { id: 'bk2', fileName: 'backup_inc_20241119.sql', size: '150 MB', createdAt: '19/11/2024 02:00', type: 'Incremental', status: 'Success' },
    { id: 'bk3', fileName: 'backup_inc_20241118.sql', size: '145 MB', createdAt: '18/11/2024 02:00', type: 'Incremental', status: 'Success' },
    { id: 'bk4', fileName: 'backup_inc_20241117.sql', size: '160 MB', createdAt: '17/11/2024 02:00', type: 'Incremental', status: 'Success' },
    { id: 'bk5', fileName: 'backup_full_20241113.sql', size: '4.1 GB', createdAt: '13/11/2024 02:00', type: 'Full', status: 'Success' },
];

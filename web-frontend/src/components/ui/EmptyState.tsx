import React from 'react';
import { FolderOpen, Search, FileText, Calendar, MessageSquare, Bell } from 'lucide-react';
import { Button } from './Button';

type EmptyStateType = 'default' | 'search' | 'tasks' | 'projects' | 'meetings' | 'messages' | 'notifications';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const icons: Record<EmptyStateType, React.ReactNode> = {
  default: <FolderOpen className="w-12 h-12 text-slate-300" />,
  search: <Search className="w-12 h-12 text-slate-300" />,
  tasks: <FileText className="w-12 h-12 text-slate-300" />,
  projects: <FolderOpen className="w-12 h-12 text-slate-300" />,
  meetings: <Calendar className="w-12 h-12 text-slate-300" />,
  messages: <MessageSquare className="w-12 h-12 text-slate-300" />,
  notifications: <Bell className="w-12 h-12 text-slate-300" />,
};

const defaultContent: Record<EmptyStateType, { title: string; description: string }> = {
  default: { title: 'Không có dữ liệu', description: 'Chưa có dữ liệu để hiển thị.' },
  search: { title: 'Không tìm thấy kết quả', description: 'Thử thay đổi từ khóa tìm kiếm.' },
  tasks: { title: 'Chưa có công việc', description: 'Bạn chưa được giao công việc nào.' },
  projects: { title: 'Chưa có dự án', description: 'Bạn chưa tham gia dự án nào.' },
  meetings: { title: 'Không có cuộc họp', description: 'Bạn không có cuộc họp nào sắp tới.' },
  messages: { title: 'Chưa có tin nhắn', description: 'Bắt đầu cuộc trò chuyện mới.' },
  notifications: { title: 'Không có thông báo', description: 'Bạn đã đọc hết thông báo.' },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'default',
  title,
  description,
  action,
  className = '',
}) => {
  const content = defaultContent[type];

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="mb-4">{icons[type]}</div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">
        {title || content.title}
      </h3>
      <p className="text-sm text-slate-500 mb-4 max-w-sm">
        {description || content.description}
      </p>
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

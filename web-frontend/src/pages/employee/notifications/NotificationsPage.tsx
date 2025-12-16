import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  RefreshCw,
  Calendar,
  MessageSquare,
  FolderKanban,
  CheckCircle,
  AlertCircle,
  Info,
  Clock
} from 'lucide-react';
import { notificationService, Notification } from '../../../services/notificationService';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';

type FilterType = 'all' | 'unread';

const THEME = {
  bg: "bg-[#F8FAFC]",
  card: "bg-white rounded-[24px] shadow-sm border-0",
  textPrimary: "text-slate-900",
  textSecondary: "text-slate-500",
  accent: "text-teal-600",
  accentBg: "bg-teal-50",
  buttonGhost: "bg-transparent text-slate-500 hover:bg-slate-100 rounded-xl"
};

import { useNavigate } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
      await Promise.all(unreadIds.map((id) => notificationService.markAsRead(id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === 'all' ? true : !n.isRead
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      task: <FolderKanban className="w-5 h-5 text-indigo-500" />,
      project: <FolderKanban className="w-5 h-5 text-violet-500" />,
      meeting: <Calendar className="w-5 h-5 text-emerald-500" />,
      booking: <Calendar className="w-5 h-5 text-teal-500" />,
      message: <MessageSquare className="w-5 h-5 text-rose-500" />,
      alert: <AlertCircle className="w-5 h-5 text-amber-500" />,
      success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      info: <Info className="w-5 h-5 text-blue-500" />,
    };
    return iconMap[type] || <Bell className="w-5 h-5 text-slate-400" />;
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on type
    switch (notification.type) {
      case 'task':
        // Logic to check if there is an ID would be here, for now go to tasks
        navigate('/employee/tasks');
        break;
      case 'project':
        navigate('/employee/projects');
        break;
      case 'message':
        navigate('/employee/chat');
        break;
      case 'meeting':
      case 'booking':
        navigate('/employee/meetings');
        break;
      default:
        break;
    }
  };

  return (
    <div className={`min-h-screen ${THEME.bg} p-6 font-sans text-slate-800`}>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Bell className="text-teal-600" /> Notifications
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${filter === 'unread' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Unread
                {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              >
                <CheckCheck size={16} /> Mark all read
              </button>
            )}

            <button onClick={fetchNotifications} className={`${THEME.buttonGhost} p-3`}>
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`${THEME.card} overflow-hidden min-h-[400px]`}>
          {loading ? (
            <div className="p-8 space-y-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-12 h-12" rounded="full" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="w-3/4 h-4" />
                    <Skeleton className="w-full h-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Bell size={40} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No notifications</h3>
              <p className="text-slate-500 mt-1 max-w-sm">
                {filter === 'unread' ? "You've read all your notifications." : "We'll notify you when something important happens."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-6 hover:bg-slate-50 transition-colors cursor-pointer group ${!notification.isRead ? 'bg-teal-50/30' : ''}`}
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${!notification.isRead ? 'bg-white shadow-md border border-teal-100' : 'bg-slate-100'}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-base ${!notification.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>{notification.title}</h4>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 whitespace-nowrap ml-2">
                          <Clock size={12} /> {getTimeAgo(notification.createdAt)}
                        </span>
                      </div>

                      <p className={`text-sm ${!notification.isRead ? 'text-slate-600' : 'text-slate-400'} leading-relaxed`}>{notification.message}</p>

                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded">{notification.type}</span>
                        {!notification.isRead && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-1 rounded flex items-center gap-1">New</span>
                        )}
                      </div>
                    </div>

                    {!notification.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                        className="self-center p-2 text-slate-300 hover:text-teal-600 hover:bg-white hover:shadow-sm rounded-full transition-all opacity-0 group-hover:opacity-100"
                        title="Mark as read"
                      >
                        <Check size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NotificationsPage;

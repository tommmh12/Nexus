import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  Calendar,
  Briefcase,
  Video,
  ChevronRight,
  AlertCircle,
  Plus,
  Play,
  Coffee,
  ArrowRight,
  CheckSquare,
  Bell,
  Wallet,
  FileText
} from 'lucide-react';
import { useEmployeeDashboard, DashboardTask, DashboardMeeting } from '../../../hooks/useEmployeeDashboard';
import { newsService } from '../../../services/newsService';

// --- Configuration ---
const THEME = {
  bg: "bg-[#F8FAFC]", // Porcelain
  cardBg: "bg-white",
  textPrimary: "text-slate-900",
  textSecondary: "text-slate-500",
  textAccent: "text-teal-600",
  buttonPrimary: "bg-slate-900 text-white hover:bg-slate-800",
  buttonSecondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
};

// --- Helper Types ---
type StreamItem =
  | { type: 'meeting'; data: DashboardMeeting; time: Date }
  | { type: 'task'; data: DashboardTask; time: Date };

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { stats, tasks, projects, meetings, notifications, loading } = useEmployeeDashboard();

  // Local state
  const [news, setNews] = useState<any[]>([]);

  // 1. Data Transformation: Create "The Stream"
  const dailyStream: StreamItem[] = useMemo(() => {
    const stream: StreamItem[] = [];

    // Add Meetings (Assume all are today relative to dashboard logic)
    meetings.forEach(m => {
      stream.push({ type: 'meeting', data: m, time: new Date(m.startTime) });
    });

    // Add Tasks (Only pending/in-progress)
    tasks.forEach(t => {
      if (t.status !== 'Done' && t.status !== 'Completed') {
        const dueDate = t.dueDate ? new Date(t.dueDate) : new Date();
        stream.push({ type: 'task', data: t, time: dueDate });
      }
    });

    // Sort by time
    return stream.sort((a, b) => a.time.getTime() - b.time.getTime());
  }, [meetings, tasks]);

  // 2. Determine "Keystone" (The One Thing)
  const keystoneItem = useMemo(() => {
    const now = new Date();
    // Priority 1: Meeting starting in next 15 mins
    const upcomingMeeting = meetings.find(m => {
      const start = new Date(m.startTime);
      const diff = (start.getTime() - now.getTime()) / 60000;
      return diff > -5 && diff <= 30; // Starts soon or just started
    });

    if (upcomingMeeting) return { type: 'meeting', data: upcomingMeeting };

    // Priority 2: Critical Task
    const criticalTask = tasks.find(t => t.priority === 'Critical' && t.status !== 'Done');
    if (criticalTask) return { type: 'task', data: criticalTask };

    // Priority 3: Next Item in Stream
    if (dailyStream.length > 0) return { type: listType(dailyStream[0]), data: dailyStream[0].data };

    return null;
  }, [meetings, tasks, dailyStream]);

  function listType(item: StreamItem): 'meeting' | 'task' {
    return item.type;
  }

  // Fetch News
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await newsService.getPublicArticles(3);
        setNews(response || []);
      } catch (e) {
        console.error("Failed to fetch news", e);
      }
    };
    fetchNews();
  }, []);

  // --- Helpers ---
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const fullName = user?.fullName || user?.name || 'Alex';
  const firstName = fullName.split(' ').pop();

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  };

  const formatTime = (d: string | Date) => {
    return new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading.stats) return <div className="h-screen flex items-center justify-center text-slate-400">Loading your cockpit...</div>;

  return (
    <div className={`min-h-screen ${THEME.bg} p-6 font-sans text-slate-800`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* === LEFT COLUMN: MAIN FOCUS (65%) === */}
        <div className="lg:col-span-2 space-y-10">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {getGreeting()}, {firstName}.
            </h1>
            <p className="text-slate-500 mt-2 text-lg font-medium flex items-center gap-2">
              {meetings.length === 0 ? (
                <><Coffee size={20} className="text-orange-400" /> Bạn không có cuộc họp nào hôm nay.</>
              ) : (
                <><Clock size={20} className="text-teal-500" /> Bạn có {meetings.length} cuộc họp và {stats.pendingTasks} việc cần làm.</>
              )}
            </p>
          </div>

          {/* Zone B: Keystone Card (The Focus) */}
          {keystoneItem ? (
            <div className="bg-white rounded-[24px] p-8 shadow-xl shadow-slate-200/50 border-0 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className={`absolute top-0 left-0 w-2 h-full ${keystoneItem.type === 'meeting' ? 'bg-teal-500' : 'bg-orange-500'}`}></div>

              <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${keystoneItem.type === 'meeting' ? 'bg-teal-50 text-teal-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                  {keystoneItem.type === 'meeting' ? 'Happening Soon' : 'Top Priority'}
                </span>
                {keystoneItem.type === 'task' && (
                  <span className="text-slate-400 text-sm font-mono">
                    Due: {formatTime((keystoneItem.data as DashboardTask).dueDate)}
                  </span>
                )}
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
                {keystoneItem.type === 'meeting' ? (keystoneItem.data as DashboardMeeting).title : (keystoneItem.data as DashboardTask).title}
              </h2>

              {keystoneItem.type === 'meeting' && (
                <div className="flex items-center gap-4 text-slate-500 mb-8 border-l-2 border-slate-100 pl-4">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-wider text-slate-400">Time</div>
                    <div className="text-lg font-medium text-slate-900">
                      {formatTime((keystoneItem.data as DashboardMeeting).startTime)} - {formatTime((keystoneItem.data as DashboardMeeting).endTime)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-wider text-slate-400">Location</div>
                    <div className="text-lg font-medium text-slate-900">
                      {(keystoneItem.data as DashboardMeeting).type === 'online' ? 'Google Meet' : (keystoneItem.data as DashboardMeeting).location || 'Office'}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button className={`${THEME.buttonPrimary} px-8 py-3 rounded-xl font-bold shadow-lg shadow-slate-900/20 flex items-center gap-2 transform group-hover:-translate-y-0.5 transition-transform`}>
                  {keystoneItem.type === 'meeting' ? <Video size={20} /> : <Play size={20} />}
                  {keystoneItem.type === 'meeting' ? 'Join Meeting' : 'Start Working'}
                </button>
                {keystoneItem.type === 'task' && (
                  <button className={`${THEME.buttonSecondary} px-6 py-3 rounded-xl font-bold`}>
                    Mark Done
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] p-8 shadow-xl shadow-slate-200/50 border-0 flex items-center justify-center flex-col text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">All caught up!</h2>
              <p className="text-slate-500 mt-2">You have no pending tasks or meetings.</p>
            </div>
          )}

          {/* Zone C: The Work Stream */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-slate-900 font-bold text-xl flex items-center gap-2">
                Your Stream <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">{dailyStream.length} items</span>
              </h3>
            </div>

            <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-10">
              {dailyStream.length > 0 ? dailyStream.map((item, idx) => (
                <div key={idx} className="relative pl-8 group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10 
                                ${item.type === 'meeting' ? 'bg-teal-500' : 'bg-slate-300 group-hover:bg-orange-400 transition-colors'}`}>
                  </div>

                  <div
                    onClick={() => {
                      if (item.type === 'task') {
                        navigate(`/employee/tasks/${(item.data as DashboardTask).id}`);
                      } else {
                        navigate('/employee/meetings');
                      }
                    }}
                    className="flex items-start justify-between p-4 -m-4 rounded-xl hover:bg-white hover:shadow-md transition-all cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold text-slate-400">
                          {formatTime(item.time)}
                        </span>
                        {item.type === 'task' && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${(item.data as DashboardTask).priority === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                            {(item.data as DashboardTask).priority}
                          </span>
                        )}
                      </div>
                      <h4 className={`text-lg font-bold ${item.type === 'meeting' ? 'text-slate-800' : 'text-slate-700'}`}>
                        {(item.data as any).title}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                        {item.type === 'meeting'
                          ? (item.data as DashboardMeeting).roomName || 'Online Meeting'
                          : (item.data as DashboardTask).projectName
                        }
                      </p>
                    </div>

                    <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="pl-8 text-slate-400 italic">No more items for today.</div>
              )}
            </div>
          </div>

        </div>

        {/* === RIGHT COLUMN: UTILITY RAIL (35%) === */}
        <div className="space-y-8">

          {/* 1. Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <QuickActionBtn icon={CheckSquare} label="New Task" onClick={() => navigate('/employee/tasks')} />
            <QuickActionBtn icon={Video} label="Meet Now" onClick={() => navigate('/employee/meetings')} />
            <QuickActionBtn icon={Wallet} label="Expense" onClick={() => { }} />
            <QuickActionBtn icon={Calendar} label="Book Room" onClick={() => navigate('/employee/booking')} />
          </div>

          {/* 2. Notifications (Action Required) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Bell size={18} className="text-slate-400" /> Needs Attention
            </h3>
            <div className="space-y-4">
              {notifications.filter(n => !n.isRead).slice(0, 3).map(n => (
                <div key={n.id} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-snug">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                  </div>
                </div>
              ))}
              {notifications.filter(n => !n.isRead).length === 0 && (
                <div className="text-center py-6 text-slate-400 text-sm">No new alerts.</div>
              )}
            </div>
          </div>

          {/* 3. Company Focus / News */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 opacity-20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <h3 className="font-bold opacity-80 mb-4 text-sm uppercase tracking-wider">Company Focus</h3>
            {news.length > 0 ? (
              <div>
                <h4 className="text-lg font-bold mb-2 leading-snug">{news[0].title}</h4>
                <button className="text-xs font-bold text-teal-300 hover:text-white flex items-center gap-1 mt-3">
                  Read Announcement <ArrowRight size={12} />
                </button>
              </div>
            ) : (
              <p className="text-sm opacity-60">No major announcements.</p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

// --- Atomic Components ---
const QuickActionBtn = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all flex flex-col items-center gap-2 group"
  >
    <div className="p-2 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
      <Icon size={24} />
    </div>
    <span className="text-sm font-bold text-slate-700">{label}</span>
  </button>
);

export default EmployeeDashboard;

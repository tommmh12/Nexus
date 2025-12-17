import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  CheckCircle,
  FolderKanban,
  Calendar,
  CheckSquare,
  Eye,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useMyTasks, MyTask } from '../../../hooks/useMyTasks';
import { Avatar } from '../../../components/ui/Avatar';
import { TaskListSkeleton, KanbanBoardSkeleton } from '../../../components/ui/TaskSkeleton';
import { TaskDetailPanelEnhanced } from '../../../components/projects/TaskDetailPanelEnhanced';
import { useSocket } from '../../../hooks/useSocket';

// --- Configuration ---
const THEME = {
  bg: "bg-[#F8FAFC]",
  card: "bg-white rounded-[20px] shadow-sm hover:shadow-md transition-all border-0",
  cardHover: "hover:shadow-lg hover:-translate-y-1 duration-300",
  textPrimary: "text-slate-900",
  textSecondary: "text-slate-500",
  accent: "text-teal-600",
  buttonPrimary: "bg-slate-900 text-white hover:bg-slate-800 rounded-xl",
  buttonGhost: "bg-transparent text-slate-500 hover:bg-slate-100 rounded-xl"
};

// --- Types ---
type ViewMode = 'list' | 'board';
type StatusFilter = 'all' | 'pending' | 'in-progress' | 'completed';

// --- Utility ---
const safeProjectName = (name: string | null | undefined): string => name || 'No Project';
const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const MyTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get Task ID from URL
  const { tasks, loading, error, refetch } = useMyTasks();
  const { isConnected } = useSocket();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [activeTask, setActiveTask] = useState<MyTask | null>(null);

  // Sync URL ID with Active Task
  useEffect(() => {
    if (id && tasks.length > 0) {
      const task = tasks.find(t => t.id === id);
      if (task) {
        setActiveTask(task);
      }
    } else if (!id) {
      setActiveTask(null);
    }
  }, [id, tasks]);

  // Handle Close Modal -> Remove ID from URL
  const handleCloseDetail = () => {
    setActiveTask(null);
    navigate('/employee/tasks');
  };

  // Handle Open Detail -> Add ID to URL
  const handleOpenDetail = (task: MyTask) => {
    navigate(`/employee/tasks/${task.id}`);
  };

  // Stats
  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter(t => t.status !== 'Done' && t.status !== 'Completed').length,
    completed: tasks.filter(t => t.status === 'Done' || t.status === 'Completed').length,
  }), [tasks]);

  // Filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
      const statusCheck = statusFilter === 'all'
        ? true
        : statusFilter === 'completed'
          ? (t.status === 'Done' || t.status === 'Completed')
          : (t.status !== 'Done' && t.status !== 'Completed');
      return matchesSearch && statusCheck;
    });
  }, [tasks, searchTerm, statusFilter]);

  // Loading state with skeleton
  if (loading) {
    return (
      <div className={`min-h-screen ${THEME.bg} p-6 font-sans text-slate-800`}>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="h-8 bg-slate-200 rounded w-48 animate-pulse mb-2" />
              <div className="h-4 bg-slate-100 rounded w-64 animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-24 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-10 w-10 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse" />
            </div>
          </div>
          {/* Filter skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 h-14 bg-slate-200 rounded-[20px] animate-pulse" />
            <div className="h-24 bg-slate-800 rounded-[20px] animate-pulse" />
          </div>
          {/* Content skeleton */}
          {viewMode === 'list' ? <TaskListSkeleton count={5} /> : <KanbanBoardSkeleton />}
        </div>
      </div>
    );
  }

  if (error) return <div className="text-red-500 text-center p-10">{error}</div>;

  return (
    <div className={`min-h-screen ${THEME.bg} p-6 font-sans text-slate-800`}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <CheckSquare className="text-teal-600" /> My Tasks
              {/* Realtime connection indicator */}
              <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                isConnected ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'
              }`}>
                {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              You have <span className="text-slate-900 font-bold">{stats.pending}</span> pending tasks today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex">
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                <List size={20} />
              </button>
              <button onClick={() => setViewMode('board')} className={`p-2 rounded-lg transition-all ${viewMode === 'board' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                <LayoutGrid size={20} />
              </button>
            </div>
            <button onClick={() => refetch()} className={`${THEME.buttonGhost} p-3`}>
              <RefreshCw size={20} />
            </button>
            <button className={`${THEME.buttonPrimary} px-5 py-3 font-bold flex items-center gap-2 shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 transition-transform`}>
              <CheckSquare size={18} /> Add Task
            </button>
          </div>
        </div>

        {/* FILTERS & STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white p-2 rounded-[20px] shadow-sm flex items-center gap-2">
            <div className="pl-4 text-slate-400"><Search size={20} /></div>
            <input
              type="text"
              placeholder="Search tasks..."
              className="flex-1 py-3 px-2 outline-none text-slate-700 placeholder:text-slate-400 font-medium"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="h-8 w-px bg-slate-100 mx-2"></div>
            <select
              className="outline-none bg-transparent text-slate-600 font-bold text-sm pr-4 cursor-pointer"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Mini Stat */}
          <div className="bg-slate-900 text-white rounded-[20px] p-6 shadow-xl flex items-center justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Completion Rate</span>
              <div className="text-3xl font-bold mt-1">
                {stats.total > 0 ? Math.round((stats.completed / (stats.total)) * 100) : 0}%
              </div>
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full border-4 border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle size={24} className="text-emerald-400" />
              </div>
            </div>
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-teal-500 rounded-full -mr-6 -mb-6 opacity-20 blur-xl"></div>
          </div>
        </div>

        {/* CONTENT: LIST VIEW */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredTasks.length > 0 ? filteredTasks.map(task => (
              <div key={task.id} className={`${THEME.card} p-5 flex flex-col md:flex-row md:items-center gap-6 group cursor-pointer`} onClick={() => handleOpenDetail(task)}>
                {/* Status Indicator */}
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${task.status === 'Done' ? 'bg-emerald-500' : task.priority === 'Critical' ? 'bg-red-500' : 'bg-slate-300'}`}></div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-teal-600 transition-colors">
                      {task.title}
                    </h3>
                    {task.priority === 'Critical' && (
                      <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Critical</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1 hover:text-teal-600 transition-colors" onClick={(e) => {
                      e.stopPropagation();
                      if (task.projectId) navigate(`/employee/projects/${task.projectId}`);
                    }}><FolderKanban size={14} /> {safeProjectName(task.projectName)}</span>
                    {task.dueDate && <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(task.dueDate)}</span>}
                  </div>
                </div>

                {/* Assignees */}
                <div className="flex -space-x-2">
                  {(task.assignees || []).slice(0, 3).map((a, i) => (
                    <div key={i} onClick={(e) => { e.stopPropagation(); navigate(`/employee/chat?userId=${a.name}`); }} className="cursor-pointer hover:z-10 transition-transform hover:scale-110" title={`Chat with ${a.name}`}>
                      <Avatar name={a.name} src={a.avatarUrl || undefined} size="sm" className="border-2 border-white" />
                    </div>
                  ))}
                </div>

                <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-all">
                  <Eye size={20} />
                </button>
              </div>
            )) : (
              <div className="text-center py-20 text-slate-400">
                <FolderKanban size={48} className="mx-auto mb-4 opacity-50" />
                <p>No tasks found matching your filters.</p>
              </div>
            )}
          </div>
        )}

        {/* CONTENT: BOARD VIEW */}
        {viewMode === 'board' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start h-full">
            {['Pending', 'In Progress', 'Done'].map(status => (
              <div key={status} className="bg-slate-100/50 p-4 rounded-[24px]">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="font-bold text-slate-700">{status}</h3>
                  <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-slate-500 shadow-sm">
                    {filteredTasks.filter(t => {
                      if (status === 'Done') return t.status === 'Done' || t.status === 'Completed';
                      if (status === 'Pending') return t.status !== 'Done' && t.status !== 'In Progress';
                      return t.status === status;
                    }).length}
                  </span>
                </div>
                <div className="space-y-3">
                  {filteredTasks
                    .filter(t => {
                      if (status === 'Done') return t.status === 'Done' || t.status === 'Completed';
                      if (status === 'Pending') return t.status !== 'Done' && t.status !== 'Completed' && t.status !== 'In Progress';
                      return t.status === status || (status === 'In Progress' && (t.status === 'In Progress' || t.status === 'inProgress'));
                    })
                    .map(task => (
                      <div key={task.id} className="bg-white p-4 rounded-[20px] shadow-sm hover:shadow-md cursor-pointer group" onClick={() => handleOpenDetail(task)}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${task.priority === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                            {task.priority || 'Normal'}
                          </span>
                          {task.dueDate && <span className="text-[10px] font-bold text-slate-400">{formatDate(task.dueDate)}</span>}
                        </div>
                        <h4 className="font-bold text-slate-900 leading-snug mb-3 group-hover:text-teal-600 transition-colors">{task.title}</h4>
                        <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[100px] hover:text-teal-600" onClick={(e) => {
                            e.stopPropagation();
                            if (task.projectId) navigate(`/employee/projects/${task.projectId}`);
                          }}>{safeProjectName(task.projectName)}</span>
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {(task.assignees?.[0]?.name || 'U').charAt(0)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* TASK DETAIL MODAL - Enhanced with realtime & optimistic updates */}
      {activeTask && (
        <TaskDetailPanelEnhanced
          taskId={activeTask.id}
          initialTask={activeTask}
          onClose={handleCloseDetail}
          onTaskUpdate={refetch}
        />
      )}
    </div>
  );
};

export default MyTasksPage;

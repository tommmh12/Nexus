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
  X,
  ArrowRight
} from 'lucide-react';
import { useMyTasks, MyTask } from '../../../hooks/useMyTasks';
import { Avatar } from '../../../components/ui/Avatar';

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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading tasks...</div>;
  if (error) return <div className="text-red-500 text-center p-10">{error}</div>;

  return (
    <div className={`min-h-screen ${THEME.bg} p-6 font-sans text-slate-800`}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <CheckSquare className="text-teal-600" /> My Tasks
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

      {/* TASK DETAIL MODAL */}
      {activeTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={handleCloseDetail}>
          <div className="bg-white w-full max-w-2xl rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <button onClick={() => { if (activeTask.projectId) navigate(`/employee/projects/${activeTask.projectId}`); }} className="text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-teal-600 flex items-center gap-1 transition-colors">
                  <FolderKanban size={12} /> {safeProjectName(activeTask.projectName)}
                </button>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">{activeTask.title}</h2>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-full transition-colors" onClick={handleCloseDetail}>
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase">Status</label>
                <div className="font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${activeTask.status === 'Done' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                  {activeTask.status}
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase">Due Date</label>
                <div className="font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" /> {formatDate(activeTask.dueDate)}
                </div>
              </div>
            </div>

            <div className="prose prose-sm text-slate-600 mb-8 bg-slate-50/50 p-6 rounded-2xl">
              <h4 className="font-bold text-slate-900 mb-2">Description</h4>
              <p>{activeTask.description || 'No description provided.'}</p>
            </div>

            <div className="flex items-center gap-2 mb-8">
              <span className="text-xs font-bold text-slate-400 uppercase">Assignees:</span>
              <div className="flex -space-x-2">
                {(activeTask.assignees || []).map((a, i) => (
                  <Avatar key={i} name={a.name} src={a.avatarUrl || undefined} size="sm" className="border-2 border-white" />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
              <button onClick={handleCloseDetail} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Close</button>
              {activeTask.projectId && (
                <button
                  onClick={() => { navigate(`/employee/projects/${activeTask.projectId}`); }}
                  className={`${THEME.buttonPrimary} px-6 py-3 flex items-center gap-2 shadow-lg shadow-slate-900/10`}
                >
                  Open Project <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;

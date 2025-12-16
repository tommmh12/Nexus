import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search,
  FolderKanban,
  LayoutGrid,
  List,
  RefreshCw,
  AlertCircle,
  Clock,
  ChevronRight,
  ArrowLeft,
  Calendar,
  CheckCircle,
  MoreVertical,
  Plus
} from 'lucide-react';
import { useMyProjects } from '../../../hooks/useMyProjects';
import { Avatar } from '../../../components/ui/Avatar';

// --- Configuration ---
const THEME = {
  bg: "bg-[#F8FAFC]",
  card: "bg-white rounded-[24px] shadow-sm hover:shadow-md transition-all border-0",
  textPrimary: "text-slate-900",
  textSecondary: "text-slate-500",
  accent: "text-teal-600",
  buttonPrimary: "bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold",
  buttonGhost: "bg-transparent text-slate-500 hover:bg-slate-100 rounded-xl"
};

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'Active' | 'Completed' | 'OnHold';

const ProjectModule: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get ID from URL
  const { projects, loading, error, refetch } = useMyProjects();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Find active project if ID exists
  const activeProject = useMemo(() =>
    id ? projects.find(p => p.id === id) : null
    , [id, projects]);

  // Stats
  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter(p => p.status === 'Active').length,
    completed: projects.filter(p => p.status === 'Completed').length,
  }), [projects]);

  // Filter
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading projects...</div>;
  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 text-red-500">
      <AlertCircle className="mb-2" size={32} />
      <p>{error}</p>
      <button onClick={() => refetch()} className="mt-4 underline">Try Again</button>
    </div>
  );

  // --- DETAIL VIEW ---
  if (id && activeProject) {
    return (
      <div className={`min-h-screen ${THEME.bg} p-6 font-sans text-slate-800`}>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Nav Back */}
          <button onClick={() => navigate('/employee/projects')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors">
            <ArrowLeft size={20} /> Back to Projects
          </button>

          {/* Header */}
          <div className={`${THEME.card} p-8`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${activeProject.status === 'Active' ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-500'}`}>
                    {activeProject.status}
                  </div>
                  <span className="text-slate-400 text-sm font-bold flex items-center gap-1"><Clock size={14} /> {formatDate(activeProject.startDate)} - {formatDate(activeProject.endDate)}</span>
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">{activeProject.name}</h1>
                <p className="text-slate-500 max-w-2xl text-lg">{activeProject.description}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-teal-600">{activeProject.progress}%</div>
                <div className="text-slate-400 text-sm font-bold uppercase">Completion</div>
              </div>
            </div>

            <div className="h-4 bg-slate-100 rounded-full mt-8 overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${activeProject.progress}%` }}></div>
            </div>

            <div className="flex justify-between items-center mt-8 pt-8 border-t border-slate-50">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {activeProject.members.map(m => (
                    <Avatar key={m.id} name={m.name} src={m.avatarUrl} size="md" className="border-4 border-white" />
                  ))}
                  <button className="w-10 h-10 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-slate-400 hover:bg-slate-200">
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-slate-500 font-bold text-sm">{activeProject.members.length} Members</span>
              </div>
              <button className={THEME.buttonPrimary + " px-6 py-3"}>View Board</button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Tasks */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Recent Tasks</h3>
                <button className="text-teal-600 font-bold text-sm hover:underline">View All</button>
              </div>

              {/* Mock Tasks for Detail View */}
              {[1, 2, 3].map(i => (
                <div key={i} className={`${THEME.card} p-5 flex items-center gap-4 group cursor-pointer`}>
                  <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center text-transparent hover:border-teal-500 hover:text-teal-500 transition-all">
                    <CheckCircle size={14} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">Update documentation for release {i}.0</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded">High Priority</span>
                      <span className="text-slate-400 text-xs font-bold">Due Tomorrow</span>
                    </div>
                  </div>
                  <Avatar name="Alex" size="sm" />
                </div>
              ))}
            </div>

            {/* Right: Info */}
            <div className="space-y-6">
              <div className={`${THEME.card} p-6`}>
                <h3 className="font-bold text-slate-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Pending Tasks</span>
                    <span className="font-bold text-slate-900">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Upcoming Meetings</span>
                    <span className="font-bold text-slate-900">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Documents</span>
                    <span className="font-bold text-slate-900">45</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (id && !activeProject && !loading) {
    // 404 Case
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Project Not Found</h2>
        <p className="text-slate-500 mb-6">The project you are looking for does not exist or you don't have access.</p>
        <button onClick={() => navigate('/employee/projects')} className={THEME.buttonPrimary + " px-6 py-3"}>Back to Projects</button>
      </div>
    );
  }

  // --- LIST VIEW (Original) ---
  return (
    <div className={`min-h-screen ${THEME.bg} p-6 font-sans text-slate-800`}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <FolderKanban className="text-teal-600" /> Projects
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              You are participating in <span className="text-slate-900 font-bold">{stats.active}</span> active projects.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                <LayoutGrid size={20} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                <List size={20} />
              </button>
            </div>
            <button onClick={() => refetch()} className={`${THEME.buttonGhost} p-3`}>
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="bg-white p-2 rounded-[20px] shadow-sm flex items-center gap-2 flex-1">
            <div className="pl-4 text-slate-400"><Search size={20} /></div>
            <input
              type="text"
              placeholder="Search projects..."
              className="flex-1 py-3 px-2 outline-none text-slate-700 placeholder:text-slate-400 font-medium"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {['all', 'Active', 'Completed', 'OnHold'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${statusFilter === status ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map(project => (
              <div key={project.id} onClick={() => navigate(`/employee/projects/${project.id}`)} className={`${THEME.card} p-6 relative group cursor-pointer flex flex-col h-full`}>

                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold bg-gradient-to-br ${project.status === 'Active' ? 'from-teal-400 to-teal-600 text-white' : 'from-slate-100 to-slate-200 text-slate-500'}`}>
                    {project.name.charAt(0)}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${project.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {project.status}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors leading-tight">
                  {project.name}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">
                  {project.description || 'No description provided.'}
                </p>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                    <span>Progress</span>
                    <span className="text-slate-900">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${project.progress}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 3).map(m => (
                      <div key={m.id} onClick={(e) => { e.stopPropagation(); navigate(`/employee/chat?userId=${m.id}`); }} className="cursor-pointer hover:z-10 transition-transform hover:scale-110" title={`Chat with ${m.name}`}>
                        <Avatar name={m.name} src={m.avatarUrl} size="sm" className="border-2 border-white" />
                      </div>
                    ))}
                    {project.members.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Clock size={14} /> {formatDate(project.endDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredProjects.map(project => (
              <div key={project.id} onClick={() => navigate(`/employee/projects/${project.id}`)} className={`${THEME.card} p-5 flex items-center gap-6 cursor-pointer group`}>
                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-white bg-slate-900`}>
                  {project.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-teal-700 transition-colors">{project.name}</h3>
                  <p className="text-sm text-slate-400 truncate">{project.description}</p>
                </div>

                <div className="hidden md:block w-32">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${project.progress}%` }}></div>
                  </div>
                </div>

                <div className="flex -space-x-2">
                  {project.members.slice(0, 3).map(m => (
                    <Avatar key={m.id} name={m.name} src={m.avatarUrl} size="sm" />
                  ))}
                </div>

                <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                  <ChevronRight size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="text-center py-20 opacity-50">
            <FolderKanban size={48} className="mx-auto mb-4" />
            <p>No projects found.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default ProjectModule;

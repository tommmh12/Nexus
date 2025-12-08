import React, { useEffect, useState } from 'react';
import { Plus, Building, Clock, Edit2, Trash2, Loader2, X, Check, GitBranch } from 'lucide-react';
import { projectService, workflowService } from '../../services/projectService';
import { Button } from '../system/ui/Button';
import { Input } from '../system/ui/Input';

interface Project {
  id: string; code: string; name: string; description?: string; managerName?: string;
  workflowId?: string; workflowName?: string; status: string; priority: string; progress: number;
  taskCount?: number; completedTaskCount?: number; startDate?: string; endDate?: string; budget?: number;
}

interface Workflow { id: string; name: string; description?: string; }

const ProjectFormModal = ({ project, workflows, onClose, onSave }: any) => {
  const [formData, setFormData] = useState({
    code: project?.code || '', name: project?.name || '', description: project?.description || '',
    workflowId: project?.workflowId || '', status: project?.status || 'Planning',
    priority: project?.priority || 'Medium', startDate: project?.startDate || '',
    endDate: project?.endDate || '', budget: project?.budget || 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(formData); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{project ? 'Chỉnh sửa dự án' : 'Tạo dự án mới'}</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Mã dự án *" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required disabled={!!project} />
            <Input label="Tên dự án *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mô tả</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quy trình</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.workflowId} onChange={(e) => setFormData({ ...formData, workflowId: e.target.value })}>
                <option value="">Chọn quy trình</option>
                {workflows.map((wf: Workflow) => <option key={wf.id} value={wf.id}>{wf.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Trạng thái</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Độ ưu tiên</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                <option value="Low">Low</option><option value="Medium">Medium</option>
                <option value="High">High</option><option value="Critical">Critical</option>
              </select>
            </div>
            <Input label="Ngân sách (VND)" type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ngày bắt đầu" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
            <Input label="Ngày kết thúc" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : (project ? 'Cập nhật' : 'Tạo dự án')}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ project, onClose, onConfirm }: any) => {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => { setDeleting(true); try { await onConfirm(); } finally { setDeleting(false); } };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold mb-2">Xác nhận xóa dự án</h3>
        <p className="text-sm text-slate-600 mb-6">Bạn có chắc chắn muốn xóa dự án <strong>{project.name}</strong>?</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={deleting}>Hủy</Button>
          <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
            {deleting ? 'Đang xóa...' : 'Xóa dự án'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ProjectModule = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsRes, workflowsRes] = await Promise.all([
        projectService.getProjects(), workflowService.getWorkflows()
      ]);
      if (projectsRes.success) setProjects(projectsRes.data);
      if (workflowsRes.success) setWorkflows(workflowsRes.data);
    } catch (err: any) {
      console.error('Lỗi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (data: any) => {
    try {
      const response = await projectService.createProject(data);
      if (response.success) {
        setProjects([response.data, ...projects]);
        setShowCreateModal(false);
        alert('Tạo dự án thành công!');
      }
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateProject = async (data: any) => {
    if (!editingProject) return;
    try {
      const response = await projectService.updateProject(editingProject.id, data);
      if (response.success) {
        setProjects(projects.map(p => p.id === editingProject.id ? response.data : p));
        setEditingProject(null);
        alert('Cập nhật thành công!');
      }
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;
    try {
      const response = await projectService.deleteProject(deletingProject.id);
      if (response.success) {
        setProjects(projects.filter(p => p.id !== deletingProject.id));
        setDeletingProject(null);
        alert('Xóa thành công!');
      }
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = { 'Done': 'bg-green-100 text-green-700', 'Review': 'bg-purple-100 text-purple-700', 'In Progress': 'bg-blue-100 text-blue-700', 'Planning': 'bg-yellow-100 text-yellow-700' };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getPriorityColor = (priority: string) => {
    const colors: any = { 'Critical': 'text-red-600', 'High': 'text-orange-600', 'Medium': 'text-blue-600', 'Low': 'text-green-600' };
    return colors[priority] || 'text-slate-600';
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-12 w-12 text-blue-600" /></div>;

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dự án (Projects)</h1>
          <p className="text-slate-500 mt-1">Quản lý và theo dõi tiến độ các dự án</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}><Plus size={18} className="mr-2" /> Tạo dự án mới</Button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed p-12 text-center">
          <Building size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold mb-2">Chưa có dự án nào</h3>
          <Button onClick={() => setShowCreateModal(true)}><Plus size={18} className="mr-2" /> Tạo dự án đầu tiên</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2 flex-wrap flex-1">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusColor(project.status)}`}>{project.status}</span>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getPriorityColor(project.priority)} bg-slate-50`}>{project.priority}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                  <button onClick={() => setEditingProject(project)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                  <button onClick={() => setDeletingProject(project)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-xs font-mono text-slate-500">{project.code}</span>
                <h3 className="text-lg font-bold mb-1 line-clamp-2">{project.name}</h3>
                {project.description && <p className="text-sm text-slate-500 line-clamp-2">{project.description}</p>}
                <div className="flex gap-4 text-sm text-slate-600 mt-2">
                  <div className="flex items-center gap-1"><Building size={14} />{project.managerName || 'Chưa có quản lý'}</div>
                  {project.workflowName && <div className="flex items-center gap-1"><GitBranch size={14} />{project.workflowName}</div>}
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500">Tiến độ ({project.completedTaskCount || 0}/{project.taskCount || 0})</span>
                  <span className="font-semibold">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${project.status === 'Done' ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                {project.budget ? <div className="text-xs font-semibold">{project.budget.toLocaleString('vi-VN')} VND</div> : <div className="text-xs text-slate-400">Chưa có ngân sách</div>}
                {project.endDate && <div className="flex items-center text-xs bg-slate-50 px-2 py-1 rounded"><Clock size={12} className="mr-1" />{new Date(project.endDate).toLocaleDateString('vi-VN')}</div>}
              </div>
            </div>
          ))}
          <div onClick={() => setShowCreateModal(true)} className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 cursor-pointer min-h-[320px]">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3"><Plus size={24} /></div>
            <span className="font-medium">Thêm dự án mới</span>
          </div>
        </div>
      )}

      {showCreateModal && <ProjectFormModal workflows={workflows} onClose={() => setShowCreateModal(false)} onSave={handleCreateProject} />}
      {editingProject && <ProjectFormModal project={editingProject} workflows={workflows} onClose={() => setEditingProject(null)} onSave={handleUpdateProject} />}
      {deletingProject && <DeleteConfirmModal project={deletingProject} onClose={() => setDeletingProject(null)} onConfirm={handleDeleteProject} />}
    </div>
  );
};

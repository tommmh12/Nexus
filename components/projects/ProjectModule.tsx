
import React, { useState } from 'react';
import { Project } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Plus, MoreHorizontal, Building, Clock, DollarSign, Check, ArrowLeft, GitBranch, UploadCloud, Users } from 'lucide-react';
import { MOCK_PROJECTS, MOCK_DEPARTMENTS } from '../../data/mockData';
import { ProjectDetailView } from './ProjectDetailView';

// --- Create Wizard Steps ---
const CreateProjectWizard = ({ onCancel, onSave }: { onCancel: () => void, onSave: (p: any) => void }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<Project>>({
        name: '',
        code: '',
        description: '',
        priority: 'Medium',
        startDate: '',
        endDate: '',
        budget: '',
        participatingDepartments: [],
        workflowId: '',
    });

    const handleDeptToggle = (deptName: string) => {
        const current = formData.participatingDepartments || [];
        if (current.includes(deptName)) {
            setFormData({ ...formData, participatingDepartments: current.filter(d => d !== deptName) });
        } else {
            setFormData({ ...formData, participatingDepartments: [...current, deptName] });
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <div className="animate-fadeIn max-w-4xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <Button variant="outline" onClick={onCancel} className="p-2 h-10 w-10"><ArrowLeft size={18} /></Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Khởi tạo Dự án mới</h1>
                    <p className="text-slate-500 text-sm">Bước {step}/3: {step === 1 ? 'Thông tin cơ bản' : step === 2 ? 'Cấu hình & Nguồn lực' : 'Tài liệu khởi tạo'}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
                <div className="bg-brand-600 h-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-8 min-h-[500px] flex flex-col">
                <div className="flex-1">
                    {/* STEP 1: BASIC INFO */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input 
                                    label="Tên dự án" 
                                    placeholder="Ví dụ: Nâng cấp hệ thống CRM" 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    required 
                                />
                                <Input 
                                    label="Mã dự án (Prefix)" 
                                    placeholder="Ví dụ: CRM-2024" 
                                    value={formData.code}
                                    onChange={e => setFormData({...formData, code: e.target.value})}
                                />
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Mô tả dự án</label>
                                    <textarea 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none min-h-[100px]" 
                                        placeholder="Mô tả mục tiêu và phạm vi dự án..."
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                    ></textarea>
                                </div>
                                <Input 
                                    label="Ngày bắt đầu" 
                                    type="date" 
                                    value={formData.startDate}
                                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                                />
                                <Input 
                                    label="Ngày kết thúc (Dự kiến)" 
                                    type="date" 
                                    value={formData.endDate}
                                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                                />
                                <Input 
                                    label="Ngân sách dự kiến" 
                                    placeholder="0 VNĐ" 
                                    icon={<DollarSign size={16}/>} 
                                    value={formData.budget}
                                    onChange={e => setFormData({...formData, budget: e.target.value})}
                                />
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Độ ưu tiên</label>
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                        value={formData.priority}
                                        onChange={e => setFormData({...formData, priority: e.target.value as any})}
                                    >
                                        <option value="Low">Thấp (Low)</option>
                                        <option value="Medium">Trung bình (Medium)</option>
                                        <option value="High">Cao (High)</option>
                                        <option value="Critical">Khẩn cấp (Critical)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: CONFIG & RESOURCES */}
                    {step === 2 && (
                        <div className="space-y-8 animate-fadeIn">
                            {/* Workflow Selection */}
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                                    <GitBranch size={20}/> Quy trình áp dụng (Workflow)
                                </h3>
                                <p className="text-sm text-blue-700 mb-4">Chọn quy trình làm việc chuẩn sẽ áp dụng cho các nhiệm vụ trong dự án này.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {['Standard (To Do -> In Progress -> Done)', 'Software Dev (Agile/Scrum)', 'Marketing Campaign'].map((wf, idx) => (
                                        <label key={idx} className={`cursor-pointer border rounded-lg p-4 flex items-center gap-3 transition-all ${formData.workflowId === String(idx) ? 'bg-white border-blue-500 ring-2 ring-blue-200' : 'bg-white/50 border-blue-200 hover:bg-white'}`}>
                                            <input 
                                                type="radio" 
                                                name="workflow" 
                                                className="text-blue-600 focus:ring-blue-500" 
                                                checked={formData.workflowId === String(idx)}
                                                onChange={() => setFormData({...formData, workflowId: String(idx)})}
                                            />
                                            <span className="text-sm font-medium text-slate-700">{wf}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Departments Selection */}
                            <div>
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Users size={20}/> Phòng ban tham gia
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar p-1">
                                    {MOCK_DEPARTMENTS.map(dept => (
                                        <label key={dept.id} className={`cursor-pointer border rounded-lg p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors ${formData.participatingDepartments?.includes(dept.name) ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}>
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.participatingDepartments?.includes(dept.name) ? 'bg-brand-600 border-brand-600' : 'bg-white border-slate-300'}`}>
                                                {formData.participatingDepartments?.includes(dept.name) && <Check size={14} className="text-white"/>}
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                className="hidden" 
                                                checked={formData.participatingDepartments?.includes(dept.name) || false}
                                                onChange={() => handleDeptToggle(dept.name)}
                                            />
                                            <div>
                                                <span className="block text-sm font-medium text-slate-700">{dept.name}</span>
                                                <span className="text-xs text-slate-500">{dept.memberCount} nhân sự</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: DOCUMENTS */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-brand-400 transition-all cursor-pointer">
                                <UploadCloud size={48} className="mb-4 text-slate-300"/>
                                <p className="font-medium text-lg text-slate-700">Kéo thả tài liệu khởi tạo tại đây</p>
                                <p className="text-sm mb-4">Hoặc nhấn để chọn file (PDF, Docx, Excel...)</p>
                                <Button variant="outline">Chọn tập tin</Button>
                            </div>
                            
                            <div>
                                <h3 className="font-bold text-slate-900 mb-2">Tài liệu đã chọn (Demo)</h3>
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-sm text-slate-600 italic">
                                    Chưa có tài liệu nào được tải lên.
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between">
                    {step > 1 ? (
                        <Button variant="outline" onClick={prevStep}>Quay lại</Button>
                    ) : (
                        <div></div> 
                    )}
                    
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onCancel}>Hủy bỏ</Button>
                        {step < 3 ? (
                            <Button onClick={nextStep}>Tiếp tục</Button>
                        ) : (
                            <Button onClick={() => onSave(formData)}><Check size={18} className="mr-2" /> Hoàn tất tạo dự án</Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ProjectModule = () => {
    const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);

    const handleCreateClick = () => setView('create');
    const handleCancelCreate = () => setView('list');
    
    const handleSaveProject = (newProjectData: Partial<Project>) => {
        const newProject: Project = {
            id: Date.now(),
            name: newProjectData.name || 'New Project',
            code: newProjectData.code || 'NEW',
            participatingDepartments: newProjectData.participatingDepartments || [],
            workflowId: newProjectData.workflowId || '1',
            progress: 0,
            status: 'Planning',
            members: 0,
            startDate: newProjectData.startDate || '',
            endDate: newProjectData.endDate || '',
            priority: newProjectData.priority || 'Medium',
            budget: newProjectData.budget || '0',
            manager: 'Tôi (Admin)',
            description: newProjectData.description || '',
            documents: []
        };
        setProjects([newProject, ...projects]);
        setView('list');
    };

    const handleProjectClick = (p: Project) => {
        setSelectedProject(p);
        setView('detail');
    };
    const handleBackToList = () => {
        setSelectedProject(null);
        setView('list');
    }

    const getStatusColor = (status: string) => {
        switch (status) {
        case 'Done': return 'bg-green-100 text-green-700';
        case 'Review': return 'bg-purple-100 text-purple-700';
        case 'In Progress': return 'bg-blue-100 text-blue-700';
        case 'Planning': return 'bg-yellow-100 text-yellow-700';
        default: return 'bg-slate-100 text-slate-700';
        }
    };

    if (view === 'create') return <CreateProjectWizard onCancel={handleCancelCreate} onSave={handleSaveProject} />;
    if (view === 'detail' && selectedProject) return <ProjectDetailView project={selectedProject} onBack={handleBackToList} />;

    return (
        <div className="animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
            <div>
            <h1 className="text-2xl font-bold text-slate-900">Danh sách Dự án</h1>
            <p className="text-slate-500 mt-1">Quản lý và theo dõi tiến độ các dự án đang hoạt động.</p>
            </div>
            <Button onClick={handleCreateClick}><Plus size={18} className="mr-2"/> Tạo dự án mới</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
            <div key={p.id} onClick={() => handleProjectClick(p)} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-brand-300">
                <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusColor(p.status)}`}>
                    {p.status}
                </span>
                <button className="text-slate-400 hover:text-slate-600">
                    <MoreHorizontal size={18} />
                </button>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-brand-600 transition-colors line-clamp-1">{p.name}</h3>
                <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                    <Building size={12}/> {p.participatingDepartments.length > 0 ? `${p.participatingDepartments[0]}...` : 'Chưa có phòng ban'}
                </p>
                
                <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-500">Tiến độ</span>
                    <span className="font-semibold text-slate-700">{p.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                        p.status === 'Done' ? 'bg-green-500' : 'bg-brand-600'
                    }`} 
                    style={{ width: `${p.progress}%` }}
                    ></div>
                </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                    {p.participatingDepartments.length} Phòng ban tham gia
                </div>
                <div className="flex items-center text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                    <Clock size={12} className="mr-1" /> {p.endDate}
                </div>
                </div>
            </div>
            ))}
            
            {/* Add Project Card Placeholder */}
            <div onClick={handleCreateClick} className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50/50 transition-all cursor-pointer h-full min-h-[220px]">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-white">
                <Plus size={24} />
            </div>
            <span className="font-medium">Thêm dự án mới</span>
            </div>
        </div>
        </div>
    );
};

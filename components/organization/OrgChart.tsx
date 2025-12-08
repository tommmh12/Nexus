
import React, { useState, useRef, useEffect } from 'react';
import { MOCK_DEPARTMENTS, MOCK_USERS } from '../../data/mockData';
import { Department, EmployeeProfile } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
    Users, Download, Edit2, Plus, Trash2, 
    ZoomIn, ZoomOut, Maximize, Move, X,
    Save, ChevronRight, MapPin, Mail, Phone, Calendar
} from 'lucide-react';

// --- Helper Components ---

const UserProfileModal = ({ user, onClose }: { user: EmployeeProfile, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="relative h-24 bg-brand-600">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <div className="px-6 pb-6">
                    <div className="relative -mt-12 mb-4 flex justify-between items-end">
                        <img src={user.avatarUrl} alt={user.fullName} className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white object-cover" />
                        <span className={`mb-2 px-3 py-1 rounded-full text-xs font-bold ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {user.status}
                        </span>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-slate-900">{user.fullName}</h2>
                    <p className="text-slate-500 font-medium">{user.position}</p>
                    
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center gap-3 text-slate-600">
                            <Mail size={18} className="text-slate-400"/>
                            <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <Phone size={18} className="text-slate-400"/>
                            <span>{user.phone || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <MapPin size={18} className="text-slate-400"/>
                            <span>{user.department}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <Calendar size={18} className="text-slate-400"/>
                            <span>Gia nhập: {user.joinDate}</span>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                        <Button fullWidth onClick={() => alert('Chức năng nhắn tin đang phát triển')}>Nhắn tin</Button>
                        <Button fullWidth variant="outline" onClick={onClose}>Đóng</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DeptFormModal = ({ dept, parentId, onSave, onClose }: { dept?: Department, parentId?: string, onSave: (d: Partial<Department>) => void, onClose: () => void }) => {
    const [formData, setFormData] = useState<Partial<Department>>({
        name: '',
        managerName: '',
        description: '',
        memberCount: 0,
        ...dept
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, parentDeptId: parentId || formData.parentDeptId });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">{dept ? 'Chỉnh sửa Phòng ban' : 'Thêm Phòng ban con'}</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Tên phòng ban" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    <Input label="Tên trưởng phòng" value={formData.managerName} onChange={e => setFormData({...formData, managerName: e.target.value})} />
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Mô tả</label>
                        <textarea 
                            className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose}>Hủy</Button>
                        <Button type="submit"><Save size={16} className="mr-2"/> Lưu</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Component ---

export const OrgChart = () => {
    const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    // Modals State
    const [selectedUser, setSelectedUser] = useState<EmployeeProfile | null>(null);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [addingChildTo, setAddingChildTo] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    // Pan & Zoom Handlers
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.min(Math.max(0.3, scale * delta), 2);
            setScale(newScale);
        } else {
            // Optional: Pan on wheel if not zooming
            // setPosition(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (containerRef.current) containerRef.current.style.cursor = 'grab';
    };

    // CRUD Handlers
    const handleDelete = (id: string) => {
        if (window.confirm('Xóa phòng ban này và tất cả phòng ban con?')) {
            // Recursive delete
            const idsToDelete = new Set<string>();
            const findChildren = (parentId: string) => {
                idsToDelete.add(parentId);
                departments.filter(d => d.parentDeptId === parentId).forEach(child => findChildren(child.id));
            };
            findChildren(id);
            setDepartments(prev => prev.filter(d => !idsToDelete.has(d.id)));
        }
    };

    const handleSaveDept = (data: Partial<Department>) => {
        if (editingDept) {
            // Edit mode
            setDepartments(prev => prev.map(d => d.id === editingDept.id ? { ...d, ...data } as Department : d));
            setEditingDept(null);
        } else if (addingChildTo) {
            // Add mode
            const newDept: Department = {
                id: `dept-${Date.now()}`,
                name: data.name || 'New Department',
                managerName: data.managerName || 'TBD',
                managerAvatar: 'https://ui-avatars.com/api/?name=New+Manager&background=random',
                memberCount: 0,
                description: data.description || '',
                budget: '---',
                kpiStatus: 'On Track',
                parentDeptId: addingChildTo
            };
            setDepartments(prev => [...prev, newDept]);
            setAddingChildTo(null);
        }
    };

    const handleProfileClick = (name: string) => {
        const user = MOCK_USERS.find(u => u.fullName === name);
        if (user) {
            setSelectedUser(user);
        } else {
            // Create mock profile if not found in mock data
            setSelectedUser({
                id: 'temp',
                fullName: name,
                email: 'contact@nexus.com',
                avatarUrl: 'https://ui-avatars.com/api/?name=' + name,
                position: 'Quản lý',
                department: 'Unknown',
                role: 'Manager',
                status: 'Active',
                phone: '0901234567',
                joinDate: '01/01/2024',
                employeeId: 'TEMP-001',
                linkedAccounts: []
            });
        }
    };

    // Render Logic
    const renderNode = (deptId: string | undefined) => {
        const dept = departments.find(d => d.id === deptId);
        if (!dept) return null;

        const children = departments.filter(d => d.parentDeptId === deptId);
        
        // Compact view logic based on zoom scale
        const isCompact = scale < 0.6;

        return (
            <div className="flex flex-col items-center">
                {/* Node Card */}
                <div 
                    className={`
                        bg-white rounded-lg shadow-md border border-slate-200 relative z-10 transition-all group
                        ${isCompact ? 'p-2 w-40' : 'p-4 w-72'}
                        hover:border-brand-400 hover:shadow-xl
                    `}
                >
                    {/* Action Buttons (Visible on Hover) */}
                    <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 scale-90">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setAddingChildTo(dept.id); }}
                            className="p-1.5 bg-green-100 text-green-700 rounded-full shadow-sm hover:bg-green-200"
                            title="Thêm cấp dưới"
                        >
                            <Plus size={14}/>
                        </button>
                        <button 
                             onClick={(e) => { e.stopPropagation(); setEditingDept(dept); }}
                            className="p-1.5 bg-blue-100 text-blue-700 rounded-full shadow-sm hover:bg-blue-200"
                            title="Chỉnh sửa"
                        >
                            <Edit2 size={14}/>
                        </button>
                        {dept.parentDeptId && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(dept.id); }}
                                className="p-1.5 bg-red-100 text-red-700 rounded-full shadow-sm hover:bg-red-200"
                                title="Xóa"
                            >
                                <Trash2 size={14}/>
                            </button>
                        )}
                    </div>

                    {/* Decorative Line */}
                    <div className={`absolute top-0 left-0 w-1 h-full rounded-l-lg ${children.length > 0 ? 'bg-brand-500' : 'bg-slate-300'}`}></div>
                    
                    {/* Card Content */}
                    <div className="flex items-center gap-3">
                         {!isCompact && (
                             <img 
                                src={dept.managerAvatar} 
                                alt="" 
                                className="w-10 h-10 rounded-full border-2 border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-brand-300 transition-all" 
                                onClick={(e) => { e.stopPropagation(); handleProfileClick(dept.managerName); }}
                             />
                         )}
                         <div className="overflow-hidden flex-1">
                             <p className={`font-bold text-slate-900 truncate ${isCompact ? 'text-xs text-center' : 'text-sm'}`} title={dept.name}>{dept.name}</p>
                             {!isCompact && (
                                 <p 
                                    className="text-xs text-brand-600 truncate hover:underline cursor-pointer"
                                    onClick={(e) => { e.stopPropagation(); handleProfileClick(dept.managerName); }}
                                 >
                                     {dept.managerName}
                                 </p>
                             )}
                         </div>
                    </div>

                    {/* Footer Stats (Hidden in Compact) */}
                    {!isCompact && (
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Users size={10}/> {dept.memberCount}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                dept.kpiStatus === 'On Track' ? 'bg-green-50 text-green-700' : 
                                dept.kpiStatus === 'At Risk' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                            }`}>
                                {dept.kpiStatus}
                            </span>
                        </div>
                    )}
                </div>

                {/* Lines and Children */}
                {children.length > 0 && (
                    <>
                        <div className="w-px h-8 bg-slate-300"></div>
                        <div className="flex gap-8 relative">
                            {/* Horizontal Line covering children */}
                            {children.length > 1 && (
                                <div className="absolute top-0 left-[calc(50%-50%+144px)] right-[calc(50%-50%+144px)] h-px bg-slate-300" style={{
                                    left: isCompact ? 'calc(50%-50%+80px)' : 'calc(50%-50%+144px)',
                                    right: isCompact ? 'calc(50%-50%+80px)' : 'calc(50%-50%+144px)'
                                }}></div>
                            )}
                            
                            <div className="flex justify-center gap-8 pt-4 border-t border-slate-300">
                                {children.map(child => (
                                    <div key={child.id} className="relative">
                                        {/* Small vertical connector for child */}
                                        <div className="absolute -top-4 left-1/2 -ml-px w-px h-4 bg-slate-300"></div>
                                        {renderNode(child.id)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="animate-fadeIn h-full flex flex-col relative">
            {/* Modals */}
            {selectedUser && <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
            {(editingDept || addingChildTo) && (
                <DeptFormModal 
                    dept={editingDept || undefined} 
                    parentId={addingChildTo || undefined}
                    onSave={handleSaveDept} 
                    onClose={() => { setEditingDept(null); setAddingChildTo(null); }} 
                />
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-4 z-10 relative pointer-events-none">
                <div className="pointer-events-auto">
                    <h1 className="text-2xl font-bold text-slate-900">Sơ đồ Tổ chức</h1>
                    <p className="text-slate-500 mt-1 text-sm">Nhấn giữ chuột để di chuyển. Cuộn chuột để phóng to/thu nhỏ.</p>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                    <Button variant="outline"><Download size={18} className="mr-2"/> Xuất PDF</Button>
                </div>
            </div>

            {/* Canvas Container */}
            <div 
                className="flex-1 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative shadow-inner cursor-grab select-none"
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                {/* Background Grid Pattern */}
                <div 
                    className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                    style={{ 
                        backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', 
                        backgroundSize: `${20 * scale}px ${20 * scale}px`,
                        backgroundPosition: `${position.x}px ${position.y}px`
                    }}
                ></div>

                {/* Controls (Floating) */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
                    <button 
                        onClick={() => setScale(s => Math.min(s + 0.1, 2))}
                        className="p-2 bg-white rounded-lg shadow-md border border-slate-200 text-slate-600 hover:text-brand-600 hover:bg-slate-50"
                        title="Phóng to"
                    >
                        <ZoomIn size={20} />
                    </button>
                    <button 
                         onClick={() => { setScale(1); setPosition({x:0, y:0}); }}
                        className="p-2 bg-white rounded-lg shadow-md border border-slate-200 text-slate-600 hover:text-brand-600 hover:bg-slate-50"
                        title="Mặc định"
                    >
                        <Maximize size={20} />
                    </button>
                    <button 
                        onClick={() => setScale(s => Math.max(s - 0.1, 0.3))}
                        className="p-2 bg-white rounded-lg shadow-md border border-slate-200 text-slate-600 hover:text-brand-600 hover:bg-slate-50"
                        title="Thu nhỏ"
                    >
                        <ZoomOut size={20} />
                    </button>
                </div>

                <div className="absolute top-6 left-6 z-20 bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-slate-200 text-xs font-mono text-slate-500 shadow-sm pointer-events-none">
                    Zoom: {Math.round(scale * 100)}%
                </div>

                {/* Transform Wrapper */}
                <div 
                    className="origin-top-left transition-transform duration-75 ease-out min-w-max min-h-max p-20"
                    style={{ 
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` 
                    }}
                >
                    <div className="flex justify-center">
                        {renderNode('bod')}
                    </div>
                </div>
            </div>
        </div>
    );
};

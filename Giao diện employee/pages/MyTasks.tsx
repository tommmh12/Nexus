
import React, { useState } from 'react';
import { 
  CheckCircle2, Circle, Clock, AlertTriangle, 
  Search, Filter, Calendar, MoreHorizontal, Plus 
} from 'lucide-react';
import { Button } from '../components/system/ui/Button';

const ALL_TASKS = [
  { id: 101, title: "Cập nhật tài liệu Marketing Q4", project: "Chiến dịch Mùa Đông", dueDate: "2024-11-20", status: "In Progress", priority: "High", progress: 60 },
  { id: 102, title: "Review PRD Document", project: "Mobile App v2", dueDate: "2024-11-21", status: "To Do", priority: "Medium", progress: 0 },
  { id: 103, title: "Nộp báo cáo chi phí tháng 10", project: "Hành chính", dueDate: "2024-11-25", status: "To Do", priority: "Low", progress: 0 },
  { id: 104, title: "Sửa lỗi CSS trang chủ", project: "Website Revamp", dueDate: "2024-11-19", status: "Overdue", priority: "Critical", progress: 90 },
  { id: 105, title: "Ghi chú cuộc họp khách hàng A", project: "Sales - Client A", dueDate: "2024-11-22", status: "Done", priority: "Medium", progress: 100 },
];

export const MyTasks = () => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const getPriorityColor = (p: string) => {
    switch(p) {
        case 'Critical': return 'text-red-600 bg-red-50 border-red-100';
        case 'High': return 'text-orange-600 bg-orange-50 border-orange-100';
        case 'Medium': return 'text-blue-600 bg-blue-50 border-blue-100';
        default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const getStatusIcon = (s: string) => {
      if (s === 'Done') return <CheckCircle2 className="text-emerald-500 fill-emerald-50" size={24} />;
      if (s === 'Overdue') return <AlertTriangle className="text-red-500 fill-red-50" size={24} />;
      if (s === 'In Progress') return <Clock className="text-blue-500 fill-blue-50" size={24} />;
      return <Circle className="text-slate-300" size={24} />;
  };

  const filteredTasks = ALL_TASKS.filter(task => {
      const matchesFilter = filter === 'All' || task.status === filter || (filter === 'Pending' && task.status !== 'Done');
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || task.project.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
  });

  const completionRate = Math.round((ALL_TASKS.filter(t => t.status === 'Done').length / ALL_TASKS.length) * 100);

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto space-y-6">
      
      {/* Header Stat Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
           <div>
              <h1 className="text-3xl font-bold mb-2">Công việc của tôi</h1>
              <p className="text-slate-300 max-w-lg">Quản lý các nhiệm vụ được giao, theo dõi tiến độ và đảm bảo hoàn thành đúng hạn.</p>
           </div>
           
           <div className="flex items-center gap-6 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="relative w-16 h-16 flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-600" />
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * completionRate) / 100} className="text-emerald-400 transition-all duration-1000" />
                 </svg>
                 <span className="absolute text-sm font-bold">{completionRate}%</span>
              </div>
              <div>
                  <div className="text-2xl font-bold">{ALL_TASKS.filter(t => t.status === 'Done').length}/{ALL_TASKS.length}</div>
                  <div className="text-xs text-slate-300 uppercase tracking-wide">Đã hoàn thành</div>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4 bg-slate-50/50">
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
                {['All', 'Pending', 'Done'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {f === 'All' ? 'Tất cả' : f === 'Pending' ? 'Đang chờ' : 'Đã xong'}
                    </button>
                ))}
            </div>

            <div className="flex gap-3">
                 <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm..." 
                        className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none w-full md:w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button>
                    <Plus size={18} className="mr-2" /> Tạo mới
                </Button>
            </div>
        </div>

        {/* Task List */}
        <div className="p-4 space-y-3">
            {filteredTasks.length > 0 ? filteredTasks.map(task => (
                <div key={task.id} className="group bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all cursor-pointer relative overflow-hidden">
                    {/* Status Indicator Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.status === 'Done' ? 'bg-emerald-500' : task.status === 'Overdue' ? 'bg-red-500' : 'bg-blue-500'}`}></div>

                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-shrink-0 pt-1 md:pt-0">
                             <button className="text-slate-400 hover:text-brand-600 transition-colors">
                                {getStatusIcon(task.status)}
                             </button>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-base text-slate-900 group-hover:text-brand-600 transition-colors mb-1 ${task.status === 'Done' ? 'line-through text-slate-400' : ''}`}>
                                {task.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold">{task.project}</span>
                                <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(task.dueDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>

                        {/* Progress Bar for In Progress Tasks */}
                        {task.status !== 'Done' && (
                            <div className="w-full md:w-32 hidden md:block">
                                <div className="flex justify-between text-xs mb-1 text-slate-500">
                                    <span>Tiến độ</span>
                                    <span>{task.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${task.status === 'Overdue' ? 'bg-red-500' : 'bg-brand-500'}`} style={{width: `${task.progress}%`}}></div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between md:justify-end gap-4 mt-2 md:mt-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                            </span>
                            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 size={40} className="text-slate-300" />
                    </div>
                    <p className="font-medium">Không tìm thấy công việc nào.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

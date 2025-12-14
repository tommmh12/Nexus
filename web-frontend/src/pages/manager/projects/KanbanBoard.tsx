import React from 'react';
import { Button } from '../ui/Button';
import { Kanban, List, MoreHorizontal } from 'lucide-react';

export const KanbanBoard = () => {
  const columns = [
    { id: 'todo', title: 'Cần làm (To Do)', color: 'border-slate-300', count: 5 },
    { id: 'progress', title: 'Đang làm (In Progress)', color: 'border-blue-500', count: 3 },
    { id: 'review', title: 'Chờ duyệt (Review)', color: 'border-purple-500', count: 2 },
    { id: 'done', title: 'Hoàn thành (Done)', color: 'border-green-500', count: 12 },
  ];

  const tasks = [
    { id: 101, title: 'Thiết kế Homepage v2', tag: 'Design', col: 'todo', member: 'A', priority: 'high' },
    { id: 102, title: 'Viết API Login', tag: 'Backend', col: 'progress', member: 'B', priority: 'medium' },
    { id: 103, title: 'Họp chốt ý tưởng Tết', tag: 'Meeting', col: 'todo', member: 'C', priority: 'low' },
    { id: 104, title: 'Sửa lỗi CSS Mobile', tag: 'Bug', col: 'review', member: 'A', priority: 'high' },
    { id: 105, title: 'Deploy Staging', tag: 'DevOps', col: 'progress', member: 'D', priority: 'medium' },
  ];

  return (
    <div className="animate-fadeIn h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Bảng công việc</h1>
           <p className="text-slate-500 mt-1">Theo dõi trạng thái công việc thời gian thực.</p>
        </div>
        <div className="flex gap-2">
            <div className="flex bg-white border border-slate-200 rounded-md p-1">
                 <button className="p-1.5 rounded bg-slate-100 text-slate-900 shadow-sm"><Kanban size={18}/></button>
                 <button className="p-1.5 rounded text-slate-400 hover:bg-slate-50"><List size={18}/></button>
            </div>
            <Button>+ Task mới</Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 min-w-[1000px] h-full pb-4">
           {columns.map(col => (
             <div key={col.id} className="flex-1 min-w-[280px] bg-slate-100/50 rounded-xl flex flex-col max-h-[calc(100vh-200px)]">
                <div className={`p-4 border-t-4 ${col.color} bg-slate-100 rounded-t-xl flex justify-between items-center`}>
                   <h3 className="font-bold text-slate-700 text-sm">{col.title}</h3>
                   <span className="bg-white text-slate-500 text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">{col.count}</span>
                </div>
                <div className="p-3 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                   {tasks.filter(t => t.col === col.id).map(t => (
                     <div key={t.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md cursor-grab active:cursor-grabbing transition-all">
                        <div className="flex justify-between items-start mb-2">
                           <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                             t.tag === 'Bug' ? 'bg-red-50 text-red-600 border-red-100' :
                             t.tag === 'Design' ? 'bg-pink-50 text-pink-600 border-pink-100' :
                             'bg-blue-50 text-blue-600 border-blue-100'
                           }`}>{t.tag}</span>
                           <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={14}/></button>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 mb-3 leading-snug">{t.title}</h4>
                        <div className="flex justify-between items-center">
                           <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
                             {t.member}
                           </div>
                           <div className={`w-2 h-2 rounded-full ${
                             t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                           }`}></div>
                        </div>
                     </div>
                   ))}
                   <button className="w-full py-2 text-slate-500 text-sm font-medium hover:bg-slate-200 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 transition-colors">
                     + Thêm thẻ
                   </button>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

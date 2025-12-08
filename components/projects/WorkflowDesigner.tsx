import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { GitBranch } from 'lucide-react';

export const WorkflowDesigner = () => {
    const [workflows] = useState([
        { id: '1', name: 'Quy trình Tiêu chuẩn (Standard)', steps: ['To Do', 'In Progress', 'Done'], description: 'Quy trình đơn giản cho các phòng ban hành chính.' },
        { id: '2', name: 'Quy trình Phát triển (Software Dev)', steps: ['Backlog', 'To Do', 'Coding', 'Code Review', 'Testing', 'Done'], description: 'Quy trình đầy đủ cho đội kỹ thuật (Engineering).' },
    ]);

    return (
        <div className="animate-fadeIn space-y-6">
            <div className="flex justify-between items-center mb-2">
                <div>
                   <h1 className="text-2xl font-bold text-slate-900">Thiết kế Quy trình (Workflows)</h1>
                   <p className="text-slate-500 mt-1">Định nghĩa các luồng làm việc tự động cho từng phòng ban.</p>
                </div>
                <Button>+ Tạo quy trình</Button>
            </div>

            <div className="grid gap-6">
                {workflows.map((wf) => (
                    <div key={wf.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                    <GitBranch size={20} className="text-brand-600"/> {wf.name}
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">{wf.description}</p>
                            </div>
                            <Button variant="outline" className="text-xs h-8">Chỉnh sửa</Button>
                        </div>
                        
                        {/* Visualizer */}
                        <div className="relative">
                           <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 transform -translate-y-1/2"></div>
                           <div className="flex justify-between items-center">
                                {wf.steps.map((step, idx) => (
                                    <div key={idx} className="bg-white p-2 rounded-lg border border-slate-300 shadow-sm min-w-[100px] text-center">
                                        <div className="text-sm font-semibold text-slate-700">{step}</div>
                                    </div>
                                ))}
                           </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
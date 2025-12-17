import React, { useState, useEffect, useCallback } from 'react';
import {
    Kanban,
    Clock,
    Users,
    Loader2,
    AlertCircle,
    Info,
} from 'lucide-react';
import { TaskDetail, taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import { Button } from '../system/ui/Button';

interface SimpleKanbanBoardProps {
    projectId: string;
    currentUserId: string;
    canDragTasks?: boolean;
    onTaskClick?: (task: TaskDetail) => void;
}

interface WorkflowStatus {
    id: string;
    name: string;
    color?: string;
    order: number;
}

const DEFAULT_STATUSES: WorkflowStatus[] = [
    { id: 'todo', name: 'To Do', color: 'bg-slate-500', order: 0 },
    { id: 'in-progress', name: 'In Progress', color: 'bg-blue-500', order: 1 },
    { id: 'review', name: 'Review', color: 'bg-yellow-500', order: 2 },
    { id: 'done', name: 'Done', color: 'bg-green-500', order: 3 },
];

/**
 * SimpleKanbanBoard - Read-only Kanban view for Employee
 * Shows all tasks in project organized by status columns
 */
export const SimpleKanbanBoard: React.FC<SimpleKanbanBoardProps> = ({
    projectId,
    currentUserId,
    canDragTasks = false,
    onTaskClick,
}) => {
    const [tasks, setTasks] = useState<TaskDetail[]>([]);
    const [statuses, setStatuses] = useState<WorkflowStatus[]>(DEFAULT_STATUSES);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch tasks
            const projectTasks = await taskService.getTasksByProject(projectId);
            setTasks(projectTasks || []);

            // Try to fetch project workflow statuses
            try {
                const projectData = await projectService.getProjectById(projectId);
                if (projectData?.workflowStatuses?.length > 0) {
                    setStatuses(projectData.workflowStatuses);
                }
            } catch (e) {
                // Use default statuses if workflow fetch fails
                console.warn('Could not fetch workflow statuses, using defaults');
            }
        } catch (err: any) {
            console.error('Error fetching board data:', err);
            setError(err.response?.data?.message || 'Không thể tải dữ liệu bảng công việc');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Group tasks by status
    const tasksByStatus = React.useMemo(() => {
        const grouped: Record<string, TaskDetail[]> = {};
        statuses.forEach(s => {
            grouped[s.name] = tasks.filter(t => t.status === s.name);
        });
        return grouped;
    }, [tasks, statuses]);

    const getPriorityStyle = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'critical':
                return 'bg-red-100 text-red-700';
            case 'high':
                return 'bg-orange-100 text-orange-700';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-slate-100 text-slate-600';
        }
    };

    const formatDueDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
    };

    const isMyTask = (task: TaskDetail) => {
        return task.assignees?.some(a => a.id === currentUserId) ||
            (task as any).assignee_ids?.includes(currentUserId);
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Đang tải bảng công việc...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-red-500">
                <AlertCircle className="w-8 h-8 mb-4" />
                <p className="mb-4">{error}</p>
                <Button variant="outline" onClick={fetchData}>Thử lại</Button>
            </div>
        );
    }

    // Empty state
    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Kanban className="w-12 h-12 mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    Chưa có công việc nào
                </h3>
                <p className="text-sm text-slate-500 text-center max-w-sm">
                    Dự án chưa có công việc nào. Quản lý dự án sẽ tạo task sớm.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Kanban className="text-brand-600" />
                        Bảng công việc
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {tasks.length} công việc trong dự án
                    </p>
                </div>

                {!canDragTasks && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                        <Info size={14} />
                        Chế độ xem (chỉ đọc)
                    </div>
                )}
            </div>

            {/* Kanban Board */}
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
                {statuses.map(status => (
                    <div
                        key={status.id || status.name}
                        className="min-w-[280px] w-[300px] bg-slate-100 rounded-xl flex flex-col"
                    >
                        {/* Column Header */}
                        <div className="p-3 font-semibold text-slate-700 border-b border-slate-200/50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${status.color || 'bg-slate-500'}`} />
                                {status.name}
                            </div>
                            <span className="bg-white text-xs px-2 py-0.5 rounded-full text-slate-600 font-medium">
                                {tasksByStatus[status.name]?.length || 0}
                            </span>
                        </div>

                        {/* Tasks */}
                        <div className="p-2 space-y-2 flex-1 min-h-[200px] overflow-y-auto">
                            {tasksByStatus[status.name]?.map(task => (
                                <div
                                    key={task.id}
                                    onClick={() => onTaskClick?.(task)}
                                    className={`bg-white p-3 rounded-lg shadow-sm border cursor-pointer transition-all hover:shadow-md ${isMyTask(task)
                                        ? 'border-brand-200 ring-1 ring-brand-100'
                                        : 'border-slate-200'
                                        }`}
                                >
                                    {/* My task indicator */}
                                    {isMyTask(task) && (
                                        <div className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mb-1.5">
                                            Việc của tôi
                                        </div>
                                    )}

                                    {/* Task title */}
                                    <p className="text-sm font-medium text-slate-900 mb-2 line-clamp-2">
                                        {task.title}
                                    </p>

                                    {/* Assignees */}
                                    {task.assignees && task.assignees.length > 0 && (
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Users size={12} className="text-slate-400" />
                                            <div className="flex -space-x-1">
                                                {task.assignees.slice(0, 3).map((a, i) => (
                                                    <img
                                                        key={i}
                                                        src={(a as any).avatar_url || (a as any).avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name || 'U')}&size=24`}
                                                        alt={a.name}
                                                        className="w-5 h-5 rounded-full border border-white"
                                                    />
                                                ))}
                                                {task.assignees.length > 3 && (
                                                    <div className="w-5 h-5 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[8px] font-bold text-slate-500">
                                                        +{task.assignees.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Priority and Due Date */}
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getPriorityStyle(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Clock size={10} />
                                            {formatDueDate((task as any).due_date || task.dueDate)}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Empty column state */}
                            {(!tasksByStatus[status.name] || tasksByStatus[status.name].length === 0) && (
                                <div className="text-center py-8 text-slate-400">
                                    <p className="text-xs">Không có task</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimpleKanbanBoard;

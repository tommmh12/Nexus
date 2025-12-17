import React, { useState, useEffect, useCallback } from 'react';
import {
    CheckCircle,
    Clock,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Loader2,
    ClipboardList,
} from 'lucide-react';
import { TaskDetail, taskService } from '../../services/taskService';
import { Badge } from '../ui/Badge';
import { Button } from '../system/ui/Button';
import { TaskDetailPanelEnhanced } from './TaskDetailPanelEnhanced';
import { TaskListSkeleton } from '../ui/TaskSkeleton';

interface MyWorkTabProps {
    projectId: string;
    currentUserId: string;
    onTaskClick?: (task: TaskDetail) => void;
    onStatusUpdate?: (taskId: string, newStatus: string) => void;
}

interface GroupedTasks {
    inProgress: TaskDetail[];
    dueSoon: TaskDetail[];
    completed: TaskDetail[];
}

/**
 * MyWorkTab displays tasks assigned to the current user within a project.
 * This is the key component for Employee experience - answering:
 * "What am I working on in this project?"
 */
export const MyWorkTab: React.FC<MyWorkTabProps> = ({
    projectId,
    currentUserId,
    onTaskClick,
    onStatusUpdate,
}) => {
    const [tasks, setTasks] = useState<TaskDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCompleted, setShowCompleted] = useState(false);
    const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<TaskDetail | null>(null);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch all tasks for the project, then filter for current user
            const allTasks = await taskService.getTasksByProject(projectId);
            const myTasks = (allTasks || []).filter((task: TaskDetail) =>
                task.assignees?.some(a => a.id === currentUserId) ||
                (task as any).assignee_ids?.includes(currentUserId)
            );
            setTasks(myTasks);
        } catch (err: any) {
            console.error('Error fetching my tasks:', err);
            setError(err.response?.data?.message || 'Không thể tải danh sách công việc');
        } finally {
            setLoading(false);
        }
    }, [projectId, currentUserId]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Group tasks by status
    const groupedTasks: GroupedTasks = React.useMemo(() => {
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        return tasks.reduce<GroupedTasks>(
            (groups, task) => {
                const dueDate = new Date((task as any).due_date || task.dueDate);
                const status = task.status?.toLowerCase() || '';

                if (status === 'done' || status === 'completed') {
                    groups.completed.push(task);
                } else if (dueDate <= threeDaysFromNow && dueDate >= now) {
                    groups.dueSoon.push(task);
                } else {
                    groups.inProgress.push(task);
                }
                return groups;
            },
            { inProgress: [], dueSoon: [], completed: [] }
        );
    }, [tasks]);

    // Handle status update
    const handleStatusChange = async (taskId: string, newStatus: string) => {
        setUpdatingTaskId(taskId);
        try {
            // Use updateTaskStatus which accepts status name (not full task update)
            await taskService.updateTaskStatus(taskId, newStatus);
            // Refresh tasks
            await fetchTasks();
            onStatusUpdate?.(taskId, newStatus);
        } catch (err) {
            console.error('Failed to update task status:', err);
            alert('Không thể cập nhật trạng thái. Vui lòng thử lại.');
        } finally {
            setUpdatingTaskId(null);
        }
    };

    const formatDueDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: `Quá hạn ${Math.abs(diffDays)} ngày`, urgent: true };
        if (diffDays === 0) return { text: 'Hôm nay', urgent: true };
        if (diffDays === 1) return { text: 'Ngày mai', urgent: true };
        if (diffDays <= 3) return { text: `Còn ${diffDays} ngày`, urgent: true };
        return { text: date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' }), urgent: false };
    };

    const getPriorityStyle = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'critical':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low':
                return 'bg-slate-100 text-slate-600 border-slate-200';
            default:
                return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    // Loading state with skeleton
    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-7 bg-slate-200 rounded w-48 animate-pulse mb-2" />
                        <div className="h-4 bg-slate-100 rounded w-64 animate-pulse" />
                    </div>
                </div>
                <TaskListSkeleton count={4} />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-red-500">
                <AlertTriangle className="w-8 h-8 mb-4" />
                <p className="mb-4">{error}</p>
                <Button variant="outline" onClick={fetchTasks}>Thử lại</Button>
            </div>
        );
    }

    // Empty state
    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <ClipboardList className="w-12 h-12 mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    Chưa có công việc nào
                </h3>
                <p className="text-sm text-slate-500 text-center max-w-sm">
                    Bạn chưa được gán công việc nào trong dự án này.
                    Quản lý dự án sẽ phân công task cho bạn sớm.
                </p>
            </div>
        );
    }

    const TaskItem = ({ task }: { task: TaskDetail }) => {
        const dueInfo = formatDueDate((task as any).due_date || task.dueDate);
        const isUpdating = updatingTaskId === task.id;
        const [expanded, setExpanded] = useState(false);

        // Normalize checklist - backend returns isCompleted as 0/1
        const checklist = (task.checklist || []).map(c => ({
            ...c,
            isCompleted: Boolean(c.isCompleted)
        }));
        const completedCount = checklist.filter(c => c.isCompleted).length;
        const hasChecklist = checklist.length > 0;

        return (
            <div
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:border-brand-200 transition-all"
            >
                <div
                    className="p-4 cursor-pointer group"
                    onClick={() => {
                        setSelectedTask(task);
                        onTaskClick?.(task);
                    }}
                >
                    <div className="flex items-start gap-3">
                        {/* Status indicator */}
                        <button
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.status === 'Done' || task.status === 'Completed'
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-slate-300 hover:border-brand-500 text-transparent hover:text-brand-500'
                                }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (task.status !== 'Done' && task.status !== 'Completed') {
                                    handleStatusChange(task.id, 'Done');
                                }
                            }}
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <Loader2 className="w-3 h-3 animate-spin text-brand-500" />
                            ) : (
                                <CheckCircle size={14} />
                            )}
                        </button>

                        {/* Task content */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 group-hover:text-brand-700 transition-colors truncate">
                                {task.title}
                            </h4>
                            {task.description && (
                                <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">
                                    {task.description}
                                </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityStyle(task.priority)}`}>
                                    {task.priority}
                                </span>
                                <span className={`text-xs font-medium flex items-center gap-1 ${dueInfo.urgent ? 'text-orange-600' : 'text-slate-500'}`}>
                                    <Clock size={12} />
                                    {dueInfo.text}
                                </span>
                                {hasChecklist && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpanded(!expanded);
                                        }}
                                        className={`text-xs font-medium flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${completedCount === checklist.length
                                            ? 'text-green-600 bg-green-50'
                                            : 'text-brand-600 bg-brand-50 hover:bg-brand-100'
                                            }`}
                                    >
                                        <ClipboardList size={12} />
                                        {completedCount}/{checklist.length}
                                        {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Status dropdown */}
                        <div className="flex-shrink-0">
                            <select
                                value={task.status}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(task.id, e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                disabled={isUpdating}
                                className="text-xs font-medium bg-slate-100 border-0 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-brand-500 cursor-pointer"
                            >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Review">Review</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Expanded Checklist */}
                {expanded && hasChecklist && (
                    <div className="px-4 pb-4 pt-0 border-t border-slate-100">
                        <div className="pt-3 space-y-2">
                            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Danh sách công việc ({completedCount}/{checklist.length})
                            </h5>
                            {checklist.map((item) => (
                                <div
                                    key={item.id}
                                    className={`flex items-center gap-2 text-sm py-1 ${item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                                >
                                    <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${item.isCompleted ? 'bg-green-500 border-green-500' : 'border-slate-300'
                                        }`}>
                                        {item.isCompleted && <CheckCircle size={10} className="text-white" />}
                                    </div>
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const TaskSection = ({
        title,
        icon,
        tasks,
        emptyMessage,
        collapsible = false,
        defaultCollapsed = false,
    }: {
        title: string;
        icon: React.ReactNode;
        tasks: TaskDetail[];
        emptyMessage?: string;
        collapsible?: boolean;
        defaultCollapsed?: boolean;
    }) => {
        const [collapsed, setCollapsed] = useState(defaultCollapsed);

        if (tasks.length === 0 && !emptyMessage) return null;

        return (
            <div className="space-y-3">
                <button
                    className={`flex items-center gap-2 w-full ${collapsible ? 'cursor-pointer hover:text-brand-600' : ''}`}
                    onClick={() => collapsible && setCollapsed(!collapsed)}
                >
                    {icon}
                    <h3 className="font-bold text-slate-800">
                        {title} ({tasks.length})
                    </h3>
                    {collapsible && (
                        collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />
                    )}
                </button>

                {!collapsed && (
                    <div className="space-y-2">
                        {tasks.length > 0 ? (
                            tasks.map((task) => <TaskItem key={task.id} task={task} />)
                        ) : (
                            emptyMessage && (
                                <p className="text-sm text-slate-400 italic py-4 text-center">
                                    {emptyMessage}
                                </p>
                            )
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <ClipboardList className="text-brand-600" />
                        Công việc của tôi
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Bạn có {tasks.length - groupedTasks.completed.length} công việc đang thực hiện
                    </p>
                </div>
                <Button variant="ghost" onClick={fetchTasks} className="text-sm">
                    Làm mới
                </Button>
            </div>

            {/* Due Soon Section */}
            {groupedTasks.dueSoon.length > 0 && (
                <TaskSection
                    title="Sắp đến hạn"
                    icon={<AlertTriangle className="text-orange-500" size={18} />}
                    tasks={groupedTasks.dueSoon}
                />
            )}

            {/* In Progress Section */}
            <TaskSection
                title="Đang thực hiện"
                icon={<Clock className="text-brand-600" size={18} />}
                tasks={groupedTasks.inProgress}
                emptyMessage="Không có công việc đang thực hiện"
            />

            {/* Completed Section */}
            <TaskSection
                title="Đã hoàn thành"
                icon={<CheckCircle className="text-green-500" size={18} />}
                tasks={showCompleted ? groupedTasks.completed : groupedTasks.completed.slice(0, 3)}
                collapsible
                defaultCollapsed={groupedTasks.completed.length > 3}
            />

            {groupedTasks.completed.length > 3 && !showCompleted && (
                <button
                    onClick={() => setShowCompleted(true)}
                    className="w-full text-center text-sm text-brand-600 hover:text-brand-700 font-medium py-2"
                >
                    Xem thêm {groupedTasks.completed.length - 3} công việc đã hoàn thành
                </button>
            )}

            {/* Task Detail Panel - Enhanced with realtime & optimistic updates */}
            {selectedTask && (
                <TaskDetailPanelEnhanced
                    taskId={selectedTask.id}
                    initialTask={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onTaskUpdate={fetchTasks}
                />
            )}
        </div>
    );
};

export default MyWorkTab;

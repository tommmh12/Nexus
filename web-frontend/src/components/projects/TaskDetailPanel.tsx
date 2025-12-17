import React, { useState, useEffect, useCallback } from 'react';
import {
    X,
    CheckCircle,
    Clock,
    MessageSquare,
    Send,
    Loader2,
    User,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Plus,
    Trash2,
} from 'lucide-react';
import { TaskDetail, taskService } from '../../services/taskService';
import { authService } from '../../services/authService';
import { Button } from '../system/ui/Button';
import { Avatar } from '../ui/Avatar';

interface TaskDetailPanelProps {
    taskId: string;
    initialTask?: TaskDetail;
    onClose: () => void;
    onTaskUpdate?: () => void;
}

interface ChecklistItem {
    id: string;
    text: string;
    isCompleted: boolean;
}

interface Comment {
    id: string;
    userName: string;
    userAvatar: string;
    text: string;
    timestamp: string;
}

/**
 * TaskDetailPanel - Full task detail view with interactive checklist and comments
 * For Employee to view task details, toggle checklist items, and add comments
 */
export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
    taskId,
    initialTask,
    onClose,
    onTaskUpdate,
}) => {
    const [task, setTask] = useState<TaskDetail | null>(initialTask || null);
    const [loading, setLoading] = useState(!initialTask);
    const [error, setError] = useState<string | null>(null);
    const [updatingChecklistId, setUpdatingChecklistId] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [showComments, setShowComments] = useState(true);

    const currentUser = authService.getStoredUser();

    const fetchTask = useCallback(async () => {
        // Skip if we already have task from props
        if (task) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const taskData = await taskService.getTaskById(taskId);
            setTask(taskData);
        } catch (err: any) {
            console.error('Error fetching task:', err);
            setError(err.response?.data?.message || 'Không thể tải thông tin công việc');
        } finally {
            setLoading(false);
        }
    }, [taskId, task]);

    useEffect(() => {
        fetchTask();
    }, [fetchTask]);

    // Toggle checklist item
    const handleToggleChecklist = async (item: ChecklistItem) => {
        if (updatingChecklistId) return;

        const newIsCompleted = !item.isCompleted;
        setUpdatingChecklistId(item.id);
        try {
            await taskService.updateChecklistItem(item.id, { isCompleted: newIsCompleted });
            // Update local state with explicit new value
            setTask(prev => {
                if (!prev) return prev;
                const currentChecklist = prev.checklist || [];
                return {
                    ...prev,
                    checklist: currentChecklist.map(c =>
                        c.id === item.id ? { ...c, isCompleted: newIsCompleted } : c
                    )
                };
            });
            onTaskUpdate?.();
        } catch (err) {
            console.error('Error updating checklist:', err);
            alert('Không thể cập nhật checklist. Vui lòng thử lại.');
        } finally {
            setUpdatingChecklistId(null);
        }
    };

    // Add comment
    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;

        setSubmittingComment(true);
        try {
            const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(
                `${API_URL}/comments`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                    body: JSON.stringify({
                        commentable_type: 'task',
                        commentable_id: taskId,
                        content: newComment.trim(),
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                // Add new comment to local state
                setTask(prev => {
                    if (!prev) return prev;
                    const newCommentObj: Comment = {
                        id: data.data?.id || Date.now().toString(),
                        userName: currentUser.full_name || currentUser.email,
                        userAvatar: currentUser.avatar_url || '',
                        text: newComment.trim(),
                        timestamp: new Date().toLocaleString('vi-VN'),
                    };
                    return {
                        ...prev,
                        comments: [...(prev.comments || []), newCommentObj],
                    };
                });
                setNewComment('');
                onTaskUpdate?.();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add comment');
            }
        } catch (err: any) {
            console.error('Error adding comment:', err);
            alert('Không thể thêm bình luận: ' + (err.message || 'Vui lòng thử lại.'));
        } finally {
            setSubmittingComment(false);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

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

    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'done':
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'in progress':
                return 'bg-blue-100 text-blue-700';
            case 'review':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-slate-100 text-slate-600';
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-4" />
                    <p className="text-slate-600">Đang tải thông tin công việc...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !task) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 flex flex-col items-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-slate-600 text-center mb-4">{error || 'Không thể tải công việc'}</p>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose}>Đóng</Button>
                        <Button onClick={fetchTask}>Thử lại</Button>
                    </div>
                </div>
            </div>
        );
    }

    // Normalize checklist - backend returns isCompleted as 0/1, convert to boolean
    const checklist = (task.checklist || []).map(c => ({
        ...c,
        isCompleted: Boolean(c.isCompleted)
    }));
    const comments = task.comments || [];
    const completedCount = checklist.filter(c => c.isCompleted).length;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusStyle(task.status)}`}>
                                    {task.status}
                                </span>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${getPriorityStyle(task.priority)}`}>
                                    {task.priority}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">{task.title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Description */}
                    {task.description && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Mô tả
                            </h3>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {task.description}
                            </p>
                        </div>
                    )}

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Clock size={16} className="text-slate-400" />
                            <span className="text-slate-500">Hạn:</span>
                            <span className="font-medium text-slate-700">
                                {formatDate((task as any).due_date || task.dueDate)}
                            </span>
                        </div>
                        {task.assignees && task.assignees.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                                <User size={16} className="text-slate-400" />
                                <span className="text-slate-500">Thực hiện:</span>
                                <div className="flex -space-x-2">
                                    {task.assignees.slice(0, 3).map((a, i) => (
                                        <Avatar key={i} name={a.name} src={a.avatarUrl} size="sm" />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Interactive Checklist */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <CheckCircle size={16} />
                            Checklist ({completedCount}/{checklist.length})
                        </h3>

                        {checklist.length === 0 ? (
                            <p className="text-sm text-slate-400 italic py-4 text-center bg-slate-50 rounded-lg">
                                Không có checklist
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {checklist.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleToggleChecklist(item)}
                                        disabled={updatingChecklistId === item.id}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${item.isCompleted
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-white border-slate-200 hover:border-brand-300 hover:bg-brand-50'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${item.isCompleted
                                            ? 'bg-green-500 border-green-500'
                                            : 'border-slate-300'
                                            }`}>
                                            {updatingChecklistId === item.id ? (
                                                <Loader2 size={12} className="animate-spin text-brand-500" />
                                            ) : item.isCompleted ? (
                                                <CheckCircle size={12} className="text-white" />
                                            ) : null}
                                        </div>
                                        <span className={`text-sm ${item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                            {item.text}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Comments Section */}
                    <div>
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="w-full text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2 hover:text-slate-700"
                        >
                            <MessageSquare size={16} />
                            Bình luận ({comments.length})
                            {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {showComments && (
                            <div className="space-y-4">
                                {/* Comment List */}
                                {comments.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic py-4 text-center bg-slate-50 rounded-lg">
                                        Chưa có bình luận
                                    </p>
                                ) : (
                                    <div className="space-y-3 max-h-60 overflow-y-auto">
                                        {comments.map((comment) => (
                                            <div key={comment.id} className="flex gap-3">
                                                <Avatar name={comment.userName} src={comment.userAvatar} size="sm" />
                                                <div className="flex-1 bg-slate-50 rounded-lg p-3">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-semibold text-sm text-slate-900">
                                                            {comment.userName}
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            {comment.timestamp}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600">{comment.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Comment Form */}
                                <form onSubmit={handleAddComment} className="flex gap-2">
                                    <Avatar
                                        name={currentUser?.full_name || ''}
                                        src={currentUser?.avatar_url || ''}
                                        size="sm"
                                    />
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Viết bình luận..."
                                            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={!newComment.trim() || submittingComment}
                                            className="px-3"
                                        >
                                            {submittingComment ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Send size={16} />
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50">
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={onClose}>Đóng</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailPanel;

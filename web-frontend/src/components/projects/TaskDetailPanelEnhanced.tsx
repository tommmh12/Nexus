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
  Wifi,
  WifiOff,
} from 'lucide-react';
import { TaskDetail, taskService } from '../../services/taskService';
import { authService } from '../../services/authService';
import { Button } from '../system/ui/Button';
import { Avatar } from '../ui/Avatar';
import { useOptimisticTask } from '../../hooks/useOptimisticTask';
import { useTaskSocket } from '../../hooks/useTaskSocket';
import { TaskDetailSkeleton, ChecklistSkeleton, CommentsListSkeleton } from '../ui/TaskSkeleton';

interface TaskDetailPanelEnhancedProps {
  taskId: string;
  initialTask?: TaskDetail;
  onClose: () => void;
  onTaskUpdate?: () => void;
}

/**
 * Enhanced TaskDetailPanel with:
 * - Optimistic updates (instant UI feedback)
 * - Realtime sync via Socket.IO
 * - Smooth animations
 * - Better loading states
 */
export const TaskDetailPanelEnhanced: React.FC<TaskDetailPanelEnhancedProps> = ({
  taskId,
  initialTask,
  onClose,
  onTaskUpdate,
}) => {
  const [loading, setLoading] = useState(!initialTask);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'error' } | null>(null);

  const currentUser = authService.getStoredUser();

  // Optimistic task state management
  const {
    task,
    setTask,
    toggleChecklist,
    updateStatus,
    addComment,
    isPending,
    applyExternalUpdate,
    error: optimisticError,
  } = useOptimisticTask(initialTask || null);

  // Realtime socket connection
  const {
    isConnected,
    onChecklistToggled,
    onCommentAdded,
    onTaskStatusUpdated,
  } = useTaskSocket(taskId);

  // Show toast notification
  const showToast = useCallback((message: string, type: 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch task detail to get comments (initialTask from list doesn't have comments)
  // Only fetch once on mount
  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const taskData = await taskService.getTaskById(taskId);
        console.log('📥 Fetched task with comments:', taskData.comments?.length || 0);
        setTask(taskData);
      } catch (err: any) {
        console.error('Error fetching task:', err);
        setFetchError(err.response?.data?.message || 'Không thể tải thông tin công việc');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]); // Only re-fetch when taskId changes

  // Listen for realtime updates from other users
  useEffect(() => {
    if (!isConnected) return;

    const unsubChecklist = onChecklistToggled?.((data) => {
      // Skip if this is our own pending update
      if (isPending('checklist', data.checklistId)) return;

      applyExternalUpdate('checklist', data);
      showToast(`${data.userName} đã cập nhật checklist`, 'info');
    });

    const unsubComment = onCommentAdded?.((data) => {
      applyExternalUpdate('comment', data);
      showToast(`${data.comment.userName} đã thêm bình luận`, 'info');
    });

    const unsubStatus = onTaskStatusUpdated?.((data) => {
      if (isPending('status', data.taskId)) return;

      applyExternalUpdate('status', data);
      showToast(`${data.userName} đã cập nhật trạng thái`, 'info');
    });

    return () => {
      unsubChecklist?.();
      unsubComment?.();
      unsubStatus?.();
    };
  }, [isConnected, onChecklistToggled, onCommentAdded, onTaskStatusUpdated, isPending, applyExternalUpdate, showToast]);

  // Handle checklist toggle with optimistic update
  // Note: Don't call onTaskUpdate here - optimistic update handles UI immediately
  // Parent will refetch when modal closes if needed
  const handleToggleChecklist = async (itemId: string) => {
    await toggleChecklist(itemId);
    // Don't refetch - optimistic update already updated UI
  };

  // Handle status change with optimistic update
  const handleStatusChange = async (newStatus: string) => {
    await updateStatus(newStatus);
    // Don't refetch - optimistic update already updated UI
  };

  // Handle add comment with optimistic update
  // Note: Don't call onTaskUpdate here - optimistic update handles UI immediately
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setSubmittingComment(true);
    const success = await addComment(newComment, currentUser);
    if (success) {
      setNewComment('');
      // Don't call onTaskUpdate - optimistic update already added comment to UI
    }
    setSubmittingComment(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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

  // Handle close with data sync - MUST be before early returns to maintain hooks order
  const handleClose = useCallback(() => {
    onTaskUpdate?.();
    onClose();
  }, [onClose, onTaskUpdate]);

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-200 flex justify-between">
            <div className="h-6 bg-slate-200 rounded w-48 animate-pulse" />
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
              <X size={20} />
            </button>
          </div>
          <div className="p-6">
            <TaskDetailSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Retry function for error state
  const handleRetry = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const taskData = await taskService.getTaskById(taskId);
      setTask(taskData);
    } catch (err: any) {
      setFetchError(err.response?.data?.message || 'Không thể tải thông tin công việc');
    } finally {
      setLoading(false);
    }
  };

  // Error state
  if (fetchError || !task) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center max-w-md shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-slate-600 text-center mb-4">{fetchError || 'Không thể tải công việc'}</p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>Đóng</Button>
            <Button onClick={handleRetry}>Thử lại</Button>
          </div>
        </div>
      </div>
    );
  }

  // Use checklist directly from task (already normalized in useOptimisticTask)
  const checklist = task.checklist || [];
  const comments = task.comments || [];
  const completedCount = checklist.filter(c => Boolean(c.isCompleted)).length;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold px-2 py-1 rounded transition-colors ${getStatusStyle(task.status)}`}>
                  {task.status}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${getPriorityStyle(task.priority)}`}>
                  {task.priority}
                </span>
                {/* Connection indicator */}
                <div className="ml-auto flex items-center gap-1 text-xs">
                  {isConnected ? (
                    <>
                      <Wifi size={12} className="text-green-500" />
                      <span className="text-green-600">Live</span>
                    </>
                  ) : (
                    <>
                      <WifiOff size={12} className="text-slate-400" />
                      <span className="text-slate-400">Offline</span>
                    </>
                  )}
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{task.title}</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Toast notification */}
          {(toast || optimisticError) && (
            <div 
              className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-[60] animate-in slide-in-from-top-2 ${
                (toast?.type === 'error' || optimisticError) 
                  ? 'bg-red-500 text-white' 
                  : 'bg-slate-800 text-white'
              }`}
            >
              {optimisticError || toast?.message}
            </div>
          )}

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

          {/* Status Dropdown */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Trạng thái
            </h3>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isPending('status', task.id)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium bg-white cursor-pointer disabled:opacity-50"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Done">Done</option>
            </select>
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
                {checklist.map((item) => {
                  const itemPending = isPending('checklist', item.id);
                  const isChecked = Boolean(item.isCompleted);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      disabled={itemPending}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left group ${
                        isChecked
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-slate-200 hover:border-brand-300 hover:bg-brand-50'
                      } ${itemPending ? 'opacity-70' : ''}`}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-green-500 border-green-500 scale-110'
                            : 'border-slate-300 group-hover:border-brand-400'
                        }`}
                      >
                        {itemPending ? (
                          <Loader2 size={12} className="animate-spin text-brand-500" />
                        ) : isChecked ? (
                          <CheckCircle size={12} className="text-white" />
                        ) : null}
                      </div>
                      <span
                        className={`text-sm transition-all ${
                          isChecked ? 'text-slate-400 line-through' : 'text-slate-700'
                        }`}
                      >
                        {item.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div>
            <button
              onClick={() => setShowComments(!showComments)}
              className="w-full text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2 hover:text-slate-700 transition-colors"
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
                    {comments.map((comment: any) => (
                      <div 
                        key={comment.id} 
                        className={`flex gap-3 transition-opacity ${comment.isPending ? 'opacity-60' : ''}`}
                      >
                        <Avatar name={comment.userName} src={comment.userAvatar} size="sm" />
                        <div className="flex-1 bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm text-slate-900">
                              {comment.userName}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              {comment.isPending && <Loader2 size={10} className="animate-spin" />}
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
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm transition-shadow"
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
            <Button variant="ghost" onClick={handleClose}>
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPanelEnhanced;

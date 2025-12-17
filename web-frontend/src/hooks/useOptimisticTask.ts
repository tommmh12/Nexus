import { useState, useCallback, useRef, useEffect } from 'react';
import { TaskDetail, taskService } from '../services/taskService';

interface PendingUpdate {
  type: 'checklist' | 'status' | 'comment';
  id: string;
  previousValue: any;
  timestamp: number;
}

// Normalize checklist data from backend (is_completed: 0/1 -> isCompleted: boolean)
const normalizeTask = (task: TaskDetail | null): TaskDetail | null => {
  if (!task) return null;
  return {
    ...task,
    checklist: (task.checklist || []).map(c => ({
      ...c,
      isCompleted: Boolean(c.isCompleted || (c as any).is_completed),
    })),
  };
};

/**
 * Hook for optimistic task updates
 * Updates UI immediately, then syncs with server
 * Automatically rolls back on error
 */
export const useOptimisticTask = (initialTask: TaskDetail | null) => {
  const [task, setTask] = useState<TaskDetail | null>(() => normalizeTask(initialTask));
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, PendingUpdate>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const rollbackTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Sync with initialTask when it changes
  // Note: We use a ref to track if this is the initial mount
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    // Skip on initial mount (already set in useState)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Update task when initialTask changes (e.g., from parent refetch)
    if (initialTask) {
      console.log('🔄 Syncing task from initialTask:', initialTask.id);
      setTask(normalizeTask(initialTask));
    }
  }, [initialTask]);

  // Clear error after 3 seconds
  const showError = useCallback((message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  }, []);

  // Optimistic checklist toggle
  const toggleChecklist = useCallback(async (itemId: string) => {
    if (!task) {
      console.error('toggleChecklist: No task available');
      return;
    }

    const item = task.checklist?.find(c => c.id === itemId);
    if (!item) {
      console.error('toggleChecklist: Item not found:', itemId);
      return;
    }

    // Normalize current value (handle both isCompleted and is_completed)
    const currentValue = Boolean(item.isCompleted || (item as any).is_completed);
    const newValue = !currentValue;
    const updateId = `checklist-${itemId}`;

    console.log(`🔄 Toggling checklist ${itemId}: ${currentValue} -> ${newValue}`);

    // 1. Update UI immediately (optimistic)
    setTask(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        checklist: prev.checklist?.map(c =>
          c.id === itemId ? { ...c, isCompleted: newValue } : c
        ),
      };
      console.log('📝 Updated task state:', updated.checklist?.find(c => c.id === itemId));
      return updated;
    });

    // 2. Track pending update
    setPendingUpdates(prev => {
      const next = new Map(prev);
      next.set(updateId, {
        type: 'checklist',
        id: itemId,
        previousValue: currentValue,
        timestamp: Date.now(),
      });
      return next;
    });

    try {
      // 3. Send to server
      console.log('📤 Sending to server:', { itemId, isCompleted: newValue });
      await taskService.updateChecklistItem(itemId, { isCompleted: newValue });
      console.log('✅ Server update successful');

      // 4. Clear pending on success
      setPendingUpdates(prev => {
        const next = new Map(prev);
        next.delete(updateId);
        return next;
      });
    } catch (err: any) {
      console.error('❌ Failed to update checklist:', err);

      // 5. Rollback on error
      setTask(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          checklist: prev.checklist?.map(c =>
            c.id === itemId ? { ...c, isCompleted: currentValue } : c
          ),
        };
      });

      setPendingUpdates(prev => {
        const next = new Map(prev);
        next.delete(updateId);
        return next;
      });

      showError('Không thể cập nhật checklist. Vui lòng thử lại.');
    }
  }, [task, showError]);

  // Optimistic status update
  const updateStatus = useCallback(async (newStatus: string) => {
    if (!task) return;

    const previousStatus = task.status;
    const updateId = `status-${task.id}`;

    // 1. Update UI immediately
    setTask(prev => prev ? { ...prev, status: newStatus } : prev);

    // 2. Track pending
    setPendingUpdates(prev => {
      const next = new Map(prev);
      next.set(updateId, {
        type: 'status',
        id: task.id,
        previousValue: previousStatus,
        timestamp: Date.now(),
      });
      return next;
    });

    try {
      // 3. Send to server
      await taskService.updateTaskStatus(task.id, newStatus);

      // 4. Clear pending
      setPendingUpdates(prev => {
        const next = new Map(prev);
        next.delete(updateId);
        return next;
      });
    } catch (err: any) {
      console.error('Failed to update status:', err);

      // 5. Rollback
      setTask(prev => prev ? { ...prev, status: previousStatus } : prev);

      setPendingUpdates(prev => {
        const next = new Map(prev);
        next.delete(updateId);
        return next;
      });

      showError('Không thể cập nhật trạng thái. Vui lòng thử lại.');
    }
  }, [task, showError]);

  // Add comment (optimistic)
  const addComment = useCallback(async (content: string, currentUser: any) => {
    if (!task || !currentUser || !content.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const newComment = {
      id: tempId,
      userName: currentUser.full_name || currentUser.email,
      userAvatar: currentUser.avatar_url || '',
      text: content.trim(),
      timestamp: new Date().toLocaleString('vi-VN'),
      isPending: true,
    };

    // 1. Add to UI immediately
    setTask(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        comments: [...(prev.comments || []), newComment],
      };
    });

    try {
      // 2. Send to server
      const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
      console.log('📤 Sending comment to:', `${API_URL}/comments`);
      console.log('📝 Comment data:', {
        commentable_type: 'task',
        commentable_id: task.id,
        content: content.trim(),
      });

      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          commentable_type: 'task',
          commentable_id: task.id,
          content: content.trim(),
        }),
      });

      const data = await response.json();
      console.log('📥 Server response:', response.status, data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add comment');
      }

      // 3. Replace temp comment with real one
      setTask(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments?.map(c =>
            c.id === tempId
              ? { ...c, id: data.data?.id || tempId, isPending: false }
              : c
          ),
        };
      });

      return true;
    } catch (err: any) {
      console.error('Failed to add comment:', err);

      // 4. Remove temp comment on error
      setTask(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments?.filter(c => c.id !== tempId),
        };
      });

      showError('Không thể thêm bình luận. Vui lòng thử lại.');
      return false;
    }
  }, [task, showError]);

  // Check if a specific item has pending update
  const isPending = useCallback((type: string, id: string) => {
    return pendingUpdates.has(`${type}-${id}`);
  }, [pendingUpdates]);

  // Apply external update (from socket)
  const applyExternalUpdate = useCallback((updateType: string, data: any) => {
    switch (updateType) {
      case 'checklist':
        // Skip if we have a pending update for this item
        if (pendingUpdates.has(`checklist-${data.checklistId}`)) return;
        
        setTask(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            checklist: prev.checklist?.map(c =>
              c.id === data.checklistId ? { ...c, isCompleted: data.isCompleted } : c
            ),
          };
        });
        break;

      case 'comment':
        setTask(prev => {
          if (!prev) return prev;
          // Avoid duplicate comments
          if (prev.comments?.some(c => c.id === data.comment.id)) return prev;
          return {
            ...prev,
            comments: [...(prev.comments || []), data.comment],
          };
        });
        break;

      case 'status':
        if (pendingUpdates.has(`status-${data.taskId}`)) return;
        setTask(prev => prev ? { ...prev, status: data.status } : prev);
        break;
    }
  }, [pendingUpdates]);

  return {
    task,
    setTask,
    toggleChecklist,
    updateStatus,
    addComment,
    isPending,
    pendingUpdates,
    applyExternalUpdate,
    error,
  };
};

export default useOptimisticTask;

import { useEffect, useCallback, useRef, useState } from 'react';
import { useSocket } from './useSocket';

interface ChecklistUpdate {
  taskId: string;
  checklistId: string;
  isCompleted: boolean;
  userId: string;
  userName: string;
}

interface CommentUpdate {
  taskId: string;
  comment: {
    id: string;
    userName: string;
    userAvatar: string;
    text: string;
    timestamp: string;
  };
}

interface TaskStatusUpdate {
  taskId: string;
  status: string;
  userId: string;
  userName: string;
}

/**
 * Hook for realtime task updates via Socket.IO
 * Extends useSocket with task-specific functionality
 * Enables live sync of checklist, comments, and status changes
 */
export const useTaskSocket = (taskId?: string) => {
  const { socket, isConnected } = useSocket();
  const joinedTaskRef = useRef<string | null>(null);
  const [listeners, setListeners] = useState<{
    checklist: ((data: ChecklistUpdate) => void) | null;
    comment: ((data: CommentUpdate) => void) | null;
    status: ((data: TaskStatusUpdate) => void) | null;
  }>({
    checklist: null,
    comment: null,
    status: null,
  });

  // Join task room when viewing task detail
  useEffect(() => {
    if (!socket || !taskId || !isConnected) return;

    // Avoid duplicate joins
    if (joinedTaskRef.current === taskId) return;

    socket.emit('task:join', { taskId });
    joinedTaskRef.current = taskId;
    console.log(`📋 Joined task room: ${taskId}`);

    return () => {
      if (joinedTaskRef.current === taskId) {
        socket.emit('task:leave', { taskId });
        joinedTaskRef.current = null;
        console.log(`👋 Left task room: ${taskId}`);
      }
    };
  }, [socket, taskId, isConnected]);

  // Setup event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleChecklist = (data: ChecklistUpdate) => {
      if (taskId && data.taskId === taskId && listeners.checklist) {
        listeners.checklist(data);
      }
    };

    const handleComment = (data: CommentUpdate) => {
      if (taskId && data.taskId === taskId && listeners.comment) {
        listeners.comment(data);
      }
    };

    const handleStatus = (data: TaskStatusUpdate) => {
      if (taskId && data.taskId === taskId && listeners.status) {
        listeners.status(data);
      }
    };

    // @ts-ignore - socket.io types
    socket.on('checklist:toggled', handleChecklist);
    // @ts-ignore
    socket.on('comment:added', handleComment);
    // @ts-ignore
    socket.on('task:status_updated', handleStatus);

    return () => {
      // @ts-ignore
      socket.off('checklist:toggled', handleChecklist);
      // @ts-ignore
      socket.off('comment:added', handleComment);
      // @ts-ignore
      socket.off('task:status_updated', handleStatus);
    };
  }, [socket, isConnected, taskId, listeners]);

  // Register callback for checklist toggle events
  const onChecklistToggled = useCallback(
    (callback: (data: ChecklistUpdate) => void) => {
      setListeners(prev => ({ ...prev, checklist: callback }));
      return () => setListeners(prev => ({ ...prev, checklist: null }));
    },
    []
  );

  // Register callback for new comments
  const onCommentAdded = useCallback(
    (callback: (data: CommentUpdate) => void) => {
      setListeners(prev => ({ ...prev, comment: callback }));
      return () => setListeners(prev => ({ ...prev, comment: null }));
    },
    []
  );

  // Register callback for task status updates
  const onTaskStatusUpdated = useCallback(
    (callback: (data: TaskStatusUpdate) => void) => {
      setListeners(prev => ({ ...prev, status: callback }));
      return () => setListeners(prev => ({ ...prev, status: null }));
    },
    []
  );

  // Emit checklist toggle (for realtime sync to other users)
  const emitChecklistToggle = useCallback(
    (checklistId: string, isCompleted: boolean) => {
      if (!socket || !taskId) return;
      socket.emit('checklist:toggle', { taskId, checklistId, isCompleted });
    },
    [socket, taskId]
  );

  // Emit new comment (for realtime sync)
  const emitComment = useCallback(
    (content: string) => {
      if (!socket || !taskId) return;
      socket.emit('comment:add', { taskId, content });
    },
    [socket, taskId]
  );

  // Emit status update
  const emitStatusUpdate = useCallback(
    (status: string) => {
      if (!socket || !taskId) return;
      socket.emit('task:update_status', { taskId, status });
    },
    [socket, taskId]
  );

  return {
    isConnected,
    onChecklistToggled,
    onCommentAdded,
    onTaskStatusUpdated,
    emitChecklistToggle,
    emitComment,
    emitStatusUpdate,
  };
};

export default useTaskSocket;

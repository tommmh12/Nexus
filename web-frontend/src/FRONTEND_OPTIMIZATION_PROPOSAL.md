# 🚀 Đề Xuất Tối Ưu Frontend: Project/Task/Checklist/Comment

## Tổng Quan Vấn Đề Hiện Tại

### 1. Performance Issues
- **N+1 Query Pattern**: `useMyTasks` fetch tasks từ TỪNG project một → chậm
- **Không có caching**: Mỗi lần navigate lại fetch mới hoàn toàn
- **Không có optimistic updates**: UI đợi server response mới update

### 2. UX/Animation Chưa Mượt
- Modal mở/đóng thiếu smooth animation
- Loading states chỉ là spinner đơn giản
- Không có skeleton loading cho từng section
- Checklist toggle không có visual feedback ngay lập tức

### 3. Không Có Realtime Updates
- Khi người khác update task → phải refresh mới thấy
- Comment mới không tự động hiện
- Checklist changes không sync giữa các users

---

## 🎯 Giải Pháp Đề Xuất

### Phase 1: Realtime Infrastructure (Socket.IO Integration)

#### 1.1 Mở rộng SocketManager (Backend)
```typescript
// backend/src/infrastructure/socket/SocketManager.ts - Thêm events mới

// Task events
socket.on("task:join", (data) => this.handleJoinTask(socket, data));
socket.on("task:leave", (data) => this.handleLeaveTask(socket, data));
socket.on("task:update_status", (data) => this.handleTaskStatusUpdate(socket, data));
socket.on("checklist:toggle", (data) => this.handleChecklistToggle(socket, data));
socket.on("comment:add", (data) => this.handleCommentAdd(socket, data));

// Project events  
socket.on("project:join", (data) => this.handleJoinProject(socket, data));
socket.on("project:leave", (data) => this.handleLeaveProject(socket, data));
```

#### 1.2 Tạo useTaskSocket Hook (Frontend)
```typescript
// web-frontend/src/hooks/useTaskSocket.ts
export const useTaskSocket = (taskId?: string) => {
  const { socket, isConnected } = useSocket();
  
  // Join task room khi view task detail
  useEffect(() => {
    if (socket && taskId) {
      socket.emit("task:join", { taskId });
      return () => socket.emit("task:leave", { taskId });
    }
  }, [socket, taskId]);

  // Listen for realtime updates
  const onTaskUpdated = useCallback((callback) => {
    socket?.on("task:updated", callback);
    return () => socket?.off("task:updated", callback);
  }, [socket]);

  const onChecklistToggled = useCallback((callback) => {
    socket?.on("checklist:toggled", callback);
    return () => socket?.off("checklist:toggled", callback);
  }, [socket]);

  const onCommentAdded = useCallback((callback) => {
    socket?.on("comment:added", callback);
    return () => socket?.off("comment:added", callback);
  }, [socket]);

  // Emit functions
  const toggleChecklist = (checklistId: string, isCompleted: boolean) => {
    socket?.emit("checklist:toggle", { taskId, checklistId, isCompleted });
  };

  const addComment = (content: string) => {
    socket?.emit("comment:add", { taskId, content });
  };

  return {
    isConnected,
    onTaskUpdated,
    onChecklistToggled,
    onCommentAdded,
    toggleChecklist,
    addComment,
  };
};
```

---

### Phase 2: Optimistic Updates + State Management

#### 2.1 Tạo useOptimisticTask Hook
```typescript
// web-frontend/src/hooks/useOptimisticTask.ts
export const useOptimisticTask = (initialTask: TaskDetail) => {
  const [task, setTask] = useState(initialTask);
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, any>>(new Map());

  // Optimistic checklist toggle
  const toggleChecklist = async (itemId: string) => {
    const item = task.checklist?.find(c => c.id === itemId);
    if (!item) return;

    // 1. Update UI immediately (optimistic)
    const newValue = !item.isCompleted;
    setTask(prev => ({
      ...prev,
      checklist: prev.checklist?.map(c =>
        c.id === itemId ? { ...c, isCompleted: newValue } : c
      )
    }));

    // 2. Track pending update
    setPendingUpdates(prev => new Map(prev).set(itemId, { isCompleted: newValue }));

    try {
      // 3. Send to server
      await taskService.updateChecklistItem(itemId, { isCompleted: newValue });
    } catch (error) {
      // 4. Rollback on error
      setTask(prev => ({
        ...prev,
        checklist: prev.checklist?.map(c =>
          c.id === itemId ? { ...c, isCompleted: !newValue } : c
        )
      }));
      toast.error('Không thể cập nhật. Vui lòng thử lại.');
    } finally {
      setPendingUpdates(prev => {
        const next = new Map(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  return { task, setTask, toggleChecklist, pendingUpdates };
};
```

#### 2.2 React Query Integration (Caching + Background Refetch)
```typescript
// web-frontend/src/hooks/useMyTasksQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useMyTasksQuery = () => {
  const queryClient = useQueryClient();

  // Fetch with caching
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => taskService.getMyTasks(), // New API endpoint
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  // Optimistic mutation
  const updateTaskStatus = useMutation({
    mutationFn: ({ taskId, status }) => taskService.updateTaskStatus(taskId, status),
    onMutate: async ({ taskId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['my-tasks'] });
      
      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(['my-tasks']);
      
      // Optimistically update
      queryClient.setQueryData(['my-tasks'], (old) =>
        old?.map(t => t.id === taskId ? { ...t, status } : t)
      );
      
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['my-tasks'], context?.previousTasks);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
    },
  });

  return { tasks, isLoading, error, updateTaskStatus };
};
```

---

### Phase 3: UI/UX Improvements

#### 3.1 Enhanced Skeleton Components
```typescript
// web-frontend/src/components/ui/TaskSkeleton.tsx
export const TaskCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-slate-200" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-slate-100 rounded" />
          <div className="h-5 w-20 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  </div>
);

export const TaskListSkeleton = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <TaskCardSkeleton key={i} />
    ))}
  </div>
);

export const ChecklistSkeleton = ({ count = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
        <div className="w-5 h-5 rounded border-2 border-slate-200" />
        <div className="h-4 bg-slate-200 rounded flex-1" style={{ width: `${60 + Math.random() * 30}%` }} />
      </div>
    ))}
  </div>
);
```

#### 3.2 Smooth Animations với Framer Motion
```typescript
// web-frontend/src/components/ui/AnimatedList.tsx
import { motion, AnimatePresence } from 'framer-motion';

export const AnimatedTaskList = ({ tasks, children }) => (
  <AnimatePresence mode="popLayout">
    {tasks.map((task, index) => (
      <motion.div
        key={task.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ 
          duration: 0.2, 
          delay: index * 0.05,
          ease: "easeOut" 
        }}
        layout
      >
        {children(task)}
      </motion.div>
    ))}
  </AnimatePresence>
);

// Checklist item animation
export const AnimatedChecklistItem = ({ item, onToggle, isPending }) => (
  <motion.button
    onClick={() => onToggle(item.id)}
    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
      item.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-brand-300'
    }`}
    whileTap={{ scale: 0.98 }}
    layout
  >
    <motion.div
      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
        item.isCompleted ? 'bg-green-500 border-green-500' : 'border-slate-300'
      }`}
      animate={{ 
        scale: isPending ? [1, 1.2, 1] : 1,
        backgroundColor: item.isCompleted ? '#22c55e' : '#fff'
      }}
      transition={{ duration: 0.2 }}
    >
      {item.isCompleted && (
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3 }}
          className="w-3 h-3 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
        >
          <motion.path d="M5 13l4 4L19 7" />
        </motion.svg>
      )}
    </motion.div>
    <span className={item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}>
      {item.text}
    </span>
  </motion.button>
);
```

#### 3.3 Enhanced Modal với Animation
```typescript
// web-frontend/src/components/ui/AnimatedModal.tsx
import { motion, AnimatePresence } from 'framer-motion';

export const AnimatedModal = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 300 
          }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
```

---

### Phase 4: Backend API Optimization

#### 4.1 New Optimized Endpoint
```typescript
// backend/src/presentation/routes/task.routes.ts
// GET /api/tasks/my-tasks - Single endpoint thay vì N+1 queries
router.get('/my-tasks', authenticate, async (req, res) => {
  const userId = req.user.id;
  
  // Single query với JOIN
  const tasks = await db.query(`
    SELECT 
      t.*,
      p.name as project_name,
      p.code as project_code,
      json_agg(DISTINCT jsonb_build_object(
        'id', u.id,
        'name', u.full_name,
        'avatarUrl', u.avatar_url
      )) FILTER (WHERE u.id IS NOT NULL) as assignees,
      json_agg(DISTINCT jsonb_build_object(
        'id', c.id,
        'text', c.text,
        'isCompleted', c.is_completed
      )) FILTER (WHERE c.id IS NOT NULL) as checklist
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    JOIN task_assignees ta ON t.id = ta.task_id
    LEFT JOIN users u ON ta.user_id = u.id
    LEFT JOIN checklist_items c ON t.id = c.task_id
    WHERE ta.user_id = $1
    GROUP BY t.id, p.id
    ORDER BY t.due_date ASC, t.priority DESC
  `, [userId]);
  
  res.json({ data: tasks });
});
```

---

### Phase 5: Realtime Sync Implementation

#### 5.1 TaskDetailPanel với Realtime
```typescript
// Cập nhật TaskDetailPanel.tsx
export const TaskDetailPanel = ({ taskId, onClose }) => {
  const { task, setTask, toggleChecklist, pendingUpdates } = useOptimisticTask(initialTask);
  const { onChecklistToggled, onCommentAdded, isConnected } = useTaskSocket(taskId);

  // Listen for realtime updates from other users
  useEffect(() => {
    const unsubChecklist = onChecklistToggled((data) => {
      // Skip if this is our own update (already handled optimistically)
      if (pendingUpdates.has(data.checklistId)) return;
      
      setTask(prev => ({
        ...prev,
        checklist: prev.checklist?.map(c =>
          c.id === data.checklistId ? { ...c, isCompleted: data.isCompleted } : c
        )
      }));
      
      // Show toast notification
      toast.info(`${data.userName} đã cập nhật checklist`);
    });

    const unsubComment = onCommentAdded((data) => {
      setTask(prev => ({
        ...prev,
        comments: [...(prev.comments || []), data.comment]
      }));
    });

    return () => {
      unsubChecklist?.();
      unsubComment?.();
    };
  }, [onChecklistToggled, onCommentAdded, pendingUpdates]);

  return (
    <AnimatedModal isOpen onClose={onClose}>
      {/* Connection indicator */}
      <div className="absolute top-4 right-12">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
      
      {/* ... rest of modal content */}
    </AnimatedModal>
  );
};
```

---

## 📦 Dependencies Cần Thêm

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.x",
    "framer-motion": "^11.x"
  }
}
```

---

## 🗓️ Implementation Roadmap

### Week 1: Foundation
- [ ] Thêm React Query setup
- [ ] Tạo optimized `/my-tasks` API endpoint
- [ ] Implement `useMyTasksQuery` hook

### Week 2: Realtime
- [ ] Extend SocketManager với task events
- [ ] Tạo `useTaskSocket` hook
- [ ] Integrate realtime vào TaskDetailPanel

### Week 3: UI/UX
- [ ] Add Framer Motion
- [ ] Implement skeleton components
- [ ] Add smooth animations cho modal, list, checklist

### Week 4: Polish
- [ ] Optimistic updates cho tất cả actions
- [ ] Error handling + rollback
- [ ] Toast notifications cho realtime events
- [ ] Testing + bug fixes

---

## 🎯 Expected Results

| Metric | Before | After |
|--------|--------|-------|
| Initial Load Time | ~3-5s (N+1 queries) | ~500ms (single query) |
| Task Status Update | ~1s (wait for response) | Instant (optimistic) |
| Checklist Toggle | ~500ms delay | Instant + sync |
| Page Refresh Needed | Yes | No (realtime) |
| Animation Smoothness | Basic | 60fps smooth |

---

## 💡 Quick Wins (Có thể làm ngay)

1. **Thêm skeleton loading** - Dùng component có sẵn
2. **Optimistic checklist toggle** - Chỉ cần update local state trước
3. **Debounce search** - Giảm API calls khi search
4. **Memoize filtered lists** - Đã có useMemo, cần review

Bạn muốn tôi implement phần nào trước?

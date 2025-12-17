import React from 'react';
import { Skeleton } from './Skeleton';

/**
 * Skeleton loading components for task-related UI
 * Provides smooth loading states instead of spinners
 */

// Single task card skeleton
export const TaskCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
    <div className="flex items-start gap-3">
      {/* Status indicator */}
      <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0" />
      
      {/* Content */}
      <div className="flex-1 space-y-3">
        {/* Title */}
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        
        {/* Description */}
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        
        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-slate-100 rounded" />
          <div className="h-5 w-20 bg-slate-100 rounded" />
        </div>
      </div>
      
      {/* Assignees */}
      <div className="flex -space-x-2">
        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white" />
        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white" />
      </div>
    </div>
  </div>
);

// Task list skeleton
export const TaskListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <TaskCardSkeleton key={i} />
    ))}
  </div>
);

// Checklist skeleton
export const ChecklistSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div 
        key={i} 
        className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 animate-pulse"
      >
        <div className="w-5 h-5 rounded border-2 border-slate-200 flex-shrink-0" />
        <div 
          className="h-4 bg-slate-200 rounded" 
          style={{ width: `${50 + Math.random() * 40}%` }} 
        />
      </div>
    ))}
  </div>
);

// Comment skeleton
export const CommentSkeleton: React.FC = () => (
  <div className="flex gap-3 animate-pulse">
    <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
    <div className="flex-1 bg-slate-50 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-200 rounded w-24" />
        <div className="h-3 bg-slate-100 rounded w-16" />
      </div>
      <div className="h-3 bg-slate-200 rounded w-full" />
      <div className="h-3 bg-slate-200 rounded w-2/3" />
    </div>
  </div>
);

// Comments list skeleton
export const CommentsListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <CommentSkeleton key={i} />
    ))}
  </div>
);

// Task detail panel skeleton
export const TaskDetailSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header */}
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="h-6 w-20 bg-slate-200 rounded" />
        <div className="h-6 w-16 bg-slate-200 rounded" />
      </div>
      <div className="h-7 bg-slate-200 rounded w-3/4" />
    </div>

    {/* Description */}
    <div className="space-y-2">
      <div className="h-4 bg-slate-100 rounded w-20" />
      <div className="h-4 bg-slate-200 rounded w-full" />
      <div className="h-4 bg-slate-200 rounded w-5/6" />
      <div className="h-4 bg-slate-200 rounded w-2/3" />
    </div>

    {/* Meta */}
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-slate-200 rounded" />
        <div className="h-4 bg-slate-200 rounded w-24" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-slate-200 rounded" />
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-slate-200" />
          <div className="w-6 h-6 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>

    {/* Checklist */}
    <div className="space-y-3">
      <div className="h-4 bg-slate-200 rounded w-32" />
      <ChecklistSkeleton count={3} />
    </div>

    {/* Comments */}
    <div className="space-y-3">
      <div className="h-4 bg-slate-200 rounded w-28" />
      <CommentsListSkeleton count={2} />
    </div>
  </div>
);

// Project card skeleton
export const ProjectCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 rounded-xl bg-slate-200" />
      <div className="h-5 w-16 bg-slate-100 rounded-full" />
    </div>
    
    <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
    <div className="h-3 bg-slate-100 rounded w-full mb-1" />
    <div className="h-3 bg-slate-100 rounded w-2/3 mb-4" />
    
    {/* Progress */}
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <div className="h-3 bg-slate-100 rounded w-12" />
        <div className="h-3 bg-slate-200 rounded w-8" />
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full" />
    </div>
    
    {/* Footer */}
    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
      <div className="flex -space-x-2">
        <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white" />
        <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white" />
        <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white" />
      </div>
      <div className="h-3 bg-slate-100 rounded w-16" />
    </div>
  </div>
);

// Project grid skeleton
export const ProjectGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProjectCardSkeleton key={i} />
    ))}
  </div>
);

// Kanban column skeleton
export const KanbanColumnSkeleton: React.FC = () => (
  <div className="bg-slate-100/50 p-4 rounded-[24px] min-w-[300px]">
    <div className="flex items-center justify-between mb-4 px-2">
      <div className="h-5 bg-slate-200 rounded w-24 animate-pulse" />
      <div className="h-6 w-8 bg-white rounded-lg animate-pulse" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-[20px] animate-pulse">
          <div className="flex justify-between items-start mb-2">
            <div className="h-4 w-14 bg-slate-100 rounded" />
            <div className="h-3 w-12 bg-slate-100 rounded" />
          </div>
          <div className="h-4 bg-slate-200 rounded w-full mb-1" />
          <div className="h-4 bg-slate-200 rounded w-2/3 mb-3" />
          <div className="flex items-center justify-between pt-3 border-t border-slate-50">
            <div className="h-3 w-16 bg-slate-100 rounded" />
            <div className="w-6 h-6 rounded-full bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Kanban board skeleton
export const KanbanBoardSkeleton: React.FC = () => (
  <div className="flex gap-6 overflow-x-auto pb-4">
    <KanbanColumnSkeleton />
    <KanbanColumnSkeleton />
    <KanbanColumnSkeleton />
  </div>
);

export default {
  TaskCardSkeleton,
  TaskListSkeleton,
  ChecklistSkeleton,
  CommentSkeleton,
  CommentsListSkeleton,
  TaskDetailSkeleton,
  ProjectCardSkeleton,
  ProjectGridSkeleton,
  KanbanColumnSkeleton,
  KanbanBoardSkeleton,
};

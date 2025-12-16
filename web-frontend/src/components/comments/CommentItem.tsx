import React, { useState, useRef, useEffect } from 'react';
import { Reply, MoreHorizontal, Pencil, Trash2, CornerDownRight } from 'lucide-react';
import { Comment, ReactionType } from '../../types/commentTypes';
import { ReactionBar } from './ReactionBar';
import { CommentComposer } from './CommentComposer';
import { commentService } from '../../services/commentService';

interface CommentItemProps {
    comment: Comment;
    currentUserId?: string;
    onReply: (parentId: string, content: string) => Promise<void>;
    onUpdate: (commentId: string, content: string) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
    onRetract: (commentId: string) => Promise<void>;
    onReact: (commentId: string, type: ReactionType) => Promise<void>;
    depth?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
    comment,
    currentUserId,
    onReply,
    onUpdate,
    onDelete,
    onRetract,
    onReact,
    depth = 0
}) => {
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const isAuthor = currentUserId === comment.author_id;

    const formattedDate = new Date(comment.created_at).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowActions(false);
            }
        };

        if (showActions) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showActions]);

    const handleReplySubmit = async (content: string) => {
        await onReply(comment.id, content);
        setIsReplying(false);
    };

    const handleUpdateSubmit = async (content: string) => {
        await onUpdate(comment.id, content);
        setIsEditing(false);
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setShowActions(false);
    };

    const handleRetractClick = () => {
        onRetract(comment.id);
        setShowActions(false);
    };

    // Parse content and render images inline
    const renderContent = (content: string) => {
        // Match markdown image syntax: ![alt](url)
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;

        while ((match = imageRegex.exec(content)) !== null) {
            // Add text before the image
            if (match.index > lastIndex) {
                parts.push(content.substring(lastIndex, match.index));
            }

            // Add the image with full URL
            const imageUrl = match[2].startsWith('http')
                ? match[2]
                : `${import.meta.env.VITE_STATIC_URL || 'http://localhost:5000'}${match[2]}`;

            parts.push(
                <div key={match.index} className="my-2">
                    <img
                        src={imageUrl}
                        alt={match[1] || 'Comment image'}
                        className="max-w-full max-h-64 rounded-lg border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(imageUrl, '_blank')}
                    />
                </div>
            );

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text after last image
        if (lastIndex < content.length) {
            parts.push(content.substring(lastIndex));
        }

        return parts.length > 0 ? parts : content;
    };

    return (
        <div className={`flex gap-3 ${depth > 0 ? 'mt-3' : 'mt-4'}`}>
            {/* Avatar */}
            <div className="flex-shrink-0">
                <img
                    src={comment.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author_name || 'User')}`}
                    alt={comment.author_name}
                    className="w-8 h-8 rounded-full bg-slate-200 object-cover"
                />
            </div>

            <div className="flex-1 min-w-0">
                {/* Header: Name and Time */}
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-900">
                        {comment.author_name}
                    </span>
                    <span className="text-xs text-slate-500">
                        {formattedDate}
                    </span>
                    {comment.is_edited && !comment.is_retracted && (
                        <span
                            className="text-[10px] text-slate-400 cursor-help border-b border-dotted border-slate-300"
                            title="Đã chỉnh sửa"
                        >
                            đã chỉnh sửa
                        </span>
                    )}
                </div>

                {/* Content */}
                {comment.is_retracted ? (
                    <div className="text-sm text-slate-400 italic bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg inline-block">
                        Tin nhắn đã được thu hồi
                    </div>
                ) : isEditing ? (
                    <div className="mt-1">
                        <CommentComposer
                            initialContent={comment.content}
                            onSubmit={handleUpdateSubmit}
                            onCancel={() => setIsEditing(false)}
                            isSubmitting={false}
                        />
                    </div>
                ) : (
                    <div className="text-slate-700 text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {renderContent(comment.content)}
                    </div>
                )}

                {/* Actions Bar */}
                {!isEditing && !comment.is_retracted && (
                    <div className="flex items-center gap-4 mt-2">
                        <ReactionBar
                            reactions={comment.reactions}
                            userReaction={comment.user_reaction}
                            onReact={(type) => onReact(comment.id, type)}
                        />

                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className="text-xs font-medium text-slate-500 hover:text-brand-600 flex items-center gap-1 transition-colors"
                        >
                            <Reply size={14} /> Trả lời
                        </button>

                        {/* More Actions Dropdown - Click-based */}
                        {isAuthor && (
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setShowActions(!showActions)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <MoreHorizontal size={16} />
                                </button>

                                {showActions && (
                                    <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 shadow-xl rounded-lg py-1 w-32 z-50">
                                        <button
                                            onClick={handleEditClick}
                                            className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-600"
                                        >
                                            <Pencil size={12} /> Chỉnh sửa
                                        </button>
                                        <button
                                            onClick={handleRetractClick}
                                            className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-red-500"
                                        >
                                            <Trash2 size={12} /> Thu hồi
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Reply Composer */}
                {isReplying && (
                    <div className="mt-3 pl-4 border-l-2 border-slate-100">
                        <CommentComposer
                            placeholder={`Trả lời ${comment.author_name}...`}
                            onSubmit={handleReplySubmit}
                            onCancel={() => setIsReplying(false)}
                        />
                    </div>
                )}

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-slate-100">
                        {comment.replies.map(reply => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                currentUserId={currentUserId}
                                onReply={onReply}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                                onRetract={onRetract}
                                onReact={onReact}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

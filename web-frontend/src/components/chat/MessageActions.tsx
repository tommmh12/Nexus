/**
 * MessageActions Component
 * Provides reaction picker, edit, recall options for chat messages
 */

import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Smile, Edit3, Trash2, X, Flag, Shield } from 'lucide-react';

// Default emoji set for reactions
const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

interface Reaction {
    emoji: string;
    count: number;
    users: { userId: string; userName: string }[];
    hasReacted: boolean; // Current user has reacted with this emoji
}

interface MessageActionsProps {
    messageId: string;
    conversationId: string;
    isOwnMessage: boolean;
    canEdit: boolean; // Based on 5-min time limit
    canModerate?: boolean; // Admin/Manager can moderate
    isRecalled: boolean;
    reactions: Reaction[];
    onEdit: (messageId: string) => void;
    onRecall: (messageId: string) => void;
    onAddReaction: (messageId: string, emoji: string) => void;
    onRemoveReaction: (messageId: string, emoji: string) => void;
    onModerateDelete?: (messageId: string) => void;
    onReport?: (messageId: string, reason: string) => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
    messageId,
    conversationId,
    isOwnMessage,
    canEdit,
    canModerate = false,
    isRecalled,
    reactions,
    onEdit,
    onRecall,
    onAddReaction,
    onRemoveReaction,
    onModerateDelete,
    onReport,
}) => {
    const [showPicker, setShowPicker] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleReaction = (emoji: string) => {
        const existingReaction = reactions.find(r => r.emoji === emoji);
        if (existingReaction?.hasReacted) {
            onRemoveReaction(messageId, emoji);
        } else {
            onAddReaction(messageId, emoji);
        }
        setShowPicker(false);
    };

    if (isRecalled) return null;

    return (
        <div className="relative flex items-center gap-1">
            {/* Reaction Display */}
            {reactions.length > 0 && (
                <div className="flex gap-1 mr-2">
                    {reactions.map((reaction) => (
                        <button
                            key={reaction.emoji}
                            onClick={() => handleReaction(reaction.emoji)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all ${reaction.hasReacted
                                    ? 'bg-teal-100 text-teal-700 border border-teal-300'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            title={reaction.users.map(u => u.userName).join(', ')}
                        >
                            <span>{reaction.emoji}</span>
                            <span className="font-medium">{reaction.count}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Action Buttons (visible on hover) */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                {/* Reaction Picker Toggle */}
                <button
                    onClick={() => { setShowPicker(!showPicker); setShowMenu(false); }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Thêm reaction"
                >
                    <Smile size={16} />
                </button>

                {/* More Options for own messages or moderators */}
                {(isOwnMessage || canModerate || onReport) && (
                    <button
                        onClick={() => { setShowMenu(!showMenu); setShowPicker(false); }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Tùy chọn"
                    >
                        <MoreHorizontal size={16} />
                    </button>
                )}
            </div>

            {/* Reaction Picker Dropdown */}
            {showPicker && (
                <div
                    ref={pickerRef}
                    className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50 flex gap-1"
                >
                    {REACTION_EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => handleReaction(emoji)}
                            className="p-2 text-xl hover:bg-slate-100 rounded-lg transition-colors hover:scale-110"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}

            {/* Context Menu Dropdown */}
            {showMenu && (isOwnMessage || canModerate || onReport) && (
                <div
                    ref={menuRef}
                    className="absolute bottom-full mb-2 right-0 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 min-w-[160px]"
                >
                    {/* Own message actions */}
                    {isOwnMessage && canEdit && (
                        <button
                            onClick={() => { onEdit(messageId); setShowMenu(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Edit3 size={14} />
                            <span>Chỉnh sửa</span>
                        </button>
                    )}
                    {isOwnMessage && (
                        <button
                            onClick={() => { onRecall(messageId); setShowMenu(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={14} />
                            <span>Thu hồi</span>
                        </button>
                    )}

                    {/* Divider if both own and other actions exist */}
                    {isOwnMessage && (canModerate || onReport) && !isOwnMessage && (
                        <div className="border-t border-slate-100 my-1" />
                    )}

                    {/* Report option for other's messages */}
                    {!isOwnMessage && onReport && (
                        <button
                            onClick={() => { 
                                const reason = prompt('Lý do báo cáo:');
                                if (reason) onReport(messageId, reason);
                                setShowMenu(false); 
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                            <Flag size={14} />
                            <span>Báo cáo</span>
                        </button>
                    )}

                    {/* Moderation actions */}
                    {canModerate && onModerateDelete && !isOwnMessage && (
                        <button
                            onClick={() => { 
                                if (confirm('Xóa tin nhắn này (kiểm duyệt)?')) {
                                    onModerateDelete(messageId);
                                }
                                setShowMenu(false); 
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <Shield size={14} />
                            <span>Xóa (Mod)</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * Edit Message Modal
 */
interface EditMessageModalProps {
    isOpen: boolean;
    currentText: string;
    onSave: (newText: string) => void;
    onClose: () => void;
}

export const EditMessageModal: React.FC<EditMessageModalProps> = ({
    isOpen,
    currentText,
    onSave,
    onClose,
}) => {
    const [text, setText] = useState(currentText);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            setText(currentText);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, currentText]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (text.trim() && text !== currentText) {
            onSave(text.trim());
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Chỉnh sửa tin nhắn</h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-32 p-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="Nhập nội dung tin nhắn..."
                />

                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!text.trim() || text === currentText}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageActions;

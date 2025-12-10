import React, { useState, useRef, useEffect } from 'react';
import { ThumbsUp, Heart, Smile, Meh, Frown, AlertCircle } from 'lucide-react';
import { ReactionSummary, ReactionType } from '../../types/commentTypes';

interface ReactionBarProps {
    reactions: ReactionSummary;
    userReaction?: string | null;
    onReact: (type: ReactionType) => void;
    size?: 'sm' | 'md';
}

export const ReactionBar: React.FC<ReactionBarProps> = ({ reactions, userReaction, onReact, size = 'sm' }) => {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    const reactionConfig: { type: ReactionType; icon: React.ReactNode; label: string; color: string }[] = [
        { type: 'like', icon: <ThumbsUp size={14} />, label: 'Like', color: 'text-blue-500' },
        { type: 'love', icon: <Heart size={14} />, label: 'Love', color: 'text-red-500' },
        { type: 'laugh', icon: <Smile size={14} />, label: 'Haha', color: 'text-yellow-500' },
        { type: 'wow', icon: <AlertCircle size={14} />, label: 'Wow', color: 'text-orange-500' },
        { type: 'sad', icon: <Frown size={14} />, label: 'Sad', color: 'text-purple-500' },
        { type: 'angry', icon: <Meh size={14} />, label: 'Angry', color: 'text-red-700' },
    ];

    const safeReactions = reactions || { like: 0, love: 0, laugh: 0, wow: 0, sad: 0, angry: 0 };

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowPicker(false);
            }
        };

        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPicker]);

    const handleReact = (type: ReactionType) => {
        onReact(type);
        setShowPicker(false);
    };

    return (
        <div className="flex items-center gap-1 flex-wrap">
            {/* Display existing reactions with counts */}
            {reactionConfig.map((config) => {
                const count = safeReactions[config.type] || 0;
                const isSelected = userReaction === config.type;

                if (count === 0 && !isSelected) return null;

                return (
                    <button
                        key={config.type}
                        onClick={() => handleReact(config.type)}
                        className={`
                            flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all
                            ${isSelected
                                ? `${config.color} bg-blue-50 border border-blue-200`
                                : 'text-slate-500 bg-slate-50 hover:bg-slate-100 border border-transparent'}
                        `}
                        title={config.label}
                    >
                        <span className={config.color}>{config.icon}</span>
                        <span>{count}</span>
                    </button>
                );
            })}

            {/* Reaction picker button */}
            <div className="relative" ref={pickerRef}>
                <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-slate-400 hover:bg-slate-100 transition-colors"
                >
                    <Smile size={14} />
                    <span>React</span>
                </button>

                {/* Picker popup - only shown when showPicker is true */}
                {showPicker && (
                    <div className="absolute bottom-full left-0 mb-2 p-1 bg-white rounded-full shadow-lg border border-slate-200 flex items-center gap-0.5 z-50">
                        {reactionConfig.map((config) => (
                            <button
                                key={config.type}
                                onClick={() => handleReact(config.type)}
                                className={`
                                    p-2 rounded-full hover:bg-slate-100 hover:scale-125 transition-all
                                    ${userReaction === config.type ? 'bg-slate-100 scale-110' : ''}
                                `}
                                title={config.label}
                            >
                                <span className={config.color}>{config.icon}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

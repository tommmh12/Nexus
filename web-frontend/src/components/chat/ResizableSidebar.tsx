/**
 * Resizable Sidebar Container
 * Allows drag-to-resize for the conversation list panel
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';

interface ResizableSidebarProps {
    children: React.ReactNode;
    minWidth?: number;
    maxWidth?: number;
    defaultWidth?: number;
    collapsedWidth?: number;
    storageKey?: string;
}

export const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
    children,
    minWidth = 280,
    maxWidth = 500,
    defaultWidth = 384, // w-96
    collapsedWidth = 0,
    storageKey = 'chat_sidebar_width',
}) => {
    // Load saved width from localStorage
    const getSavedWidth = (): number => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const width = parseInt(saved, 10);
                if (!isNaN(width) && width >= minWidth && width <= maxWidth) {
                    return width;
                }
            }
        } catch { }
        return defaultWidth;
    };

    const [width, setWidth] = useState(getSavedWidth);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Save width to localStorage when it changes
    useEffect(() => {
        if (!isCollapsed) {
            localStorage.setItem(storageKey, width.toString());
        }
    }, [width, isCollapsed, storageKey]);

    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback(
        (e: MouseEvent) => {
            if (!isResizing || !sidebarRef.current) return;

            const newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left;
            if (newWidth >= minWidth && newWidth <= maxWidth) {
                setWidth(newWidth);
            }
        },
        [isResizing, minWidth, maxWidth]
    );

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResizing);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResizing);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, resize, stopResizing]);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div
            ref={sidebarRef}
            className={`relative flex-shrink-0 transition-all duration-300 ${isResizing ? 'transition-none' : ''}`}
            style={{ width: isCollapsed ? collapsedWidth : width }}
        >
            {/* Main content - hidden when collapsed */}
            <div className={`h-full ${isCollapsed ? 'hidden' : 'block'}`}>
                {children}
            </div>

            {/* Collapse/Expand button when collapsed */}
            {isCollapsed && (
                <button
                    onClick={toggleCollapse}
                    className="absolute top-4 left-0 p-2 bg-white rounded-r-xl shadow-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            )}

            {/* Resize handle - only visible when not collapsed */}
            {!isCollapsed && (
                <div
                    onMouseDown={startResizing}
                    className={`absolute top-0 right-0 w-2 h-full cursor-col-resize group hover:bg-teal-500/20 transition-colors ${isResizing ? 'bg-teal-500/30' : ''}`}
                >
                    {/* Visual grip indicator */}
                    <div className="absolute top-1/2 right-0 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center justify-center w-4 h-8 bg-white rounded-r-lg shadow-lg border-l-0">
                            <GripVertical size={14} className="text-slate-400" />
                        </div>
                    </div>

                    {/* Collapse button */}
                    <button
                        onClick={toggleCollapse}
                        className="absolute top-4 right-0 p-1 bg-white rounded-r-lg shadow-md text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                        <ChevronLeft size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResizableSidebar;

/**
 * Connection Status Banner Component
 * Shows connection state (online/offline/reconnecting) with visual feedback
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

type ConnectionState = 'online' | 'offline' | 'reconnecting';

interface ConnectionStatusProps {
    isConnected: boolean;
    onRetry?: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
    isConnected,
    onRetry,
}) => {
    const [state, setState] = useState<ConnectionState>(isConnected ? 'online' : 'offline');
    const [showBanner, setShowBanner] = useState(!isConnected);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        if (isConnected) {
            if (wasOffline) {
                // Show "reconnected" message briefly
                setState('online');
                setShowBanner(true);
                const timer = setTimeout(() => setShowBanner(false), 3000);
                return () => clearTimeout(timer);
            } else {
                setState('online');
                setShowBanner(false);
            }
        } else {
            setState('offline');
            setShowBanner(true);
            setWasOffline(true);
        }
    }, [isConnected, wasOffline]);

    // Also track browser online/offline events
    useEffect(() => {
        const handleOnline = () => {
            if (!isConnected) {
                setState('reconnecting');
            }
        };

        const handleOffline = () => {
            setState('offline');
            setShowBanner(true);
            setWasOffline(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [isConnected]);

    if (!showBanner) return null;

    const configs = {
        online: {
            bg: 'bg-green-500',
            icon: <Wifi size={16} />,
            text: 'Đã kết nối lại',
            animate: false,
        },
        offline: {
            bg: 'bg-red-500',
            icon: <WifiOff size={16} />,
            text: 'Mất kết nối - Tin nhắn sẽ được gửi khi có mạng',
            animate: false,
        },
        reconnecting: {
            bg: 'bg-amber-500',
            icon: <RefreshCw size={16} className="animate-spin" />,
            text: 'Đang kết nối lại...',
            animate: true,
        },
    };

    const config = configs[state];

    return (
        <div
            className={`fixed top-16 left-0 right-0 z-40 ${config.bg} text-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium shadow-lg transition-all`}
        >
            {config.icon}
            <span>{config.text}</span>
            {state === 'offline' && onRetry && (
                <button
                    onClick={onRetry}
                    className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors"
                >
                    Thử lại
                </button>
            )}
        </div>
    );
};

/**
 * Pending Messages Queue Manager
 * Handles messages sent while offline
 */
export interface PendingMessage {
    id: string;
    conversationId: string;
    content: string;
    timestamp: string;
    retryCount: number;
}

interface MessageQueueManager {
    queue: PendingMessage[];
    addToQueue: (message: Omit<PendingMessage, 'id' | 'retryCount'>) => string;
    removeFromQueue: (id: string) => void;
    getQueue: () => PendingMessage[];
    clearQueue: () => void;
    incrementRetry: (id: string) => void;
}

export const useMessageQueue = (): MessageQueueManager => {
    const STORAGE_KEY = 'chat_pending_messages';
    const MAX_RETRIES = 3;

    const getQueue = (): PendingMessage[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    };

    const saveQueue = (queue: PendingMessage[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    };

    const addToQueue = (message: Omit<PendingMessage, 'id' | 'retryCount'>): string => {
        const id = `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const pending: PendingMessage = {
            ...message,
            id,
            retryCount: 0,
        };
        const queue = getQueue();
        queue.push(pending);
        saveQueue(queue);
        return id;
    };

    const removeFromQueue = (id: string) => {
        const queue = getQueue().filter((m) => m.id !== id);
        saveQueue(queue);
    };

    const clearQueue = () => {
        localStorage.removeItem(STORAGE_KEY);
    };

    const incrementRetry = (id: string) => {
        const queue = getQueue().map((m) => {
            if (m.id === id) {
                return { ...m, retryCount: m.retryCount + 1 };
            }
            return m;
        });
        // Remove messages that exceeded max retries
        const filtered = queue.filter((m) => m.retryCount <= MAX_RETRIES);
        saveQueue(filtered);
    };

    return {
        queue: getQueue(),
        addToQueue,
        removeFromQueue,
        getQueue,
        clearQueue,
        incrementRetry,
    };
};

export default ConnectionStatus;

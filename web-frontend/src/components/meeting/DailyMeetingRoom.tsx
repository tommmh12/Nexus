/**
 * Daily Meeting Room Component
 * Renders Daily.co Prebuilt UI for video meetings
 * Uses module-level singleton to prevent "Duplicate DailyIframe" errors
 */

import React, { useEffect, useRef, useState } from 'react';

// Types for Daily.co SDK
interface DailyCallOptions {
    url?: string;
    token?: string;
}

interface DailyIframeOptions {
    iframeStyle?: Partial<CSSStyleDeclaration>;
    showLeaveButton?: boolean;
    showFullscreenButton?: boolean;
}

interface DailyCall {
    join: (options: DailyCallOptions) => Promise<void>;
    leave: () => Promise<void>;
    destroy: () => void;
    on: (event: string, callback: (event?: any) => void) => void;
    off: (event: string, callback: (event?: any) => void) => void;
    iframe: () => HTMLIFrameElement | null;
}

interface DailyIframeSDK {
    createFrame: (container: HTMLElement, options?: DailyIframeOptions) => DailyCall;
}

declare global {
    interface Window {
        DailyIframe?: DailyIframeSDK;
    }
}

// =====================================================
// MODULE-LEVEL SINGLETON - Prevents duplicate instances
// =====================================================

let globalCallFrame: DailyCall | null = null;
let globalRoomUrl: string | null = null;
let lastDestroyTime: number = 0;
const DESTROY_COOLDOWN_MS = 500; // Wait 500ms after destroy before creating new frame

async function destroyGlobalCallFrame() {
    if (globalCallFrame) {
        console.log('[Daily] Destroying global call frame');
        try {
            await globalCallFrame.leave();
        } catch (e) {
            console.warn('[Daily] Error leaving:', e);
        }
        try {
            globalCallFrame.destroy();
        } catch (e) {
            console.warn('[Daily] Error destroying:', e);
        }
        globalCallFrame = null;
        globalRoomUrl = null;
        lastDestroyTime = Date.now();
    }
}

async function waitForDestroyCooldown(): Promise<void> {
    const elapsed = Date.now() - lastDestroyTime;
    if (lastDestroyTime > 0 && elapsed < DESTROY_COOLDOWN_MS) {
        const waitTime = DESTROY_COOLDOWN_MS - elapsed;
        console.log(`[Daily] Waiting ${waitTime}ms for SDK cooldown...`);
        await new Promise(r => setTimeout(r, waitTime));
    }
}

// =====================================================
// Component Props
// =====================================================

interface DailyMeetingRoomProps {
    /** Daily.co room URL */
    roomUrl: string;
    /** Meeting token for authentication */
    token: string;
    /** Callback when user leaves the meeting */
    onLeave?: () => void;
    /** Callback on error */
    onError?: (error: Error) => void;
    /** Custom container class name */
    className?: string;
    /** Minimum height for the container */
    minHeight?: string;
}

// =====================================================
// Component Implementation
// =====================================================

export const DailyMeetingRoom: React.FC<DailyMeetingRoomProps> = ({
    roomUrl,
    token,
    onLeave,
    onError,
    className = '',
    minHeight = '600px',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mountedRef = useRef(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        mountedRef.current = true;
        let localCallFrame: DailyCall | null = null;

        const initDaily = async () => {
            console.log('[Daily] Init starting, roomUrl:', roomUrl);

            // Check if we already have a frame for THIS room
            if (globalCallFrame && globalRoomUrl === roomUrl) {
                console.log('[Daily] Reusing existing call frame');
                setIsLoading(false);
                return;
            }

            // Destroy any existing frame first
            await destroyGlobalCallFrame();

            // Wait for SDK cooldown after destroy
            await waitForDestroyCooldown();

            // Wait for SDK to load
            if (!window.DailyIframe) {
                console.log('[Daily] Loading SDK...');
                await loadDailySDK();
            }

            if (!mountedRef.current || !containerRef.current) {
                console.log('[Daily] Aborted - component unmounted');
                return;
            }

            // Clear container
            containerRef.current.innerHTML = '';

            if (!mountedRef.current || !containerRef.current) {
                return;
            }

            try {
                console.log('[Daily] Creating frame...');
                const callFrame = window.DailyIframe!.createFrame(containerRef.current, {
                    iframeStyle: {
                        width: '100%',
                        height: minHeight || 'calc(100vh - 200px)',
                        border: '0',
                        borderRadius: '12px',
                    },
                    showLeaveButton: true,
                    showFullscreenButton: true,
                });

                // Hide our loading - Daily iframe has its own loading UI
                setIsLoading(false);

                globalCallFrame = callFrame;
                globalRoomUrl = roomUrl;
                localCallFrame = callFrame;

                // Event handlers
                callFrame.on('left-meeting', () => {
                    console.log('[Daily] Left meeting');
                    destroyGlobalCallFrame().catch(e => console.error(e));
                    onLeave?.();
                });

                callFrame.on('error', (e: any) => {
                    console.error('[Daily] Error:', e);
                    const msg = e?.errorMsg || 'Unknown error';
                    setError(msg);
                    onError?.(new Error(msg));
                });

                callFrame.on('joined-meeting', () => {
                    console.log('[Daily] Joined meeting');
                });

                // Join
                console.log('[Daily] Joining...');
                await callFrame.join({ url: roomUrl, token });
                console.log('[Daily] Join complete');

                // Hide loading immediately - Daily UI handles its own states
                if (mountedRef.current) {
                    setIsLoading(false);
                }

            } catch (err: any) {
                console.error('[Daily] Init failed:', err);
                const msg = err.message || 'Failed to join meeting';
                if (mountedRef.current) {
                    setError(msg);
                    setIsLoading(false);
                }
                onError?.(err);
            }
        };

        initDaily();

        return () => {
            console.log('[Daily] Cleanup effect');
            mountedRef.current = false;
            // Only destroy if this component owns the frame
            if (localCallFrame === globalCallFrame) {
                destroyGlobalCallFrame().catch(e => console.error('[Daily] Cleanup error:', e));
            }
        };
    }, [roomUrl, token]); // Re-init if roomUrl or token changes

    return (
        <div className={`relative ${className}`} style={{ minHeight }}>
            {/* Loading State */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10 rounded-xl">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white font-semibold">Joining meeting...</p>
                        <p className="text-slate-400 text-sm mt-1">Please wait while we connect you</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10 rounded-xl">
                    <div className="text-center p-6 max-w-md">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Connection Error</h3>
                        <p className="text-slate-400 text-sm mb-4">{error}</p>
                        <button
                            onClick={onLeave}
                            className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            )}

            {/* Daily.co Container */}
            <div
                ref={containerRef}
                className="w-full rounded-xl overflow-hidden bg-slate-900"
                style={{ height: minHeight, minHeight }}
            />
        </div>
    );
};

// Helper to load Daily SDK
async function loadDailySDK(): Promise<void> {
    if (window.DailyIframe) return;

    return new Promise((resolve, reject) => {
        const existingScript = document.getElementById('daily-js-script');
        if (existingScript) {
            // Wait for it to load
            const checkLoaded = setInterval(() => {
                if (window.DailyIframe) {
                    clearInterval(checkLoaded);
                    resolve();
                }
            }, 100);
            setTimeout(() => {
                clearInterval(checkLoaded);
                reject(new Error('Daily SDK load timeout'));
            }, 10000);
            return;
        }

        const script = document.createElement('script');
        script.id = 'daily-js-script';
        script.src = 'https://unpkg.com/@daily-co/daily-js';
        script.async = true;
        script.onload = () => {
            console.log('[Daily] SDK loaded');
            resolve();
        };
        script.onerror = () => reject(new Error('Failed to load Daily.co SDK'));
        document.head.appendChild(script);
    });
}

export default DailyMeetingRoom;

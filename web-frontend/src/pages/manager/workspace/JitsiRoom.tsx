import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../../components/system/ui/Button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { onlineMeetingService } from "../../../services/onlineMeetingService";
import type { JitsiJoinConfig } from "../../../types/onlineMeeting.types";

// Declare Jitsi external API type
declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

export const JitsiRoom: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [joinConfig, setJoinConfig] = useState<JitsiJoinConfig | null>(null);
    const jitsiApiRef = useRef<any>(null);

    useEffect(() => {
        if (!id) {
            setError("Meeting ID không hợp lệ");
            setLoading(false);
            return;
        }

        loadJitsiAPI();
        fetchJoinToken();

        return () => {
            // Cleanup Jitsi on unmount
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
            }
        };
    }, [id]);

    const loadJitsiAPI = () => {
        // Load Jitsi Meet External API script if not already loaded
        if (!document.getElementById("jitsi-script")) {
            const script = document.createElement("script");
            script.id = "jitsi-script";
            script.src = "https://meet.jit.si/external_api.js";
            script.async = true;
            document.head.appendChild(script);
        }
    };

    const fetchJoinToken = async () => {
        try {
            setLoading(true);
            const config = await onlineMeetingService.getJoinToken(id!);
            setJoinConfig(config);
            setLoading(false);

            // Wait a bit for Jitsi API script to load
            setTimeout(() => initializeJitsi(config), 500);
        } catch (error: any) {
            console.error("Error fetching join token:", error);
            setError(
                error.response?.data?.message ||
                "Bạn không có quyền tham gia cuộc họp này"
            );
            setLoading(false);
        }
    };

    const initializeJitsi = (config: JitsiJoinConfig) => {
        if (!jitsiContainerRef.current || !window.JitsiMeetExternalAPI) {
            console.error("Jitsi API not loaded");
            setTimeout(() => initializeJitsi(config), 500);
            return;
        }

        try {
            // Clear container
            jitsiContainerRef.current.innerHTML = "";

            // Initialize Jitsi
            const domain = config.domain;

            // Note: meet.jit.si public server doesn't support JWT auth
            // Only use JWT for self-hosted Jitsi servers
            const isPublicServer = domain === 'meet.jit.si';

            const options: any = {
                roomName: config.roomName,
                width: "100%",
                height: "100%",
                parentNode: jitsiContainerRef.current,
                configOverwrite: {
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    enableWelcomePage: false,
                    prejoinPageEnabled: true, // Show prejoin page
                    disableDeepLinking: true,
                },
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    TOOLBAR_BUTTONS: [
                        "microphone",
                        "camera",
                        "desktop",
                        "fullscreen",
                        "fodeviceselection",
                        "hangup",
                        "chat",
                        "recording",
                        "livestreaming",
                        "etherpad",
                        "sharedvideo",
                        "settings",
                        "raisehand",
                        "videoquality",
                        "filmstrip",
                        "feedback",
                        "stats",
                        "shortcuts",
                        "tileview",
                        "videobackgroundblur",
                        "mute-everyone",
                        "security",
                    ],
                },
                userInfo: {
                    displayName: config.userInfo.displayName,
                    email: config.userInfo.email,
                },
            };

            // Only add JWT for self-hosted servers
            if (!isPublicServer) {
                options.jwt = config.jwt;
            }

            jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

            // Track if user has actually joined the conference
            let hasJoinedConference = false;

            // Set avatar if available
            if (config.userInfo.avatarUrl) {
                jitsiApiRef.current.executeCommand(
                    "avatarUrl",
                    config.userInfo.avatarUrl
                );
            }

            // Handle events
            jitsiApiRef.current.addEventListener("videoConferenceJoined", () => {
                console.log("User joined the conference");
                hasJoinedConference = true;
            });

            jitsiApiRef.current.addEventListener("videoConferenceLeft", () => {
                console.log("User left the conference");
                // Only redirect if user actually joined before
                if (hasJoinedConference) {
                    handleLeaveMeeting();
                }
            });

            jitsiApiRef.current.addEventListener("readyToClose", () => {
                console.log("Jitsi ready to close");
                // Only redirect if user actually joined before
                if (hasJoinedConference) {
                    handleLeaveMeeting();
                }
            });

            // Handle participate request (for moderator dialogs)
            jitsiApiRef.current.addEventListener("participantRoleChanged", (event: any) => {
                console.log("Participant role changed:", event);
            });
        } catch (error) {
            console.error("Error initializing Jitsi:", error);
            setError("Lỗi khi khởi tạo phòng họp");
        }
    };

    const handleLeaveMeeting = () => {
        if (jitsiApiRef.current) {
            jitsiApiRef.current.dispose();
            jitsiApiRef.current = null;
        }
        navigate("/admin/online-meetings");
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-brand-600 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">
                        Đang chuẩn bị phòng họp...
                    </p>
                    <p className="text-slate-400 text-sm mt-2">
                        Vui lòng đợi trong giây lát
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 max-w-md text-center">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                        Không thể tham gia
                    </h3>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <Button onClick={() => navigate("/admin/online-meetings")}>
                        <ArrowLeft size={16} className="mr-2" />
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-slate-900">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLeaveMeeting}
                        className="text-white hover:bg-slate-700"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Rời khỏi cuộc họp
                    </Button>
                    {joinConfig && (
                        <div className="text-sm text-slate-300">
                            <span className="font-medium">Bạn đang tham gia với tư cách:</span>{" "}
                            <span className="text-white">{joinConfig.userInfo.displayName}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Jitsi Container */}
            <div ref={jitsiContainerRef} className="flex-1" />
        </div>
    );
};

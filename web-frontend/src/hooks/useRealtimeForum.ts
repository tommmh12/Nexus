import { useEffect, useCallback } from "react";
import { socketService } from "../services/socketService";
import { ForumPost } from "../types";

interface UseRealtimeForumOptions {
  onPostCreated?: (post: ForumPost) => void;
  onPostUpdated?: (post: ForumPost) => void;
  onPostApproved?: (post: ForumPost) => void;
  onPostRejected?: (post: ForumPost) => void;
  subscribeToPost?: string; // Post ID to subscribe to
}

export const useRealtimeForum = (options: UseRealtimeForumOptions = {}) => {
  const {
    onPostCreated,
    onPostUpdated,
    onPostApproved,
    onPostRejected,
    subscribeToPost,
  } = options;

  useEffect(() => {
    // Connect to WebSocket
    const socket = socketService.connect();
    if (!socket) return;

    // Subscribe to forum events
    socketService.subscribe("forum:all");
    if (subscribeToPost) {
      socketService.subscribe(`forum:post:${subscribeToPost}`);
    }

    // Set up event listeners
    const handlePostCreated = (data: { post: ForumPost }) => {
      if (onPostCreated) {
        onPostCreated(data.post);
      }
    };

    const handlePostUpdated = (data: { post: ForumPost }) => {
      if (onPostUpdated) {
        onPostUpdated(data.post);
      }
    };

    const handlePostApproved = (data: { post: ForumPost }) => {
      if (onPostApproved) {
        onPostApproved(data.post);
      }
    };

    const handlePostRejected = (data: { post: ForumPost }) => {
      if (onPostRejected) {
        onPostRejected(data.post);
      }
    };

    socketService.on("forum:post:created", handlePostCreated);
    socketService.on("forum:post:updated", handlePostUpdated);
    socketService.on("forum:post:approved", handlePostApproved);
    socketService.on("forum:post:rejected", handlePostRejected);

    // Cleanup
    return () => {
      socketService.off("forum:post:created", handlePostCreated);
      socketService.off("forum:post:updated", handlePostUpdated);
      socketService.off("forum:post:approved", handlePostApproved);
      socketService.off("forum:post:rejected", handlePostRejected);

      if (subscribeToPost) {
        socketService.unsubscribe(`forum:post:${subscribeToPost}`);
      }
      socketService.unsubscribe("forum:all");
    };
  }, [onPostCreated, onPostUpdated, onPostApproved, onPostRejected, subscribeToPost]);

  return {
    isConnected: socketService.isConnected(),
  };
};


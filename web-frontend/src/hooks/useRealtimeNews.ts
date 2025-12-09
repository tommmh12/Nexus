import { useEffect } from "react";
import { socketService } from "../services/socketService";
import { NewsArticle } from "../types";

interface UseRealtimeNewsOptions {
  onArticleCreated?: (article: NewsArticle) => void;
  onArticleUpdated?: (article: NewsArticle) => void;
  onArticlePublished?: (article: NewsArticle) => void;
  onArticleArchived?: (article: NewsArticle) => void;
  subscribeToArticle?: string; // Article ID to subscribe to
}

export const useRealtimeNews = (options: UseRealtimeNewsOptions = {}) => {
  const {
    onArticleCreated,
    onArticleUpdated,
    onArticlePublished,
    onArticleArchived,
    subscribeToArticle,
  } = options;

  useEffect(() => {
    // Connect to WebSocket
    const socket = socketService.connect();
    if (!socket) return;

    // Subscribe to news events
    socketService.subscribe("news:all");
    if (subscribeToArticle) {
      socketService.subscribe(`news:article:${subscribeToArticle}`);
    }

    // Set up event listeners
    const handleArticleCreated = (data: { article: NewsArticle }) => {
      if (onArticleCreated) {
        onArticleCreated(data.article);
      }
    };

    const handleArticleUpdated = (data: { article: NewsArticle }) => {
      if (onArticleUpdated) {
        onArticleUpdated(data.article);
      }
    };

    const handleArticlePublished = (data: { article: NewsArticle }) => {
      if (onArticlePublished) {
        onArticlePublished(data.article);
      }
    };

    const handleArticleArchived = (data: { article: NewsArticle }) => {
      if (onArticleArchived) {
        onArticleArchived(data.article);
      }
    };

    socketService.on("news:article:created", handleArticleCreated);
    socketService.on("news:article:updated", handleArticleUpdated);
    socketService.on("news:article:published", handleArticlePublished);
    socketService.on("news:article:archived", handleArticleArchived);

    // Cleanup
    return () => {
      socketService.off("news:article:created", handleArticleCreated);
      socketService.off("news:article:updated", handleArticleUpdated);
      socketService.off("news:article:published", handleArticlePublished);
      socketService.off("news:article:archived", handleArticleArchived);

      if (subscribeToArticle) {
        socketService.unsubscribe(`news:article:${subscribeToArticle}`);
      }
      socketService.unsubscribe("news:all");
    };
  }, [onArticleCreated, onArticleUpdated, onArticlePublished, onArticleArchived, subscribeToArticle]);

  return {
    isConnected: socketService.isConnected(),
  };
};


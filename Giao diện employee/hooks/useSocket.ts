

export const useSocket = (userId: string = "") => {
  return {
    isConnected: true,
    onlineUsers: new Set<string>(),
    joinConversation: (conversationId: string) => {},
    leaveConversation: (conversationId: string) => {},
    sendMessage: (message: any) => {},
    startTyping: (conversationId: string) => {},
    stopTyping: (conversationId: string) => {},
    markAsRead: (conversationId: string) => {},
    onNewMessage: (callback: (data: any) => void) => { return () => {}; },
    onTyping: (callback: (data: any) => void) => { return () => {}; },
    onStopTyping: (callback: (data: any) => void) => { return () => {}; },
    onMessagesRead: (callback: (data: any) => void) => { return () => {}; }
  };
};
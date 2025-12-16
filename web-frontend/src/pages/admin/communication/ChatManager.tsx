/**
 * Admin Chat Manager
 * Uses shared ChatManager component with admin role
 */

import ChatManager from '../../../components/chat/ChatManager';

export default function AdminChatManager() {
  return <ChatManager userRole="admin" canModerate={true} />;
}

export { AdminChatManager as ChatManager };

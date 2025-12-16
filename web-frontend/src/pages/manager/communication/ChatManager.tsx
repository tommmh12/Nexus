/**
 * Manager Chat Manager
 * Uses shared ChatManager component with department-manager role
 */

import ChatManager from '../../../components/chat/ChatManager';

export default function ManagerChatManager() {
  return <ChatManager userRole="department-manager" canModerate={true} />;
}

export { ManagerChatManager as ChatManager };

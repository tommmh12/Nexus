/**
 * Employee Chat Manager
 * Uses shared ChatManager component with employee role
 */

import ChatManager from '../../../components/chat/ChatManager';

export default function EmployeeChatManager() {
  return <ChatManager userRole="employee" canModerate={false} />;
}

export { EmployeeChatManager };

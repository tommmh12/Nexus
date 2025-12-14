import React, { useState } from "react";

// Mock data for UI preview
const MOCK_CONVERSATIONS = [
  {
    id: "1",
    type: "direct" as const,
    name: "Nguyễn Văn An",
    avatar: "NA",
    lastMessage: "Bạn gửi file báo cáo cho mình nhé",
    lastMessageTime: "10:30",
    unreadCount: 2,
    online: true,
    department: "Phòng Kỹ thuật",
  },
  {
    id: "2",
    type: "direct" as const,
    name: "Trần Thị Bình",
    avatar: "TB",
    lastMessage: "OK, để mình check lại",
    lastMessageTime: "09:45",
    unreadCount: 0,
    online: true,
    department: "Phòng Nhân sự",
  },
  {
    id: "3",
    type: "group" as const,
    name: "Dự án Website Portal",
    avatar: "WP",
    lastMessage: "Anh An: Sprint này cần hoàn thành UI",
    lastMessageTime: "Hôm qua",
    unreadCount: 5,
    memberCount: 8,
  },
  {
    id: "4",
    type: "group" as const,
    name: "Team Frontend",
    avatar: "FE",
    lastMessage: "Họp review code lúc 2h",
    lastMessageTime: "Hôm qua",
    unreadCount: 0,
    memberCount: 5,
  },
  {
    id: "5",
    type: "direct" as const,
    name: "Lê Hoàng Cường",
    avatar: "LC",
    lastMessage: "Thanks bạn!",
    lastMessageTime: "Thứ 2",
    unreadCount: 0,
    online: false,
    department: "Phòng Marketing",
  },
];

const MOCK_MESSAGES = [
  {
    id: "m1",
    senderId: "other",
    senderName: "Nguyễn Văn An",
    senderAvatar: "NA",
    content:
      "Chào bạn, bạn có thể gửi file báo cáo tuần này cho mình được không?",
    timestamp: "10:15",
    status: "read" as const,
  },
  {
    id: "m2",
    senderId: "me",
    senderName: "Tôi",
    senderAvatar: "ME",
    content: "Chào anh, dạ được ạ. Để em gửi ngay",
    timestamp: "10:20",
    status: "read" as const,
  },
  {
    id: "m3",
    senderId: "other",
    senderName: "Nguyễn Văn An",
    senderAvatar: "NA",
    content: "Bạn gửi file báo cáo cho mình nhé",
    timestamp: "10:30",
    status: "delivered" as const,
  },
];

const MOCK_CONTACTS = [
  {
    id: "c1",
    name: "Nguyễn Văn An",
    department: "Phòng Kỹ thuật",
    avatar: "NA",
    online: true,
  },
  {
    id: "c2",
    name: "Trần Thị Bình",
    department: "Phòng Nhân sự",
    avatar: "TB",
    online: true,
  },
  {
    id: "c3",
    name: "Lê Hoàng Cường",
    department: "Phòng Marketing",
    avatar: "LC",
    online: false,
  },
  {
    id: "c4",
    name: "Phạm Thị Dung",
    department: "Phòng Kế toán",
    avatar: "PD",
    online: true,
  },
  {
    id: "c5",
    name: "Hoàng Văn Em",
    department: "Phòng IT",
    avatar: "HE",
    online: false,
  },
];

export default function ChatManager() {
  const [activeConversation, setActiveConversation] = useState<string | null>(
    "1"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "direct" | "group">(
    "all"
  );

  const filteredConversations = MOCK_CONVERSATIONS.filter((conv) => {
    const matchesSearch = conv.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || conv.type === filterType;
    return matchesSearch && matchesType;
  });

  const activeChat = MOCK_CONVERSATIONS.find(
    (c) => c.id === activeConversation
  );

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    // Mock send - in real app would call API
    console.log("Sending message:", messageInput);
    setMessageInput("");
  };

  return (
    <div className="h-[calc(100vh-120px)] flex bg-gray-50 rounded-xl overflow-hidden shadow-lg">
      {/* Sidebar - Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">💬 Tin nhắn</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewChat(true)}
                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                title="Chat mới"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              <button
                onClick={() => setShowGroupModal(true)}
                className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                title="Tạo nhóm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 mt-3 bg-gray-100 p-1 rounded-lg">
            {[
              { key: "all", label: "Tất cả" },
              { key: "direct", label: "Cá nhân" },
              { key: "group", label: "Nhóm" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterType(tab.key as typeof filterType)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterType === tab.key
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConversation(conv.id)}
              className={`w-full p-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                activeConversation === conv.id
                  ? "bg-blue-50 border-l-4 border-l-blue-500"
                  : ""
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                    conv.type === "group"
                      ? "bg-gradient-to-br from-green-400 to-green-600"
                      : "bg-gradient-to-br from-blue-400 to-blue-600"
                  }`}
                >
                  {conv.avatar}
                </div>
                {conv.type === "direct" && conv.online && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800 truncate">
                    {conv.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {conv.lastMessageTime}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {conv.lastMessage}
                </p>
                {conv.type === "group" && (
                  <span className="text-xs text-gray-400">
                    {conv.memberCount} thành viên
                  </span>
                )}
              </div>

              {/* Unread Badge */}
              {conv.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  {conv.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChat ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  activeChat.type === "group"
                    ? "bg-gradient-to-br from-green-400 to-green-600"
                    : "bg-gradient-to-br from-blue-400 to-blue-600"
                }`}
              >
                {activeChat.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {activeChat.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {activeChat.type === "direct"
                    ? activeChat.online
                      ? "🟢 Đang hoạt động"
                      : "Offline"
                    : `${activeChat.memberCount} thành viên`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {MOCK_MESSAGES.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.senderId === "me" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] ${
                    msg.senderId === "me" ? "order-2" : "order-1"
                  }`}
                >
                  {msg.senderId !== "me" && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                        {msg.senderAvatar}
                      </div>
                      <span className="text-xs text-gray-500">
                        {msg.senderName}
                      </span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      msg.senderId === "me"
                        ? "bg-blue-500 text-white rounded-br-md"
                        : "bg-white text-gray-800 rounded-bl-md shadow-sm"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <div
                    className={`flex items-center gap-1 mt-1 ${
                      msg.senderId === "me" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span className="text-xs text-gray-400">
                      {msg.timestamp}
                    </span>
                    {msg.senderId === "me" && (
                      <span className="text-xs text-blue-400">
                        {msg.status === "read" ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 px-4 py-2 bg-gray-100 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="p-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Chọn cuộc trò chuyện
            </h3>
            <p className="text-gray-500">
              Chọn một cuộc trò chuyện từ danh sách để bắt đầu
            </p>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Tin nhắn mới</h3>
              <button
                onClick={() => setShowNewChat(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {MOCK_CONTACTS.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => {
                      setShowNewChat(false);
                      // Would navigate to new conversation
                    }}
                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
                        {contact.avatar}
                      </div>
                      {contact.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">
                        {contact.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {contact.department}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Tạo nhóm mới</h3>
              <button
                onClick={() => setShowGroupModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên nhóm
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên nhóm..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thêm thành viên
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {MOCK_CONTACTS.map((contact) => (
                    <label
                      key={contact.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                        {contact.avatar}
                      </div>
                      <span className="text-gray-800">{contact.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                Tạo nhóm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";

// Mock data for UI preview
const MOCK_MEETINGS = [
  {
    id: "1",
    title: "Sprint Planning - Q3",
    type: "meeting" as const,
    startTime: "09:00",
    endTime: "10:30",
    date: "2024-06-18",
    organizer: "Nguyễn Văn An",
    participants: [
      "Nguyễn Văn An",
      "Trần Thị Bình",
      "Lê Hoàng Cường",
      "Phạm Văn Dũng",
    ],
    status: "upcoming" as const,
    meetingLink: "https://meet.example.com/abc123",
    description:
      "Họp planning sprint mới cho Q3, review backlog và phân chia công việc",
    isRecurring: true,
  },
  {
    id: "2",
    title: "Code Review Session",
    type: "meeting" as const,
    startTime: "14:00",
    endTime: "15:00",
    date: "2024-06-18",
    organizer: "Trần Thị Bình",
    participants: ["Trần Thị Bình", "Lê Hoàng Cường"],
    status: "upcoming" as const,
    meetingLink: "https://meet.example.com/def456",
    description: "Review code module authentication",
    isRecurring: false,
  },
  {
    id: "3",
    title: "Daily Standup",
    type: "meeting" as const,
    startTime: "08:30",
    endTime: "08:45",
    date: "2024-06-17",
    organizer: "Team Lead",
    participants: ["Toàn team"],
    status: "completed" as const,
    meetingLink: "https://meet.example.com/daily",
    description: "Daily standup meeting",
    isRecurring: true,
  },
];

const MOCK_SCHEDULE = [
  { date: "2024-06-17", meetings: 2, events: 1 },
  { date: "2024-06-18", meetings: 3, events: 0 },
  { date: "2024-06-19", meetings: 1, events: 2 },
  { date: "2024-06-20", meetings: 0, events: 1 },
];

const MOCK_QUICK_CONTACTS = [
  { id: "1", name: "Nguyễn Văn An", avatar: "NA", status: "online" as const },
  { id: "2", name: "Trần Thị Bình", avatar: "TB", status: "online" as const },
  { id: "3", name: "Lê Hoàng Cường", avatar: "LC", status: "away" as const },
  { id: "4", name: "Phạm Văn Dũng", avatar: "PD", status: "offline" as const },
];

export default function OnlineMeetingModule() {
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "history" | "schedule"
  >("upcoming");
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<
    (typeof MOCK_MEETINGS)[0] | null
  >(null);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    participants: [] as string[],
    description: "",
  });

  const upcomingMeetings = MOCK_MEETINGS.filter((m) => m.status === "upcoming");
  const pastMeetings = MOCK_MEETINGS.filter((m) => m.status === "completed");

  const handleCreateMeeting = () => {
    console.log("Creating meeting:", newMeeting);
    setShowCreateMeeting(false);
    setNewMeeting({
      title: "",
      date: "",
      startTime: "",
      endTime: "",
      participants: [],
      description: "",
    });
  };

  const handleJoinMeeting = (meetingLink: string) => {
    console.log("Joining meeting:", meetingLink);
    window.open(meetingLink, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">🎥 Họp trực tuyến</h1>
            <p className="text-teal-100">
              Quản lý lịch họp và tham gia cuộc họp online
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateMeeting(true)}
              className="px-5 py-2.5 bg-white text-teal-600 rounded-xl font-semibold hover:bg-teal-50 transition-colors flex items-center gap-2"
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
              Tạo cuộc họp
            </button>
            <button className="px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-colors flex items-center gap-2">
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
              Tham gia nhanh
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {[
            { label: "Họp hôm nay", value: "3", icon: "📅" },
            { label: "Sắp diễn ra", value: "2", icon: "⏰" },
            { label: "Đã tham gia tuần này", value: "12", icon: "✅" },
            { label: "Tạo bởi tôi", value: "5", icon: "👤" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-white/80">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="col-span-8">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-4">
            <div className="flex border-b border-gray-100">
              {[
                { key: "upcoming", label: "Sắp diễn ra", icon: "📅" },
                { key: "history", label: "Lịch sử", icon: "📋" },
                { key: "schedule", label: "Lịch tuần", icon: "🗓️" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "text-teal-600 border-b-2 border-teal-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Meetings */}
          {activeTab === "upcoming" && (
            <div className="space-y-4">
              {upcomingMeetings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">📅</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Không có cuộc họp
                  </h3>
                  <p className="text-gray-500">
                    Bạn chưa có cuộc họp nào sắp diễn ra
                  </p>
                </div>
              ) : (
                upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {meeting.isRecurring && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                🔄 Định kỳ
                              </span>
                            )}
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              Sắp diễn ra
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {meeting.title}
                          </h3>
                          <p className="text-gray-500 text-sm mt-1">
                            {meeting.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-teal-600">
                            {meeting.startTime} - {meeting.endTime}
                          </p>
                          <p className="text-sm text-gray-500">
                            {meeting.date}
                          </p>
                        </div>
                      </div>

                      {/* Participants */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            Người tham gia:
                          </span>
                          <div className="flex -space-x-2">
                            {meeting.participants.slice(0, 4).map((p, idx) => (
                              <div
                                key={idx}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center text-xs font-medium border-2 border-white"
                                title={p}
                              >
                                {p.charAt(0)}
                              </div>
                            ))}
                            {meeting.participants.length > 4 && (
                              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-medium border-2 border-white">
                                +{meeting.participants.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedMeeting(meeting)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Chi tiết
                          </button>
                          <button
                            onClick={() =>
                              handleJoinMeeting(meeting.meetingLink)
                            }
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
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
                            Tham gia
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* History */}
          {activeTab === "history" && (
            <div className="space-y-3">
              {pastMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-white rounded-xl shadow-sm p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {meeting.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {meeting.date} • {meeting.startTime} - {meeting.endTime}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      ✅ Đã kết thúc
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Weekly Schedule */}
          {activeTab === "schedule" && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                📅 Lịch tuần này
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day, idx) => (
                  <div key={day} className="text-center">
                    <p className="text-xs text-gray-500 mb-2">{day}</p>
                    <div
                      className={`p-3 rounded-lg ${
                        idx === 1 || idx === 2
                          ? "bg-teal-50 border border-teal-200"
                          : "bg-gray-50"
                      }`}
                    >
                      <p className="text-lg font-bold text-gray-800">
                        {17 + idx}
                      </p>
                      {(idx === 1 || idx === 2) && (
                        <div className="mt-1">
                          <span className="inline-block w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="col-span-4 space-y-4">
          {/* Quick Join */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              🔗 Tham gia nhanh
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập mã cuộc họp..."
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
              />
              <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors">
                Tham gia
              </button>
            </div>
          </div>

          {/* Quick Contacts */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              👥 Liên hệ nhanh
            </h3>
            <div className="space-y-2">
              {MOCK_QUICK_CONTACTS.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-medium">
                        {contact.avatar}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          contact.status === "online"
                            ? "bg-green-500"
                            : contact.status === "away"
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                        }`}
                      ></span>
                    </div>
                    <span className="text-sm text-gray-700">
                      {contact.name}
                    </span>
                  </div>
                  <button className="p-1.5 hover:bg-teal-50 text-teal-600 rounded">
                    <svg
                      className="w-4 h-4"
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
                </div>
              ))}
            </div>
          </div>

          {/* Meeting Tips */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
            <h3 className="font-semibold text-teal-800 mb-3">
              💡 Mẹo họp hiệu quả
            </h3>
            <ul className="space-y-2 text-sm text-teal-700">
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Kiểm tra micro và camera trước khi vào họp</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Tắt tiếng khi không nói</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Chuẩn bị nội dung trước cuộc họp</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create Meeting Modal */}
      {showCreateMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">
                🎥 Tạo cuộc họp mới
              </h3>
              <button
                onClick={() => setShowCreateMeeting(false)}
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
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề cuộc họp
                </label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, title: e.target.value })
                  }
                  placeholder="VD: Sprint Planning Meeting"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày
                  </label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bắt đầu
                  </label>
                  <input
                    type="time"
                    value={newMeeting.startTime}
                    onChange={(e) =>
                      setNewMeeting({
                        ...newMeeting,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kết thúc
                  </label>
                  <input
                    type="time"
                    value={newMeeting.endTime}
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, endTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={newMeeting.description}
                  onChange={(e) =>
                    setNewMeeting({
                      ...newMeeting,
                      description: e.target.value,
                    })
                  }
                  placeholder="Nội dung cuộc họp..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowCreateMeeting(false)}
                  className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateMeeting}
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                >
                  Tạo cuộc họp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Detail Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Chi tiết cuộc họp</h3>
              <button
                onClick={() => setSelectedMeeting(null)}
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
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {selectedMeeting.title}
              </h2>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">📅</span>
                  <span>{selectedMeeting.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">🕐</span>
                  <span>
                    {selectedMeeting.startTime} - {selectedMeeting.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">👤</span>
                  <span>Tổ chức bởi: {selectedMeeting.organizer}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-500">👥</span>
                  <div>
                    <p className="mb-1">Người tham gia:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedMeeting.participants.map((p, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                {selectedMeeting.description}
              </p>
              <button
                onClick={() => handleJoinMeeting(selectedMeeting.meetingLink)}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Tham gia ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

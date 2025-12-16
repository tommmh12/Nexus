/**
 * Online Meeting Module with Daily.co Integration
 * Replaces mock data with real API calls
 */

import React, { useState, useEffect } from "react";
import { Video, Calendar, Clock, User, Check, Plus, X, AlertCircle, Loader2 } from "lucide-react";
import meetingService from "../../../services/meetingService";
import { MeetingDetails, JoinMeetingResponse } from "../../../types/meeting.types";
import DailyMeetingRoom from "../../../components/meeting/DailyMeetingRoom";

const THEME = {
  bg: "bg-[#F8FAFC]",
  card: "bg-white rounded-[24px] shadow-sm border-0",
  textPrimary: "text-slate-900",
  textSecondary: "text-slate-500",
  accent: "text-teal-600",
  accentBg: "bg-teal-50",
  buttonPrimary: "bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold shadow-lg shadow-slate-900/10",
  buttonGhost: "bg-transparent text-slate-500 hover:bg-slate-100 rounded-xl"
};

export default function OnlineMeetingModule() {
  // State
  const [activeTab, setActiveTab] = useState<"upcoming" | "history" | "schedule">("upcoming");
  const [meetings, setMeetings] = useState<MeetingDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Meeting room state
  const [activeMeeting, setActiveMeeting] = useState<JoinMeetingResponse | null>(null);
  const [joiningMeetingId, setJoiningMeetingId] = useState<string | null>(null);

  // Create meeting modal
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    scheduledStart: "",
    scheduledEnd: "",
    accessMode: "public" as "public" | "private",
    description: "",
  });
  const [creating, setCreating] = useState(false);

  // Fetch meetings on mount
  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await meetingService.getMeetings();
      setMeetings(data);
    } catch (err: any) {
      console.error("Failed to fetch meetings:", err);
      setError(err.response?.data?.message || "Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async (meetingId: string) => {
    try {
      setJoiningMeetingId(meetingId);
      const response = await meetingService.joinMeeting(meetingId);
      setActiveMeeting(response);
    } catch (err: any) {
      console.error("Failed to join meeting:", err);
      alert(err.response?.data?.message || "Failed to join meeting");
    } finally {
      setJoiningMeetingId(null);
    }
  };

  const handleLeaveMeeting = () => {
    setActiveMeeting(null);
    fetchMeetings(); // Refresh list
  };

  const handleCreateMeeting = async () => {
    if (!newMeeting.title || !newMeeting.scheduledStart) {
      alert("Please fill in title and start time");
      return;
    }

    try {
      setCreating(true);
      await meetingService.createMeeting({
        title: newMeeting.title,
        description: newMeeting.description,
        scheduledStart: new Date(newMeeting.scheduledStart).toISOString(),
        scheduledEnd: newMeeting.scheduledEnd ? new Date(newMeeting.scheduledEnd).toISOString() : undefined,
        accessMode: newMeeting.accessMode,
      });
      setShowCreateMeeting(false);
      setNewMeeting({ title: "", scheduledStart: "", scheduledEnd: "", accessMode: "public", description: "" });
      fetchMeetings();
    } catch (err: any) {
      console.error("Failed to create meeting:", err);
      alert(err.response?.data?.message || "Failed to create meeting");
    } finally {
      setCreating(false);
    }
  };

  // Filter meetings by status
  const now = new Date();
  const upcomingMeetings = meetings.filter(m => m.status === "scheduled" || m.status === "active");
  const pastMeetings = meetings.filter(m => m.status === "ended" || m.status === "cancelled");

  // If in a meeting, show the Daily room
  if (activeMeeting) {
    return (
      <div className={`min-h-screen ${THEME.bg} p-6`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Video className="text-teal-600" /> In Meeting
            </h1>
            <button
              onClick={handleLeaveMeeting}
              className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600"
            >
              Leave Meeting
            </button>
          </div>

          <DailyMeetingRoom
            roomUrl={activeMeeting.roomUrl}
            token={activeMeeting.token}
            onLeave={handleLeaveMeeting}
            onError={(err) => {
              console.error("Meeting error:", err);
              alert("Meeting error: " + err.message);
            }}
            minHeight="calc(100vh - 200px)"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${THEME.bg} p-6 font-sans text-slate-800`}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Video className="text-teal-600" /> Online Meetings
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Manage and join your virtual meetings.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateMeeting(true)}
              className={`${THEME.buttonPrimary} px-6 py-3 flex items-center gap-2`}
            >
              <Plus size={18} /> New Meeting
            </button>
            <button
              onClick={fetchMeetings}
              className="px-6 py-3 bg-white text-slate-600 rounded-xl font-bold border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Meetings", value: meetings.length.toString(), icon: Calendar },
            { label: "Upcoming", value: upcomingMeetings.length.toString(), icon: Clock },
            { label: "Completed", value: pastMeetings.filter(m => m.status === "ended").length.toString(), icon: Check },
            { label: "Active Now", value: meetings.filter(m => m.status === "active").length.toString(), icon: Video },
          ].map((stat, i) => (
            <div key={i} className={`${THEME.card} p-5 flex items-center gap-4`}>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-teal-600">
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-red-700 font-medium">{error}</span>
            <button onClick={fetchMeetings} className="ml-auto text-red-600 font-bold hover:underline">
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-teal-600" size={32} />
          </div>
        )}

        {/* Main Content */}
        {!loading && (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex items-center space-x-1 bg-white p-1 rounded-xl w-fit shadow-sm border border-slate-100">
              {[
                { key: "upcoming", label: "Upcoming" },
                { key: "history", label: "History" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.key ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "upcoming" && (
              <div className="space-y-4">
                {upcomingMeetings.length === 0 ? (
                  <div className={`${THEME.card} p-12 text-center`}>
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No upcoming meetings</h3>
                    <p className="text-slate-500">You are free for now!</p>
                  </div>
                ) : (
                  upcomingMeetings.map(meeting => (
                    <div key={meeting.id} className={`${THEME.card} p-6 group hover:shadow-md transition-all relative overflow-hidden`}>
                      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${meeting.status === 'active' ? 'bg-green-500' : 'bg-teal-500'}`}></div>

                      <div className="flex justify-between items-start mb-4 pl-2">
                        <div>
                          <div className="flex gap-2 mb-2">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${meeting.status === 'active'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-teal-50 text-teal-700'
                              }`}>
                              {meeting.status === 'active' ? 'Live Now' : 'Scheduled'}
                            </span>
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                              {meeting.provider}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{meeting.title}</h3>
                          <p className="text-slate-500 text-sm mt-1">{meeting.description || 'No description'}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900">
                            {new Date(meeting.scheduledStart).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-sm font-bold text-slate-400">
                            {new Date(meeting.scheduledStart).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pl-2 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {meeting.participants.slice(0, 3).map((p, i) => (
                              <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600" title={p.userName}>
                                {p.userName?.charAt(0) || '?'}
                              </div>
                            ))}
                            {meeting.participants.length > 3 && (
                              <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600">
                                +{meeting.participants.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-bold text-slate-400">{meeting.participants.length} Participants</span>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleJoinMeeting(meeting.id)}
                            disabled={joiningMeetingId === meeting.id}
                            className={`px-4 py-2 font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2 ${meeting.status === 'active'
                                ? 'bg-green-600 text-white shadow-green-600/20 hover:bg-green-700'
                                : 'bg-teal-600 text-white shadow-teal-600/20 hover:bg-teal-700'
                              } ${joiningMeetingId === meeting.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {joiningMeetingId === meeting.id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <Video size={16} />
                            )}
                            {meeting.status === 'active' ? 'Join Now' : 'Start Meeting'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-4">
                {pastMeetings.length === 0 ? (
                  <div className={`${THEME.card} p-12 text-center`}>
                    <p className="text-slate-500">No past meetings</p>
                  </div>
                ) : (
                  pastMeetings.map(meeting => (
                    <div key={meeting.id} className={`${THEME.card} p-5 flex justify-between items-center opacity-75`}>
                      <div>
                        <h4 className="font-bold text-slate-800">{meeting.title}</h4>
                        <div className="text-sm text-slate-500 font-medium">
                          {new Date(meeting.scheduledStart).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${meeting.status === 'cancelled'
                          ? 'bg-red-100 text-red-500'
                          : 'bg-slate-100 text-slate-500'
                        }`}>
                        {meeting.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Create Meeting Modal */}
        {showCreateMeeting && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Create New Meeting</h2>
                <button onClick={() => setShowCreateMeeting(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Meeting title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Start Time *</label>
                    <input
                      type="datetime-local"
                      value={newMeeting.scheduledStart}
                      onChange={(e) => setNewMeeting({ ...newMeeting, scheduledStart: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">End Time</label>
                    <input
                      type="datetime-local"
                      value={newMeeting.scheduledEnd}
                      onChange={(e) => setNewMeeting({ ...newMeeting, scheduledEnd: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Access Mode</label>
                  <select
                    value={newMeeting.accessMode}
                    onChange={(e) => setNewMeeting({ ...newMeeting, accessMode: e.target.value as "public" | "private" })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="public">Public (All employees can join)</option>
                    <option value="private">Private (Invite only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={newMeeting.description}
                    onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows={3}
                    placeholder="Meeting description (optional)"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowCreateMeeting(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMeeting}
                  disabled={creating}
                  className={`flex-1 px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 flex items-center justify-center gap-2 ${creating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {creating && <Loader2 className="animate-spin" size={18} />}
                  Create Meeting
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

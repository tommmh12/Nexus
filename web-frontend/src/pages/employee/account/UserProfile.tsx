import React, { useState } from "react";
import { User, Shield, Settings, Activity, Mail, Phone, Calendar, MapPin, Briefcase, Lock, Smartphone, LogOut, Award } from "lucide-react";

// Mock user data for UI preview
const MOCK_USER_PROFILE = {
  id: "1",
  fullName: "Nguyễn Văn Bình",
  email: "binh.nguyen@company.com",
  phone: "0901234567",
  department: "Phòng Kỹ thuật",
  position: "Senior Developer",
  employeeId: "NV001234",
  joinDate: "2021-03-15",
  avatar: null,
  address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
  dateOfBirth: "1995-06-20",
  gender: "male" as const,
  emergencyContact: {
    name: "Nguyễn Văn An",
    relationship: "Anh",
    phone: "0987654321",
  },
};

const MOCK_SKILLS = [
  { name: "React", level: 90 },
  { name: "TypeScript", level: 85 },
  { name: "Node.js", level: 80 },
  { name: "PostgreSQL", level: 75 },
  { name: "Docker", level: 70 },
];

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

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "preferences">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: MOCK_USER_PROFILE.phone,
    address: MOCK_USER_PROFILE.address,
    emergencyContactName: MOCK_USER_PROFILE.emergencyContact.name,
    emergencyContactPhone: MOCK_USER_PROFILE.emergencyContact.phone,
    emergencyContactRelationship: MOCK_USER_PROFILE.emergencyContact.relationship,
  });

  const handleSaveProfile = () => {
    console.log("Saving profile:", editForm);
    setIsEditing(false);
  };

  return (
    <div className={`min-h-screen ${THEME.bg} p-6 font-sans text-slate-800 pb-20`}>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header Profile Card */}
        <div className="relative bg-white rounded-[32px] overflow-hidden shadow-sm">
          <div className="h-48 bg-slate-900 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-900/50 to-slate-900/50"></div>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full border-4 border-white/5 opacity-50"></div>
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 rounded-full bg-teal-500/20 blur-3xl"></div>
          </div>

          <div className="px-8 pb-8 flex flex-col md:flex-row items-end -mt-20 gap-6 relative z-10">
            <div className="bg-white p-2 rounded-3xl shadow-xl">
              <div className="w-32 h-32 rounded-2xl bg-slate-100 flex items-center justify-center text-4xl font-bold text-slate-300">
                {MOCK_USER_PROFILE.avatar ? (
                  <img src={MOCK_USER_PROFILE.avatar} className="w-full h-full object-cover rounded-2xl" alt="" />
                ) : (
                  MOCK_USER_PROFILE.fullName.charAt(0)
                )}
              </div>
            </div>

            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold text-slate-900 mb-1">{MOCK_USER_PROFILE.fullName}</h1>
              <p className="text-slate-500 font-medium flex items-center gap-2 mb-4">
                {MOCK_USER_PROFILE.position} <span className="w-1 h-1 bg-slate-300 rounded-full"></span> {MOCK_USER_PROFILE.department}
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold text-slate-500 border border-slate-100">
                  <Mail size={14} /> {MOCK_USER_PROFILE.email}
                </div>
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold text-slate-500 border border-slate-100">
                  <Briefcase size={14} /> {MOCK_USER_PROFILE.employeeId}
                </div>
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold text-slate-500 border border-slate-100">
                  <Calendar size={14} /> Joined {new Date(MOCK_USER_PROFILE.joinDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="pb-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all hover:-translate-y-1"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Navigation & Stats (Left Sidebar) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className={`${THEME.card} p-4`}>
              {[
                { id: 'profile', icon: User, label: 'Personal Info' },
                { id: 'security', icon: Shield, label: 'Security' },
                { id: 'preferences', icon: Settings, label: 'Preferences' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all mb-1 ${activeTab === tab.id ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <tab.icon size={18} /> {tab.label}
                </button>
              ))}
            </div>

            <div className={`${THEME.card} p-6`}>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Award className="text-teal-600" size={20} /> Skills
              </h3>
              <div className="space-y-4">
                {MOCK_SKILLS.map(skill => (
                  <div key={skill.name}>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                      <span>{skill.name}</span>
                      <span>{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-900 rounded-full" style={{ width: `${skill.level}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full py-4 text-red-500 font-bold bg-white rounded-[24px] shadow-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
              <LogOut size={18} /> Sign Out
            </button>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-8">
            {activeTab === 'profile' && (
              <div className={`${THEME.card} p-8 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Full Name</label>
                    <div className="text-slate-900 font-medium py-2 border-b border-slate-100">{MOCK_USER_PROFILE.fullName}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Email</label>
                    <div className="text-slate-900 font-medium py-2 border-b border-slate-100">{MOCK_USER_PROFILE.email}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Phone</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full font-bold text-slate-900 py-2 border-b-2 border-teal-500 outline-none bg-transparent"
                      />
                    ) : (
                      <div className="text-slate-900 font-medium py-2 border-b border-slate-100 flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {MOCK_USER_PROFILE.phone}</div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Date of Birth</label>
                    <div className="text-slate-900 font-medium py-2 border-b border-slate-100">{new Date(MOCK_USER_PROFILE.dateOfBirth).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full font-bold text-slate-900 py-2 border-b-2 border-teal-500 outline-none bg-transparent"
                      />
                    ) : (
                      <div className="text-slate-900 font-medium py-2 border-b border-slate-100 flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> {MOCK_USER_PROFILE.address}</div>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-6 mt-10">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-6 rounded-2xl">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Contact Name</label>
                    <div className="text-slate-900 font-bold">{MOCK_USER_PROFILE.emergencyContact.name}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Relationship</label>
                    <div className="text-slate-900 font-bold">{MOCK_USER_PROFILE.emergencyContact.relationship}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Phone</label>
                    <div className="text-slate-900 font-bold">{MOCK_USER_PROFILE.emergencyContact.phone}</div>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-8 flex justify-end">
                    <button onClick={handleSaveProfile} className="px-8 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg hover:bg-teal-700 transition-all">
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className={`${THEME.card} p-8 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Security Settings</h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-slate-900">Password</h4>
                      <p className="text-sm text-slate-500">Last changed 3 months ago</p>
                    </div>
                    <button className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Change</button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-slate-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-slate-500">Secure your account with 2FA</p>
                    </div>
                    <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                      <div className="w-6 h-6 bg-white rounded-full shadow-md absolute left-0 top-0 border border-slate-200"></div>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 mt-8 mb-4">Active Sessions</h4>
                  <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><Smartphone size={24} className="text-slate-400" /></div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">iPhone 14 Pro</div>
                      <div className="text-xs text-slate-500">Ho Chi Minh City • Active now</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import {
    Users,
    MessageSquare,
    Mail,
    Building,
    ChevronRight,
    Loader2,
    AlertCircle,
    Search,
    UserPlus,
    Crown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { Button } from '../system/ui/Button';
import { Avatar } from '../ui/Avatar';

interface MembersTabProps {
    projectId: string;
    currentUserId: string;
    canAddMembers?: boolean;
    canRemoveMembers?: boolean;
}

interface ProjectMember {
    id: string;
    user_id: string;
    role: string;
    joined_at: string;
    userName: string;
    email: string;
    avatar_url?: string;
    departmentName?: string;
}

/**
 * MembersTab - Shows project team members with chat navigation
 */
export const MembersTab: React.FC<MembersTabProps> = ({
    projectId,
    currentUserId,
    canAddMembers = false,
    canRemoveMembers = false,
}) => {
    const navigate = useNavigate();
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const projectData = await projectService.getProjectById(projectId);
            setMembers(projectData?.members || []);
        } catch (err: any) {
            console.error('Error fetching members:', err);
            setError(err.response?.data?.message || 'Không thể tải danh sách thành viên');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleChatWithMember = (memberId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/employee/chat?userId=${memberId}`);
    };

    const getRoleStyle = (role: string) => {
        switch (role?.toLowerCase()) {
            case 'owner':
            case 'manager':
            case 'project manager':
                return 'bg-amber-100 text-amber-700';
            case 'lead':
            case 'tech lead':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-slate-100 text-slate-600';
        }
    };

    const isManager = (role: string) => {
        return ['owner', 'manager', 'project manager'].includes(role?.toLowerCase());
    };

    const filteredMembers = members.filter(m =>
        m.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort: managers first, then by name
    const sortedMembers = [...filteredMembers].sort((a, b) => {
        if (isManager(a.role) && !isManager(b.role)) return -1;
        if (!isManager(a.role) && isManager(b.role)) return 1;
        return a.userName.localeCompare(b.userName);
    });

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Đang tải danh sách thành viên...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-red-500">
                <AlertCircle className="w-8 h-8 mb-4" />
                <p className="mb-4">{error}</p>
                <Button variant="outline" onClick={fetchMembers}>Thử lại</Button>
            </div>
        );
    }

    // Empty state
    if (members.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Users className="w-12 h-12 mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    Chưa có thành viên
                </h3>
                <p className="text-sm text-slate-500 text-center max-w-sm">
                    Dự án chưa có thành viên nào.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="text-brand-600" />
                        Thành viên dự án
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {members.length} thành viên
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm thành viên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none w-48"
                        />
                    </div>

                    {/* Add member button (for managers) */}
                    {canAddMembers && (
                        <Button disabled>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Thêm thành viên
                        </Button>
                    )}
                </div>
            </div>

            {/* Members grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedMembers.map(member => (
                    <div
                        key={member.id || member.user_id}
                        className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-brand-200 transition-all group"
                    >
                        {/* Avatar */}
                        <div className="relative">
                            <Avatar
                                name={member.userName}
                                src={member.avatar_url}
                                size="lg"
                            />
                            {isManager(member.role) && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                                    <Crown size={10} className="text-white" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-slate-900 truncate">
                                    {member.userName}
                                </h4>
                                {member.user_id === currentUserId && (
                                    <span className="text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded font-medium">
                                        Bạn
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getRoleStyle(member.role)}`}>
                                    {member.role}
                                </span>
                                {member.departmentName && (
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <Building size={10} />
                                        {member.departmentName}
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                <Mail size={10} />
                                {member.email}
                            </div>
                        </div>

                        {/* Actions */}
                        {member.user_id !== currentUserId && (
                            <button
                                onClick={(e) => handleChatWithMember(member.user_id, e)}
                                className="p-2.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Nhắn tin"
                            >
                                <MessageSquare size={18} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* No search results */}
            {filteredMembers.length === 0 && searchTerm && (
                <div className="text-center py-12 text-slate-400">
                    <p>Không tìm thấy thành viên nào với từ khóa "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
};

export default MembersTab;

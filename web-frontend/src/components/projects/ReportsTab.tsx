import React, { useState, useEffect, useCallback } from 'react';
import {
    FileText,
    Send,
    Clock,
    CheckCircle,
    XCircle,
    ChevronDown,
    ChevronUp,
    Loader2,
    AlertCircle,
    Plus,
    X,
    Paperclip,
} from 'lucide-react';
import { reportService, ProjectReport } from '../../services/reportService';
import { departmentService, Department } from '../../services/departmentService';
import { Button } from '../system/ui/Button';

interface ReportsTabProps {
    projectId: string;
    currentUserId: string;
    currentUserName?: string;
    canSubmitReport?: boolean;
    canReviewReports?: boolean;
}

/**
 * ReportsTab - View reports history and submit new reports
 */
export const ReportsTab: React.FC<ReportsTabProps> = ({
    projectId,
    currentUserId,
    currentUserName = 'Bạn',
    canSubmitReport = true,
    canReviewReports = false,
}) => {
    const [reports, setReports] = useState<ProjectReport[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        content: '',
    });

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await reportService.getReportsByProject(projectId) as any;
            // Handle both array response and { success, data } response
            const projectReports = Array.isArray(response)
                ? response
                : (response?.data || response || []);
            setReports(Array.isArray(projectReports) ? projectReports : []);
        } catch (err: any) {
            console.error('Error fetching reports:', err);
            setError(err.response?.data?.message || 'Không thể tải danh sách báo cáo');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    const fetchDepartments = useCallback(async () => {
        try {
            const depts = await departmentService.getAllDepartments();
            setDepartments(depts || []);
        } catch (err) {
            console.warn('Could not fetch departments');
        }
    }, []);

    useEffect(() => {
        fetchReports();
        fetchDepartments();
    }, [fetchReports, fetchDepartments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setSubmitting(true);
        try {
            const newReport = await reportService.createReport({
                projectId,
                title: formData.title,
                department: formData.department || 'Chung',
                content: formData.content,
                submittedBy: currentUserName,
                submittedDate: new Date().toLocaleDateString('vi-VN'),
                status: 'Pending',
            });
            setReports([newReport, ...reports]);
            setFormData({ title: '', department: '', content: '' });
            setShowSubmitForm(false);
            alert('✅ Nộp báo cáo thành công!');
        } catch (err: any) {
            console.error('Error submitting report:', err);
            alert('❌ Có lỗi xảy ra: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved':
                return <CheckCircle size={16} className="text-green-500" />;
            case 'Rejected':
                return <XCircle size={16} className="text-red-500" />;
            default:
                return <Clock size={16} className="text-yellow-500" />;
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'Đã duyệt';
            case 'Rejected':
                return 'Từ chối';
            default:
                return 'Chờ duyệt';
        }
    };

    // Group reports by status
    const groupedReports = {
        Pending: reports.filter(r => r.status === 'Pending'),
        Approved: reports.filter(r => r.status === 'Approved'),
        Rejected: reports.filter(r => r.status === 'Rejected'),
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Đang tải báo cáo...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-red-500">
                <AlertCircle className="w-8 h-8 mb-4" />
                <p className="mb-4">{error}</p>
                <Button variant="outline" onClick={fetchReports}>Thử lại</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="text-brand-600" />
                        Báo cáo dự án
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {reports.length} báo cáo • {groupedReports.Pending.length} chờ duyệt
                    </p>
                </div>

                {canSubmitReport && (
                    <Button onClick={() => setShowSubmitForm(!showSubmitForm)}>
                        {showSubmitForm ? (
                            <>
                                <X size={16} className="mr-2" />
                                Hủy
                            </>
                        ) : (
                            <>
                                <Plus size={16} className="mr-2" />
                                Nộp báo cáo
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Submit Form */}
            {showSubmitForm && (
                <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Send size={16} className="text-brand-600" />
                        Nộp báo cáo mới
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Tiêu đề báo cáo *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="VD: Báo cáo tuần 1"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Phòng ban
                            </label>
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                            >
                                <option value="">Chọn phòng ban</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Nội dung báo cáo *
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Nhập nội dung báo cáo..."
                            rows={5}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowSubmitForm(false)}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Send size={16} className="mr-2" />
                                    Gửi báo cáo
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            )}

            {/* Empty state */}
            {reports.length === 0 && !showSubmitForm && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <FileText className="w-12 h-12 mb-4 text-slate-300" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                        Chưa có báo cáo
                    </h3>
                    <p className="text-sm text-slate-500 text-center max-w-sm mb-4">
                        Dự án chưa có báo cáo nào. Hãy nộp báo cáo đầu tiên.
                    </p>
                    {canSubmitReport && (
                        <Button onClick={() => setShowSubmitForm(true)}>
                            <Plus size={16} className="mr-2" />
                            Nộp báo cáo
                        </Button>
                    )}
                </div>
            )}

            {/* Reports List */}
            {reports.length > 0 && (
                <div className="space-y-3">
                    {reports.map(report => (
                        <div
                            key={report.id}
                            className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
                        >
                            {/* Report Header */}
                            <button
                                onClick={() => setExpandedReportId(
                                    expandedReportId === report.id ? null : report.id
                                )}
                                className="w-full p-4 flex items-center gap-4 text-left hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex-shrink-0">
                                    {getStatusIcon(report.status)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-slate-900 truncate">
                                        {report.title}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                        <span>{report.submittedBy}</span>
                                        <span>•</span>
                                        <span>{report.submittedDate}</span>
                                        {report.department && (
                                            <>
                                                <span>•</span>
                                                <span>{report.department}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(report.status)}`}>
                                    {getStatusLabel(report.status)}
                                </span>

                                {expandedReportId === report.id ? (
                                    <ChevronUp size={18} className="text-slate-400" />
                                ) : (
                                    <ChevronDown size={18} className="text-slate-400" />
                                )}
                            </button>

                            {/* Expanded Content */}
                            {expandedReportId === report.id && (
                                <div className="px-4 pb-4 border-t border-slate-100">
                                    <div className="pt-4 space-y-4">
                                        {/* Content */}
                                        <div>
                                            <h5 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                                Nội dung
                                            </h5>
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                                {report.content}
                                            </p>
                                        </div>

                                        {/* Attachments */}
                                        {report.attachments && report.attachments.length > 0 && (
                                            <div>
                                                <h5 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                                    Tệp đính kèm
                                                </h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {report.attachments.map((att, i) => (
                                                        <a
                                                            key={i}
                                                            href={att.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-700 hover:bg-slate-200 transition-colors"
                                                        >
                                                            <Paperclip size={14} />
                                                            {att.name}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Feedback */}
                                        {report.feedback && (
                                            <div className={`p-4 rounded-lg ${report.status === 'Approved'
                                                ? 'bg-green-50 border border-green-200'
                                                : 'bg-red-50 border border-red-200'
                                                }`}>
                                                <h5 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                                    Phản hồi
                                                </h5>
                                                <p className="text-sm text-slate-700">
                                                    {report.feedback}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReportsTab;

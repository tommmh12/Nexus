import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    FileText,
    Upload,
    Download,
    Folder,
    File,
    Image,
    FileSpreadsheet,
    Loader2,
    AlertCircle,
    Search,
    MoreVertical,
    Trash2,
} from 'lucide-react';
import { Button } from '../system/ui/Button';
import { projectService } from '../../services/projectService';

interface DocumentsTabProps {
    projectId: string;
    canUpload?: boolean;
    canDelete?: boolean;
}

interface ProjectDocument {
    id?: string;
    name: string;
    url: string;
    type: string;
    size?: number;
    uploadedBy?: string;
    uploadedAt?: string;
    source?: string;
}

/**
 * DocumentsTab - Shows project documents with upload capability
 */
export const DocumentsTab: React.FC<DocumentsTabProps> = ({
    projectId,
    canUpload = true,
    canDelete = false,
}) => {
    const [documents, setDocuments] = useState<ProjectDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDocuments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const projectData = await projectService.getProjectById(projectId);
            // Documents might be in different places depending on API
            const docs = projectData?.documents || projectData?.files || [];
            setDocuments(docs);
        } catch (err: any) {
            console.error('Error fetching documents:', err);
            setError(err.response?.data?.message || 'Không thể tải danh sách tài liệu');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            // TODO: Implement actual file upload API
            // For now, just simulate and show success
            const newDocs: ProjectDocument[] = Array.from(files).map(file => ({
                id: `temp-${Date.now()}-${Math.random()}`,
                name: file.name,
                url: URL.createObjectURL(file),
                type: file.type,
                size: file.size,
                uploadedBy: 'Bạn',
                uploadedAt: new Date().toLocaleDateString('vi-VN'),
            }));

            setDocuments(prev => [...newDocs, ...prev]);
            alert(`✅ Đã tải lên ${files.length} tệp tin!`);
        } catch (err: any) {
            alert('❌ Lỗi khi tải lên: ' + (err.message || 'Unknown error'));
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const getFileIcon = (type: string, name: string) => {
        if (type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(name)) {
            return <Image size={20} className="text-purple-500" />;
        }
        if (/\.(xlsx|xls|csv)$/i.test(name)) {
            return <FileSpreadsheet size={20} className="text-green-500" />;
        }
        if (/\.(pdf|doc|docx)$/i.test(name)) {
            return <FileText size={20} className="text-red-500" />;
        }
        return <File size={20} className="text-slate-400" />;
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const filteredDocs = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Đang tải tài liệu...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-red-500">
                <AlertCircle className="w-8 h-8 mb-4" />
                <p className="mb-4">{error}</p>
                <Button variant="outline" onClick={fetchDocuments}>Thử lại</Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg,.gif,.zip,.txt"
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Folder className="text-brand-600" />
                        Tài liệu dự án
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {documents.length} tài liệu
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm tài liệu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none w-48"
                        />
                    </div>

                    {/* Upload button */}
                    {canUpload && (
                        <Button onClick={handleUploadClick} disabled={uploading}>
                            {uploading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4 mr-2" />
                            )}
                            Tải lên
                        </Button>
                    )}
                </div>
            </div>

            {/* Empty state */}
            {filteredDocs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <FileText className="w-12 h-12 mb-4 text-slate-300" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                        {searchTerm ? 'Không tìm thấy tài liệu' : 'Chưa có tài liệu'}
                    </h3>
                    <p className="text-sm text-slate-500 text-center max-w-sm mb-4">
                        {searchTerm
                            ? 'Thử tìm với từ khóa khác'
                            : 'Tải lên tài liệu đầu tiên cho dự án này'}
                    </p>
                    {canUpload && !searchTerm && (
                        <Button variant="outline" onClick={handleUploadClick}>
                            <Upload className="w-4 h-4 mr-2" />
                            Tải lên tài liệu
                        </Button>
                    )}
                </div>
            )}

            {/* Document list */}
            {filteredDocs.length > 0 && (
                <div className="space-y-2">
                    {filteredDocs.map((doc, index) => (
                        <div
                            key={doc.id || index}
                            className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group"
                        >
                            {/* Icon */}
                            <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                {getFileIcon(doc.type, doc.name)}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-slate-900 truncate">{doc.name}</h4>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                    {doc.size && <span>{formatFileSize(doc.size)}</span>}
                                    {doc.uploadedBy && <span>Bởi {doc.uploadedBy}</span>}
                                    {doc.uploadedAt && <span>{doc.uploadedAt}</span>}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                    href={doc.url}
                                    download={doc.name}
                                    className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                    title="Tải xuống"
                                >
                                    <Download size={16} />
                                </a>
                                {canDelete && (
                                    <button
                                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Xóa"
                                        onClick={() => {
                                            if (confirm('Bạn có chắc muốn xóa tài liệu này?')) {
                                                setDocuments(prev => prev.filter(d => d.id !== doc.id));
                                            }
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DocumentsTab;

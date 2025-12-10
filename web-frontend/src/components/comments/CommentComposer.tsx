import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Image, Loader2 } from 'lucide-react';
import { commentService } from '../../services/commentService';

interface CommentComposerProps {
    onSubmit: (content: string) => Promise<void>;
    placeholder?: string;
    initialContent?: string;
    onCancel?: () => void;
    isSubmitting?: boolean;
}

export const CommentComposer: React.FC<CommentComposerProps> = ({
    onSubmit,
    placeholder = "Viết bình luận...",
    initialContent = "",
    onCancel,
    isSubmitting = false
}) => {
    const [content, setContent] = useState(initialContent);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [content]);

    // Handle image upload
    const handleImageUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Chỉ cho phép upload file ảnh');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File quá lớn. Giới hạn 5MB');
            return;
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);

        // Upload to server
        setUploadingImage(true);
        try {
            const url = await commentService.uploadImage(file);
            setImageUrl(url);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Không thể upload ảnh. Vui lòng thử lại.');
            setImagePreview(null);
        } finally {
            setUploadingImage(false);
        }
    };

    // Handle paste event for images
    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    e.preventDefault();
                    handleImageUpload(file);
                    break;
                }
            }
        }
    };

    // Handle file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
        // Reset input so same file can be selected again
        e.target.value = '';
    };

    // Remove image preview
    const removeImage = () => {
        setImagePreview(null);
        setImageUrl(null);
    };

    const handleSubmit = async () => {
        if ((!content.trim() && !imageUrl) || isSubmitting || uploadingImage) return;

        // Build final content with image if present
        let finalContent = content.trim();
        if (imageUrl) {
            finalContent = finalContent
                ? `${finalContent}\n\n![image](${imageUrl})`
                : `![image](${imageUrl})`;
        }

        await onSubmit(finalContent);

        if (!initialContent) {
            setContent("");
            removeImage();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="flex flex-col gap-2 relative group">
            {/* Image Preview */}
            {imagePreview && (
                <div className="relative inline-block max-w-xs">
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="rounded-lg max-h-32 object-cover border border-slate-200"
                    />
                    {uploadingImage && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                            <Loader2 className="animate-spin text-white" size={24} />
                        </div>
                    )}
                    {!uploadingImage && (
                        <button
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
            )}

            <div className="relative">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder={placeholder}
                    disabled={isSubmitting}
                    className="w-full p-3 pr-24 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none min-h-[48px] transition-all"
                    rows={1}
                />

                <div className={`absolute bottom-2 right-2 flex items-center gap-1`}>
                    {/* Image upload button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSubmitting || uploadingImage}
                        className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-full transition-colors"
                        title="Đính kèm ảnh (hoặc paste Ctrl+V)"
                    >
                        <Image size={16} />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {onCancel && (
                        <button
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Hủy"
                        >
                            <X size={16} />
                        </button>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={(!content.trim() && !imageUrl) || isSubmitting || uploadingImage}
                        className={`
                            p-2 rounded-full transition-all duration-200
                            ${(content.trim() || imageUrl) && !isSubmitting && !uploadingImage
                                ? 'bg-brand-600 text-white shadow-md hover:bg-brand-700 hover:shadow-lg transform hover:-translate-y-0.5'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                        `}
                        title="Gửi (Enter)"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>

            <div className="text-[10px] text-slate-400 px-1 opacity-0 group-focus-within:opacity-100 transition-opacity">
                Nhấn <b>Enter</b> để gửi, <b>Shift + Enter</b> để xuống dòng, <b>Ctrl+V</b> để paste ảnh
            </div>
        </div>
    );
};

import React, { useState } from "react";
import {
    Key,
    Eye,
    EyeOff,
    Shield,
    CheckCircle,
    AlertCircle,
    Lock,
} from "lucide-react";
import { Button } from "../../../components/system/ui/Button";
import { authService } from "../../../services/authService";

export const ChangePasswordPage: React.FC = () => {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Password strength checker
    const getPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(formData.newPassword);
    const strengthLabels = ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"];
    const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"];

    const passwordRequirements = [
        { label: "Ít nhất 8 ký tự", met: formData.newPassword.length >= 8 },
        { label: "Chứa chữ thường (a-z)", met: /[a-z]/.test(formData.newPassword) },
        { label: "Chứa chữ hoa (A-Z)", met: /[A-Z]/.test(formData.newPassword) },
        { label: "Chứa số (0-9)", met: /[0-9]/.test(formData.newPassword) },
        { label: "Chứa ký tự đặc biệt (!@#$...)", met: /[^a-zA-Z0-9]/.test(formData.newPassword) },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validation
        if (!formData.currentPassword) {
            setError("Vui lòng nhập mật khẩu hiện tại");
            return;
        }

        if (!formData.newPassword) {
            setError("Vui lòng nhập mật khẩu mới");
            return;
        }

        if (formData.newPassword.length < 8) {
            setError("Mật khẩu mới phải có ít nhất 8 ký tự");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        if (formData.currentPassword === formData.newPassword) {
            setError("Mật khẩu mới phải khác mật khẩu hiện tại");
            return;
        }

        setLoading(true);
        try {
            // Call real API to change password
            const token = localStorage.getItem("accessToken");
            const response = await fetch("http://localhost:5000/api/auth/change-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Có lỗi xảy ra");
            }

            setSuccess(true);
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err: any) {
            setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Đổi mật khẩu</h1>
                <p className="text-slate-500 mt-1">Cập nhật mật khẩu để bảo vệ tài khoản của bạn</p>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Security Banner */}
                <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <Shield size={20} className="text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-amber-800">Bảo mật tài khoản</p>
                        <p className="text-xs text-amber-600">Sử dụng mật khẩu mạnh và không chia sẻ với người khác</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Success Message */}
                    {success && (
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle size={20} className="text-green-600" />
                            <p className="text-sm text-green-700">Đổi mật khẩu thành công! Mật khẩu mới đã được cập nhật.</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle size={20} className="text-red-600" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Mật khẩu hiện tại <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-slate-400" />
                            </div>
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                                placeholder="Nhập mật khẩu hiện tại"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                            >
                                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Key size={18} className="text-slate-400" />
                            </div>
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                                placeholder="Nhập mật khẩu mới"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                            >
                                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Password Strength */}
                        {formData.newPassword && (
                            <div className="mt-3">
                                <div className="flex gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-1.5 flex-1 rounded-full transition-colors ${level <= passwordStrength ? strengthColors[passwordStrength - 1] : "bg-slate-200"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className={`text-xs font-medium ${passwordStrength < 3 ? "text-red-600" : passwordStrength < 4 ? "text-yellow-600" : "text-green-600"
                                    }`}>
                                    Độ mạnh: {strengthLabels[passwordStrength - 1] || "Rất yếu"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Key size={18} className="text-slate-400" />
                            </div>
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className={`w-full pl-10 pr-12 py-3 bg-slate-50 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all ${formData.confirmPassword && formData.confirmPassword !== formData.newPassword
                                    ? "border-red-300"
                                    : formData.confirmPassword && formData.confirmPassword === formData.newPassword
                                        ? "border-green-300"
                                        : "border-slate-200"
                                    }`}
                                placeholder="Nhập lại mật khẩu mới"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                            >
                                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {formData.confirmPassword && formData.confirmPassword !== formData.newPassword && (
                            <p className="text-xs text-red-600 mt-1">Mật khẩu xác nhận không khớp</p>
                        )}
                        {formData.confirmPassword && formData.confirmPassword === formData.newPassword && (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <CheckCircle size={12} /> Mật khẩu khớp
                            </p>
                        )}
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs font-semibold text-slate-700 mb-3">Yêu cầu mật khẩu:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {passwordRequirements.map((req, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    {req.met ? (
                                        <CheckCircle size={14} className="text-green-500" />
                                    ) : (
                                        <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300" />
                                    )}
                                    <span className={`text-xs ${req.met ? "text-green-700" : "text-slate-500"}`}>
                                        {req.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={loading || !formData.currentPassword || !formData.newPassword || formData.newPassword !== formData.confirmPassword}
                            className="w-full py-3"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Key size={18} className="mr-2" />
                                    Đổi mật khẩu
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordPage;

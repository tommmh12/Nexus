import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Layers,
  HelpCircle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Input } from "./system/ui/Input";
import { Button } from "./system/ui/Button";
import { AuthStatus } from "../types";

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  status: AuthStatus;
  errorMessage: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  status,
  errorMessage,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (email && password) {
      await onLogin(email, password);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setLocalError("Vui lòng nhập email để khôi phục mật khẩu.");
      return;
    }
    // Mock forgot password flow
    alert(`Hướng dẫn đặt lại mật khẩu đã được gửi đến ${email}`);
    setForgotPasswordMode(false);
    setLocalError(null);
  };

  if (forgotPasswordMode) {
    return (
      <div className="w-full max-w-md mx-auto animate-fadeIn">
        <div className="mb-8">
          <button
            onClick={() => {
              setForgotPasswordMode(false);
              setLocalError(null);
            }}
            className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-4 transition-colors"
          >
            ← Quay lại đăng nhập
          </button>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Quên mật khẩu?
          </h1>
          <p className="text-slate-500 text-sm">
            Nhập email doanh nghiệp của bạn, hệ thống sẽ gửi liên kết để đặt lại
            mật khẩu mới.
          </p>
        </div>
        <form onSubmit={handleForgotPassword} className="space-y-6">
          <Input
            label="Email doanh nghiệp"
            type="email"
            placeholder="name@nexus.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setLocalError(null);
            }}
            icon={<Mail size={18} />}
            required
            autoFocus
            className={
              localError
                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                : ""
            }
          />

          {localError && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-md text-sm flex items-start shadow-sm animate-fadeIn">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{localError}</span>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            className="bg-brand-700 hover:bg-brand-800 h-11"
          >
            Gửi yêu cầu
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-10 text-center lg:text-left">
        <div className="flex items-center justify-center lg:justify-start gap-2 mb-8">
          <div className="h-10 w-10 bg-brand-700 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-700/20">
            <Layers size={24} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            NEXUS<span className="text-brand-600">FORUM</span>
          </span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Đăng nhập hệ thống
        </h1>
        <p className="text-slate-500 text-sm">
          Chào mừng trở lại! Truy cập không gian làm việc số an toàn và hiệu
          quả.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email công ty"
          type="email"
          placeholder="name@nexus.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setLocalError(null);
          }}
          icon={<Mail size={18} />}
          required
          autoFocus
          className={
            localError
              ? "border-red-300 focus:border-red-500 focus:ring-red-200"
              : ""
          }
        />

        <div>
          <Input
            label="Mật khẩu"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            required
          />
          <div className="flex items-center justify-between mt-3">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-brand-700 focus:ring-brand-600 border-slate-300 rounded cursor-pointer"
              />
              <span className="ml-2 text-sm text-slate-500 group-hover:text-slate-700 select-none">
                Ghi nhớ đăng nhập
              </span>
            </label>

            <button
              type="button"
              onClick={() => {
                setForgotPasswordMode(true);
                setLocalError(null);
              }}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline transition-colors"
            >
              Quên mật khẩu?
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {(errorMessage || localError) && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-md text-sm flex items-start shadow-sm animate-fadeIn">
            <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{localError || errorMessage}</span>
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          isLoading={status === AuthStatus.LOADING}
          className="shadow-brand-700/20 shadow-lg h-12 text-base font-bold bg-brand-700 hover:bg-brand-800 transition-all active:scale-[0.98]"
        >
          {status === AuthStatus.LOADING
            ? "Đang xác thực..."
            : "Đăng nhập ngay"}
          {!status.includes("LOADING") && (
            <ArrowRight size={18} className="ml-2 opacity-80" />
          )}
        </Button>

        {/* SSO Section */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider font-semibold">
            <span className="px-3 bg-white text-slate-400">
              Hoặc tiếp tục với
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            className="w-full font-normal text-slate-600 h-11 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full font-normal text-slate-600 h-11 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
            </svg>
            Microsoft
          </Button>
        </div>
      </form>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
        <HelpCircle size={14} />
        <span>
          Cần hỗ trợ kỹ thuật?{" "}
          <a href="#" className="text-brand-700 font-semibold hover:underline">
            Liên hệ IT Helpdesk
          </a>{" "}
          (Ext: 101)
        </span>
      </div>
    </div>
  );
};

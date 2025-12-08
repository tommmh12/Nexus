
import React from 'react';
import { LoginForm } from './LoginForm';
import { AuthStatus } from '../types';
import { MessageSquare, Users, Zap, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (email: string) => Promise<void>;
  status: AuthStatus;
  errorMessage: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, status, errorMessage }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Left Column: Form Container */}
      <div className="w-full lg:w-[480px] xl:w-[550px] flex flex-col justify-center py-12 px-6 sm:px-10 lg:px-14 bg-white z-20 shadow-2xl relative">
        <LoginForm onLogin={onLogin} status={status} errorMessage={errorMessage} />
        
        <div className="mt-auto pt-8 text-center lg:text-left">
            <p className="text-xs text-slate-400">
                &copy; 2024 Nexus Corporation. <br className="hidden sm:block" />Hệ thống được giám sát an ninh 24/7.
            </p>
        </div>
      </div>

      {/* Right Column: Visuals & Branding */}
      <div className="hidden lg:flex relative flex-1 items-center justify-center bg-slate-900 overflow-hidden">
        {/* Background Image with Fallback */}
        <div className="absolute inset-0 bg-slate-900">
            <img
            className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay scale-105 hover:scale-110 transition-transform duration-[20s]"
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop"
            alt="Office Atmosphere"
            />
        </div>
        
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/90 via-slate-900/80 to-slate-900/90" />
        
        {/* Decorative Ambient Effects */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>

        {/* Content Content */}
        <div className="relative z-10 max-w-2xl px-12 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-8 text-brand-200">
             <ShieldCheck size={16} /> Nexus Internal System v2.0
          </div>
          
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Kết nối tri thức, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-blue-300">Kiến tạo tương lai.</span>
          </h2>
          
          <p className="text-lg text-slate-300 mb-12 leading-relaxed max-w-lg">
            Nền tảng giao tiếp và cộng tác tập trung dành cho nhân sự Nexus. Truy cập tài nguyên, thảo luận dự án và cập nhật tin tức nội bộ một cách liền mạch.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-white/10 pt-8">
             <div className="group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-brand-300 group-hover:bg-brand-500/20 transition-colors">
                    <Users size={24} />
                </div>
                <h3 className="font-bold text-lg mb-1">Cộng tác</h3>
                <p className="text-sm text-slate-400">Làm việc nhóm hiệu quả qua các dự án và phòng ban.</p>
             </div>
             <div className="group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-blue-300 group-hover:bg-blue-500/20 transition-colors">
                    <MessageSquare size={24} />
                </div>
                <h3 className="font-bold text-lg mb-1">Thảo luận</h3>
                <p className="text-sm text-slate-400">Diễn đàn mở để chia sẻ ý kiến và đóng góp sáng kiến.</p>
             </div>
             <div className="group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-purple-300 group-hover:bg-purple-500/20 transition-colors">
                    <Zap size={24} />
                </div>
                <h3 className="font-bold text-lg mb-1">Tốc độ</h3>
                <p className="text-sm text-slate-400">Hệ thống tối ưu hóa cho trải nghiệm mượt mà nhất.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

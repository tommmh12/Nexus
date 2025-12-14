
import React from 'react';
import { Menu, Bell, Search, Moon, Settings } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, title }) => {
  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between px-6 lg:px-8 transition-all glass border-b border-white/40 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 lg:hidden transition-colors"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 capitalize tracking-tight">{title.replace('-', ' ')}</h1>
          <p className="text-xs text-slate-500 hidden md:block">Welcome back, let's be productive today.</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="hidden md:block relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="h-11 w-72 rounded-full border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="rounded-full p-2.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-all">
            <Moon size={20} />
          </button>
          <button className="rounded-full p-2.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-all">
            <Settings size={20} />
          </button>
          <button className="relative rounded-full p-2.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-all">
            <Bell size={20} />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse"></span>
          </button>
        </div>

        {/* Separator */}
        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-1 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Admin User</p>
            <p className="text-xs text-slate-500 font-medium">HQ • Engineering</p>
          </div>
          <div className="relative">
             <img 
              src="https://picsum.photos/100/100" 
              alt="Profile" 
              className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-md group-hover:shadow-lg transition-all group-hover:scale-105"
            />
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import { MyTasks } from './pages/MyTasks';
import { BookingModule } from './pages/BookingModule';
import { ProjectModule } from './pages/ProjectModule';
import { ChatManager } from './pages/ChatManager';
import { ForumModule } from './pages/ForumModule';
import { NewsModule } from './pages/NewsModule';
import { OnlineMeetingModule } from './pages/OnlineMeetingModule';
import { UserProfile } from './pages/UserProfile';
import { QuickChatWidget } from './components/QuickChatWidget';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'my-tasks':
        return <MyTasks />;
      case 'projects':
        return <ProjectModule />;
      case 'booking':
        return <BookingModule />;
      case 'meetings':
        return <OnlineMeetingModule />;
      case 'chat':
        return <ChatManager />;
      case 'forum':
        return <ForumModule initialView="feed" />;
      case 'news':
        return <NewsModule />;
      case 'profile':
        return <UserProfile userId="me" onBack={() => setActivePage('dashboard')} />;
      
      // Fallback for placeholder pages
      default:
        return (
          <div className="flex h-[60vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 backdrop-blur-sm animate-fadeIn">
            <h3 className="text-xl font-bold text-slate-400">Module: {activePage}</h3>
            <p className="text-slate-500 mt-2">This feature is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/50 text-slate-900 font-sans flex flex-col">
      {/* Top Navigation */}
      <Navbar 
        activePage={activePage} 
        onNavigate={setActivePage} 
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8">
        <div className="animate-fadeIn">
          {renderContent()}
        </div>
      </main>
      
      {/* Global Widgets */}
      <QuickChatWidget />
    </div>
  );
};

export default App;

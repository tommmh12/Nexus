import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { AuthState, AuthStatus, User, UserRole } from './types';

// Mock function to simulate API call
const mockLoginApi = async (email: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simple mock logic: fail if email contains "error"
      if (email.includes('error')) {
        reject(new Error('Tài khoản hoặc mật khẩu không chính xác.'));
      } else {
        resolve({
          id: 'u_12345',
          name: 'Trần Minh Đức',
          email: email,
          avatarUrl: 'https://picsum.photos/200',
          department: 'Ban Giám Đốc (Board of Directors)',
          role: UserRole.ADMIN
        });
      }
    }, 1500); // 1.5s delay to show loading state
  });
};

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    status: AuthStatus.IDLE,
    user: null,
    errorMessage: null,
  });

  const handleLogin = async (email: string) => {
    setAuth(prev => ({ ...prev, status: AuthStatus.LOADING, errorMessage: null }));
    
    try {
      const user = await mockLoginApi(email);
      setAuth({
        status: AuthStatus.SUCCESS,
        user,
        errorMessage: null,
      });
    } catch (error) {
      setAuth({
        status: AuthStatus.ERROR,
        user: null,
        errorMessage: error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định',
      });
    }
  };

  const handleLogout = () => {
    setAuth({
      status: AuthStatus.IDLE,
      user: null,
      errorMessage: null,
    });
  };

  // Simple conditional rendering based on auth status
  if (auth.status === AuthStatus.SUCCESS && auth.user) {
    return <Dashboard user={auth.user} onLogout={handleLogout} />;
  }

  return (
    <LoginScreen 
      onLogin={handleLogin} 
      status={auth.status} 
      errorMessage={auth.errorMessage} 
    />
  );
};

export default App;
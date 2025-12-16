import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 ${hover ? 'hover:shadow-md hover:border-slate-300 transition-all cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '', action }) => {
  return (
    <div className={`px-5 py-4 border-b border-slate-100 flex items-center justify-between ${className}`}>
      <div className="font-semibold text-slate-900">{children}</div>
      {action}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`${noPadding ? '' : 'p-5'} ${className}`}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-5 py-3 border-t border-slate-100 bg-slate-50/50 ${className}`}>
      {children}
    </div>
  );
};

import React from 'react';
import { Menu } from 'lucide-react';

interface TopBarProps {
  onMenuClick: () => void;
  title: string;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, title }) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-sm p-4 flex items-center justify-between z-40">
      <button
        onClick={onMenuClick}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Menu className="h-6 w-6 text-gray-600" />
      </button>
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="w-10" /> {/* Spacer for centering */}
    </div>
  );
};

export default TopBar;
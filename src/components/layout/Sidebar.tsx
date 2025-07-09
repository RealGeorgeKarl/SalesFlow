import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  BarChart3,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  LogOut,
  Package,
  Calendar,
  Shield,
  User,
  RefreshCw,
  X,
  Key,
  CreditCard,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { persona, logout, clearSelectedPersona } = useAuth();
  const navigate = useNavigate();

  {/*{ name: 'Installment Plans', href: '/installment-plans', icon: Calendar, roles: ['Admin'] },
    { name: 'Audit Logs', href: '/audit-logs', icon: Shield, roles: ['Admin'] },*/}
  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, roles: ['Admin', 'Salesperson'] },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp, roles: ['Admin'] },
    { name: 'New Sale', href: '/new-sale', icon: ShoppingCart, roles: ['Admin', 'Salesperson'] },
    { name: 'Sales', href: '/sales', icon: FileText, roles: ['Admin', 'Salesperson'] },
    { name: 'Customers', href: '/customers', icon: Users, roles: ['Admin', 'Salesperson'] },
    { name: 'Products', href: '/products', icon: Package, roles: ['Admin'] },
    { name: 'Persona Management', href: '/persona-management', icon: Key, roles: ['Admin'] },
    { name: 'Subscription', href: '/subscription', icon: CreditCard, roles: ['Admin'] },
  ];

  const visibleItems = navigationItems.filter(item => 
    item.roles.includes(persona?.user_type || '')
  );

  const handleChangePersona = () => {
    clearSelectedPersona();
    navigate('/login');
    setIsOpen(false);
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg h-screen flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">SalesFlow</h1>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="mt-2 flex items-center space-x-2">
          <div className={`p-1 rounded-full ${
            persona?.user_type === 'Admin' ? 'bg-purple-100' : 'bg-green-100'
          }`}>
            {persona?.user_type === 'Admin' ? (
              <Shield className="h-4 w-4 text-purple-600" />
            ) : (
              <User className="h-4 w-4 text-green-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{persona?.name}</p>
            <p className="text-xs text-gray-500">{persona?.user_type}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {visibleItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleChangePersona}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-lg transition-colors mb-2"
        >
          <RefreshCw className="h-5 w-5 mr-3" />
          Change Persona
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
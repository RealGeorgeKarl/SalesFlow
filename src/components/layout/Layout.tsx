import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Map routes to page titles
  const getPageTitle = (pathname: string): string => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/new-sale':
        return 'New Sale';
      case '/sales':
        return 'Sales Management';
      case '/customers':
        return 'Customer Management';
      case '/products':
        return 'Product Management';
      case '/persona-management':
        return 'Persona Management';
      case '/subscription':
        return 'Subscription Details';
      case '/installment-plans':
        return 'Installment Plans';
      case '/audit-logs':
        return 'Audit Logs';
      default:
        return 'SalesFlow';
    }
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen bg-gray-50">
      <TopBar 
        onMenuClick={() => setIsSidebarOpen(true)} 
        title={pageTitle} 
      />
      
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      <main className="flex-1 overflow-auto pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
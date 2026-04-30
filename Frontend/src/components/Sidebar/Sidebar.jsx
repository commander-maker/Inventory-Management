import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Package,
  Truck,
  Calculator,
  Users,
  Settings,
  LogOut,
  Menu,
  MapPin,
  Store
} from 'lucide-react';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';

export default function Sidebar({ isOpen, isDesktop, onToggle, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { isDark } = useTheme();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const adminItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: Truck, label: 'Vehicle Inventory', path: '/vehicles' },
    { icon: Store, label: 'Customers', path: '/customers' },
    { icon: MapPin, label: 'Deliveries', path: '/deliveries' },
    { icon: Calculator, label: 'Finance', path: '/finance' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const agentItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/agent-dashboard' },
    { icon: MapPin, label: 'My Deliveries', path: '/my-deliveries' },
    { icon: Truck, label: 'My Vehicle Inventory', path: '/my-vehicle' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const menuItems = user?.role === 'agent' ? agentItems : adminItems;

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (!isDesktop) onClose();
  };

  // Desktop: isOpen toggles between expanded (w-64) and collapsed (w-20)
  // Mobile: isOpen toggles overlay visibility
  const isExpanded = isDesktop ? !isOpen : true; // mobile overlay is always full width when open
  const isCollapsed = isDesktop ? isOpen : false;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {!isDesktop && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      <aside className={`
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full transition-all duration-300 z-50
        ${isDesktop ? 'relative' : 'fixed'}
        ${isDesktop
          ? (isOpen ? 'w-20' : 'w-64')
          : 'w-64'
        }
        ${isDesktop
          ? 'translate-x-0'
          : (isOpen ? 'translate-x-0' : '-translate-x-full')
        }
      `}>
      {/* Logo Section */}
      <div className='p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between'>
        {!isCollapsed && <h1 className='text-2xl font-bold text-blue-600 dark:text-blue-400'>AQUA</h1>}
        <button 
          onClick={onToggle}
          className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200'
        >
          <Menu className='w-6 h-6 text-gray-700 dark:text-gray-400' />
        </button>
      </div>

      {/* Menu Items */}
      <nav className='flex-1 p-4'>
        <ul className='space-y-2'>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className='w-5 h-5' />
                  {!isCollapsed && <span className='font-medium'>{item.label}</span>}
                </button>
              </li>
            );
          })}

          {/* Log Out */}
          <li className='pt-4'>
            <button
              onClick={handleLogout}
              className='w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200'
              title={isCollapsed ? 'Log Out' : ''}
            >
              <LogOut className='w-5 h-5' />
              {!isCollapsed && <span className='font-medium'>Log Out</span>}
            </button>
          </li>
        </ul>
      </nav>

      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
      />
    </aside>
    </>
  );
}
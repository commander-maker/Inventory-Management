import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Calculator, 
  Users, 
  Settings, 
  LogOut,
  Menu
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: Truck, label: 'Vehicles', path: '/vehicles' },
    { icon: Calculator, label: 'Finance', path: '/finance' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: Settings, label: 'Setting', path: '/settings' },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <aside className='w-64 bg-white border-r border-gray-200 flex flex-col h-full'>
      {/* Logo Section */}
      <div className='p-6 border-b border-gray-200 flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-blue-600'>AQUA</h1>
        <button className='p-2 hover:bg-gray-100 rounded-lg'>
          <Menu className='w-6 h-6 text-gray-700' />
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
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className='w-5 h-5' />
                  <span className='font-medium'>{item.label}</span>
                </button>
              </li>
            );
          })}

          {/* Log Out */}
          <li className='pt-4'>
            <button
              onClick={handleLogout}
              className='w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
            >
              <LogOut className='w-5 h-5' />
              <span className='font-medium'>Log Out</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
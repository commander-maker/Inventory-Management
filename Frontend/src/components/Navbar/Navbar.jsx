import React from 'react';
import { Search, Bell, MessageSquare, Maximize, Grid3x3, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();

  // Get role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'agent':
        return 'Sales Agent';
      default:
        return role?.charAt(0).toUpperCase() + role?.slice(1) || 'User';
    }
  };

  // Get avatar color based on role
  const getAvatarColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-orange-400';
      case 'agent':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <nav className='bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between w-full'>
      {/* Search Bar */}
      <div className='flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg flex-1 max-w-md'>
        <Search className='w-5 h-5 text-gray-400' />
        <input
          type='text'
          placeholder='Search'
          className='bg-transparent outline-none text-sm text-gray-700 w-full'
        />
      </div>

      {/* Right Side Icons */}
      <div className='flex items-center gap-4'>
        {/* Notification Icon with Badge */}
        <div className='relative cursor-pointer'>
          <Bell className='w-5 h-5 text-gray-600' />
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center'>
            1
          </span>
        </div>

        {/* Message Icon with Badge */}
        <div className='relative cursor-pointer'>
          <MessageSquare className='w-5 h-5 text-gray-600' />
          <span className='absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center'>
            1
          </span>
        </div>

        {/* Fullscreen Icon */}
        <Maximize className='w-5 h-5 text-gray-600 cursor-pointer' />

        {/* Grid Icon */}
        <Grid3x3 className='w-5 h-5 text-gray-600 cursor-pointer' />

        {/* User Profile - Dynamic */}
        <div className='flex items-center gap-2 cursor-pointer'>
          <div className={`w-9 h-9 rounded-full ${getAvatarColor(user?.role)} flex items-center justify-center overflow-hidden`}>
            <span className='text-white font-semibold text-sm'>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className='text-sm'>
            <div className='font-semibold text-gray-800'>{user?.name || 'User'}</div>
            <div className='text-gray-500 text-xs'>{getRoleDisplayName(user?.role)}</div>
          </div>
        </div>
      </div>
    </nav>
  );
}

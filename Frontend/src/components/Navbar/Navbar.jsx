import React from 'react';
import { Search, Bell, MessageSquare, Maximize, Grid3x3, User } from 'lucide-react';

export default function Navbar() {
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

        {/* User Profile */}
        <div className='flex items-center gap-2 cursor-pointer'>
          <div className='w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center overflow-hidden'>
            <User className='w-5 h-5 text-white' />
          </div>
          <div className='text-sm'>
            <div className='font-semibold text-gray-800'>admin</div>
            <div className='text-gray-500 text-xs'>Administrator</div>
          </div>
        </div>
      </div>
    </nav>
  );
}